import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { formatRoomLayout } from '../utils/userPayload.js';

const router = express.Router();

router.post('/save', authRequired, async (req, res) => {
  const user = req.user;
  const { layout } = req.body;

  user.roomLayout = layout;
  await user.save();
  await user.populate({ path: 'roomLayout.itemId' });

  res.json({ layout: formatRoomLayout(user.roomLayout) });
});

export default router;
