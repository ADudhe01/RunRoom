export const PORT = process.env.PORT || 4000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/runroom';

// Strava app settings (from your Strava Developer dashboard)
export const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || '185819';
export const STRAVA_CLIENT_SECRET =
  process.env.STRAVA_CLIENT_SECRET || '20810d9c4331a38eb5efce8f3508835224548233';
export const STRAVA_REDIRECT_URI =
  process.env.STRAVA_REDIRECT_URI || 'http://localhost:4000/api/strava/callback';
