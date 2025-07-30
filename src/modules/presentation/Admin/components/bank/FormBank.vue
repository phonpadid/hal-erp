<script setup lang="ts">
import { ref, reactive, watch, defineProps, defineEmits, computed } from "vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UploadFile from "@/common/shared/components/Upload/UploadFile.vue";
import { useI18n } from 'vue-i18n';
import { createBankValidation } from "@/modules/presentation/Admin/views/bank/validation/bank.validate";

const { t } = useI18n();

const props = defineProps<{
  modelValue: { name: string; short_name: string; logo: string | File | null, logoUrl: string | File | null  };
  loading?: boolean;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  (
    e: "update:modelValue",
    value: { name: string; short_name: string; logo: string | File | null; logoUrl: string | File | null }
  ): void;
  (e: "submit", value: { name: string; short_name: string; logo: string | File | null }): void;
}>();

const formRef = ref();
const formModel = reactive({ ...props.modelValue });
const logoFile = ref<File | string | null>(formModel.logo ?? null);
const rules = computed(() => createBankValidation(t, { isEditMode: props.isEdit ?? false }));

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(formModel, val);
    logoFile.value = val.logo ?? null;
    logoFile.value = val.logoUrl ?? null;
  }
);

watch(logoFile, (val) => {
  formModel.logo = val;
  emit("update:modelValue", { ...formModel });
});

function handleFileChange(file: File) {
  formModel.logo = file;
  logoFile.value = file;
  emit("update:modelValue", { ...formModel });
}

function submitForm() {
  emit("submit", { ...formModel });
}

defineExpose({ submitForm });
</script>

<template>
  <UiForm ref="formRef" :model="formModel" :rules="rules">
    <UiFormItem>
      <UploadFile
        v-model="logoFile"
        :width="'100%'"
        :height="'200px'"
        :upload-text="isEdit ? 'ອັບເດດໂລໂກ້' : 'ອັບໂຫລດໂລໂກ'"
        @onFileSelect="handleFileChange"
      />
    </UiFormItem>
    <UiFormItem :label="$t('banks.field.name')" name="name" required>
      <UiInput
        v-model="formModel.name"
        :placeholder="$t('banks.placeholder.name')"
        :disabled="loading"
      />
    </UiFormItem>
    <UiFormItem :label="$t('banks.field.short_name')" name="short_name" required>
      <UiInput
        v-model="formModel.short_name"
        :placeholder="$t('banks.placeholder.short_name')"
        :disabled="loading"
      />
    </UiFormItem>
  </UiForm>
</template>
