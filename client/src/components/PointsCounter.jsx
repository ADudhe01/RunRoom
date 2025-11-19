import React from 'react';
import { motion } from 'framer-motion';

export default function PointsCounter({ points }) {
  return (
    <motion.div
      className="points-counter"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 12 }}
    >
      <span className="points-label">Total Points</span>
      <span className="points-value">{points}</span>
    </motion.div>
  );
}
