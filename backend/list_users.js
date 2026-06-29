const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/githubclone";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("githubclone");
    const users = await db.collection("users").find({}).toArray();
    console.log("=== REGISTERED USERS IN NEW LOCAL DB ===");
    if (users.length === 0) {
      console.log("No users found in the database. You must Sign Up / Register first!");
    } else {
      users.forEach(u => {
        console.log(`- Username: ${u.username}, Email: ${u.email}`);
      });
    }
  } catch (err) {
    console.error("Error during check:", err);
  } finally {
    await client.close();
  }
}

run();
