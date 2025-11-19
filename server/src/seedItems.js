// server/src/seedItems.js
import mongoose from 'mongoose';
import { MONGO_URI } from './config.js';
import { Item } from './models/Item.js';
import defaultItems from './data/defaultItems.js';

async function main() {
  await mongoose.connect(MONGO_URI);
  await Item.deleteMany({});

  await Item.insertMany(defaultItems);

  console.log('Seeded items');
  process.exit(0);
}

main();
