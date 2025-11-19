import defaultItems from "../data/defaultItems.js";
import { Item } from "../models/Item.js";

let ensurePromise = null;

export async function ensureBaseCatalog() {
  if (ensurePromise) {
    return ensurePromise;
  }

  ensurePromise = (async () => {
    await Promise.all(
      defaultItems.map((entry) =>
        Item.findOneAndUpdate(
          { sku: entry.sku },
          entry,
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        )
      )
    );
  })();

  try {
    await ensurePromise;
  } finally {
    ensurePromise = null;
  }
}

export const STARTER_SKUS = [
  "poster.midnight-grid",
  "plant.moss-wall",
  "light.aurora-bar",
];

export async function grantStarterKit(user) {
  if (user.inventory && user.inventory.length > 0) {
    return user;
  }

  await ensureBaseCatalog();

  const starterItems = await Item.find({ sku: { $in: STARTER_SKUS } });
  starterItems.forEach((item) => {
    user.inventory.push({ itemId: item._id });
  });

  await user.save();
  return user;
}

