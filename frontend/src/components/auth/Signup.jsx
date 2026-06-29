import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext";
import { MailIcon, LockIcon, PersonIcon, GitBranchIcon, ChevronRightIcon, CheckIcon } from "@primer/octicons-react";
import "./auth.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email || !username || !password) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/signup`,
        { email, username, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      setCurrentUser(res.data.userId);
      setLoading(false);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Signup Failed! Username or Email might be already taken.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Column Artwork */}
      <div className="auth-artwork-col">
        <div className="artwork-overlay"></div>
        <div className="artwork-content">
          <div className="artwork-logo">
            <GitBranchIcon size={36} className="logo-icon-art" />
            <h2>TrackChange</h2>
          </div>
          <h1>Start Tracking Change.</h1>
          <p className="art-sub">Build repositories. Track evolution. Visualize progress.</p>
          
          {/* Benefits Bullet List */}
          <div className="benefits-list">
            <div className="benefit-item">
              <div className="check-badge"><CheckIcon size={14} /></div>
              <span>Repository Tracking</span>
            </div>
            <div className="benefit-item">
              <div className="check-badge"><CheckIcon size={14} /></div>
              <span>Activity Analytics</span>
            </div>
            <div className="benefit-item">
              <div className="check-badge"><CheckIcon size={14} /></div>
              <span>Commit Visualization</span>
            </div>
            <div className="benefit-item">
              <div className="check-badge"><CheckIcon size={14} /></div>
              <span>Development Insights</span>
            </div>
          </div>

          {/* Growing Commit Graph Illustration */}
          <div className="network-illustration growing-graph">
            <div className="network-line main-branch"></div>
            <div className="network-line feature-branch-up"></div>
            <div className="network-node node-red pt-1" style={{ left: "10%", top: "60%" }}></div>
            <div className="network-node node-teal pt-2" style={{ left: "30%", top: "60%" }}></div>
            <div className="network-node node-white pt-3" style={{ left: "50%", top: "30%" }}></div>
            <div className="network-node node-teal pt-4" style={{ left: "70%", top: "30%" }}></div>
            <div className="network-node node-red pulse-grow" style={{ left: "90%", top: "30%" }}>
              <span className="grow-pulse-ring"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column Form */}
      <div className="auth-form-col">
        <div className="auth-glass-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Begin visualizing your repository evolution.</p>
          </div>

          <form onSubmit={handleSignup} className="auth-form">
            {/* Username Field */}
            <div className="floating-input-group">
              <PersonIcon size={18} className="input-icon" />
              <input
                id="Username"
                type="text"
                className="auth-input-field"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label htmlFor="Username">Username</label>
            </div>

            {/* Email Field */}
            <div className="floating-input-group">
              <MailIcon size={18} className="input-icon" />
              <input
                id="Email"
                type="email"
                className="auth-input-field"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="Email">Email address</label>
            </div>

            {/* Password Field */}
            <div className="floating-input-group">
              <LockIcon size={18} className="input-icon" />
              <input
                id="Password"
                type="password"
                className="auth-input-field"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="Password">Password</label>
            </div>

            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading ? "Registering..." : "Create Account"}
              <ChevronRightIcon size={16} className="btn-chevron" />
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/auth" className="auth-link">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
