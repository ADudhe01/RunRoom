# Backend Deployment Guide - RunRoom

## Quick Deploy to Railway (Recommended - 5 minutes)

Railway is the easiest option with a free tier that's perfect for this project.

### Step 1: Sign Up
1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with your **GitHub account** (easiest option)

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select your **RunRoom** repository
4. Click **"Deploy Now"**

### Step 3: Configure the Service
1. Railway will detect it's a Node.js project
2. Click on the service that was created
3. Go to **Settings** tab
4. Set **Root Directory** to: `server`
5. Set **Start Command** to: `npm start` (or leave default)

### Step 4: Set Environment Variables
Go to **Variables** tab and add these:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/runroom
JWT_SECRET=your-super-secret-jwt-key-change-this
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=https://your-app-name.railway.app/api/strava/callback
FRONTEND_URL=https://adudhe01.github.io
PORT=4000
```

**Important Notes:**
- Replace `your-app-name` with your actual Railway app name
- Get MongoDB URI from MongoDB Atlas (see below)
- Use strong JWT_SECRET (random string)

### Step 5: Get Your Backend URL
1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"** (or use the default one)
3. Copy the URL (e.g., `https://runroom-production.up.railway.app`)

### Step 6: Update Frontend to Use Backend
1. Go to your GitHub repo: https://github.com/ADudhe01/RunRoom
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `VITE_API_URL`
5. Value: `https://your-railway-url.railway.app/api` (your Railway URL + `/api`)
6. Click **"Add secret"**
7. This will trigger a new deployment with the correct API URL

## MongoDB Atlas Setup (Free)

### Step 1: Create Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a **Free** cluster (M0)

### Step 2: Create Database User
1. Go to **Database Access**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create username and password (save these!)
5. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### Step 3: Whitelist IP Address
1. Go to **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Railway) or add `0.0.0.0/0`
4. Click **"Confirm"**

### Step 4: Get Connection String
1. Go to **Database** → **Connect**
2. Click **"Connect your application"**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `runroom`
6. Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/runroom?retryWrites=true&w=majority`
7. Add this to Railway environment variables as `MONGO_URI`

## Update Strava API Settings

1. Go to [Strava Developers](https://www.strava.com/settings/api)
2. Find your application
3. Update **Authorization Callback Domain**: Your Railway domain (without https://)
   - Example: `runroom-production.up.railway.app`
4. Update **Redirect URI**: `https://your-railway-url.railway.app/api/strava/callback`
5. Save changes

## Verify Deployment

1. **Check Railway Logs:**
   - Go to Railway dashboard
   - Click on your service
   - Check **"Deployments"** tab for logs
   - Should see: "Server listening on http://localhost:4000"

2. **Test API Endpoint:**
   - Visit: `https://your-railway-url.railway.app/api/shop`
   - Should return JSON with shop items

3. **Test Frontend Connection:**
   - Visit your GitHub Pages site
   - Try to register/login
   - Check browser console (F12) for API calls

## Troubleshooting

### Backend Not Starting
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

### CORS Errors
- Verify `FRONTEND_URL` is set to `https://adudhe01.github.io`
- Check Railway logs for CORS errors

### MongoDB Connection Failed
- Verify IP is whitelisted in MongoDB Atlas
- Check connection string format
- Ensure database user password is correct

### Strava OAuth Not Working
- Verify redirect URI matches exactly
- Check callback domain in Strava settings
- Ensure Railway URL is correct in environment variables

## Alternative: Render.com

If Railway doesn't work, try Render:

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Configure:
   - **Name**: `runroom-backend`
   - **Root Directory**: `server`
   - **Build Command**: (leave empty)
   - **Start Command**: `npm start`
6. Add environment variables (same as Railway)
7. Click **"Create Web Service"**

## Cost

- **Railway**: Free tier includes $5 credit/month (enough for this app)
- **MongoDB Atlas**: Free tier (512MB storage)
- **GitHub Pages**: Free
- **Total**: $0/month 🎉

## Next Steps After Deployment

1. ✅ Backend deployed on Railway
2. ✅ MongoDB Atlas connected
3. ✅ Frontend updated with backend URL
4. ✅ Strava OAuth configured
5. 🎉 Your app is live!

Your full stack app will be accessible at:
- **Frontend**: https://adudhe01.github.io/RunRoom/
- **Backend**: https://your-railway-url.railway.app



