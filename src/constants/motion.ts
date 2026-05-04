import type { Transition, Variants } from 'framer-motion';

export const MOTION_DURATION = {
  fast: 0.16,
  normal: 0.24,
  slow: 0.36,
  page: 0.32
} as const;

export const MOTION_EASE = {
  standard: [0.22, 1, 0.36, 1] as const,
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  emphasized: [0.16, 1, 0.3, 1] as const
} as const;

export const APP_PAGE_TRANSITION: Transition = {
  duration: MOTION_DURATION.page,
  ease: MOTION_EASE.emphasized
};

export const APP_PAGE_VARIANTS: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

export const REDUCED_PAGE_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const SECTION_STAGGER_TRANSITION: Transition = {
  staggerChildren: 0.045,
  delayChildren: 0.02
};

export const SECTION_ITEM_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
};

export const SURFACE_TRANSITION: Transition = {
  duration: MOTION_DURATION.normal,
  ease: MOTION_EASE.emphasized
};

export const SURFACE_VARIANTS: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 }
};

export const LIST_CONTAINER_VARIANTS: Variants = {
  initial: {},
  animate: {
    transition: SECTION_STAGGER_TRANSITION
  }
};
