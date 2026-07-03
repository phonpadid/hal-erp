<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
// In-module transfer-slip upload widget (fresh, not reused from Finance-DPM).
// Emits [{ file_name }] for the approve-step payload.
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { uploadFile } from "@/modules/application/services/upload.service";

const props = defineProps<{
  modelValue: Array<{ file_name: string }>;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: Array<{ file_name: string }>): void;
}>();

const { t } = useI18n();
const previews = ref<Array<{ url: string; file_name: string }>>([]);

const onChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { fileName } = await uploadFile(formData);
    previews.value.push({ url: URL.createObjectURL(file), file_name: fileName });
    emit("update:modelValue", [...props.modelValue, { file_name: fileName }]);
  } catch (err: any) {
    message.error(err?.message || "upload failed");
  }
};

const remove = (index: number) => {
  previews.value.splice(index, 1);
  const next = [...props.modelValue];
  next.splice(index, 1);
  emit("update:modelValue", next);
};
</script>

<template>
  <div class="space-y-2">
    <h4 class="font-semibold">{{ t("expressDisbursementRequest.approval.upload_slip") }}</h4>
    <input type="file" accept="image/*,application/pdf" @change="onChange" />
    <div class="flex flex-wrap gap-2 mt-2">
      <div v-for="(p, i) in previews" :key="i" class="relative border rounded p-1">
        <img :src="p.url" alt="slip" class="w-24 h-24 object-cover" />
        <button
          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
          @click="remove(i)"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>
