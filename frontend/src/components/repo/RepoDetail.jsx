import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./repo.css";
import {
  RepoIcon,
  GlobeIcon,
  LockIcon,
  FlameIcon,
  FileCodeIcon,
  GitCommitIcon,
  IssueOpenedIcon,
  TerminalIcon,
  CalendarIcon,
  PersonIcon,
  CopyIcon,
  CheckIcon,
  TrashIcon,
  SyncIcon,
  CheckCircleIcon,
  PlayIcon,
  InfoIcon
} from "@primer/octicons-react";

const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Tab control: 'code' or 'issues'
  const [activeTab, setActiveTab] = useState("code");

  // Copy code feedback state
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Issue creation form state
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [creatingIssue, setCreatingIssue] = useState(false);
  const [issueError, setIssueError] = useState("");
  const [updatingIssueId, setUpdatingIssueId] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchRepoDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/repo/${id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch repository details");
      }
      
      setRepo(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load repository.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepoDetails();
  }, [id]);

  const handleToggleVisibility = async () => {
    try {
      const response = await fetch(`${apiUrl}/repo/toggle/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to toggle visibility");
      }
      
      setRepo({
        ...repo,
        visibility: data.repository.visibility
      });
    } catch (err) {
      alert(err.message || "Could not toggle visibility.");
    }
  };

  const handleDeleteRepo = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete this repository? This will wipe all commit logs and file structures permanently!")) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/repo/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete repository");
      }

      navigate("/");
    } catch (err) {
      alert(err.message || "Could not delete repository.");
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    setIssueError("");

    if (!issueTitle.trim() || !issueDesc.trim()) {
      setIssueError("Both title and description are required!");
      return;
    }

    try {
      setCreatingIssue(true);
      const response = await fetch(`${apiUrl}/issue/create/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: issueTitle.trim(),
          description: issueDesc.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create issue");
      }

      setIssueTitle("");
      setIssueDesc("");
      setCreatingIssue(false);
      
      fetchRepoDetails();
    } catch (err) {
      console.error(err);
      setIssueError(err.message || "Could not create issue.");
      setCreatingIssue(false);
    }
  };

  const handleUpdateIssueStatus = async (issueId, currentTitle, currentDesc, newStatus) => {
    try {
      setUpdatingIssueId(issueId);
      const response = await fetch(`${apiUrl}/issue/update/${issueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: currentTitle,
          description: currentDesc,
          status: newStatus
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update issue");
      }

      fetchRepoDetails();
    } catch (err) {
      alert(err.message || "Could not update issue status.");
    } finally {
      setUpdatingIssueId(null);
    }
  };

  const handleCopyCode = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="repo-loading-screen">
          <div className="spinner"></div>
          <p>Assembling repository metadata...</p>
        </div>
      </>
    );
  }

  if (error || !repo) {
    return (
      <>
        <Navbar />
        <div className="repo-error-screen">
          <div className="error-card glass-card">
            <InfoIcon size={36} className="error-card-icon" />
            <h3>Repository Not Found</h3>
            <p>{error || "The repository may have been deleted or the access is restricted."}</p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Return to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  const isOwner = repo.owner && (repo.owner._id === localStorage.getItem("userId") || repo.owner === localStorage.getItem("userId"));

  // Calculate Health Score: Starts at 100, drops by 10 for every open issue, minimum capped at 20%
  const openIssues = (repo.issues || []).filter((i) => i.status !== "closed");
  const closedIssues = (repo.issues || []).filter((i) => i.status === "closed");
  const healthScore = Math.max(20, 100 - openIssues.length * 10);

  // Health color themes
  const getHealthClass = (score) => {
    if (score >= 80) return "health-good";
    if (score >= 50) return "health-warn";
    return "health-danger";
  };

  const cliCommands = [
    { title: "Initialize local system", code: "apnagit init" },
    { title: "Identify developer profile", code: `apnagit config email ${localStorage.getItem("userEmail") || "my-email@example.com"}` },
    { title: "Map remote tracking origin", code: `apnagit remote add origin ${repo.name}` },
    { title: "Stage local changes", code: "apnagit add ." },
    { title: "Record local snapshot", code: 'apnagit commit "Initial project commit"' },
    { title: "Synchronize commits remote", code: "apnagit push" }
  ];

  const sortedCommits = repo.commits ? [...repo.commits].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  const oldestCommit = repo.commits && repo.commits.length > 0 ? repo.commits[0] : null;

  return (
    <>
      <Navbar />
      <div className="repo-detail-container">
        {/* Flagship Header */}
        <header className="repo-detail-header glass-card">
          <div className="header-left">
            <div className="repo-icon-box">
              <RepoIcon size={28} className="text-navy" />
            </div>
            <div className="repo-meta-titles">
              <div className="title-row">
                <h2>{repo.name}</h2>
                <span className={`badge ${repo.visibility ? "badge-public" : "badge-private"}`}>
                  {repo.visibility ? <GlobeIcon size={12} className="inline-icon" /> : <LockIcon size={12} className="inline-icon" />}
                  {repo.visibility ? "Public" : "Private"}
                </span>
              </div>
              <p className="owner-meta">
                Owned by <span className="owner-highlight">{repo.owner && typeof repo.owner === "object" ? repo.owner.username : "Unknown"}</span>
              </p>
            </div>
          </div>
          
          {isOwner && (
            <div className="header-right">
              <button onClick={handleToggleVisibility} className="btn-secondary flex-center">
                <SyncIcon size={16} className="btn-icon" />
                <span>Make {repo.visibility ? "Private" : "Public"}</span>
              </button>
              <button onClick={handleDeleteRepo} className="btn-primary danger-btn flex-center">
                <TrashIcon size={16} className="btn-icon" />
                <span>Delete Repo</span>
              </button>
            </div>
          )}
        </header>

        {/* Repository Description */}
        <div className="repo-desc-card glass-card">
          <h3>Repository Overview</h3>
          <p>{repo.description || "This repository does not have a detailed description configured."}</p>
        </div>

        {/* Activity Grid (4 Stat cards) */}
        <section className="repo-stats-grid">
          {/* Health index card */}
          <div className="stat-card glass-card">
            <div className="card-top">
              <span>Repository Health</span>
              <FlameIcon className={`card-icon ${getHealthClass(healthScore)}`} />
            </div>
            <div className="card-body">
              <span className="card-value">{healthScore}%</span>
              <div className="health-bar-bg">
                <div 
                  className={`health-bar-inner ${getHealthClass(healthScore)}`}
                  style={{ width: `${healthScore}%` }}
                ></div>
              </div>
            </div>
            <div className="card-footer-text">Calculated from open active issues</div>
          </div>

          {/* Files count card */}
          <div className="stat-card glass-card">
            <div className="card-top">
              <span>Tracked Files</span>
              <FileCodeIcon className="card-icon text-blue" />
            </div>
            <div className="card-body">
              <span className="card-value">{repo.content?.length || 0}</span>
              <span className="card-label">files</span>
            </div>
            <div className="card-footer-text">Merged into current master file tree</div>
          </div>

          {/* Commits count card */}
          <div className="stat-card glass-card">
            <div className="card-top">
              <span>Total Commits</span>
              <GitCommitIcon className="card-icon text-red" />
            </div>
            <div className="card-body">
              <span className="card-value">{repo.commits?.length || 0}</span>
              <span className="card-label">commits</span>
            </div>
            <div className="card-footer-text">Version snapshots pushed to origin</div>
          </div>

          {/* Issues count card */}
          <div className="stat-card glass-card">
            <div className="card-top">
              <span>Active Issues</span>
              <IssueOpenedIcon className="card-icon text-navy" />
            </div>
            <div className="card-body">
              <span className="card-value">{openIssues.length}</span>
              <span className="card-label">open</span>
            </div>
            <div className="card-footer-text">{closedIssues.length} issues successfully resolved</div>
          </div>
        </section>

        {/* Segmented Workspace Tabs */}
        <div className="workspace-tabs-navigator">
          <button 
            className={`tab-btn ${activeTab === "code" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("code")}
          >
            <FileCodeIcon size={16} />
            <span>Files & Milestones</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === "issues" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("issues")}
          >
            <IssueOpenedIcon size={16} />
            <span>Issue Workbench (Kanban)</span>
          </button>
        </div>

        {/* Tab Layout Container */}
        <div className="workspace-tabs-content">
          {activeTab === "code" ? (
            <div className="tab-grid-layout">
              {/* Left Column: Code explorer & Milestones */}
              <div className="workspace-main-column">
                
                {/* File Explorer Card */}
                <div className="files-explorer-card glass-card">
                  <div className="card-header-bar">
                    <h3>Tracked Repository Files</h3>
                    <span className="count-tag">{repo.content?.length || 0} files</span>
                  </div>
                  
                  {(!repo.content || repo.content.length === 0) ? (
                    <div className="empty-files-placeholder">
                      <FileCodeIcon size={32} className="placeholder-icon" />
                      <p>This repository does not contain any synchronized code files yet.</p>
                      <span className="placeholder-helper">Follow the connection guide on the right to push your local files.</span>
                    </div>
                  ) : (
                    <div className="files-grid-list">
                      {repo.content.map((file, idx) => (
                        <div key={idx} className="file-grid-item">
                          <FileCodeIcon size={18} className="file-icon" />
                          <div className="file-info">
                            <span className="file-name">{file}</span>
                            <span className="file-details">Tracked origin file</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Evolution Milestones */}
                <div className="milestones-evolution-card glass-card">
                  <div className="card-header-bar">
                    <h3>Project Evolution Milestones</h3>
                  </div>

                  <div className="milestones-vertical-timeline">
                    {/* Milestone 1: Repo created */}
                    <div className="milestone-timeline-item">
                      <div className="milestone-node birth-node">
                        <CheckCircleIcon size={12} />
                      </div>
                      <div className="milestone-body">
                        <div className="milestone-meta">
                          <span className="milestone-title">Repository Instantiation</span>
                          <span className="milestone-time">
                            {repo.createdAt ? new Date(repo.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                        <p className="milestone-desc">
                          Project tracking space created on TrackChange by {repo.owner && typeof repo.owner === "object" ? repo.owner.username : "owner"}.
                        </p>
                      </div>
                    </div>

                    {/* Milestone 2: First commit */}
                    {oldestCommit && (
                      <div className="milestone-timeline-item">
                        <div className="milestone-node code-node">
                          <GitCommitIcon size={12} />
                        </div>
                        <div className="milestone-body">
                          <div className="milestone-meta">
                            <span className="milestone-title">First Code Synced</span>
                            <span className="milestone-time">
                              {new Date(oldestCommit.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="milestone-desc">
                            First push commit recorded: <code>{oldestCommit.message}</code> ({oldestCommit.commitID.substring(0, 7)}).
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Milestone 3: Latest commit */}
                    {sortedCommits.length > 0 && (
                      <div className="milestone-timeline-item">
                        <div className="milestone-node peak-node">
                          <FlameIcon size={12} />
                        </div>
                        <div className="milestone-body">
                          <div className="milestone-meta">
                            <span className="milestone-title">Latest State Captured</span>
                            <span className="milestone-time">
                              {new Date(sortedCommits[0].date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="milestone-desc">
                            Latest project commit: <strong>"{sortedCommits[0].message}"</strong> ({sortedCommits[0].commitID.substring(0, 7)}).
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Complete Commits Logs */}
                  {sortedCommits.length > 0 && (
                    <div className="commits-history-logs">
                      <h4 className="sub-title">Version Logs History</h4>
                      <div className="commits-logs-list">
                        {sortedCommits.map((commit, idx) => (
                          <div key={commit.commitID || idx} className={`log-row-item ${idx === 0 ? "highlight-latest" : ""}`}>
                            <div className="log-badge-wrapper">
                              <GitCommitIcon size={14} className="log-row-icon" />
                            </div>
                            <div className="log-row-content">
                              <div className="log-row-header">
                                <span className="log-message">{commit.message}</span>
                                <span className="log-date">
                                  {new Date(commit.date).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              <span className="log-id">ID: <code>{commit.commitID}</code></span>
                              {commit.files && commit.files.length > 0 && (
                                <div className="log-files-list">
                                  {commit.files.map((file, fIdx) => (
                                    <span key={fIdx} className="log-file-tag">{file}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: CLI Setup & Metadata */}
              <div className="workspace-sidebar-column">
                
                {/* CLI Setup guide */}
                <div className="cli-guide-card glass-card">
                  <div className="card-header-bar">
                    <TerminalIcon size={18} className="text-navy" />
                    <h3>CLI Sync Guide</h3>
                  </div>
                  <p className="cli-instructions">
                    Run the following commands in your project's local root folder to push local changes.
                  </p>
                  
                  <div className="cli-terminal-shell">
                    {cliCommands.map((cmd, index) => (
                      <div key={index} className="terminal-command-row">
                        <div className="command-header">
                          <span className="command-number">0{index + 1}. {cmd.title}</span>
                          <button 
                            onClick={() => handleCopyCode(cmd.code, index)} 
                            className="copy-btn-icon"
                            title="Copy to Clipboard"
                          >
                            {copiedIndex === index ? (
                              <CheckIcon size={12} className="copied-green-icon" />
                            ) : (
                              <CopyIcon size={12} />
                            )}
                          </button>
                        </div>
                        <div className="command-box-code">
                          <code>$ {cmd.code}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata details */}
                <div className="metadata-card glass-card">
                  <div className="card-header-bar">
                    <CalendarIcon size={18} className="text-teal" />
                    <h3>Meta Parameters</h3>
                  </div>
                  <div className="meta-lines-list">
                    <div className="meta-line">
                      <span className="meta-label">System Owner</span>
                      <span className="meta-val">
                        {repo.owner && typeof repo.owner === "object" ? repo.owner.username : "Unknown"}
                      </span>
                    </div>
                    <div className="meta-line">
                      <span className="meta-label">Created At</span>
                      <span className="meta-val">
                        {repo.createdAt ? new Date(repo.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="meta-line">
                      <span className="meta-label">Last Snapshot</span>
                      <span className="meta-val">
                        {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Tab 2: Issue workbench */
            <div className="kanban-workbench-layout">
              {/* Kanban columns */}
              <div className="kanban-board">
                {/* Active Column */}
                <div className="kanban-column column-active glass-card">
                  <div className="kanban-column-header">
                    <div className="flex-align-center gap-6">
                      <div className="status-indicator-dot dot-active"></div>
                      <h4>Active Issues</h4>
                    </div>
                    <span className="column-count-badge">{openIssues.length}</span>
                  </div>

                  <div className="kanban-cards-stack">
                    {openIssues.length === 0 ? (
                      <div className="kanban-card-empty">
                        <CheckCircleIcon size={24} className="empty-resolved-icon" />
                        <p>No active issues. Code evolution is stable!</p>
                      </div>
                    ) : (
                      openIssues.map((issue) => (
                        <div key={issue._id} className="kanban-card glass-card-nested">
                          <h5 className="kanban-card-title">{issue.title}</h5>
                          <p className="kanban-card-desc">{issue.description}</p>
                          <div className="kanban-card-actions">
                            <button 
                              onClick={() => handleUpdateIssueStatus(issue._id, issue.title, issue.description, "closed")}
                              className="kanban-action-btn action-resolve"
                              disabled={updatingIssueId === issue._id}
                            >
                              {updatingIssueId === issue._id ? "Processing..." : "Mark Resolved"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Resolved Column */}
                <div className="kanban-column column-resolved glass-card">
                  <div className="kanban-column-header">
                    <div className="flex-align-center gap-6">
                      <div className="status-indicator-dot dot-resolved"></div>
                      <h4>Resolved Issues</h4>
                    </div>
                    <span className="column-count-badge">{closedIssues.length}</span>
                  </div>

                  <div className="kanban-cards-stack">
                    {closedIssues.length === 0 ? (
                      <div className="kanban-card-empty">
                        <InfoIcon size={24} />
                        <p>No resolved issues yet.</p>
                      </div>
                    ) : (
                      closedIssues.map((issue) => (
                        <div key={issue._id} className="kanban-card kanban-card-closed glass-card-nested">
                          <h5 className="kanban-card-title">{issue.title}</h5>
                          <p className="kanban-card-desc">{issue.description}</p>
                          <div className="kanban-card-actions">
                            <button 
                              onClick={() => handleUpdateIssueStatus(issue._id, issue.title, issue.description, "open")}
                              className="kanban-action-btn action-reopen"
                              disabled={updatingIssueId === issue._id}
                            >
                              {updatingIssueId === issue._id ? "Processing..." : "Re-open Issue"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Open Issue Card Form */}
              <div className="issue-creator-card glass-card">
                <h3>Open a New Issue</h3>
                <p className="creator-subtitle">Identify bottlenecks, bugs, or milestones that require resolution.</p>
                
                <form onSubmit={handleCreateIssue} className="issue-create-form">
                  <div className="form-group">
                    <label htmlFor="issueTitle">Issue Summary</label>
                    <input
                      id="issueTitle"
                      type="text"
                      className="form-input text-field"
                      placeholder="e.g. Critical: Push command throws S3 config exceptions"
                      value={issueTitle}
                      onChange={(e) => setIssueTitle(e.target.value)}
                      disabled={creatingIssue}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="issueDesc">Issue Description</label>
                    <textarea
                      id="issueDesc"
                      className="form-input form-textarea text-field"
                      placeholder="Describe steps to replicate, logs, or features required..."
                      value={issueDesc}
                      onChange={(e) => setIssueDesc(e.target.value)}
                      disabled={creatingIssue}
                    />
                  </div>

                  {issueError && (
                    <div className="form-error-banner">
                      <InfoIcon className="error-banner-icon" />
                      <span>{issueError}</span>
                    </div>
                  )}

                  <div className="action-buttons-group">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={creatingIssue}
                    >
                      {creatingIssue ? "Creating Tracker..." : "Submit New Issue"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RepoDetail;
