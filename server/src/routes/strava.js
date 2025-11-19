import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_REDIRECT_URI,
  JWT_SECRET,
} from "../config.js";
import { User } from "../models/User.js";

const router = express.Router();
const PROFILE_REDIRECT = "http://localhost:5173/profile";

function redirectWithStatus(res, status, reason) {
  const params = new URLSearchParams({ strava: status });
  if (reason) params.append("reason", reason);
  return res.redirect(`${PROFILE_REDIRECT}?${params.toString()}`);
}

/**
 * STEP 1 — Redirect user to Strava OAuth
 * Frontend calls: GET /api/strava/connect?state=<jwt>
 */
router.get("/connect", (req, res) => {
  const stateToken = req.query.state || "";

  const url =
    `https://www.strava.com/oauth/authorize?` +
    `client_id=${STRAVA_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}` +
    `&scope=read,activity:read_all` +
    `&state=${stateToken}`;

  console.log("Strava OAuth URL:", url);
  res.redirect(url);
});

/**
 * STEP 2 — Strava redirects back here with ?code=&state=
 * We exchange the code for tokens and save them to the user.
 */
router.get("/callback", async (req, res) => {
  const { code, state } = req.query;
  console.log("Strava callback query:", req.query);

  if (!code) {
    return redirectWithStatus(res, "error", "missing_code");
  }

  try {
    // 1) Exchange code for tokens
    const tokenRes = await axios.post("https://www.strava.com/oauth/token", {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    });

    const { access_token, refresh_token, expires_at } = tokenRes.data;

    // 2) state contains our JWT token from frontend
    if (!state) {
      console.error("Missing state – cannot link to a user");
      return redirectWithStatus(res, "error", "missing_state");
    }

    let jwtToken;
    try {
      jwtToken = decodeURIComponent(state);
    } catch {
      jwtToken = state;
    }

    let payload;
    try {
      payload = jwt.verify(jwtToken, JWT_SECRET);
    } catch (err) {
      console.error("JWT error from state:", err.message);
      return redirectWithStatus(res, "error", "invalid_token");
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return redirectWithStatus(res, "error", "missing_user");
    }

    // 3) Save tokens into user document
    user.stravaAccessToken = access_token;
    user.stravaRefreshToken = refresh_token;
    user.stravaTokenExpiresAt = new Date(expires_at * 1000);
    await user.save();

    console.log("✅ Strava connected for:", user.email);

    // 4) Redirect back to frontend profile page
    return redirectWithStatus(res, "connected");
  } catch (err) {
    console.error("Strava Callback Error:", err.response?.data || err.message);
    return redirectWithStatus(res, "error", "oauth_failed");
  }
});

/**
 * Helper — Ensure we have a valid Strava access token
 * Refresh it if expired using refresh_token
 */
async function ensureValidStravaToken(user) {
  if (
    user.stravaTokenExpiresAt &&
    user.stravaTokenExpiresAt.getTime() > Date.now() + 60 * 1000
  ) {
    // Token still valid (60s buffer)
    return user.stravaAccessToken;
  }

  if (!user.stravaRefreshToken) {
    throw new Error("No Strava refresh token stored");
  }

  const refreshRes = await axios.post("https://www.strava.com/oauth/token", {
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: user.stravaRefreshToken,
  });

  const { access_token, refresh_token, expires_at } = refreshRes.data;

  user.stravaAccessToken = access_token;
  user.stravaRefreshToken = refresh_token;
  user.stravaTokenExpiresAt = new Date(expires_at * 1000);
  await user.save();

  console.log("♻️ Refreshed Strava token for:", user.email);
  return access_token;
}

/**
 * STEP 3 — Sync latest runs and update km + points
 * Frontend calls: POST /api/strava/sync  with Authorization: Bearer <jwt>
 */
