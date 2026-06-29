import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./repo.css";
import {
  RepoIcon,
  GlobeIcon,
  LockIcon,
  FileCodeIcon,
  IssueOpenedIcon,
  GitCommitIcon,
  InfoIcon,
  HeartIcon
} from "@primer/octicons-react";

const CreateRepository = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true); // true = public, false = private
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Repository name is required!");
      return;
    }

    // Basic regex validation for repo name
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmedName)) {
      setError("Repository name can only contain letters, numbers, hyphens, periods, or underscores.");
      return;
    }

    const owner = localStorage.getItem("userId");
    if (!owner) {
      setError("User session not found! Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      
      const response = await fetch(`${apiUrl}/repo/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim(),
          visibility,
          owner,
          content: [],
          issues: []
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create repository");
      }

      setLoading(false);
      navigate(`/repo/${data.repositoryID}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-repo-wrapper">
        {/* Left Side: Creative form */}
        <div className="create-repo-form-panel glass-card">
          <div className="panel-header">
            <div className="header-icon-badge">
              <RepoIcon size={24} className="badge-icon-primary" />
            </div>
            <div>
              <h2>Create New Repository</h2>
              <p className="subtitle-text">Spin up a new tracking space for your project</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="repo-form-layout">
            <div className="form-group">
              <label htmlFor="repoName">Repository Name</label>
              <div className="input-with-prefix">
                <span className="prefix-owner">trackchange.io / </span>
                <input
                  id="repoName"
                  type="text"
                  className="form-input text-field"
                  placeholder="my-awesome-project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <span className="field-hint">Use simple names. Only alphanumeric, dashes, dots, or underscores.</span>
            </div>

            <div className="form-group">
              <label htmlFor="repoDescription">Description <span className="label-optional">(optional)</span></label>
              <textarea
                id="repoDescription"
                className="form-input form-textarea text-field"
                placeholder="What is this project tracking?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Select Visibility Mode</label>
              <div className="segmented-selector">
                <div 
                  className={`segmented-option ${visibility === true ? "active-public" : ""}`}
                  onClick={() => !loading && setVisibility(true)}
                >
                  <GlobeIcon size={18} className="selector-icon" />
                  <div className="option-text-group">
                    <span className="option-title">Public</span>
                    <span className="option-desc">Visible to everyone in community feeds</span>
                  </div>
                </div>

                <div 
                  className={`segmented-option ${visibility === false ? "active-private" : ""}`}
                  onClick={() => !loading && setVisibility(false)}
                >
                  <LockIcon size={18} className="selector-icon" />
                  <div className="option-text-group">
                    <span className="option-title">Private</span>
                    <span className="option-desc">Only accessible by you and collaborators</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="form-error-banner">
                <InfoIcon className="error-banner-icon" />
                <span>{error}</span>
              </div>
            )}

            <div className="action-buttons-group">
              <button
                type="submit"
                className="btn-primary flex-center"
                disabled={loading}
              >
                {loading ? "Creating System..." : "Create Repository"}
              </button>
              <button
                type="button"
                className="btn-secondary flex-center"
                onClick={() => navigate("/")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Repository Preview */}
        <div className="create-repo-preview-panel">
          <div className="preview-sticky-wrapper">
            <div className="preview-label">Live Cards Preview</div>
            
            {/* Renders preview of how the repo card looks in dashboard listings */}
            <div className="profile-repo-card glass-card preview-card-glow">
              <div className="repo-card-top">
                <h4 className="repo-card-title">
                  {name.trim() || "my-project-name"}
                </h4>
                <span className={`badge ${visibility ? "badge-public" : "badge-private"}`}>
                  {visibility ? "Public" : "Private"}
                </span>
              </div>
              
              <p className="repo-card-desc">
                {description.trim() || "The description of your project will update live as you write it on the left form panel."}
              </p>

              <div className="repo-card-insights">
                <div className="insight-row">
                  <HeartIcon size={14} className="insight-icon text-red" />
                  <span className="insight-text">Health Rating: <strong>100%</strong></span>
                </div>
              </div>

              <div className="repo-card-footer">
                <span className="footer-item">
                  <FileCodeIcon size={14} className="footer-icon" />
                  0 Files
                </span>
                <span className="footer-item">
                  <IssueOpenedIcon size={14} className="footer-icon" />
                  0 Issues
                </span>
                <span className="footer-item">
                  <GitCommitIcon size={14} className="footer-icon" />
                  0 Commits
                </span>
              </div>
            </div>

            {/* Quick configuration hint card */}
            <div className="config-hint-box glass-card">
              <h4>Setup Guide preview</h4>
              <p>Once created, sync your codebase immediately in three simple steps:</p>
              <div className="mini-cli-code">
                <code>apnagit init</code>
                <code>apnagit remote add origin {name.trim() || "my-repo-name"}</code>
                <code>apnagit push</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateRepository;
