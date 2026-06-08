import { computed, onBeforeUnmount, onMounted, ref } from "vue";

/**
 * Reactive viewport breakpoints aligned with Tailwind's defaults plus
 * an `ultra` tier for 2K/4K displays. Used by responsive grids that need
 * to pick column counts in JS rather than CSS (e.g. virtualised lists,
 * chart sizing).
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  ultra: 1920,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS | "xs";

export function useBreakpoint() {
  const width = ref(typeof window !== "undefined" ? window.innerWidth : 1280);

  const onResize = () => {
    width.value = window.innerWidth;
  };

  onMounted(() => {
    window.addEventListener("resize", onResize, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
  });

  const current = computed<Breakpoint>(() => {
    const w = width.value;
    if (w >= BREAKPOINTS.ultra) return "ultra";
    if (w >= BREAKPOINTS["2xl"]) return "2xl";
    if (w >= BREAKPOINTS.xl) return "xl";
    if (w >= BREAKPOINTS.lg) return "lg";
    if (w >= BREAKPOINTS.md) return "md";
    if (w >= BREAKPOINTS.sm) return "sm";
    return "xs";
  });

  const isMobile = computed(() => width.value < BREAKPOINTS.md);
  const isTablet = computed(
    () => width.value >= BREAKPOINTS.md && width.value < BREAKPOINTS.lg,
  );
  const isDesktop = computed(
    () => width.value >= BREAKPOINTS.lg && width.value < BREAKPOINTS.ultra,
  );
  const isUltraWide = computed(() => width.value >= BREAKPOINTS.ultra);

  return {
    width,
    current,
    isMobile,
    isTablet,
    isDesktop,
    isUltraWide,
  };
}
