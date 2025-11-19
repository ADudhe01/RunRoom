import React from "react";
import { motion } from "framer-motion";

export default function ItemCard({ item, onBuy, disabled, owned }) {
  const rarityValue = item.rarity || "common";
  const rarityClass = `rarity-pill rarity-${rarityValue}`;

  return (
    <motion.div
      className="item-card"
      whileHover={{ y: -4, boxShadow: "0 10px 24px rgba(0,0,0,0.15)" }}
    >
      <div className="item-media">
        <img src={item.imageUrl} alt={item.name} className="item-image" />
        <span className={rarityClass}>{rarityValue}</span>
        {owned && <span className="owned-tag">Owned</span>}
      </div>
      <div className="item-info">
        <div className="item-headline">
          <h3>{item.name}</h3>
          <p className="item-cost">⭐ {item.cost} pts</p>
        </div>
        {item.description && <p className="item-description">{item.description}</p>}
        <button onClick={() => onBuy(item)} disabled={disabled || owned}>
          {owned ? "In collection" : disabled ? "Not enough points" : "Add to room"}
        </button>
      </div>
    </motion.div>
  );
}
