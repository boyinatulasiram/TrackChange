const fs = require("fs").promises;
const path = require("path");

async function configRepo(key, value) {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const configFilePath = path.join(repoPath, "config.json");

  try {
    let config = {};
    try {
      const content = await fs.readFile(configFilePath, "utf8");
      config = JSON.parse(content);
    } catch (e) {
      // Config file might not exist yet, initialize it
      await fs.mkdir(repoPath, { recursive: true });
    }

    config[key] = value;
    await fs.writeFile(configFilePath, JSON.stringify(config, null, 2));
    console.log(`Configuration updated: ${key} = ${value}`);
  } catch (err) {
    console.error("Error setting configuration:", err.message);
  }
}

async function remoteRepo(action, name, url) {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const configFilePath = path.join(repoPath, "config.json");

  try {
    let config = {};
    try {
      const content = await fs.readFile(configFilePath, "utf8");
      config = JSON.parse(content);
    } catch (e) {
      await fs.mkdir(repoPath, { recursive: true });
    }

    if (action === "add" && name === "origin" && url) {
      config.repo = url;
      await fs.writeFile(configFilePath, JSON.stringify(config, null, 2));
      console.log(`Added remote origin: ${url}`);
    } else {
      console.log("Usage: node index.js remote add origin <repoName>");
    }
  } catch (err) {
    console.error("Error adding remote repository:", err.message);
  }
}

module.exports = { configRepo, remoteRepo };
