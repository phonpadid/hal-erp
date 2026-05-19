<template>
  <a-drawer
    :title="title"
    :placement="placement"
    :width="isHorizontal ? responsiveWidth : undefined"
    :height="isHorizontal ? undefined : responsiveHeight"
    :open="open"
    :closable="closable"
    @close="handleClose"
    :class="['ui-drawer-responsive', wrapperClass]"
  >
    <template #title v-if="$slots.title">
      <slot name="title" />
    </template>

    <template #extra v-if="$slots.extra">
      <slot name="extra" />
    </template>

    <slot />

    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </a-drawer>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { DrawerProps } from "ant-design-vue";

interface Props {
  open: boolean;
  title?: string;
  placement?: DrawerProps["placement"];
  width?: number | string;
  height?: number | string;
  closable?: boolean;
  wrapperClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  placement: "right",
  width: 378,
  height: 378,
  closable: true,
  wrapperClass: "",
});

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "close"): void;
}>();

const isHorizontal = computed(() => {
  return props.placement === "left" || props.placement === "right";
});

const viewportWidth = ref<number>(
  typeof window !== "undefined" ? window.innerWidth : 1024
);

const updateViewport = () => {
  if (typeof window !== "undefined") {
    viewportWidth.value = window.innerWidth;
  }
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateViewport);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateViewport);
  }
});

const responsiveWidth = computed<number | string>(() => {
  if (viewportWidth.value < 640) return "100%";
  if (viewportWidth.value < 768) return "90%";
  const numeric = typeof props.width === "number" ? props.width : parseInt(`${props.width}`, 10);
  if (!Number.isFinite(numeric)) return props.width;
  const cap = Math.min(numeric, viewportWidth.value - 32);
  return cap > 0 ? cap : props.width;
});

const responsiveHeight = computed<number | string>(() => {
  if (viewportWidth.value < 640) return "90vh";
  return props.height;
});

const handleClose = () => {
  emit("update:open", false);
  emit("close");
};
</script>

<style>
@media (max-width: 640px) {
  .ui-drawer-responsive .ant-drawer-body {
    padding: 16px !important;
  }
}
</style>
