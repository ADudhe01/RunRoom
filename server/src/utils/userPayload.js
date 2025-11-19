import { grantStarterKit } from "./catalog.js";

function formatItemDoc(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    sku: doc.sku,
    name: doc.name,
    cost: doc.cost,
    category: doc.category,
    imageUrl: doc.imageUrl,
    rarity: doc.rarity,
    description: doc.description || "",
  };
}

function formatInventory(inventory = []) {
  return inventory
    .map((slot, idx) => ({
      slotId: `${slot.itemId?._id?.toString() || "missing"}-${idx}`,
      itemId: slot.itemId?._id?.toString(),
      item: formatItemDoc(slot.itemId),
    }))
    .filter((slot) => slot.itemId && slot.item);
}

function formatRoomLayout(layout = []) {
  return layout
    .map((placement) => ({
      id: placement._id?.toString() || `${placement.itemId}-${placement.x}-${placement.y}`,
      itemId: placement.itemId?._id?.toString(),
      x: placement.x ?? 0,
      y: placement.y ?? 0,
      z: placement.z ?? 0,
      rotation: placement.rotation ?? 0,
      scale: placement.scale ?? 1,
      item: formatItemDoc(placement.itemId),
    }))
    .filter((placement) => placement.itemId && placement.item);
}

export async function buildUserSnapshot(user) {
  const workingUser = await grantStarterKit(user);

  await workingUser.populate([
    { path: "inventory.itemId" },
    { path: "roomLayout.itemId" },
  ]);

  return {
    user: {
      id: workingUser._id.toString(),
      email: workingUser.email,
      name: workingUser.name,
      profilePicture: workingUser.profilePicture || null,
    },
    pointsRemaining: workingUser.pointsRemaining,
    inventory: formatInventory(workingUser.inventory),
    roomLayout: formatRoomLayout(workingUser.roomLayout),
    stravaConnected: Boolean(
      workingUser.stravaAccessToken || workingUser.stravaRefreshToken
    ),
    totalKm: Math.floor(workingUser.totalKm || 0),
  };
}

export { formatInventory, formatRoomLayout, formatItemDoc };

