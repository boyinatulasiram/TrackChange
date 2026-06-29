const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repository created!",
      repositoryID: result._id,
    });
  } catch (err) {
    console.error("Error during repository creation : ", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    res.json(repositories);
  } catch (err) {
    console.error("Error during fetching repositories : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;
  try {
    const repository = await Repository.find({ name })
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const { userID } = req.params;

  if (!userID || userID === "null" || userID === "undefined" || !mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(400).json({ error: "Invalid or missing User ID!", repositories: [] });
  }

  try {
    const repositories = await Repository.find({ owner: userID }).populate("issues");
    res.json({ message: "Repositories found!", repositories });
  } catch (err) {
    console.error("Error during fetching user repositories : ", err.message);
    res.status(500).send("Server error");
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (content) {
      if (Array.isArray(content)) {
        content.forEach((file) => {
          if (!repository.content.includes(file)) {
            repository.content.push(file);
          }
        });
      } else {
        if (!repository.content.includes(content)) {
          repository.content.push(content);
        }
      }
    }
    if (description !== undefined) {
      repository.description = description;
    }

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function pushCommits(req, res) {
  const { email, repoName, commits } = req.body;

  try {
    if (!email || !repoName || !commits) {
      return res.status(400).json({ error: "Email, repoName, and commits are required!" });
    }

    // Find the user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: `User not found with email: ${email}` });
    }

    // Find the repository by name
    const repository = await Repository.findOne({ name: repoName });
    if (!repository) {
      return res.status(404).json({ error: `Repository not found with name: ${repoName}` });
    }

    // Verify ownership
    if (repository.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized: You do not own this repository!" });
    }

    // Merge files and commits
    const allFiles = new Set(repository.content || []);

    for (const commit of commits) {
      // Check if commit already exists in repo
      const exists = repository.commits.some((c) => c.commitID === commit.commitID);
      if (!exists) {
        repository.commits.push({
          commitID: commit.commitID,
          message: commit.message,
          date: commit.date,
          files: commit.files || [],
        });
      }
      if (commit.files) {
        commit.files.forEach((file) => allFiles.add(file));
      }
    }

    repository.content = Array.from(allFiles);

    const updatedRepository = await repository.save();

    res.json({
      message: "Commits synced successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error syncing commits:", err.message);
    res.status(500).send("Server error");
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.visibility = !repository.visibility;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility : ", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository : ", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
  pushCommits,
};
