# Deployment Guide for RunRoom

## GitHub Pages Deployment (Frontend)

Your frontend can be deployed to GitHub Pages, and **yes, the 3D models will work!** The models stored via Git LFS will be accessible.

### Automatic Deployment Setup

1. **Enable GitHub Pages in your repository:**
   - Go to your repo: https://github.com/ADudhe01/RunRoom
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save

2. **Set Environment Variable (Optional):**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `VITE_API_URL`
   - Value: Your backend API URL (e.g., `https://your-backend.railway.app/api`)
   - This allows the frontend to connect to your deployed backend

3. **Push to main branch:**
   - The GitHub Actions workflow will automatically build and deploy
   - Your site will be available at: `https://adudhe01.github.io/RunRoom/`

### Manual Deployment

If you prefer to deploy manually:

```bash
cd client
npm run build
# Then upload the 'dist' folder to GitHub Pages
```

## Backend Deployment (Required)

**Important:** GitHub Pages only hosts static files. Your Express backend needs separate hosting.

### Recommended Backend Hosting Options:

#### Option 1: Railway (Recommended - Easy & Free tier)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your RunRoom repository
5. Set root directory to `server`
6. Add environment variables:
   - `MONGO_URI` (use MongoDB Atlas)
   - `JWT_SECRET`
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
   - `STRAVA_REDIRECT_URI` (your Railway URL + `/api/strava/callback`)
7. Railway will auto-deploy and give you a URL like: `https://your-app.railway.app`

#### Option 2: Render
1. Go to [render.com](https://render.com)
2. Create new **Web Service**
3. Connect GitHub repo
4. Set root directory to `server`
5. Build command: (leave empty, Render auto-detects)
6. Start command: `npm start`
7. Add environment variables (same as Railway)

#### Option 3: Heroku
1. Install Heroku CLI
2. Create `server/Procfile`: `web: node src/index.js`
3. Deploy:
   ```bash
   cd server
   heroku create your-app-name
   heroku config:set MONGO_URI=... JWT_SECRET=...
   git push heroku main
   ```

### MongoDB Setup

For production, use **MongoDB Atlas** (free tier available):
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Add to your backend environment variables

## Complete Deployment Checklist

### Frontend (GitHub Pages)
- [x] GitHub Actions workflow created
- [ ] Enable GitHub Pages in repo settings
- [ ] Set `VITE_API_URL` secret (optional, for production backend)
- [ ] Push to main branch (auto-deploys)

### Backend
- [ ] Choose hosting provider (Railway/Render/Heroku)
- [ ] Set up MongoDB Atlas
- [ ] Deploy backend
- [ ] Update `VITE_API_URL` in GitHub secrets with backend URL
- [ ] Update Strava redirect URI to backend URL

### Strava API
- [ ] Update Strava app settings:
  - Authorization Callback Domain: Your backend domain
  - Redirect URI: `https://your-backend.com/api/strava/callback`

## Testing Your Deployment

1. **Frontend:** Visit `https://adudhe01.github.io/RunRoom/`
2. **3D Models:** Check if models load in the Room page
3. **Backend:** Test API endpoints
4. **Strava:** Try connecting Strava account

## Troubleshooting

### 3D Models Not Loading
- Ensure Git LFS files are downloaded during build (workflow includes `lfs: true`)
- Check browser console for 404 errors
- Verify model paths in `Room3D.jsx`

### API Connection Issues
- Check CORS settings in `server/src/index.js`
- Verify `VITE_API_URL` environment variable
- Ensure backend is running and accessible

### Build Failures
- Check GitHub Actions logs
- Verify Node.js version compatibility
- Ensure all dependencies are in `package.json`

## Production URLs

After deployment, update these:
- Frontend: `https://adudhe01.github.io/RunRoom/`
- Backend: `https://your-backend.railway.app` (or your hosting URL)
- Update `VITE_API_URL` to point to your backend

