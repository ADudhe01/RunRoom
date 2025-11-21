# Complete Deployment Checklist - RunRoom Backend

## ✅ What's Already Done
- [x] Frontend deployed to GitHub Pages
- [x] MongoDB Atlas cluster created
- [x] Database user created (`atharvadudhe_db_user`)
- [x] IP address whitelisted for local access

## 📋 Tasks Remaining (Do These Tomorrow)

---

## Step 1: Get/Reset MongoDB Password (5 minutes)

### Option A: If You Remember Your Password
1. Use the password you created when setting up the database user
2. Skip to Step 2

### Option B: If You Forgot Your Password (Reset It)
1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Click **"Database Access"** in the left sidebar
3. Find your user: **`atharvadudhe_db_user`**
4. Click the **"Edit"** button (pencil icon) next to the username
5. Click **"Edit Password"**
6. Enter a **new password** (make it strong and save it somewhere safe!)
   - Example: `MySecurePass123!`
7. Click **"Update User"**
8. **Save this password** - you'll need it in Step 2

---

## Step 2: Get MongoDB Connection String (2 minutes)

1. In MongoDB Atlas, click **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Click **"Connect your application"**
4. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://atharvadudhe_db_user:<password>@cluster0.otjnnyp.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with your actual password from Step 1
7. **Add `/runroom`** before the `?` so it becomes:
   ```
   mongodb+srv://atharvadudhe_db_user:YOUR_PASSWORD@cluster0.otjnnyp.mongodb.net/runroom?retryWrites=true&w=majority
   ```
8. **Save this complete connection string** - you'll need it for Railway

**Example of final connection string:**
```
mongodb+srv://atharvadudhe_db_user:MySecurePass123!@cluster0.otjnnyp.mongodb.net/runroom?retryWrites=true&w=majority
```

---

## Step 3: Add Railway IP to MongoDB (2 minutes)

1. In MongoDB Atlas, click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"** button
3. Click **"Allow Access from Anywhere"** button
   - This adds `0.0.0.0/0` which allows Railway to connect
4. Click **"Confirm"**
5. Wait a few seconds for it to save

---

## Step 4: Deploy Backend to Railway (10 minutes)

