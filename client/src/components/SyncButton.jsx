import React, { useState } from "react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { useUser } from "../context/UserContext";

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const { setPoints, user, setUser } = useUser();

  async function handleSync() {
    try {
      setLoading(true);
      const res = await api.post("/strava/sync", {});
      
      // Update points
      setPoints(res.pointsRemaining);
      
      // Update user's totalKm
      if (user && res.totalKm !== undefined) {
        setUser({
          ...user,
          totalKm: res.totalKm,
        });
      }
      
      // Also refresh user data from server to ensure everything is in sync
      try {
        const userRes = await api.get("/user/me");
        setUser({
          ...userRes.user,
          stravaConnected: userRes.stravaConnected,
          totalKm: userRes.totalKm,
        });
        setPoints(Math.floor(userRes.pointsRemaining));
      } catch (err) {
        console.log("Could not refresh user data:", err);
      }
      
      // Log debug info to console only (not displayed on screen)
      if (res.debug) {
        console.log("🔍 Strava Sync Debug Info:", res.debug);
        console.log("📊 Activities this year:", res.debug.activitiesThisYear);
        console.log("📏 Total km this year:", res.debug.kmThisYear, "km");
        console.log("📋 Sample activities:", res.debug.activities);
      }
      
      // Also log the full response
      console.log("✅ Full sync response:", res);
    } catch (err) {
      console.error("❌ Sync error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <motion.button
        className="sync-button"
        onClick={handleSync}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.03 }}
        whileTap={{ scale: loading ? 1 : 0.95 }}
      >
        {loading ? "Syncing..." : "Sync latest run"}
      </motion.button>
    </div>
  );
}
