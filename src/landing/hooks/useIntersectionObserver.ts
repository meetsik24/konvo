/**
 * useIntersectionObserver Hook
 * Observes elements and triggers callback when they enter viewport
 */

import { useEffect, useRef } from 'react';
import { animations } from '../constants/animations';

interface UseIntersectionObserverProps {
  onIntersect: (entry: IntersectionObserverEntry) => void;
  options?: IntersectionObserverInit;
}

export const useIntersectionObserver = ({
  onIntersect,
  options = animations.observerOptions,
}: UseIntersectionObserverProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onIntersect(entry);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [onIntersect, options]);

  return ref;
};
