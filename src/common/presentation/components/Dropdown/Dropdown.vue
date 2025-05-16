<script setup lang="ts">
defineOptions({
  name: 'CustomDropdown'
});
import { defineProps, defineEmits, h } from "vue";
import { Dropdown, Menu } from "ant-design-vue";
import type { MenuProps, DropdownProps } from "ant-design-vue";

interface Option {
  key: string;
  label: string;
}

const props = defineProps<{
  options: Option[];
  trigger?: DropdownProps["trigger"];
  placement?: DropdownProps["placement"];
}>();

const emit = defineEmits<{
  (event: "select", key: string): void;
}>();

const handleMenuClick: MenuProps["onClick"] = (info) => {
  emit("select", info.key as string);
};

const renderMenu = () => {
  return h(Menu, { onClick: handleMenuClick }, () =>
    props.options.map((option) => h(Menu.Item, { key: option.key }, () => option.label))
  );
};
</script>

<template>
  <Dropdown :trigger="props.trigger" :placement="props.placement" class="custom-dropdown">
    <slot />
    <template #overlay>
      <renderMenu />
    </template>
  </Dropdown>
</template>

<style>
/* Dark Mode styles for dropdown */
.dark .ant-dropdown-menu {
  background-color: #1f2937 !important; /* gray.800 */
  border: 1px solid #374151 !important; /* gray.700 */
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 6px 16px 0 rgba(0, 0, 0, 0.32),
    0 9px 28px 8px rgba(0, 0, 0, 0.2) !important;
}

.dark .ant-dropdown-menu-item,
.dark .ant-dropdown-menu-submenu-title {
  color: #e5e7eb !important; /* gray.200 */
  transition: background-color 0.3s;
}

.dark .ant-dropdown-menu-item:hover,
.dark .ant-dropdown-menu-submenu-title:hover {
  background-color: #374151 !important; /* gray.700 */
}

.dark .ant-dropdown-menu-item-divider {
  background-color: #374151 !important; /* gray.700 */
}

.dark .ant-dropdown-menu-item-selected {
  background-color: #3b82f6 !important; /* blue.500 */
  color: #ffffff !important;
}

.dark .ant-dropdown-menu-item-disabled,
.dark .ant-dropdown-menu-submenu-title-disabled {
  color: #6b7280 !important; /* gray.500 */
  cursor: not-allowed;
}

/* เพิ่มลูกศรในโหมดกลางคืน */
.dark .ant-dropdown-placement-bottomLeft > .ant-dropdown-arrow,
.dark .ant-dropdown-placement-bottomCenter > .ant-dropdown-arrow,
.dark .ant-dropdown-placement-bottomRight > .ant-dropdown-arrow {
  border-top-color: #1f2937 !important;
  border-left-color: #1f2937 !important;
}

.dark .ant-dropdown-placement-topLeft > .ant-dropdown-arrow,
.dark .ant-dropdown-placement-topCenter > .ant-dropdown-arrow,
.dark .ant-dropdown-placement-topRight > .ant-dropdown-arrow {
  border-bottom-color: #1f2937 !important;
  border-right-color: #1f2937 !important;
}

/* เพิ่ม style เฉพาะสำหรับ Dropdown ใน Ant Design Vue 3 */
.dark .ant-dropdown .ant-dropdown-menu {
  background-color: #1f2937 !important;
}

/* เพิ่มความเฉพาะเจาะจงเพื่อ override styles เดิม */
html.dark .ant-dropdown .ant-dropdown-menu,
body.dark .ant-dropdown .ant-dropdown-menu {
  background-color: #1f2937 !important;
  color: #e5e7eb !important;
}

/* หากใช้ Portal ใน Ant Design */
.dark div[id^="ant-dropdown"] .ant-dropdown-menu,
div[id^="ant-dropdown"].dark .ant-dropdown-menu {
  background-color: #1f2937 !important;
  color: #e5e7eb !important;
}
</style>
