import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { Item } from '../models/Item.js';
import { ensureBaseCatalog } from '../utils/catalog.js';
import { formatInventory } from '../utils/userPayload.js';

const router = express.Router();

router.get('/items', async (req, res) => {
  await ensureBaseCatalog();
  const items = await Item.find().sort({ cost: 1 });
  res.json({ items });
});

router.post('/buy', authRequired, async (req, res) => {
  const user = req.user;
  const { itemId } = req.body;

  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  if (user.pointsRemaining < item.cost) {
    return res.status(400).json({ message: 'Not enough points' });
  }

  user.pointsSpent += item.cost;
  user.inventory.push({ itemId: item._id });
  await user.save();
  await user.populate({ path: 'inventory.itemId' });

  res.json({
    pointsRemaining: user.pointsRemaining,
    inventory: formatInventory(user.inventory),
  });
});

export default router;
