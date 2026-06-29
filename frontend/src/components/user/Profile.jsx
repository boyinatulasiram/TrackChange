import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";
import {
  RepoIcon,
  GitCommitIcon,
  IssueOpenedIcon,
  StarIcon,
  PersonIcon,
  FlameIcon,
  SignOutIcon,
  FileCodeIcon,
  HistoryIcon
} from "@primer/octicons-react";

const Profile = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats variables calculated from repositories
  const [stats, setStats] = useState({
    totalCommits: 0,
    weeklyCommits: 0,
    healthScore: 100,
    issuesResolved: 0,
    totalIssues: 0,
    velocity: 0,
  });

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch User details
        const userRes = await axios.get(`http://localhost:8080/userProfile/${userId}`);
        setUserDetails(userRes.data);

        // 2. Fetch User's Repositories
        const reposRes = await axios.get(`http://localhost:8080/repo/user/${userId}`);
        const userRepos = reposRes.data.repositories || [];
        setRepos(userRepos);

        // 3. Process analytics from repos
        let totalC = 0;
        let weeklyC = 0;
        let closedI = 0;
        let totalI = 0;
        let totalHealth = 0;
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        userRepos.forEach((repo) => {
          // Commits aggregation
          const repoCommits = repo.commits || [];
          totalC += repoCommits.length;

          repoCommits.forEach((c) => {
            if (c.date) {
              const cDate = new Date(c.date);
              if (cDate >= oneWeekAgo) {
                weeklyC += 1;
              }
            }
          });

          // Issues aggregation
          const repoIssues = repo.issues || [];
          totalI += repoIssues.length;
          let openInRepo = 0;
          repoIssues.forEach((issue) => {
            if (issue.status === "closed") {
              closedI += 1;
            } else {
              openInRepo += 1;
            }
          });

          // Repository Health: start at 100, deduct 10 per open issue, min 20%
          const health = Math.max(20, 100 - openInRepo * 10);
          totalHealth += health;
        });

        const avgHealth = userRepos.length > 0 ? Math.round(totalHealth / userRepos.length) : 100;
        // Velocity: Weekly commits weighted with a base activity factor
        const calculatedVelocity = Math.min(100, weeklyC * 8 + (userRepos.length * 5));

        setStats({
          totalCommits: totalC,
          weeklyCommits: weeklyC,
          healthScore: avgHealth,
          issuesResolved: closedI,
          totalIssues: totalI,
          velocity: calculatedVelocity,
        });

      } catch (err) {
        console.error("Error fetching profile details and repos: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate]);

  // Aggregate all commits from all repos for the heatmap & timeline
  const allCommits = repos.flatMap((repo) =>
    (repo.commits || []).map((c) => ({
      ...c,
      repoName: repo.name,
      repoId: repo._id,
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    window.location.href = "/auth";
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Analyzing developer footprint...</p>
      </div>
    );
  }

  // Get initials for profile picture
  const userInitials = userDetails?.username
    ? userDetails.username.substring(0, 2).toUpperCase()
    : "TC";

  return (
    <>
      <Navbar />
      <div className="profile-container">
        {/* Left Side: Profile Sidebar card */}
        <aside className="profile-sidebar glass-card">
          <div className="avatar-wrapper">
            <div className="profile-avatar-gradient">
              {userInitials}
            </div>
            <div className="active-badge" title="Developer active"></div>
          </div>

          <h2 className="user-name">{userDetails?.username || "Developer"}</h2>
          <p className="user-email">{userDetails?.email || "developer@trackchange.io"}</p>

          <div className="follow-stats">
            <div className="follow-item">
              <span className="follow-count">{userDetails?.followedUsers?.length || 0}</span>
              <span className="follow-label">Followers</span>
            </div>
            <div className="follow-border"></div>
            <div className="follow-item">
              <span className="follow-count">{userDetails?.starRepos?.length || 0}</span>
              <span className="follow-label">Starred</span>
            </div>
          </div>

          <div className="sidebar-stats-list">
            <div className="sidebar-stat-row">
              <div className="stat-label">
                <RepoIcon className="stat-icon" />
                <span>Repositories</span>
              </div>
              <span className="stat-value">{repos.length}</span>
            </div>
            <div className="sidebar-stat-row">
              <div className="stat-label">
                <GitCommitIcon className="stat-icon" />
                <span>Total Commits</span>
              </div>
              <span className="stat-value">{stats.totalCommits}</span>
            </div>
            <div className="sidebar-stat-row">
              <div className="stat-label">
                <IssueOpenedIcon className="stat-icon" />
                <span>Total Issues</span>
              </div>
              <span className="stat-value">{stats.totalIssues}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn" id="logout">
            <SignOutIcon className="logout-icon" />
            <span>Logout</span>
          </button>
        </aside>

        {/* Right Side: Main Dashboard area */}
        <main className="profile-main-content">
          {/* Hero Welcome */}
          <div className="welcome-banner">
            <h1>Developer Overview</h1>
            <p>Track your commits, system health, and code evolution analytics in one unified dashboard.</p>
          </div>

          {/* Metric Cards Grid */}
          <section className="metrics-grid">
            {/* Weekly Commits */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <span className="metric-title">Weekly Commits</span>
                <div className="metric-icon-box commits-bg">
                  <GitCommitIcon className="metric-icon text-red" />
                </div>
              </div>
              <div className="metric-body">
                <span className="metric-value">{stats.weeklyCommits}</span>
                <span className="metric-unit">commits</span>
              </div>
              <div className="metric-footer">
                <span className="metric-subtext">In the last 7 days</span>
              </div>
            </div>

            {/* Repository Health */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <span className="metric-title">Repository Health</span>
                <div className="metric-icon-box health-bg">
                  <FlameIcon className="metric-icon text-teal" />
                </div>
              </div>
              <div className="metric-body">
                <span className="metric-value">{stats.healthScore}%</span>
                <div className="health-bar-container">
                  <div 
                    className="health-bar-fill" 
                    style={{ width: `${stats.healthScore}%` }}
                  ></div>
                </div>
              </div>
              <div className="metric-footer">
                <span className="metric-subtext">Based on active unresolved issues</span>
              </div>
            </div>

            {/* Issues Resolved */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <span className="metric-title">Issues Resolved</span>
                <div className="metric-icon-box issues-bg">
                  <IssueOpenedIcon className="metric-icon text-navy" />
                </div>
              </div>
              <div className="metric-body">
                <span className="metric-value">
                  {stats.issuesResolved}
                  <span className="value-separator">/</span>
                  <span className="value-total">{stats.totalIssues}</span>
                </span>
              </div>
              <div className="metric-footer">
                <span className="metric-subtext">Issues resolved successfully</span>
              </div>
            </div>

            {/* Development Velocity */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <span className="metric-title">Activity Score</span>
                <div className="metric-icon-box velocity-bg">
                  <PersonIcon className="metric-icon text-blue" />
                </div>
              </div>
              <div className="metric-body">
                <span className="metric-value">{stats.velocity}</span>
                <span className="metric-unit">pts</span>
              </div>
              <div className="metric-footer">
                <span className="metric-subtext">Weighted index of weekly contributions</span>
              </div>
            </div>
          </section>

          {/* Code Evolution Heatmap Card */}
          <section className="heatmap-section-card glass-card">
            <HeatMapProfile commits={allCommits} />
          </section>

          {/* Bottom Columns: Repositories & Recent Commit Timeline */}
          <div className="profile-columns-wrapper">
            {/* Left Column: Repository Grid */}
            <div className="profile-repos-column">
              <div className="column-header">
                <h3>Your Repositories</h3>
                <span className="repos-count-badge">{repos.length} total</span>
              </div>

              {repos.length === 0 ? (
                <div className="empty-repos-card glass-card">
                  <RepoIcon size={24} className="empty-icon" />
                  <p>No repositories found. Create your first repo to start tracking changes!</p>
                  <button onClick={() => navigate("/create")} className="btn-primary">
                    Create Repository
                  </button>
                </div>
              ) : (
                <div className="profile-repos-list">
                  {repos.map((repo) => (
                    <div 
                      key={repo._id} 
                      className="profile-repo-card glass-card"
                      onClick={() => navigate(`/repo/${repo._id}`)}
                    >
                      <div className="repo-card-top">
                        <h4 className="repo-card-title">{repo.name}</h4>
                        <span className={`badge ${repo.visibility ? "badge-public" : "badge-private"}`}>
                          {repo.visibility ? "Public" : "Private"}
                        </span>
                      </div>
                      
                      <p className="repo-card-desc">
                        {repo.description || "No description provided."}
                      </p>

                      <div className="repo-card-footer">
                        <span className="footer-item">
                          <FileCodeIcon size={14} className="footer-icon" />
                          {repo.content?.length || 0} Files
                        </span>
                        <span className="footer-item">
                          <IssueOpenedIcon size={14} className="footer-icon" />
                          {repo.issues?.filter(i => i.status !== "closed").length || 0} Open Issues
                        </span>
                        <span className="footer-item">
                          <GitCommitIcon size={14} className="footer-icon" />
                          {repo.commits?.length || 0} Commits
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Recent Commit Timeline */}
            <div className="profile-timeline-column">
              <div className="column-header">
                <h3>Activity Feed</h3>
                <span className="timeline-subtitle">Recent commits across your project space</span>
              </div>

              {allCommits.length === 0 ? (
                <div className="empty-timeline-card glass-card">
                  <HistoryIcon size={24} className="empty-icon" />
                  <p>No commit activity recorded yet. Run `apnagit push` to populate history.</p>
                </div>
              ) : (
                <div className="profile-timeline-card glass-card">
                  <div className="profile-timeline">
                    {allCommits.slice(0, 5).map((commit, index) => (
                      <div key={commit.commitID || index} className="profile-timeline-item">
                        <div className="timeline-badge-circle">
                          <GitCommitIcon size={12} className="timeline-badge-icon" />
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-meta">
                            <span 
                              className="timeline-repo-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/repo/${commit.repoId}`);
                              }}
                            >
                              {commit.repoName}
                            </span>
                            <span className="timeline-date">
                              {new Date(commit.date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="timeline-msg">{commit.message}</p>
                          <div className="timeline-commit-id">
                            <span>ID: <code>{commit.commitID?.substring(0, 7)}</code></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;
