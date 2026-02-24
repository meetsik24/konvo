/**
 * Landing page animation configurations
 * Reusable animation patterns and timing
 */

export const animations = {
  // Timing
  duration: {
    fast: 0.3,
    normal: 0.5,
    slow: 0.8,
    slower: 1,
  },

  // Stagger delays
  stagger: {
    small: 0.1,
    normal: 0.2,
    large: 0.3,
  },

  // Intersection observer options
  observerOptions: {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  },

  // Fade in animation config
  fadeInConfig: {
    opacity: [0, 1],
    y: [20, 0],
    duration: 0.6,
  },

  // Slide in animation config
  slideInConfig: {
    opacity: [0, 1],
    x: [100, 0],
    duration: 0.6,
  },

  // Parallax sensitivity
  parallax: {
    sensitivity: 20,
  },

  // Rotation intervals (in ms)
  rotation: {
    textInterval: 3500,
    mockupInterval: 3500,
  },
};
