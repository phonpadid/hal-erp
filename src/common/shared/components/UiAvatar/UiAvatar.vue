<template>
  <a-avatar
    :size="size"
    :shape="shape"
    :src="src"
    :style="avatarStyle"
    :class="[customClass, { 'cursor-pointer': clickable }]"
    @click="handleClick"
  >
    <template v-if="!src && (icon || fallbackIcon)">
      <Icon :icon="icon || fallbackIcon" :style="iconStyle" />
    </template>
    <template v-else-if="!src && text">{{ text }}</template>
  </a-avatar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";

interface Props {
  size?: "large" | "small" | "default" | number;

  shape?: "circle" | "square";

  src?: string;

  icon?: string;

  fallbackIcon?: string;

  text?: string;

  backgroundColor?: string;

  color?: string;

  customClass?: string;

  iconSize?: number;

  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "default",
  shape: "circle",
  src: "",
  icon: "",
  fallbackIcon: "ant-design:user-outlined",
  text: "",
  backgroundColor: "#f0f0f0",
  color: "#666666",
  customClass: "",
  iconSize: 16,
  clickable: false,
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const avatarStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  color: props.color,
}));

const iconStyle = computed(() => ({
  fontSize: `${props.iconSize}px`,
  color: props.color,
}));

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit("click", event);
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

:deep(.ant-avatar-string) {
  line-height: 1;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>
