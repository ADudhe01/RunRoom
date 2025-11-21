import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, getServerBaseUrl } from "../services/api";
import { useUser } from "../context/UserContext";
import StatusBanner from "../components/StatusBanner";
import { motion } from "framer-motion";

// Default profile picture generator
function getDefaultAvatar(name = "User") {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=7c5dfa&color=fff&size=200&bold=true`;
}

// Profile Picture Editor Component
function ProfilePictureEditor({ user, setUser, setAlert }) {
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.profilePicture 
      ? (user.profilePicture.startsWith('http') ? user.profilePicture : `${getServerBaseUrl()}${user.profilePicture}`)
      : getDefaultAvatar(user?.name)
  );
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlert({
          type: "error",
          message: "File size must be less than 5MB",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setAlert({
          type: "error",
          message: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
        });
        return;
      }

      setProfilePictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }

      const res = await fetch(`${getServerBaseUrl()}/api/user/update-profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Profile picture update error:', errorData);
        throw new Error(errorData.message || `Failed to update profile picture: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      setUser({
        ...user,
        profilePicture: data.user.profilePicture,
      });
      
      setAlert({
        type: "success",
        message: "Profile picture updated successfully!",
      });
      
      // Update preview with new URL
      if (data.user.profilePicture) {
        const newUrl = data.user.profilePicture.startsWith('http') 
          ? data.user.profilePicture 
          : `${getServerBaseUrl()}${data.user.profilePicture}`;
        setPreviewUrl(newUrl);
      } else {
        setPreviewUrl(getDefaultAvatar(user?.name));
      }
      
      setProfilePictureFile(null);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Failed to update profile picture",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      setSaving(true);
      
      const res = await fetch(`${getServerBaseUrl()}/api/user/update-profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ removePicture: 'true' }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove profile picture');
      }

      const data = await res.json();
      
      setUser({
        ...user,
        profilePicture: null,
      });
      
      setAlert({
        type: "success",
        message: "Profile picture removed successfully!",
      });
      
      setPreviewUrl(getDefaultAvatar(user?.name));
      setProfilePictureFile(null);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Failed to remove profile picture",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-picture-editor">
      <div className="profile-picture-preview">
        <img
          src={previewUrl}
          alt={user?.name || "User"}
          className="profile-picture-preview-img"
          onError={(e) => {
            e.target.src = getDefaultAvatar(user?.name);
          }}
        />
      </div>
      <div className="profile-picture-form">
        <div className="file-upload-wrapper">
          <input
            type="file"
            id="profile-picture-upload"
            className="file-upload-input"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
          />
          <label
            htmlFor="profile-picture-upload"
            className={`file-upload-label ${profilePictureFile ? 'has-file' : ''}`}
          >
            <span className="file-upload-icon">📷</span>
            <span className="file-upload-text">
              {profilePictureFile ? profilePictureFile.name : 'Choose a photo from your device'}
            </span>
          </label>
        </div>
        {profilePictureFile && previewUrl && (
          <div className="file-upload-preview">
            <img
              src={previewUrl}
              alt="Preview"
            />
          </div>
        )}
        <p className="muted small" style={{ marginTop: "0.5rem", textAlign: "center" }}>
          Max 5MB • JPEG, PNG, GIF, or WebP
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
          <button
            className="primary-button full"
            onClick={handleSave}
            disabled={saving || !profilePictureFile}
          >
            {saving ? "Saving..." : "Update Profile Picture"}
          </button>
          {user?.profilePicture && (
            <button
              className="ghost-button full"
              onClick={handleRemove}
              disabled={saving}
            >
              {saving ? "Removing..." : "Remove Profile Picture"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const reasonCopy = {
  missing_code: "Strava did not send an authorization code. Please try again.",
  missing_state: "We lost track of your login. Sign in again and retry.",
  invalid_token:
    "Your session expired before Strava could connect. Please login first.",
  missing_user: "We could not find your profile. Contact support if this persists.",
  oauth_failed: "Strava rejected the request. Please try again in a moment.",
};

export default function Profile() {
  const {
    user,
    setUser,
    setPoints,
    setInventory,
    setRoomLayout,
    logout,
    points,
  } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("strava");

    if (!status) return;

    if (status === "connected") {
      setAlert({
        type: "success",
        message: "Strava connected! You can sync the latest run from Home anytime.",
      });
    } else if (status === "error") {
      const reason = params.get("reason");
      setAlert({
        type: "error",
        message: reasonCopy[reason] || "We could not connect to Strava. Try again soon.",
      });
    }

    params.delete("strava");
    params.delete("reason");
    navigate({ pathname: location.pathname }, { replace: true });
  }, [location, navigate]);

  const stravaCtaLabel = useMemo(() => {
    if (!user?.stravaConnected) return "Connect Strava";
    return connecting ? "Reconnecting..." : "Reconnect Strava";
  }, [user?.stravaConnected, connecting]);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setAlert(null);
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.token);
      setUser({
        ...res.user,
        stravaConnected: res.stravaConnected,
        totalKm: res.totalKm,
        profilePicture: res.user.profilePicture,
      });
      setPoints(res.pointsRemaining);
      setInventory(res.inventory || []);
      setRoomLayout(res.roomLayout || []);
      setAlert({ type: "success", message: "Logged in successfully." });
      setEmail("");
      setPassword("");
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  function handleConnectStrava() {
    const token = localStorage.getItem("token");
    if (!token) {
      setAlert({
        type: "error",
        message: "Please login before connecting your Strava account.",
      });
      return;
    }

    setConnecting(true);
    setAlert({
      type: "info",
      message: "Redirecting you to Strava for approval...",
    });

    const encoded = encodeURIComponent(token);
    window.location.href = `${getServerBaseUrl()}/api/strava/connect?state=${encoded}`;
  }

  if (!user) {
    return (
      <div className="page profile-page auth-page">
        <div className="auth-card">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>Sign in to keep building</h2>
            <p className="muted">
              Track your kilometres, redeem rewards, and sync your Strava account.
            </p>
          </div>

          <StatusBanner
            tone={alert?.type || "info"}
            message={alert?.message}
            onDismiss={() => setAlert(null)}
          />

          <form onSubmit={handleLogin} className="auth-form sleek">
            <label className="input-group">
              <span>Email</span>
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="input-group">
              <span>Password</span>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="muted">
            Need an account?{" "}
            <Link className="inline-link" to="/register">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Handle profile picture URL for header
  const getProfilePictureUrl = () => {
    if (!user?.profilePicture) return getDefaultAvatar(user?.name);
    if (user.profilePicture.startsWith('http')) return user.profilePicture;
    return `${getServerBaseUrl()}${user.profilePicture}`;
  };

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-header-info">
            <p className="eyebrow">Profile</p>
            <h1>{user.name}</h1>
            <p className="muted">{user.email}</p>
          </div>
          <div className="profile-header-avatar">
            <img
              src={getProfilePictureUrl()}
              alt={user?.name || "User"}
              className="profile-header-img"
              onError={(e) => {
                e.target.src = getDefaultAvatar(user?.name);
              }}
            />
          </div>
        </div>
      </div>

      <StatusBanner
        tone={alert?.type || "info"}
        message={alert?.message}
        onDismiss={() => setAlert(null)}
      />

      <div className="profile-grid">
        <section className="profile-card">
          <h3>Profile Picture</h3>
          <ProfilePictureEditor user={user} setUser={setUser} setAlert={setAlert} />
        </section>

        <section className="profile-card">
          <h3>Quick stats</h3>
          <div className="stats-row">
            <div className="stat-pill">
              <span className="label">Points available</span>
              <strong>{Math.floor(points)}</strong>
            </div>
            <div className="stat-pill">
              <span className="label">Km this year</span>
              <strong>{Math.floor(user.totalKm || 0)} km</strong>
            </div>
          </div>
          <p className="muted">
            Sync after every run to keep your progress current and unlock more décor.
          </p>
        </section>

        <section className="profile-card">
          <h3>Strava connection</h3>
          <p className="muted">
            Securely link your Strava account so we can import your activity data.
          </p>
          <div className={`connection-state ${user.stravaConnected ? "is-connected" : ""}`}>
            <span className="dot" />
            {user.stravaConnected ? "Connected" : "Not connected"}
          </div>
          <button
            className="primary-button"
            onClick={handleConnectStrava}
            disabled={connecting}
          >
            {connecting ? "Opening Strava..." : stravaCtaLabel}
          </button>
          {user.stravaConnected && (
            <p className="muted small">
              Already linked. If Strava asked you to re-authorize, use "Reconnect".
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
