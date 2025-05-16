<script setup lang="ts">
import { Modal } from "ant-design-vue";
import { defineProps, defineEmits } from "vue";

interface Props {
  title?: string;
  visible: boolean;
  width?: number | string;
  centered?: boolean;
  closable?: boolean;
  confirmLoading?: boolean;
  okText?: string;
  cancelText?: string;
  okType?: "primary" | "ghost" | "dashed" | "link" | "text" | "default";
  okButtonProps?: Record<string, unknown>;
  cancelButtonProps?: Record<string, unknown>;
  destroyOnClose?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: "",
  visible: false,
  width: 520,
  centered: true,
  closable: true,
  confirmLoading: false,
  okText: "ຕົກລົງ",
  cancelText: "ຍົກເລີກ",
  okType: "primary",
  destroyOnClose: true,
});

const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "ok"): void;
  (e: "cancel"): void;
}>();

const handleOk = () => {
  emit("ok");
};

const handleCancel = () => {
  emit("update:visible", false);
  emit("cancel");
};
</script>

<template>
  <Modal
    :title="title"
    :open="visible"
    :centered="centered"
    :closable="closable"
    :confirm-loading="confirmLoading"
    :width="width"
    :ok-text="okText"
    :cancel-text="cancelText"
    :ok-type="okType"
    :ok-button-props="okButtonProps"
    :cancel-button-props="cancelButtonProps"
    :destroy-on-close="destroyOnClose"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <slot></slot>
    <template #footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </template>
  </Modal>
</template>
