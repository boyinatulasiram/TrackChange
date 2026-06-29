const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });

    const files = await fs.readdir(stagedPath);
    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }

    // Read config to see if a remote repo is linked
    let repoName = "";
    try {
      const configContent = await fs.readFile(path.join(repoPath, "config.json"), "utf8");
      const config = JSON.parse(configContent);
      repoName = config.repo || "";
    } catch (e) {
      // Ignored
    }

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({ 
        message, 
        date: new Date().toISOString(),
        repoName: repoName
      }, null, 2)
    );

    console.log(`Commit ${commitID} created with message: ${message}`);
  } catch (err) {
    console.error("Error committing files : ", err);
  }
}

module.exports = { commitRepo };
