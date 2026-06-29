import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { 
  GitBranchIcon, 
  SearchIcon, 
  PlusIcon, 
  PersonIcon, 
  BellIcon, 
  SignOutIcon, 
  GraphIcon 
} from "@primer/octicons-react";
import "./navbar.css";

const Navbar = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    window.location.href = "/auth";
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      // Navigate to home and let Dashboard handle query or pass query parameter
      navigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <nav className="fixed-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon-wrapper">
            <GitBranchIcon size={24} className="logo-svg" />
          </div>
          <span className="logo-text">
            Track<span className="logo-text-red">Change</span>
            <span className="logo-dot">.</span>
          </span>
        </Link>

        {/* Search */}
        {currentUser && (
          <form className="nav-search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <SearchIcon size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search evolution..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        )}

        {/* Menu Links */}
        {currentUser ? (
          <div className="nav-actions">
            <Link to="/" className="nav-link">
              <GraphIcon size={16} />
              <span>Dashboard</span>
            </Link>
            <Link to="/create" className="nav-link">
              <PlusIcon size={16} />
              <span>New Repository</span>
            </Link>
            <Link to="/profile" className="nav-link">
              <PersonIcon size={16} />
              <span>Profile</span>
            </Link>

            {/* Notifications */}
            <button className="nav-icon-btn" aria-label="Notifications">
              <BellIcon size={16} />
              <span className="notification-dot"></span>
            </button>

            {/* Logout / User Menu */}
            <button onClick={handleLogout} className="nav-logout-btn" title="Sign Out">
              <SignOutIcon size={16} />
            </button>
          </div>
        ) : (
          <div className="nav-actions">
            <Link to="/auth" className="btn-secondary nav-auth-btn">Sign In</Link>
            <Link to="/signup" className="btn-primary nav-auth-btn">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
