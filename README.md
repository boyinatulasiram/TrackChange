<div align="center">

#  TrackChange

### A full-stack GitHub replica with a custom version control system built from scratch.
### Git-like CLI · REST API · Real-time · AWS S3 Cloud Storage · React UI

---

</div>

## 📌 What is this?

**TrackChange** is a MERN-based GitHub clone with its own version control system — no Git under the hood. It includes:

- A **CLI tool** (like Git) to init, add, commit, push, pull and revert files
- **AWS S3** as the cloud storage for your commits
- A **REST API** backend with full auth, repositories and issues
- A **React frontend** with auth, dashboard, and profile pages

---

## 🗂️ Project Structure

```
TrackChange/
├── backend/          ← Express API + CLI tool
│   ├── config/       ← AWS S3 config
│   ├── controllers/  ← Business logic (auth, repo, issue, CLI ops)
│   ├── middleware/   ← Auth & authorization middleware
│   ├── models/       ← Mongoose schemas (User, Repo, Issue)
│   ├── routes/       ← Express routers
│   └── index.js      ← Entry point (CLI + server)
└── frontend/         ← React + Vite UI
    └── src/
        ├── components/
        │   ├── auth/       ← Login, Signup
        │   ├── dashboard/  ← Dashboard
        │   └── user/       ← Profile, Navbar, HeatMap
        ├── authContext.jsx
        ├── Routes.jsx
        └── main.jsx
```

---

## ⚙️ Installation

### Prerequisites
- Node.js >= 16
- MongoDB running locally or Atlas URI
- AWS account with an S3 bucket

---

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/TrackChange.git
cd TrackChange
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
# Server
PORT=8080

# MongoDB
MONGO_URL=mongodb://localhost:27017

# JWT
JWT_SECRET_KEY=your_super_secret_key

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
S3_BUCKET=your_bucket_name
```

Start the server:

```bash
node index.js start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

## 🖥️ CLI — Custom Version Control

The CLI is powered by **yargs** and mirrors Git's workflow. Run all commands from inside the directory you want to track.

```bash
node index.js <command>
```

---

### 🔧 Commands

#### `init` — Initialize a repository
```bash
node index.js init
```
Creates a `.apnaGit/` folder with:
```
.trackChange/
├── commits/      ← stores all commits
├── staging/      ← staging area
└── config.json   ← S3 bucket config
```

---

#### `add <file>` — Stage a file
```bash
node index.js add hello.txt
node index.js add src/index.js
```
Copies the file into `.apnaGit/staging/`. Only staged files get committed.

---

#### `commit <message>` — Commit staged files
```bash
node index.js commit "initial commit"
node index.js commit "added login feature"
```
- Generates a unique **UUID** as the commit ID
- Copies all staged files into `.apnaGit/commits/<commitID>/`
- Saves a `commit.json` with the message and timestamp

```
.trackChange/commits/
└── 3f2a1c-uuid-here/
    ├── hello.txt
    └── commit.json  ← { message, date }
```

---

#### `push` — Push commits to AWS S3
```bash
node index.js push
```
Uploads all local commits from `.apnaGit/commits/` to your S3 bucket under `commits/` prefix.

**Requires:** AWS credentials in `.env` and a valid S3 bucket.

---

#### `pull` — Pull commits from AWS S3
```bash
node index.js pull
```
Downloads all commits stored in your S3 bucket back to `.apnaGit/commits/` locally.

---

#### `revert <commitID>` — Revert to a commit
```bash
node index.js revert 3f2a1c-uuid-here
```
Copies all files from the specified commit back to your working directory, effectively reverting your project to that state.

---

### 🔁 Full CLI Workflow Example

```bash
# 1. Initialize
node index.js init

# 2. Create a file
echo "console.log('hello')" > app.js

# 3. Stage it
node index.js add app.js

# 4. Commit it
node index.js commit "first commit"

# 5. Push to S3
node index.js push

# 6. Pull from S3 (on another machine)
node index.js pull

# 7. Revert to a previous commit
node index.js revert <commitID>
```

---

## ☁️ AWS S3 Setup

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Create a new bucket (e.g. `trackchange-storage`)
3. Go to **IAM** → create a user with `AmazonS3FullAccess`
4. Generate **Access Key ID** and **Secret Access Key**
5. Add them to your `.env` file

All commits are stored in S3 under this structure:
```
your-bucket/
└── commits/
    └── <commitID>/
        ├── yourfile.txt
        └── commit.json
```

---

## 🌐 REST API Reference

Base URL: `http://localhost:8080`

### 👤 Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/signup` | Register a new user |
| POST | `/users/login` | Login, returns JWT token |
| GET | `/users/allUsers` | Get all users |
| GET | `/users/userProfile/:id` | Get user by ID |
| PUT | `/users/updateProfile/:id` | Update user profile |
| DELETE | `/users/deleteProfile/:id` | Delete user |

### 📁 Repositories
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/repo/create` | Create a repository |
| GET | `/repo/all` | Get all repositories |
| GET | `/repo/:id` | Get repository by ID |
| GET | `/repo/name/:name` | Get repository by name |
| GET | `/repo/user/:userID` | Get repos for a user |
| PUT | `/repo/update/:id` | Update repository |
| DELETE | `/repo/delete/:id` | Delete repository |
| PATCH | `/repo/toggle/:id` | Toggle visibility |

### 🐛 Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/issue/create` | Create an issue |
| GET | `/issue/all` | Get all issues |
| GET | `/issue/:id` | Get issue by ID |
| PUT | `/issue/update/:id` | Update issue |
| DELETE | `/issue/delete/:id` | Delete issue |

---

## 🔌 WebSocket Events (Socket.IO)

| Event | Payload | Description |
|-------|---------|-------------|
| `joinRoom` | `userID` | Join a room for real-time updates |

---

## 🖼️ UI — React Frontend

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/auth` | Login | Email + password login |
| `/signup` | Signup | Create a new account |
| `/` | Dashboard | Your repos + suggested repos + search |
| `/profile` | Profile | Contribution heatmap |
| `/create` | Create Repo | Create a new repository *(in progress)* |

### Auth Flow
```
User visits app
      ↓
Not logged in? → redirect to /auth
      ↓
Login/Signup → JWT + userId stored in localStorage
      ↓
Redirect to Dashboard
      ↓
Logout → clear localStorage → redirect to /auth
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router v7 |
| UI Library | @primer/react (GitHub's design system) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Cloud Storage | AWS S3 (SDK v2) |
| Real-time | Socket.IO |
| CLI | Yargs |
| HTTP Client | Axios |

---

## 📄 License

MIT
