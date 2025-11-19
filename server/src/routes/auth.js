import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { User } from '../models/User.js';
import { JWT_SECRET } from '../config.js';
import { buildUserSnapshot } from '../utils/userPayload.js';
import { uploadProfilePicture } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', (req, res, next) => {
  uploadProfilePicture.single('profilePicture')(req, res, (err) => {
    if (err) {
      console.error('Multer error during registration:', err);
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: err.message || 'File upload error' });
      }
      // Handle other errors (like file type validation)
      return res.status(400).json({ message: err.message || 'Invalid file' });
    }
    console.log('File uploaded successfully:', req.file ? req.file.filename : 'No file');
    next();
  });
}, async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    
    // If file was uploaded, use the uploaded file path
    const profilePicture = req.file 
      ? `/uploads/profile-pictures/${req.file.filename}` 
      : null;

    const user = await User.create({ email, name, passwordHash, profilePicture });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const snapshot = await buildUserSnapshot(user);

    res.json({
      token,
      ...snapshot,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message || 'Register failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const snapshot = await buildUserSnapshot(user);

    res.json({
      token,
      ...snapshot,
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

export default router;
