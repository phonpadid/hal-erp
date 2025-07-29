<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from "vue";
import type { VatInterface } from "@/modules/interfaces/vat.interface";
import { useI18n } from "vue-i18n";
import { createVatValidation } from "@/modules/presentation/Admin/views/vat/validation/vat.validate.ts";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";

const { t } = useI18n();

const props = defineProps<{
  vat?: VatInterface | null;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: "submit", data: { amount: number }): void;
}>();

const formRef = ref();
const formState = reactive({
  amount: "",
});

watch(
  () => props.vat,
  (newVat) => {
    if (newVat) {
      formState.amount = newVat.amount !== undefined && newVat.amount !== null ? String(newVat.amount) : "";
    } else {
      formState.amount = "";
    }
  },
  { immediate: true }
);

const vatRules = createVatValidation(t, { isEditMode: true });

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    emit("submit", { amount: Number(formState.amount) });
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};

defineExpose({ submitForm });
</script>

<template>
  <UiForm ref="formRef" :model="formState" :rules="vatRules">
    <UiFormItem :label="$t('vats.form.amount')" name="amount" required>
      <UiInput
        v-model="formState.amount"
        type="number"
        :placeholder="$t('vats.form.amountPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>
  </UiForm>
</template>
