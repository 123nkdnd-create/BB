import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ClickSpark = ({ children }) => {
  const [sparks, setSparks] = useState([]);

  const createSpark = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSpark = {
      id: Date.now() + Math.random(),
      x,
      y,
      particles: Array.from({ length: 8 }, (_, i) => ({
        id: i,
        angle: (i * 360) / 8,
      })),
    };

    setSparks((prev) => [...prev, newSpark]);

    setTimeout(() => {
      setSparks((prev) => prev.filter((spark) => spark.id !== newSpark.id));
    }, 600);
  }, []);

  return (
    <div
      onClick={createSpark}
      style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
    >
      {children}
      <AnimatePresence>
        {sparks.map((spark) => (
          <div
            key={spark.id}
            style={{
              position: 'absolute',
              left: spark.x,
              top: spark.y,
              pointerEvents: 'none',
            }}
          >
            {spark.particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: Math.cos((particle.angle * Math.PI) / 180) * 40,
                  y: Math.sin((particle.angle * Math.PI) / 180) * 40,
                  opacity: 0,
                  scale: 0.5,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  boxShadow: '0 0 4px #ef4444',
                }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ClickSpark;