router.post("/sync", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid auth token" });
    }

    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.stravaAccessToken && !user.stravaRefreshToken) {
      return res.status(400).json({ message: "Strava not connected" });
    }

    // Ensure we have a valid access token (refresh if expired)
    const accessToken = await ensureValidStravaToken(user);

    // Fetch ALL activities for the current year (paginate through all pages)
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1).getTime() / 1000; // Unix timestamp
    
    let allActivities = [];
    let page = 1;
    const perPage = 200; // Max allowed by Strava API
    
    console.log(`\n🔍 Starting Strava sync for user: ${user.email}`);
    console.log(`📅 Looking for activities in year: ${currentYear}`);
    console.log(`📅 Start of year timestamp: ${startOfYear}`);

    // Fetch all pages of activities
    while (true) {
      try {
        const activitiesRes = await axios.get(
          `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const activities = activitiesRes.data || [];
        
        if (activities.length === 0) {
          console.log(`✅ Reached end of activities at page ${page}`);
          break;
        }

        console.log(`📄 Fetched page ${page}: ${activities.length} activities`);
        
        // Check if we've gone past the current year
        const oldestActivity = activities[activities.length - 1];
        if (oldestActivity?.start_date) {
          const oldestDate = new Date(oldestActivity.start_date);
          if (oldestDate.getFullYear() < currentYear) {
            console.log(`⏰ Oldest activity on page ${page} is from ${oldestDate.getFullYear()}, stopping pagination`);
            // Still add activities from this year on this page
            allActivities.push(...activities.filter(act => {
              if (!act.start_date) return false;
              return new Date(act.start_date).getFullYear() === currentYear;
            }));
            break;
          }
        }

        allActivities.push(...activities);
        page++;

        // Safety limit to prevent infinite loops
        if (page > 50) {
          console.log(`⚠️ Reached safety limit of 50 pages (${allActivities.length} activities)`);
          break;
        }
      } catch (err) {
        console.error(`❌ Error fetching page ${page}:`, err.message);
        break;
      }
    }

    console.log(`\n📊 Total activities fetched: ${allActivities.length}`);

    // Filter for activities in the current year and calculate totals
    const currentYearActivities = [];
    const skippedActivities = [];
    let totalMetersThisYear = 0;
    let totalMetersAllTime = 0;
    const activityTypeBreakdown = {};

    console.log(`\n🔍 Analyzing ${allActivities.length} total activities...`);

    for (const act of allActivities) {
      const dt = act.start_date ? new Date(act.start_date) : null;
      const distance = act.distance || 0;
      const distanceKm = (distance / 1000).toFixed(2);
      const year = dt ? dt.getFullYear() : null;
      const type = act.type || "Unknown";

      // Track all activity types
      if (!activityTypeBreakdown[type]) {
        activityTypeBreakdown[type] = { count: 0, totalKm: 0, thisYear: 0 };
      }
      activityTypeBreakdown[type].count++;
      activityTypeBreakdown[type].totalKm += distance / 1000;

      totalMetersAllTime += distance;

      // Check why activities might be skipped
      if (!act.start_date) {
        skippedActivities.push({
          name: act.name || "Unnamed",
          reason: "No start_date",
          type: type,
        });
        continue;
      }

      if (year !== currentYear) {
        skippedActivities.push({
          name: act.name || "Unnamed",
          date: act.start_date,
          year: year,
          reason: `Wrong year (${year} vs ${currentYear})`,
          distanceKm: distanceKm,
          type: type,
        });
        continue;
      }

      // This activity is from current year
      currentYearActivities.push({
        id: act.id,
        name: act.name,
        date: act.start_date,
        distance: distance,
        distanceKm: distanceKm,
        type: type,
      });
      totalMetersThisYear += distance;
      activityTypeBreakdown[type].thisYear += distance / 1000;
    }

    const kmThisYear = totalMetersThisYear / 1000;
    const kmAllTime = totalMetersAllTime / 1000;

    console.log(`\n📈 SUMMARY:`);
    console.log(`   Current year: ${currentYear}`);
    console.log(`   Activities this year (${currentYear}): ${currentYearActivities.length}`);
    console.log(`   Activities skipped: ${skippedActivities.length}`);
    console.log(`   Total km this year: ${kmThisYear.toFixed(2)} km`);
    console.log(`   Total km all time: ${kmAllTime.toFixed(2)} km`);
    
    console.log(`\n📊 Activity Type Breakdown (ALL TIME):`);
    Object.entries(activityTypeBreakdown)
      .sort((a, b) => b[1].totalKm - a[1].totalKm)
      .forEach(([type, stats]) => {
        console.log(`   ${type}: ${stats.count} activities, ${stats.totalKm.toFixed(2)} km total`);
      });

    console.log(`\n📊 Activity Type Breakdown (THIS YEAR ${currentYear}):`);
    Object.entries(activityTypeBreakdown)
      .filter(([type, stats]) => stats.thisYear > 0)
      .sort((a, b) => b[1].thisYear - a[1].thisYear)
      .forEach(([type, stats]) => {
        console.log(`   ${type}: ${stats.thisYear.toFixed(2)} km`);
      });

    console.log(`\n📋 ALL Activities this year (${currentYear}) - ${currentYearActivities.length} total:`);
    if (currentYearActivities.length === 0) {
      console.log(`   ⚠️  NO ACTIVITIES FOUND FOR ${currentYear}!`);
    } else {
      currentYearActivities.forEach((act, idx) => {
        console.log(`   ${idx + 1}. ${act.name} - ${act.date} - ${act.distanceKm} km (${act.type})`);
      });
    }

    if (skippedActivities.length > 0 && skippedActivities.length <= 20) {
      console.log(`\n⏭️  Sample skipped activities (showing first 20):`);
      skippedActivities.slice(0, 20).forEach((act, idx) => {
        console.log(`   ${idx + 1}. ${act.name} - ${act.reason}${act.distanceKm ? ` (${act.distanceKm} km)` : ""} (${act.type})`);
      });
    }

    // Store integer points
    user.totalKm = kmThisYear;
    user.pointsEarned = Math.floor(kmThisYear);
    await user.save();

    console.log(`\n💰 Points calculation:`);
    console.log(`   Points earned: ${user.pointsEarned}`);
    console.log(`   Points spent: ${user.pointsSpent}`);
    console.log(`   Points remaining: ${user.pointsRemaining}`);
    console.log(`\n✅ Sync complete!\n`);

    return res.json({
      totalKm: Math.floor(kmThisYear),
      pointsRemaining: Math.floor(user.pointsEarned - user.pointsSpent),
      debug: {
        currentYear: currentYear,
        activitiesThisYear: currentYearActivities.length,
        totalActivitiesFetched: allActivities.length,
        skippedActivities: skippedActivities.length,
        kmThisYear: kmThisYear.toFixed(2),
        kmAllTime: kmAllTime.toFixed(2),
        activityTypeBreakdown: activityTypeBreakdown,
        activities: currentYearActivities, // ALL activities, not just first 10
        skippedSample: skippedActivities.slice(0, 10), // Sample of skipped
      },
    });
  } catch (err) {
    console.error("Strava Sync Error:", err.response?.data || err.message);
    return res.status(500).json({ message: "Strava sync failed" });
  }
});

export default router;
