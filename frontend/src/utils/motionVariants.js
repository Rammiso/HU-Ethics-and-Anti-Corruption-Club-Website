export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -20 },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const heroTextReveal = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1], // Cubic bezier for premium feel
    },
  },
};

export const glowButton = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow: "0 0 20px rgba(57, 255, 20, 0.3)", // Neon green glow
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: { scale: 0.98 },
};

export const holographicCard = {
  rest: {
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    y: -5,
    boxShadow:
      "0 10px 30px -5px rgba(57, 255, 20, 0.15), inset 0 0 20px rgba(57, 255, 20, 0.05)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

export const cardSweep = {
  rest: { x: "-100%", opacity: 0 },
  hover: {
    x: "100%",
    opacity: [0, 0.3, 0],
    transition: {
      duration: 0.6,
      ease: "linear",
    },
  },
};

export const subtleGradient = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 15,
      ease: "linear",
      repeat: Infinity,
    },
  },
};
