<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { VendorInterface } from "@/modules/interfaces/vendors/vendor/vendor.interfacce";
import { createVendorValidation } from "../../../views/vendors/vendor/validations/vendor.validation";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiTextArea from "@/common/shared/components/Input/Textarea.vue";

const { t } = useI18n();
const rules = createVendorValidation(t);
const props = defineProps<{
  vendor?: VendorInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", data: { name: string; contact_info: string }): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  name: "",
  contact_info: "",
});

// Watch for vendor changes
watch(
  () => props.vendor,
  (newVendor) => {
    if (newVendor) {
      formState.name = newVendor.name || "";
      formState.contact_info = newVendor.contact_info || "";
    } else {
      formState.name = "";
      formState.contact_info = "";
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    emit("submit", {
      name: formState.name,
      contact_info: formState.contact_info,
    });
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};

defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
</script>

<template>
  <UiForm ref="formRef" :model="formState" :rules="rules">
    <UiFormItem :label="$t('vendors.form.name')" name="name" required>
      <UiInput
        v-model="formState.name"
        :placeholder="$t('vendors.form.namePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('vendors.form.contactInfo')" name="contact_info" required>
      <UiTextArea
        v-model="formState.contact_info"
        :placeholder="$t('vendors.form.contactInfoPlaceholder')"
        :disabled="loading"
        :rows="4"
      />
    </UiFormItem>
  </UiForm>
</template>
