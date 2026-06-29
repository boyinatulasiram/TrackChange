const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pushRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    // Read config to verify email and repo
    let config = {};
    try {
      const configContent = await fs.readFile(path.join(repoPath, "config.json"), "utf8");
      config = JSON.parse(configContent);
    } catch (e) {
      // Ignored
    }

    if (!config.email) {
      console.error("Error: User email not configured. Please run:\n  node index.js config email <email>");
      return;
    }
    if (!config.repo) {
      console.error("Error: Remote repository not configured. Please run:\n  node index.js remote add origin <repoName>");
      return;
    }

    const pushedCommits = config.pushedCommits || [];

    // Fetch all repositories to map commit IDs to their remote repos
    const port = process.env.PORT || 8080;
    let commitToRepoMap = {};
    try {
      const allReposRes = await fetch(`http://localhost:${port}/repo/all`);
      if (allReposRes.ok) {
        const reposData = await allReposRes.json();
        for (const r of reposData) {
          if (r.commits) {
            for (const c of r.commits) {
              commitToRepoMap[c.commitID] = r.name;
            }
          }
        }
      }
    } catch (err) {
      // Ignored
    }

    const commitDirs = await fs.readdir(commitsPath);
    // Filter out already pushed commits recorded in config
    const newCommitDirs = commitDirs.filter(dir => !pushedCommits.includes(dir));

    if (newCommitDirs.length === 0) {
      console.log("No new commits to push.");
      return;
    }

    const commitsData = [];
    const successfullyPushed = [];
    const updateCommitRepos = [];

    for (const commitDir of newCommitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);

      // Read commit.json
      let commitMessage = "No message";
      let commitDate = new Date().toISOString();
      let commitRepoName = "";
      try {
        const commitJsonContent = await fs.readFile(path.join(commitPath, "commit.json"), "utf8");
        const commitJson = JSON.parse(commitJsonContent);
        commitMessage = commitJson.message || commitMessage;
        commitDate = commitJson.date || commitDate;
        commitRepoName = commitJson.repoName || "";
      } catch (e) {
        // Ignored
      }

      // If repoName is not set in commit.json, check if it's already in the database
      if (!commitRepoName) {
        if (commitToRepoMap[commitDir]) {
          commitRepoName = commitToRepoMap[commitDir];
          // Save it back to local commit.json so it is permanently marked
          try {
            await fs.writeFile(
              path.join(commitPath, "commit.json"),
              JSON.stringify({ message: commitMessage, date: commitDate, repoName: commitRepoName }, null, 2)
            );
          } catch (e) {}
        }
      }

      // Skip commits that belong to a different repository
      if (commitRepoName && commitRepoName !== config.repo) {
        continue;
      }

      // Skip commits already pushed to the current repository
      if (commitToRepoMap[commitDir] === config.repo) {
        continue;
      }

      // If commit doesn't have a repo name, track it for update after successful push
      if (!commitRepoName) {
        updateCommitRepos.push({ commitDir, commitMessage, commitDate });
      }

      const filesList = [];
      for (const file of files) {
        if (file === "commit.json") continue;
        filesList.push(file);

        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);
        const params = {
          Bucket: S3_BUCKET,
          Key: `commits/${commitDir}/${file}`,
          Body: fileContent,
        };

        await s3.upload(params).promise();
      }

      commitsData.push({
        commitID: commitDir,
        message: commitMessage,
        date: commitDate,
        files: filesList
      });
      successfullyPushed.push(commitDir);
    }

    if (commitsData.length === 0) {
      console.log("No new commits for the current repository to push.");
      return;
    }

    console.log("New commits pushed to S3.");

    // Sync with backend API
    const url = `http://localhost:${port}/repo/push`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: config.email,
          repoName: config.repo,
          commits: commitsData
        })
      });

      const resData = await response.json();
      if (response.ok) {
        console.log("Successfully synced commits and files with backend/frontend.");
        
        // Save successfully pushed commits
        config.pushedCommits = [...pushedCommits, ...successfullyPushed];
        await fs.writeFile(path.join(repoPath, "config.json"), JSON.stringify(config, null, 2));

        // Update repoName in successfully pushed local commits
        for (const item of updateCommitRepos) {
          const commitJsonPath = path.join(commitsPath, item.commitDir, "commit.json");
          await fs.writeFile(
            commitJsonPath,
            JSON.stringify({
              message: item.commitMessage,
              date: item.commitDate,
              repoName: config.repo
            }, null, 2)
          );
        }
      } else {
        console.error("Failed to sync commits with backend server:", resData.error || response.statusText);
      }
    } catch (fetchErr) {
      console.error("Error syncing commits with backend server:", fetchErr.message);
    }
  } catch (err) {
    console.error("Error pushing to S3 : ", err);
  }
}

module.exports = { pushRepo };
