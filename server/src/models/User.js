import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  },
  { _id: false }
);

const RoomPlacementSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
    rotation: { type: Number, default: 0 },
    scale: { type: Number, default: 1 },
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    profilePicture: { type: String, default: null },
    totalKm: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    pointsSpent: { type: Number, default: 0 },
    inventory: [InventoryItemSchema],
    roomLayout: [RoomPlacementSchema],
    stravaAccessToken: String,
    stravaRefreshToken: String,
    stravaTokenExpiresAt: Date,
  },
  { timestamps: true }
);

UserSchema.virtual("pointsRemaining").get(function () {
  return this.pointsEarned - this.pointsSpent;
});

export const User = mongoose.model("User", UserSchema);
