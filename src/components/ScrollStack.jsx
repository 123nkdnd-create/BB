import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ScrollStack = ({ items, renderItem }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Create a rotated array based on current index to show the stack
  const getVisibleItems = () => {
    const visibleCount = 3;
    const result = [];
    for (let i = 0; i < Math.min(items.length, visibleCount); i++) {
      const idx = (currentIndex + i) % items.length;
      result.push({ data: items[idx], originalIndex: idx, stackIndex: i });
    }
    return result;
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px]">
      <div className="relative w-full max-w-2xl aspect-video flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {getVisibleItems().map((item, i) => (
            <motion.div
              key={`${item.originalIndex}-${currentIndex}`} // Key changes to trigger animation
              className="absolute w-full h-full rounded-xl overflow-hidden shadow-2xl border border-gray-100 bg-white cursor-pointer"
              style={{ 
                zIndex: 30 - item.stackIndex * 10,
                transformOrigin: 'bottom center'
              }}
              initial={{ 
                scale: 0.9, 
                y: 50, 
                opacity: 0 
              }}
              animate={{ 
                scale: 1 - item.stackIndex * 0.05, 
                y: item.stackIndex * 20, 
                opacity: 1 - item.stackIndex * 0.2,
                rotate: item.stackIndex % 2 === 0 ? item.stackIndex * 2 : item.stackIndex * -2
              }}
              exit={{ 
                x: -100, 
                opacity: 0, 
                rotate: -10,
                transition: { duration: 0.2 }
              }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={item.stackIndex === 0 ? next : undefined}
              drag={item.stackIndex === 0 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.x > 100) {
                    prev();
                } else if (offset.x < -100) {
                    next();
                }
              }}
            >
              {renderItem(item)}
              
              {/* Overlay for non-top items */}
              {item.stackIndex > 0 && (
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-12 flex gap-6 z-40">
        <button 
            onClick={prev} 
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 text-gray-700 transition-transform hover:scale-110 active:scale-95"
        >
            <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
            {currentIndex + 1} / {items.length}
        </div>
        <button 
            onClick={next} 
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 text-gray-700 transition-transform hover:scale-110 active:scale-95"
        >
            <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ScrollStack;
