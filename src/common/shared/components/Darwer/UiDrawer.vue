<template>
  <a-drawer
    :title="title"
    :placement="placement"
    :width="isHorizontal ? width : undefined"
    :height="isHorizontal ? undefined : height"
    :open="open"
    :closable="closable"
    @close="handleClose"
    :class="wrapperClass"
  >
    <!-- Header Slot -->
    <template #title v-if="$slots.title">
      <slot name="title" />
    </template>

    <!-- Extra Slot (buttons in header) -->
    <template #extra v-if="$slots.extra">
      <slot name="extra" />
    </template>

    <!-- Default Slot (main content) -->
    <slot />

    <!-- Footer Slot -->
    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </a-drawer>
</template>

<script lang="ts" setup>
import { computed } from "vue";
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

const handleClose = () => {
  emit("update:open", false);
  emit("close");
};
</script>
