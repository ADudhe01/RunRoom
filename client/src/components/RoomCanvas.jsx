import React from "react";
import { motion } from "framer-motion";

const floatTransition = {
  repeat: Infinity,
  repeatType: "mirror",
  duration: 3.2,
  ease: "easeInOut",
};

export default function RoomCanvas({
  layout = [],
  activePlacementId,
  onSelectPlacement,
  onCanvasClick,
}) {
  const hasItems = layout.length > 0;

  return (
    <div
      className="room-canvas"
      onClick={(event) => {
        onCanvasClick?.(event);
      }}
    >
      <div className="room-background" />
      <div className="room-halo" />
      <motion.div
        className="room-window"
        animate={{ opacity: [0.75, 0.9, 0.8] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <div className="window-bars" />
        <div className="window-glow" />
      </motion.div>
      <motion.div
        className="room-decor room-decor--shelf"
        animate={{ y: [-2, 2, -1], opacity: [0.85, 1, 0.9] }}
        transition={floatTransition}
      >
        <span className="shelf-board" />
        <span className="shelf-vase" />
        <span className="shelf-books" />
      </motion.div>
      <motion.div
        className="room-decor room-decor--plant"
        animate={{ y: [0, -4, 0], rotate: [-1, 1, -1] }}
        transition={{ ...floatTransition, duration: 4.2 }}
      >
        <span className="plant-pot" />
        <span className="plant-leaf leaf-left" />
        <span className="plant-leaf leaf-right" />
      </motion.div>
      <motion.div
        className="room-decor room-decor--lamp"
        animate={{ opacity: [0.9, 1, 0.95] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "mirror" }}
      >
        <span className="lamp-head" />
        <span className="lamp-stand" />
      </motion.div>
      <div className="room-floor" />

      {hasItems ? (
        layout.map((placement) => {
          const { id, x, y, scale, item, localId } = placement;
          if (!item) return null;
          const key = id || localId;
          const isActive = (localId || id) === activePlacementId;
          return (
            <motion.img
              key={key}
              src={item.imageUrl}
              alt={item.name}
              className={`room-item ${isActive ? "is-active" : ""}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${scale || 1})`,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlacement?.(localId || id);
              }}
              whileHover={{ scale: 1.05 }}
            />
          );
        })
      ) : (
        <div className="room-empty">
          <p>No décor placed yet</p>
          <span>Pick from your inventory to start composing.</span>
        </div>
      )}
    </div>
  );
}
