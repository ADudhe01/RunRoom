import express from "express";
import multer from "multer";
import { authRequired } from "../middleware/auth.js";
import { buildUserSnapshot, formatInventory, formatRoomLayout } from "../utils/userPayload.js";
import { Item } from "../models/Item.js";
import { User } from "../models/User.js";
import { uploadProfilePicture } from "../middleware/upload.js";

const router = express.Router();

router.get("/me", authRequired, async (req, res) => {
  const snapshot = await buildUserSnapshot(req.user);
  res.json(snapshot);
});

router.post("/buy-item", authRequired, async (req, res) => {
  const user = req.user;
  const { itemId } = req.body;

  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  if (user.pointsRemaining < item.cost) {
    return res.status(400).json({ message: "Not enough points" });
  }

  user.pointsSpent += item.cost;
  user.inventory.push({ itemId: item._id });
  await user.save();
  await user.populate({ path: "inventory.itemId" });

  const snapshot = await buildUserSnapshot(user);

  res.json({
    pointsRemaining: user.pointsRemaining,
    inventory: snapshot.inventory,
  });
});

router.post("/save-room-layout", authRequired, async (req, res) => {
  const user = req.user;
  const { layout } = req.body;

  user.roomLayout = layout;
  await user.save();
  await user.populate({ path: "roomLayout.itemId" });

  res.json({ layout: formatRoomLayout(user.roomLayout) });
});

router.post("/update-profile-picture", authRequired, (req, res, next) => {
  uploadProfilePicture.single('profilePicture')(req, res, (err) => {
    if (err) {
      console.error('Multer error during profile picture update:', err);
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
  try {
    const user = req.user;
    
    // If file was uploaded, use the uploaded file path
    if (req.file) {
      user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    } else if (req.body.removePicture === 'true') {
      // Allow removing profile picture
      user.profilePicture = null;
    } else if (req.body.profilePicture) {
      // Fallback to URL if provided (for backwards compatibility)
      user.profilePicture = req.body.profilePicture;
    }

    await user.save();

    const snapshot = await buildUserSnapshot(user);

    res.json({
      user: snapshot.user,
    });
  } catch (err) {
    console.error("Error updating profile picture:", err);
    res.status(500).json({ message: err.message || "Failed to update profile picture" });
  }
});

// Admin endpoint to view all users (for development/debugging)
router.get("/all", async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash -stravaAccessToken -stravaRefreshToken") // Exclude sensitive data
      .populate("inventory.itemId", "name sku cost category")
      .populate("roomLayout.itemId", "name sku")
      .sort({ createdAt: -1 }); // Newest first

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      totalKm: user.totalKm || 0,
      pointsEarned: user.pointsEarned || 0,
      pointsSpent: user.pointsSpent || 0,
      pointsRemaining: user.pointsRemaining || 0,
      stravaConnected: Boolean(user.stravaAccessToken || user.stravaRefreshToken),
      inventoryCount: user.inventory?.length || 0,
      roomLayoutCount: user.roomLayout?.length || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      inventory: user.inventory?.map((item) => ({
        itemId: item.itemId?._id?.toString(),
        itemName: item.itemId?.name,
        itemSku: item.itemId?.sku,
      })) || [],
      roomLayout: user.roomLayout?.map((placement) => ({
        itemId: placement.itemId?._id?.toString(),
        itemName: placement.itemId?.name,
        itemSku: placement.itemId?.sku,
        position: { x: placement.x, y: placement.y, z: placement.z },
        rotation: placement.rotation,
        scale: placement.scale,
      })) || [],
    }));

    res.json({
      total: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

export default router;
