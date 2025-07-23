<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue';
import type { UploadProps } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { CloudUploadOutlined } from '@ant-design/icons-vue';

interface Props {
  modelValue?: string | File | null;
  accept?: string;
  maxSize?: number; // ขนาดไฟล์สูงสุดในหน่วย MB
  width?: string;
  height?: string;
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  accept: 'image/*',
  maxSize: 5, 
  width: '100%',
  height: 'auto',
  placeholder: 'ຄລິກເພື່ອອັບໂຫຼດ',
  disabled: false,
});

const emit = defineEmits(['update:modelValue', 'change']);

const fileList = ref<any[]>([]);
const loading = ref(false);

// Convert size to MB
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Handle before upload
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  // Check file type
  const isAccepted = props.accept
    .split(',')
    .some(type => file.type.match(type.trim()));

  if (!isAccepted) {
    message.error('ກະລຸນາອັບໂຫຼດໄຟລ໌ຮູບພາບເທົ່ານັ້ນ!');
    return false;
  }

  // Check file size
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize;
  if (!isLtMaxSize) {
    message.error(`ຂະໜາດໄຟລ໌ຕ້ອງນ້ອຍກວ່າ ${props.maxSize}MB!`);
    return false;
  }

  return true;
};

// Handle change
const handleChange: UploadProps['onChange'] = (info) => {
  const { file, fileList: newFileList } = info;

  if (file.status === 'uploading') {
    loading.value = true;
    return;
  }

  if (file.status === 'done') {
    loading.value = false;
    emit('update:modelValue', file);
    emit('change', file);
  }

  if (file.status === 'error') {
    loading.value = false;
    message.error('ການອັບໂຫຼດລົ້ມເຫຼວ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ!');
  }

  fileList.value = newFileList;
};

// Handle preview
const handlePreview = async (file: any) => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj);
  }

  // Open preview modal here if needed
};

// Convert file to base64
const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
</script>

<template>
  <div class="upload-component">
    <a-upload-dragger
      v-model:fileList="fileList"
      :accept="accept"
      :before-upload="beforeUpload"
      @change="handleChange"
      @preview="handlePreview"
      :multiple="false"
      :disabled="disabled"
      :style="{ width, height }"
      class="upload-area"
    >
      <div class="upload-content">
        <p class="upload-icon">
          <CloudUploadOutlined />
        </p>
        <p class="upload-text">{{ placeholder }}</p>
        <p class="upload-hint">
          ຫຼື ລາກໄຟລ໌ມາວາງທີ່ນີ້
        </p>
        <p class="upload-hint">
          ຮອງຮັບໄຟລ໌: {{ accept }} | ຂະໜາດສູງສຸດ: {{ maxSize }}MB
        </p>
      </div>

      <!-- Preview Section -->
      <template v-if="fileList.length > 0" #itemRender="{ file }">
        <div class="upload-list-item">
          <img
            v-if="file.url || file.preview"
            :src="file.url || file.preview"
            :alt="file.name"
            class="upload-preview-image"
          />
          <div class="upload-list-item-info">
            <span class="upload-file-name">{{ file.name }}</span>
            <span class="upload-file-size">{{ formatFileSize(file.size) }}</span>
          </div>
        </div>
      </template>
    </a-upload-dragger>
  </div>
</template>

<style scoped>
.upload-component {
  width: 100%;
}

.upload-area {
  background: #fafafa;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #1890ff;
}

.upload-content {
  padding: 20px;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #1890ff;
}

.upload-text {
  margin: 8px 0;
  font-size: 16px;
  color: #666;
}

.upload-hint {
  color: #999;
  font-size: 14px;
  margin: 4px 0;
}

.upload-list-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin-top: 8px;
}

.upload-preview-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 8px;
}

.upload-list-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.upload-file-name {
  color: #666;
  font-size: 14px;
}

.upload-file-size {
  color: #999;
  font-size: 12px;
}

/* Dark mode styles */
:deep(.dark) .upload-area {
  background: #1f2937;
  border-color: #4b5563;
}

:deep(.dark) .upload-text {
  color: #e5e7eb;
}

:deep(.dark) .upload-hint {
  color: #9ca3af;
}

:deep(.dark) .upload-list-item {
  border-color: #4b5563;
  background: #1f2937;
}

:deep(.dark) .upload-file-name {
  color: #e5e7eb;
}

:deep(.dark) .upload-file-size {
  color: #9ca3af;
}
</style>
