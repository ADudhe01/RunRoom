import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true, sparse: true },
    name: String,
    cost: Number,
    category: String,
    imageUrl: String,
    rarity: { type: String, default: 'common' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Item = mongoose.model('Item', ItemSchema);
