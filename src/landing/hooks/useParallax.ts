/**
 * useParallax Hook
 * Creates parallax effect on mouse movement
 */

import { useState, useEffect } from 'react';
import { animations } from '../constants/animations';

interface ParallaxPosition {
  x: number;
  y: number;
}

export const useParallax = () => {
  const [position, setPosition] = useState<ParallaxPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: (e.clientX / window.innerWidth - 0.5) * animations.parallax.sensitivity,
        y: (e.clientY / window.innerHeight - 0.5) * animations.parallax.sensitivity,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
};
