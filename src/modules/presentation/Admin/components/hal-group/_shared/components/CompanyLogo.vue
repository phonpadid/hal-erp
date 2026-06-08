<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { useCompanyTheme } from "../composables/useCompanyTheme";
import type { ThemeColor } from "../constants";

/**
 * Render a company logo: tries the remote image URL first, falls back to
 * an Iconify icon, and finally to a generic `mdi:domain` placeholder.
 *
 * Replaces three copies of inline `@error="(e) => { ... toggle classes ... }"`
 * handlers in OverView and one in CompanyDetail. The fallback is driven by
 * reactive state instead of DOM mutation.
 */
interface Props {
  /** Either an absolute http(s) URL or an Iconify icon name. */
  source?: string | null;
  alt?: string;
  /** Theme colour for the background tile. */
  color?: ThemeColor | string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  rounded?: "full" | "lg" | "md";
}

const props = withDefaults(defineProps<Props>(), {
  source: undefined,
  alt: "",
  color: "blue",
  size: "md",
  rounded: "full",
});

const { getBgClass, getTextClass } = useCompanyTheme();
const failed = ref(false);

watch(
  () => props.source,
  () => {
    failed.value = false;
  },
);

const isUrl = computed(() => {
  if (!props.source) return false;
  return /^https?:\/\//i.test(props.source);
});

const showImage = computed(() => isUrl.value && !failed.value);
const iconName = computed(() => (isUrl.value ? "mdi:domain" : props.source || "mdi:domain"));

const SIZE_MAP = {
  xs: { wrap: "w-6 h-6", icon: "text-xs", inner: "w-4 h-4" },
  sm: { wrap: "w-10 h-10", icon: "text-base", inner: "w-7 h-7" },
  md: { wrap: "w-12 h-12", icon: "text-xl", inner: "w-9 h-9" },
  lg: { wrap: "w-16 h-16", icon: "text-2xl", inner: "w-12 h-12" },
  xl: { wrap: "w-24 h-24", icon: "text-4xl", inner: "w-20 h-20" },
} as const;

const ROUND_MAP = {
  full: "rounded-full",
  lg: "rounded-xl",
  md: "rounded-md",
} as const;

const sizes = computed(() => SIZE_MAP[props.size]);
const roundedClass = computed(() => ROUND_MAP[props.rounded]);
</script>

<template>
  <div
    :class="[sizes.wrap, roundedClass, getBgClass(color), getTextClass(color)]"
    class="flex items-center justify-center flex-shrink-0 overflow-hidden"
  >
    <img
      v-if="showImage"
      :src="source as string"
      :alt="alt"
      class="w-full h-full object-cover"
      loading="lazy"
      decoding="async"
      @error="failed = true"
    />
    <Icon v-else :icon="iconName" :class="sizes.icon" />
  </div>
</template>
