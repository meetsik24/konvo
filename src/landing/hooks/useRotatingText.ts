/**
 * useRotatingText Hook
 * Rotates through an array of text items at intervals
 */

import { useState, useEffect } from 'react';
import { animations } from '../constants/animations';

export const useRotatingText = <T,>(items: T[], interval: number = animations.rotation.textInterval) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [items.length, interval]);

  return {
    activeIndex,
    activeItem: items[activeIndex],
    setActiveIndex,
  };
};
