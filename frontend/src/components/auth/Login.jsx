import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext";
import { MailIcon, LockIcon, GitBranchIcon, ChevronRightIcon } from "@primer/octicons-react";
import "./auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/login`,
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      setCurrentUser(res.data.userId);
      setLoading(false);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Login Failed! Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Artwork Column */}
      <div className="auth-artwork-col">
        <div className="artwork-overlay"></div>
        <div className="artwork-content">
          <div className="artwork-logo">
            <GitBranchIcon size={36} className="logo-icon-art" />
            <h2>TrackChange</h2>
          </div>
          <h1>Track every commit.<br />Visualize every change.</h1>
          <p>The first activity-first development visualization engine built for tracking repository momentum.</p>
          
          {/* Commit Network Illustration */}
          <div className="network-illustration">
            <div className="network-line main-branch"></div>
            <div className="network-line feature-branch"></div>
            <div className="network-node node-red pt-1" style={{ left: "10%", top: "50%" }}>
              <span className="node-tooltip">Init</span>
            </div>
            <div className="network-node node-teal pt-2" style={{ left: "30%", top: "50%" }}>
              <span className="node-tooltip">Fix</span>
            </div>
            <div className="network-node node-white pt-3" style={{ left: "45%", top: "35%" }}>
              <span className="node-tooltip">Feature</span>
            </div>
            <div className="network-node node-teal pt-4" style={{ left: "65%", top: "35%" }}>
              <span className="node-tooltip">Refactor</span>
            </div>
            <div className="network-node node-red pt-5" style={{ left: "85%", top: "50%" }}>
              <span className="node-tooltip">Merge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="auth-form-col">
        <div className="auth-glass-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Continue tracking your development journey.</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            {/* Email field */}
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

            {/* Password field */}
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
              {loading ? "Signing In..." : "Sign In"}
              <ChevronRightIcon size={16} className="btn-chevron" />
            </button>
          </form>

          <div className="auth-footer">
            <p>New to TrackChange? <Link to="/signup" className="auth-link">Create Account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
