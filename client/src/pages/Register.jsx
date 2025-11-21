import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusBanner from "../components/StatusBanner";
import { api, getServerBaseUrl } from "../services/api";
import { useUser } from "../context/UserContext";

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setPoints, setInventory, setRoomLayout } = useUser();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setAlert(null);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }

      const res = await fetch(`${getServerBaseUrl()}/api/auth/register`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Registration error:', errorData);
        throw new Error(errorData.message || `Registration failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);
      setUser({
        ...data.user,
        stravaConnected: data.stravaConnected,
        totalKm: data.totalKm,
        profilePicture: data.user.profilePicture,
      });
      setPoints(data.pointsRemaining);
      setInventory(data.inventory || []);
      setRoomLayout(data.roomLayout || []);

      setAlert({ type: "success", message: "Account created! Redirecting..." });
      setTimeout(() => navigate("/profile"), 600);
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <p className="eyebrow">Create account</p>
        <h2>Join RunRoom</h2>
        <p className="muted">
          Turn kilometres into points, personalize your space, and stay motivated.
        </p>

        <StatusBanner
          tone={alert?.type || "info"}
          message={alert?.message}
          onDismiss={() => setAlert(null)}
        />

        <form className="auth-form sleek" onSubmit={handleRegister}>
          <label className="input-group">
            <span>Name</span>
            <input
              type="text"
              name="name"
              placeholder="Chari Runner"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label className="input-group">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className="input-group">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>
          <div className="input-group">
            <span>Profile Picture (optional)</span>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="register-profile-picture"
                name="profilePicture"
                className="file-upload-input"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
              />
              <label
                htmlFor="register-profile-picture"
                className={`file-upload-label ${profilePictureFile ? 'has-file' : ''}`}
              >
                <span className="file-upload-icon">📷</span>
                <span className="file-upload-text">
                  {profilePictureFile ? profilePictureFile.name : 'Choose a photo from your device'}
                </span>
              </label>
            </div>
            {profilePicturePreview && (
              <div className="file-upload-preview">
                <img
                  src={profilePicturePreview}
                  alt="Preview"
                />
                <button
                  type="button"
                  className="ghost-button"
                  style={{ marginTop: "0.75rem", fontSize: "0.85rem", width: "100%" }}
                  onClick={() => {
                    setProfilePictureFile(null);
                    setProfilePicturePreview(null);
                  }}
                >
                  Remove photo
                </button>
              </div>
            )}
            <p className="muted small" style={{ marginTop: "0.5rem", textAlign: "center" }}>
              Max 5MB • JPEG, PNG, GIF, or WebP • Leave empty for default avatar
            </p>
          </div>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="muted">
          Already have an account?{" "}
          <Link className="inline-link" to="/profile">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
