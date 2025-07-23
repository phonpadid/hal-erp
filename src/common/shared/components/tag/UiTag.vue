<template>
  <a-tag
    :color="color"
    :class="[customClass, { 'cursor-pointer': clickable }, 'tag-content']"
    @click="handleClick"
  >
    <div class="tag-inner">
      <template v-if="icon || $slots.icon">
        <span class="icon-wrapper">
          <slot name="icon">
            <Icon v-if="icon" :icon="icon" />
          </slot>
        </span>
      </template>
      <span class="text-wrapper">
        <slot>{{ text }}</slot>
      </span>
    </div>
  </a-tag>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

type TagColor = "success" | "processing" | "error" | "warning" | "default" | string;

interface Props {
  color?: TagColor;
  text?: string;
  icon?: string;
  customClass?: string;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: "default",
  text: "",
  icon: "",
  customClass: "",
  clickable: false,
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

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

.tag-content {
  padding: 0 7px;
}

.tag-inner {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.icon-wrapper {
  display: flex;
  align-items: center;
}

.text-wrapper {
  line-height: 1.4;
}

:deep(.anticon) {
  vertical-align: middle;
  display: flex;
  align-items: center;
}
</style>
