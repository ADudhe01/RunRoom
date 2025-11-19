import React from 'react';
import { motion } from 'framer-motion';

export default function Avatar() {
  return (
    <motion.div
      className="avatar-wrapper"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="avatar-body">
        <div className="avatar-head" />
        <div className="avatar-torso" />
        <div className="avatar-legs" />
      </div>
    </motion.div>
  );
}
