import React from 'react';
import { motion } from 'framer-motion';

/**
 * Lightweight Spotlight-style card inspired by reactbits Spotlight Card.
 * Uses mouse position to create a radial highlight and subtle 3D tilt.
 */
const SpotlightCard = ({ children, className = '' }) => {
  const ref = React.useRef(null);
  const [coords, setCoords] = React.useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setCoords((c) => ({ ...c, opacity: 0 }));
  };

  const rotateAmount = 8;

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-xl bg-rose-50/80 border border-rose-200 shadow-sm transition-transform duration-200 ${className}`}
      style={{
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        scale: 1.02,
        
      }}
    >
      {/* spotlight layer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200"
        style={{ opacity: coords.opacity }}
      >
        <div
          className="absolute w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-300/45 blur-3xl"
          style={{ left: coords.x, top: coords.y }}
        />
      </div>

      {/* content */}
      <div className="relative z-10 p-4">
        {children}
      </div>
    </motion.div>
  );
};

export default SpotlightCard;
