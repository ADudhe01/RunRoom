import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import PointsCounter from "../components/PointsCounter";
import SyncButton from "../components/SyncButton";
import { motion } from "framer-motion";

// Default profile picture generator
function getDefaultAvatar(name = "User") {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=7c5dfa&color=fff&size=200&bold=true`;
}

export default function Home() {
  const { user, points, inventory, roomLayout } = useUser();
  
  // Handle profile picture URL - if it's a local path, prepend server URL
  const getProfilePictureUrl = () => {
    if (!user?.profilePicture) return getDefaultAvatar(user?.name);
    if (user.profilePicture.startsWith('http')) return user.profilePicture;
    return `http://localhost:4000${user.profilePicture}`;
  };
  
  const profilePicture = getProfilePictureUrl();
  const inventoryCount = inventory?.length || 0;
  const roomItemsCount = roomLayout?.length || 0;

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-left">
          <h1>Turn your kms into a cosy room.</h1>
          <p>
            Connect your running/walking watch, earn points for every kilometre
            this year, and spend them decorating your avatar&apos;s room.
          </p>

          {/* ⭐ USER STATS */}
          {user && (
            <div className="home-stats">
              <div className="stat-item">
                <span className="stat-label">Kilometres this year</span>
                <span className="stat-value">{Math.floor(user.totalKm || 0)} km</span>
              </div>
              {user.stravaConnected && (
                <div className="stat-item">
                  <span className="stat-label">Strava</span>
                  <span className="stat-value connected">Connected</span>
                </div>
              )}
            </div>
          )}

          <SyncButton />
        </div>

        <div className="hero-right">
          <motion.div
            className="user-avatar-container"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src={profilePicture}
              alt={user?.name || "User"}
              className="user-profile-picture"
              onError={(e) => {
                // Fallback to default if image fails to load
                e.target.src = getDefaultAvatar(user?.name);
              }}
            />
          </motion.div>
          <PointsCounter points={points} />
        </div>
      </section>

      {!user && (
        <div className="home-cta-section">
          <p className="hint-text">
            Login in the Profile page to connect your Strava and start earning
            points.
          </p>
        </div>
      )}

      {user && (
        <>
          <section className="home-content-section">
            <div className="content-grid">
              <motion.div
                className="content-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="card-icon">🏃</div>
                <h3>Track Your Progress</h3>
                <p className="muted">
                  Every kilometre you run or walk this year earns you points. Sync
                  your Strava account to automatically track your activities.
                </p>
                {!user.stravaConnected && (
                  <Link to="/profile" className="inline-link">
                    Connect Strava →
                  </Link>
                )}
              </motion.div>

              <motion.div
                className="content-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="card-icon">🛍️</div>
                <h3>Shop for Décor</h3>
                <p className="muted">
                  Spend your points on furniture, plants, lights, and more. Build
                  your perfect recovery space.
                </p>
                <Link to="/shop" className="inline-link">
                  Browse Shop →
                </Link>
              </motion.div>

              <motion.div
                className="content-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="card-icon">🏠</div>
                <h3>Design Your Room</h3>
                <p className="muted">
                  Arrange your 3D room with items from your collection. Drag, rotate,
                  and position everything just how you like it.
                </p>
                <Link to="/room" className="inline-link">
                  Decorate Room →
                </Link>
              </motion.div>
            </div>
          </section>

          <section className="home-quick-stats">
            <div className="quick-stats-grid">
              <div className="quick-stat">
                <div className="quick-stat-value">{inventoryCount}</div>
                <div className="quick-stat-label">Items Owned</div>
                <Link to="/shop" className="quick-stat-link">
                  View Shop →
                </Link>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-value">{roomItemsCount}</div>
                <div className="quick-stat-label">Items in Room</div>
                <Link to="/room" className="quick-stat-link">
                  Edit Room →
                </Link>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-value">{Math.floor(points)}</div>
                <div className="quick-stat-label">Points Available</div>
                <Link to="/shop" className="quick-stat-link">
                  Spend Points →
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
