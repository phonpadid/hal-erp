<script setup lang="ts">
import { ref, watch } from 'vue';
import { Upload, Modal, message } from 'ant-design-vue';

const props = defineProps<{
  visible: boolean;
  logoUrl: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'upload', file: File, previewUrl: string): void;
}>();

const handleUpload = (info: any) => {
  const file = info.file.originFileObj;
  const previewUrl = URL.createObjectURL(file);
  emit('upload', file, previewUrl);
  emit('update:visible', false);
  message.success('Logo selected successfully!');
};
</script>

<template>
  <Modal
    :open="visible"
    title="Upload Logo"
    @cancel="() => emit('update:visible', false)"
    :footer="null"
  >
    <Upload
      :beforeUpload="() => false"
      @change="handleUpload"
      :max-count="1"
      accept="image/*"
    >
      <a-button type="primary">Click to Upload</a-button>
    </Upload>
    <div v-if="logoUrl" class="mt-4">
      <img :src="logoUrl" alt="Logo preview" class="w-32 h-auto" />
    </div>
  </Modal>
</template>
