import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import { 
  RepoIcon, 
  GitCommitIcon, 
  IssueOpenedIcon, 
  FlameIcon, 
  CheckIcon, 
  CalendarIcon, 
  ClockIcon, 
  PeopleIcon,
  ProjectIcon,
  ChevronRightIcon,
  PlusIcon
} from "@primer/octicons-react";
import "./dashboard.css";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Sync search query from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchVal = searchParams.get("search") || "";
    setSearchQuery(searchVal);
  }, [location.search]);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch(`${apiUrl}/repo/user/${userId}`);
        const data = await response.json();
        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`${apiUrl}/repo/all`);
        const data = await response.json();
        
        // Suggest only public repositories belonging to other users
        const suggestions = data.filter(
          (repo) => repo.visibility === true && repo.owner && repo.owner._id !== userId && repo.owner !== userId
        );
        setSuggestedRepositories(suggestions);
      } catch (err) {
        console.error("Error while fetching suggested repositories: ", err);
      }
    };

    if (userId) {
      fetchRepositories();
      fetchSuggestedRepositories();
    }
  }, [userId, apiUrl]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  // Aggregate Stats
  const totalRepos = repositories.length;
  const totalCommits = repositories.reduce((sum, r) => sum + (r.commits ? r.commits.length : 0), 0);
  const totalIssues = repositories.reduce((sum, r) => sum + (r.issues ? r.issues.length : 0), 0);
  const velocityScore = totalCommits > 0 ? Math.min(100, 45 + totalCommits * 8) : 0;

  // Aggregate recent changes timeline
  const allCommits = repositories.flatMap(r => 
    (r.commits || []).map(c => ({
      ...c,
      repoName: r.name,
      repoId: r._id
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        {/* Hero Section */}
        <header className="dashboard-hero glass-card">
          <div className="hero-text">
            <span className="hero-pulse-badge">
              <span className="pulse-dot"></span>
              TrackChange Pulse
            </span>
            <h1>Monitor repository evolution<br />across your projects.</h1>
            <p>Track every commit, visualize momentum, and measure development velocity in real time.</p>
          </div>
          
          {/* Animated Commit Timeline Visual in Hero */}
          <div className="hero-visual">
            <div className="pulse-network">
              <div className="pulse-line"></div>
              <div className="pulse-node p1"></div>
              <div className="pulse-node p2"></div>
              <div className="pulse-node p3"></div>
              <div className="pulse-node-active p4">
                <span className="pulse-ring-glow"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon red"><GitCommitIcon size={20} /></div>
            <div className="stat-info">
              <h3>{totalCommits}</h3>
              <p>Total Commits</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon teal"><RepoIcon size={20} /></div>
            <div className="stat-info">
              <h3>{totalRepos}</h3>
              <p>Active Repositories</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon dark"><IssueOpenedIcon size={20} /></div>
            <div className="stat-info">
              <h3>{totalIssues}</h3>
              <p>Open Issues</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon velocity"><FlameIcon size={20} /></div>
            <div className="stat-info">
              <h3>{velocityScore > 0 ? `${velocityScore}%` : "0%"}</h3>
              <p>Development Velocity</p>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Suggested Repos */}
          <aside className="dashboard-sidebar-left">
            <div className="sidebar-box glass-card">
              <h3>Suggested Repositories</h3>
              <p className="sidebar-subtitle">Discover projects in the network.</p>
              
              <div className="suggested-list">
                {suggestedRepositories.length > 0 ? (
                  suggestedRepositories.map((repo) => {
                    const activity = (repo.commits ? repo.commits.length * 12 : 0) + 35;
                    const cleanActivity = Math.min(99, activity);
                    return (
                      <Link to={`/repo/${repo._id}`} key={repo._id} className="suggested-card">
                        <div className="sug-header">
                          <h4>{repo.name}</h4>
                          <span className="sug-score">Pulse {cleanActivity}</span>
                        </div>
                        <p className="sug-desc">{repo.description || "No description provided."}</p>
                        <div className="sug-meta">
                          <span>@{repo.owner && typeof repo.owner === "object" ? repo.owner.username : "Unknown"}</span>
                          <span className="sug-dot">•</span>
                          <span>Last Commit {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : "N/A"}</span>
                        </div>
                        
                        {/* Mini Activity Line SVG */}
                        <div className="mini-activity-graph">
                          <svg viewBox="0 0 100 25" width="100%" height="25">
                            <path 
                              d={`M0,20 Q15,${25 - cleanActivity/4} 30,12 T60,${18 - cleanActivity/6} T90,2`} 
                              fill="none" 
                              stroke="var(--primary-red)" 
                              strokeWidth="2" 
                            />
                            <circle cx="90" cy="2" r="3" fill="var(--primary-red)" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="empty-text">No suggested projects found.</p>
                )}
              </div>
            </div>
          </aside>

          {/* Center Column: Your Repos */}
          <main className="dashboard-main-col">
            <div className="repos-container-header">
              <h2>Your Repositories</h2>
              <Link to="/create" className="btn-primary btn-new-repo">
                <PlusIcon size={16} />
                <span>New Project</span>
              </Link>
            </div>

            {/* Custom Search bar */}
            <div className="repo-search-bar">
              <input
                type="text"
                value={searchQuery}
                placeholder="Filter your repositories by name..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input search-repos-input"
              />
            </div>

            <div className="repositories-list">
              {searchResults.length > 0 ? (
                searchResults.map((repo) => {
                  const repoIssuesCount = repo.issues ? repo.issues.length : 0;
                  const healthScore = Math.max(20, 100 - (repoIssuesCount * 12));
                  const latestMsg = repo.commits && repo.commits.length > 0 
                    ? repo.commits[repo.commits.length - 1].message 
                    : "No commits yet";

                  return (
                    <div key={repo._id} className="repo-row-card glass-card">
                      <div className="repo-card-top">
                        <div className="repo-title-wrapper">
                          <Link to={`/repo/${repo._id}`} className="repo-card-title">
                            <h3>{repo.name}</h3>
                          </Link>
                          <span className={`badge ${repo.visibility ? "badge-public" : "badge-private"}`}>
                            {repo.visibility ? "Public" : "Private"}
                          </span>
                        </div>
                        
                        {/* Health Score Indicator */}
                        <div className="health-score-indicator" title={`Repository Health: ${healthScore}%`}>
                          <span className="health-label">Health</span>
                          <div className="health-bar-bg">
                            <div 
                              className="health-bar-fill" 
                              style={{ 
                                width: `${healthScore}%`,
                                backgroundColor: healthScore > 75 ? "var(--slate-blue)" : healthScore > 40 ? "var(--accent-teal)" : "var(--primary-red)"
                              }}
                            ></div>
                          </div>
                          <span className="health-val">{healthScore}%</span>
                        </div>
                      </div>

                      <p className="repo-card-desc">
                        {repo.description || "No description provided."}
                      </p>

                      {/* Latest Commit Message */}
                      <div className="repo-latest-commit-banner">
                        <GitCommitIcon size={16} className="commit-banner-icon" />
                        <span className="commit-msg" title={latestMsg}>{latestMsg}</span>
                      </div>

                      {/* Metadata Row */}
                      <div className="repo-card-meta">
                        <div className="meta-stats">
                          <span title="Tracked Files"><ProjectIcon size={14} /> {repo.content ? repo.content.length : 0} Files</span>
                          <span title="Open Issues"><IssueOpenedIcon size={14} /> {repoIssuesCount} Issues</span>
                          <span title="Contributors"><PeopleIcon size={14} /> 1 Contributor</span>
                        </div>
                        
                        {/* Mini Contribution Heatmap Mock */}
                        <div className="mini-heatmap" title="Recent contribution spikes">
                          <div className="heatmap-box lvl-3"></div>
                          <div className="heatmap-box lvl-1"></div>
                          <div className="heatmap-box lvl-0"></div>
                          <div className="heatmap-box lvl-2"></div>
                          <div className="heatmap-box lvl-4"></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-repos-view glass-card">
                  <ProjectIcon size={40} className="empty-icon" />
                  <h3>No repositories found</h3>
                  <p>Create a repository and use the TrackChange CLI to upload and track your code evolution.</p>
                  <Link to="/create" className="btn-primary" style={{ marginTop: "15px" }}>Create Repository</Link>
                </div>
              )}
            </div>
          </main>

          {/* Right Column: Developer Radar */}
          <aside className="dashboard-sidebar-right">
            <div className="sidebar-box glass-card">
              <h3>Developer Radar</h3>
              <p className="sidebar-subtitle">Version control insights & activity.</p>

              <div className="radar-section">
                <h4 className="radar-title">Developer Insights</h4>
                <div className="insight-card">
                  <div className="insight-top">
                    <span className="insight-label">Velocity Trend</span>
                    <span className="insight-badge badge-public">Stable</span>
                  </div>
                  <p>Commit activity is steady. Keep creating commits to see timeline metrics grow.</p>
                </div>
              </div>

              <div className="radar-section" style={{ marginTop: "24px" }}>
                <h4 className="radar-title">Network Events</h4>
                <ul className="radar-events-list">
                  <li>
                    <CalendarIcon size={14} />
                    <div>
                      <h5>V2.0 Release</h5>
                      <p>July 10, 2026</p>
                    </div>
                  </li>
                  <li>
                    <CalendarIcon size={14} />
                    <div>
                      <h5>Commits Sync</h5>
                      <p>Continuous</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Section: Recent Change Feed */}
        <section className="dashboard-timeline-section glass-card">
          <h2>Recent Change Feed</h2>
          <p className="section-subtitle">Real-time commit updates across your workspace.</p>
          
          <div className="timeline-feed">
            {allCommits.length > 0 ? (
              allCommits.slice(0, 5).map((commit, idx) => (
                <div key={idx} className="timeline-feed-item">
                  <div className="timeline-node-dot">
                    <GitCommitIcon size={14} />
                  </div>
                  <div className="timeline-feed-content">
                    <div className="timeline-feed-header">
                      <Link to={`/repo/${commit.repoId}`} className="timeline-repo-name">
                        {commit.repoName}
                      </Link>
                      <span className="timeline-time">
                        <ClockIcon size={12} /> {new Date(commit.date).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="timeline-commit-msg">{commit.message}</h4>
                    <div className="timeline-commit-details">
                      <span>Commit: <strong className="commit-hash">{commit.commitID.substring(0, 8)}</strong></span>
                      <span className="divider">•</span>
                      <span>Files changed: <strong className="files-count">{commit.files ? commit.files.length : 0}</strong></span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-text">No recent commits found. Run 'node index.js push' locally to sync commits!</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