### 4.1: Sign Up / Login to Railway
1. Go to [railway.app](https://railway.app)
2. Click **"Login"** or **"Start a New Project"**
3. Sign up with your **GitHub account** (easiest option)
4. Authorize Railway to access your GitHub

### 4.2: Create New Project
1. Click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Find and select your **RunRoom** repository
4. Click **"Deploy Now"**

### 4.3: Configure the Service
1. Railway will create a service automatically
2. Click on the service that was created
3. Go to **"Settings"** tab
4. Find **"Root Directory"** and set it to: `server`
   - If you don't see this option, Railway should auto-detect it from the `nixpacks.toml` file
5. **Start Command** should be: `npm start` (usually auto-detected)

---

## Step 5: Add Environment Variables to Railway (5 minutes)

1. In Railway, with your service selected, go to **"Variables"** tab
2. Click **"New Variable"** or **"Raw Editor"** (easier)
3. Add these variables one by one:

### Variable 1: MONGO_URI
- **Name**: `MONGO_URI`
- **Value**: Your complete connection string from Step 2
  ```
  mongodb+srv://atharvadudhe_db_user:YOUR_PASSWORD@cluster0.otjnnyp.mongodb.net/runroom?retryWrites=true&w=majority
  ```

### Variable 2: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: A random secret string (make it long and random)
  ```
  my-super-secret-jwt-key-12345-change-this-in-production
  ```
  Or generate one: https://randomkeygen.com/

### Variable 3: STRAVA_CLIENT_ID
- **Name**: `STRAVA_CLIENT_ID`
- **Value**: Your Strava Client ID
  ```
  185819
  ```
  (Or your actual Strava Client ID if different)

### Variable 4: STRAVA_CLIENT_SECRET
- **Name**: `STRAVA_CLIENT_SECRET`
- **Value**: Your Strava Client Secret
  ```
  20810d9c4331a38eb5efce8f3508835224548233
  ```
  (Or your actual Strava Client Secret if different)

### Variable 5: STRAVA_REDIRECT_URI
- **Name**: `STRAVA_REDIRECT_URI`
- **Value**: You'll set this after getting your Railway URL (Step 6)
  - For now, leave it as: `http://localhost:4000/api/strava/callback`
  - **You'll update this in Step 7**

### Variable 6: FRONTEND_URL
- **Name**: `FRONTEND_URL`
- **Value**: 
  ```
  https://adudhe01.github.io
  ```

### Variable 7: PORT
- **Name**: `PORT`
- **Value**: 
  ```
  4000
  ```
  (Railway usually sets this automatically, but add it to be safe)

4. Click **"Save"** or **"Deploy"** after adding all variables

---

## Step 6: Get Your Railway Backend URL (2 minutes)

1. In Railway, with your service selected
2. Go to **"Settings"** tab
3. Scroll to **"Networking"** section
4. Click **"Generate Domain"** button
5. Copy the URL that appears (e.g., `https://runroom-production.up.railway.app`)
6. **Save this URL** - you'll need it for the next steps

---

## Step 7: Update Strava Redirect URI in Railway (2 minutes)

1. Go back to Railway → Your Service → **"Variables"** tab
2. Find the `STRAVA_REDIRECT_URI` variable
3. Click **"Edit"** or update it
4. Change the value to:
   ```
   https://YOUR-RAILWAY-URL.railway.app/api/strava/callback
   ```
   Replace `YOUR-RAILWAY-URL` with your actual Railway URL from Step 6
   
   Example:
   ```
   https://runroom-production.up.railway.app/api/strava/callback
   ```
5. Save

---

## Step 8: Update Strava API Settings (3 minutes)

1. Go to [Strava Developers](https://www.strava.com/settings/api)
2. Find your application
3. Update **"Authorization Callback Domain"**:
   - Enter your Railway domain (without `https://`)
   - Example: `runroom-production.up.railway.app`
4. Update **"Website"** (optional):
   - Enter: `https://adudhe01.github.io/RunRoom`
5. Click **"Update"** or **"Save"**

---

## Step 9: Update Frontend to Use Backend (3 minutes)

1. Go to your GitHub repo: https://github.com/ADudhe01/RunRoom
2. Click **"Settings"** tab
3. Click **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"**
5. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://YOUR-RAILWAY-URL.railway.app/api`
     - Replace with your Railway URL from Step 6
     - Example: `https://runroom-production.up.railway.app/api`
6. Click **"Add secret"**
7. This will automatically trigger a new frontend deployment

---

## Step 10: Verify Everything Works (5 minutes)

### Check Railway Deployment
1. Go to Railway dashboard
2. Click your service
3. Check **"Deployments"** tab
4. Should see "Deployed successfully" ✅
5. Check **"Logs"** tab
6. Should see: `Server listening on http://localhost:4000` or similar ✅

### Test Backend API
1. Open a new browser tab
2. Visit: `https://YOUR-RAILWAY-URL.railway.app/api/shop`
3. Should see JSON data with shop items ✅
4. If you see data, backend is working! ✅

### Test Frontend
1. Visit: https://adudhe01.github.io/RunRoom/
2. Try to **register** a new account
3. Try to **login**
4. If it works, everything is connected! ✅

### Test Strava Connection
1. On your frontend, go to **Profile** page
2. Click **"Connect Strava"**
3. Should redirect to Strava for authorization
4. After authorizing, should redirect back ✅

---

## 🎉 You're Done!

Your full-stack app is now live:
- **Frontend**: https://adudhe01.github.io/RunRoom/
- **Backend**: https://YOUR-RAILWAY-URL.railway.app
- **3D Models**: Working via Git LFS ✅
- **Database**: Connected to MongoDB Atlas ✅
- **Strava**: Connected and ready ✅

---

## 📝 Quick Reference

### Your URLs (fill these in as you complete steps):
- **Frontend**: https://adudhe01.github.io/RunRoom/
- **Backend**: `https://________________.railway.app` (fill in from Step 6)
- **MongoDB Connection**: `mongodb+srv://atharvadudhe_db_user:________@cluster0.otjnnyp.mongodb.net/runroom?retryWrites=true&w=majority` (fill in password)

### Important Passwords/Secrets to Save:
- MongoDB Password: `________________`
- JWT Secret: `________________`
- Railway URL: `________________`

---

## 🆘 Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify all environment variables are set correctly
- Check MongoDB connection string format

### Can't connect to MongoDB
- Verify IP `0.0.0.0/0` is whitelisted in Network Access
- Check password in connection string
- Verify database name is `/runroom` in connection string

### Frontend can't reach backend
- Check `VITE_API_URL` secret in GitHub
- Verify CORS settings in backend (should allow `https://adudhe01.github.io`)
- Check Railway logs for CORS errors

### Strava OAuth not working
- Verify redirect URI matches exactly in Strava settings
- Check callback domain in Strava settings
- Verify `STRAVA_REDIRECT_URI` in Railway matches Strava settings

---

## ⏱️ Estimated Time: 30-40 minutes total

Good luck! 🚀



