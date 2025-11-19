# RunRoom 🏃‍♂️🏠

**Turn every kilometre into décor.** RunRoom connects to Strava, tracks your running/walking distance, converts kilometres into points, and lets you redeem items to furnish your personalized 3D virtual recovery room.

![RunRoom](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Express](https://img.shields.io/badge/Express-5.1.0-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-8.19.4-47A248?logo=mongodb)
![Three.js](https://img.shields.io/badge/Three.js-0.181.2-000000?logo=three.js)

## ✨ Features

- **🔐 User Authentication** – Secure registration, login, and JWT-based session management
- **📊 Strava Integration** – OAuth connection to sync running/walking activities automatically
- **💰 Points System** – Earn points for every kilometre you run/walk this year
- **🛍️ Shop Experience** – Browse and purchase 3D room décor items with your earned points
- **🏠 3D Room Editor** – Interactive 3D room built with React Three Fiber where you can:
  - Place items from your inventory
  - Move, rotate, and scale items with TransformControls
  - Save your room layout
  - View your personalized space in real-time
- **📸 Profile Management** – Upload profile pictures, view stats, and manage your account
- **🎨 Modern UI** – Beautiful dark theme with smooth animations and responsive design

## 🛠️ Tech Stack

### Frontend

- **React 19** – Modern React with hooks
- **Vite** – Fast build tool and dev server
- **React Router 7** – Client-side routing
- **React Three Fiber** – React renderer for Three.js
- **@react-three/drei** – Useful helpers for R3F
- **Three.js** – 3D graphics library
- **Framer Motion** – Smooth animations
- **Custom CSS** – Tokenized design system

### Backend

- **Node.js** – JavaScript runtime
- **Express 5** – Web framework
- **MongoDB** – NoSQL database
- **Mongoose 8** – MongoDB object modeling
- **JWT** – JSON Web Tokens for authentication
- **Multer** – File upload handling
- **Axios** – HTTP client for Strava API
- **bcryptjs** – Password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.19+ or v22.12+) – [Download](https://nodejs.org/)
- **MongoDB** – [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)
- **Git** – [Download](https://git-scm.com/)
- **Strava API Credentials** (optional for local dev, required for Strava features)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd runroom
```

### 2. Install Dependencies

Install dependencies for both the server and client:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
touch .env
```

Add the following environment variables to `server/.env`:

```env
# Server Configuration
PORT=4000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/runroom
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/runroom

# Strava API Configuration
# Get these from https://www.strava.com/settings/api
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=http://localhost:4000/api/strava/callback
```

> **Note:** The code includes placeholder Strava credentials for local development, but you should replace them with your own for production use.

### 4. Set Up MongoDB

#### Option A: Local MongoDB

1. Install MongoDB locally ([instructions](https://docs.mongodb.com/manual/installation/))
2. Start MongoDB service:

   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and add it to `MONGO_URI` in `.env`

### 5. Set Up Strava API (Optional)

1. Go to [Strava Developers](https://www.strava.com/settings/api)
2. Create a new application
3. Set the **Authorization Callback Domain** to `localhost:4000`
4. Copy your **Client ID** and **Client Secret** to the `.env` file

### 6. Seed the Database (Optional)

The shop will auto-populate items on first request, but you can manually seed:

```bash
cd server
node src/seedItems.js
```

### 7. Run the Application

You'll need two terminal windows:

**Terminal 1 - Start the Backend Server:**

```bash
cd server
npm start
```

The server will start on `http://localhost:4000`

**Terminal 2 - Start the Frontend Dev Server:**

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173`

### 8. Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

## 📁 Project Structure

```
runroom/
├── client/                 # Frontend React application
│   ├── public/
│   │   └── models/        # 3D GLTF/GLB model files
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── context/       # React Context (UserContext)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── styles/        # Global CSS styles
│   └── package.json
│
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── data/          # Default items data
│   │   ├── middleware/    # Express middleware (auth, upload)
│   │   ├── models/        # Mongoose models (User, Item)
│   │   ├── routes/        # API route handlers
│   │   └── utils/         # Utility functions
│   ├── uploads/           # User-uploaded files (profile pictures)
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Login user

### User

- `GET /api/user/me` – Get current user data
- `POST /api/user/update-profile-picture` – Upload/update profile picture
- `POST /api/user/buy-item` – Purchase an item from shop
- `POST /api/user/save-room-layout` – Save 3D room layout
- `GET /api/user/all` – Get all users (admin/dev endpoint)

### Shop

- `GET /api/shop` – Get all available items
- `POST /api/shop/buy` – Purchase an item (alternative endpoint)

### Strava

- `GET /api/strava/connect` – Initiate Strava OAuth flow
- `GET /api/strava/callback` – Strava OAuth callback
- `POST /api/strava/sync` – Sync Strava activities and update points

### Room

- `GET /api/room` – Get user's room layout

## 🎮 Usage Guide

### Creating an Account

1. Navigate to the **Profile** page
2. Click **Register** or use the registration link
3. Fill in your name, email, and password
4. Optionally upload a profile picture
5. Click **Create account**

### Connecting Strava

1. Log in to your account
2. Go to the **Profile** page
3. Click **Connect Strava**
4. Authorize the application on Strava
5. You'll be redirected back with a success message

### Earning Points

1. After connecting Strava, go to the **Home** page
2. Click **Sync latest run** to fetch your activities
3. Points are automatically calculated based on kilometres run/walked this year
4. 1 kilometre = 1 point

### Shopping for Items

1. Navigate to the **Shop** page
2. Browse available items by category
3. Click **Buy for X points** on any item
4. Items are added to your inventory

### Decorating Your Room

1. Go to the **Room** page
2. Items from your inventory appear in the sidebar
3. Click an item to place it in the 3D room
4. Use the transform controls to:
   - **Move** items (translate mode)
   - **Rotate** items (rotate mode)
5. Click **Save Room Layout** to persist your changes

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod` or check service status
- Verify `MONGO_URI` in `.env` is correct
- Check MongoDB logs for connection errors

### Strava API Errors

- Verify your Strava credentials in `.env`
- Ensure callback URL matches: `http://localhost:4000/api/strava/callback`
- Check Strava API rate limits (100 requests per 15 minutes)

### File Upload Issues

- Ensure `server/uploads/profile-pictures/` directory exists
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, GIF, WebP only)

### 3D Models Not Loading

- Ensure GLB files are in `client/public/models/`
- File names must match item SKUs (e.g., `light.aurora-bar.glb`)
- Check browser console for loading errors
- Fallback geometry will display if models are missing

### Port Already in Use

- Change `PORT` in `server/.env` if 4000 is taken
- Update `BASE_URL` in `client/src/services/api.js` if needed

## 🚢 Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```
2. Deploy the `dist` folder to Vercel or Netlify
3. Update API base URL in production

### Backend (Railway/Render/Heroku)

1. Set environment variables in your hosting platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Update CORS settings in `server/src/index.js` for your frontend URL
4. Deploy the `server` directory

### Environment Variables for Production

- Use strong `JWT_SECRET`
- Use production MongoDB URI
- Update `STRAVA_REDIRECT_URI` to your production callback URL
- Set proper CORS origins

## 🧪 Development Tips

- **Hot Reload**: Both frontend and backend support hot reload during development
- **Database Seeding**: Run `node src/seedItems.js` to reset the item catalog
- **User Data**: Use `/api/user/all` endpoint to view all registered users (dev only)
- **Console Logs**: Check browser console (F12) for detailed Strava sync information
- **3D Debugging**: React Three Fiber errors appear in browser console

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👤 Author

Built with ❤️ for runners and walkers everywhere.

---

**Happy Running! 🏃‍♂️💨**
