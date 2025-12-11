import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const colors = ['#ef4444', '#f97316', '#e11d48', '#fb7185'];

const GlobalClickSpark = () => {
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    const handleClick = (event) => {
      const sparkId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      const newSpark = {
        id: sparkId,
        x: event.clientX,
        y: event.clientY,
        particles: Array.from({ length: 10 }, (_, index) => ({
          id: `${sparkId}-${index}`,
          angle: (index * 360) / 10,
          color: colors[index % colors.length],
        })),
      };

      setSparks((prev) => [...prev, newSpark]);

      setTimeout(() => {
        setSparks((prev) => prev.filter((spark) => spark.id !== sparkId));
      }, 700);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] overflow-hidden">
      <AnimatePresence>
        {sparks.map((spark) => (
          <div
            key={spark.id}
            className="absolute"
            style={{ left: spark.x, top: spark.y }}
          >
            {spark.particles.map((particle) => (
              <motion.span
                key={particle.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((particle.angle * Math.PI) / 180) * 40,
                  y: Math.sin((particle.angle * Math.PI) / 180) * 40,
                  opacity: 0,
                  scale: 0.2,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute rounded-full shadow"
                style={{
                  width: 5,
                  height: 5,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 6px ${particle.color}`,
                }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GlobalClickSpark;
