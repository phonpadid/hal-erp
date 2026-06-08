<script setup lang="ts">
interface Props {
  message?: string;
  size?: "sm" | "md" | "lg";
  /** When true, render a full-viewport overlay (z-50, white backdrop). */
  overlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  message: "",
  size: "md",
  overlay: false,
});

const SIZE_MAP = {
  sm: "h-6 w-6 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
} as const;

const spinnerClass = SIZE_MAP[props.size];
</script>

<template>
  <div
    v-if="overlay"
    class="fixed inset-0 bg-white/85 backdrop-blur-sm flex items-center justify-center z-50"
    role="status"
    :aria-label="message || 'Loading'"
  >
    <div class="text-center">
      <div
        class="inline-block animate-spin motion-reduce:animate-none rounded-full border-blue-600 border-b-transparent"
        :class="spinnerClass"
      />
      <p v-if="message" class="mt-4 text-gray-600 font-medium">{{ message }}</p>
    </div>
  </div>
  <div v-else class="flex flex-col items-center justify-center py-6" role="status">
    <div
      class="animate-spin motion-reduce:animate-none rounded-full border-blue-600 border-b-transparent"
      :class="spinnerClass"
    />
    <p v-if="message" class="mt-3 text-sm text-gray-600">{{ message }}</p>
  </div>
</template>
