# Aurumhive 🐝

A complete full-stack web application featuring a modern React frontend (Vite), an Express/Postgres backend API, and a dedicated admin dashboard for content management. 

## 🏗️ Architecture

The project is structured as a monorepo setup logic, but without explicit workspaces:

- **/frontend** - User-facing website. Built with React, TypeScript, Vite, Tailwind V4, Framer Motion, and GSAP. 
- **/backend** - Core API. Built with Node.js, Express, and PostgreSQL. Handles authentication, contact forms, visitor flow, and careers.
- **/backend/admin** - Admin Dashboard. React application using Vite, Tailwind, React Router, Recharts, and React Query to manage the backend.

---

## 🚀 Local Development Setup

To run this application locally on your machine, you need to start the backend, the user frontend, and the admin frontend.

### 1. Backend Setup
1. CD into the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment file:
   - Ensure you have the `.env` file populated using `.env.example` as a template.
   - You must insert your Neon/Supabase PostgreSQL `DATABASE_URL`.
4. Run database migrations and seed data:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
5. Create a default admin user (optional script):
   ```bash
   npm run create-admin
   ```
6. Start the server (runs on `http://localhost:3001`):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and CD into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (if it doesn't exist) and leave `VITE_API_URL` empty to rely on the Vite proxy:
   ```env
   VITE_API_URL=
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *(Access at `http://localhost:5173`)*

### 3. Admin Panel Setup
1. Open a new terminal and CD into the admin folder:
   ```bash
   cd backend/admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (if it doesn't exist):
   ```env
   VITE_API_URL=
   ```
4. Start the admin development server:
   ```bash
   npm run dev
   ```
   *(Access at `http://localhost:5174`)*

---

## 🌍 Deployment Guide (Vercel & Render)

Follow these steps to deploy your application live to the internet.

### Step 1: Push Code to GitHub
Ensure all your latest changes are committed and pushed to a GitHub repository.

### Step 2: Deploy the Backend API to Render.com
1. Go to [Render.com](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables**:
   - `DATABASE_URL` = Your production Neon database connection string.
   - `JWT_ACCESS_SECRET` = Generate a random strong string
   - `JWT_REFRESH_SECRET` = Generate another random string
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (Leave this as Vercel URL once deployed, see below)
   - `ADMIN_URL` = (Leave this as Vercel Admin URL once deployed, see below)
5. Click **Deploy**. Copy your Render backend URL (e.g., `https://aurumhive-api.onrender.com`).

### Step 3: Deploy the Frontend to Vercel
1. Go to [Vercel](https://vercel.com/) and create a **New Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
4. Click **Environment Variables** and add:
   - `VITE_API_URL` = `https://aurumhive-api.onrender.com` (Your Render Backend URL)
5. Click **Deploy**.
6. Copy your live Frontend URL (e.g., `https://aurumhive.vercel.app`).
   *Go back to your Render Dashboard and set the `FRONTEND_URL` environment variable to this link.*

### Step 4: Deploy the Admin Panel to Vercel
1. Go back to Vercel and create **another New Project** from the same GitHub repo.
2. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `backend/admin`
3. Click **Environment Variables** and add:
   - `VITE_API_URL` = `https://aurumhive-api.onrender.com` (Your Render Backend URL)
4. Click **Deploy**.
5. Copy your live Admin URL (e.g., `https://aurumhive-admin.vercel.app`).
   *Go back to your Render Dashboard and set the `ADMIN_URL` environment variable to this link.*

### You're live! 🎉
You can now access your Frontend website and Admin dashboard from anywhere, and they will securely communicate with your Render backend API.
