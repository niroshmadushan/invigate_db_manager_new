# DB Manager (Elite Portal)

An enterprise-grade database control and tracking system originally scaffolded with the T3 Stack. This repository contains the complete frontend UI, backend tRPC endpoints, and Prisma database models necessary to run the Sri Lankan Airlines Database Management Dashboard.

## 🚀 Features
- **Role-Based Access Control (RBAC):** Granular control over which modules users can view or edit.
- **Robust Tracking:** Keep tabs on user access across different environments and applications.
- **Modern Tech Stack:** Next.js 14, Tailwind CSS, tRPC, Prisma, and NextAuth.

---

## 💻 Local Development Setup

To get the application running on your local machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/niroshmadushan/invigate_db_manager_new.git
   cd "invigate_db_manager_new"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory (copy from `.env.example` if it exists) and add your database URL:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/db_manager"
   NEXTAUTH_SECRET="your_secure_secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize Database (`dbmanager` scripts):**
   Push the Prisma schema to your local MySQL instance and seed it with default Admin and User roles.
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will now be running on [http://localhost:3000](http://localhost:3000).*

---

## 🌍 Server Deployment Guide (Ubuntu)

This project utilizes a **3-folder architecture** for zero-downtime automated deployments:
- `~/db-manager/test` (Used for building the new codebase)
- `~/db-manager/current` (The active, running application)
- `~/db-manager/released` (Versioned backups of previous releases)

### Step 1: Initial Server Setup
Connect to your Ubuntu server and ensure the following are installed:
- Node.js (v18+)
- MySQL Server
- PM2 (`npm install -g pm2`)

Create the directory structure:
```bash
mkdir -p ~/db-manager/test
mkdir -p ~/db-manager/current
mkdir -p ~/db-manager/released
```

### Step 2: Set up Environment Variables
Create the production environment file in the `current` folder:
```bash
nano ~/db-manager/current/.env
```
*(Add your production `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`)*

### Step 3: Set up GitHub Runner
This repository is configured to deploy automatically when changes are pushed to `main` using GitHub Actions.

1. Go to your GitHub Repository -> **Settings** -> **Actions** -> **Runners**.
2. Click **New self-hosted runner**.
3. Select **Linux** and your Architecture (usually x64).
4. Run the provided download and configuration scripts on your Ubuntu server inside a `~/actions-runner` folder.
5. Install the runner as a background service:
   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

### Step 4: The Automated Pipeline
Once the runner is active, any `git push` to the `main` branch will trigger `.github/workflows/deploy.yml`.

**The Pipeline Process:**
1. **Fetch & Build:** Code is pulled into `test`. The workflow runs `npm install` and `npm run build`.
2. **Backup:** If the build is successful, everything in `current` is zipped and moved to `released/v_YYYYMMDD_HHMMSS`.
3. **Deploy:** The `current` directory is cleared, and the newly built code from `test` is copied into `current`.
4. **Clean up:** The `test` directory is wiped clean.
5. **Restart:** The workflow runs `npx prisma db push` and `pm2 restart db-manager`.

*Note: If the build process in the `test` folder fails, the workflow immediately aborts, leaving the active `current` folder completely untouched to prevent downtime.*

---

## 🛠️ Rollback Process
If a critical bug is found in production after a deployment:
1. Stop the PM2 process: `pm2 stop db-manager`
2. Empty the `current` folder: `rm -rf ~/db-manager/current/*`
3. Copy the contents of the latest stable version from `released/` back into `current`.
4. Restart PM2: `pm2 restart db-manager`
