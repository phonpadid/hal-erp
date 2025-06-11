<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { BudgetItemDetailsInterface } from "@/modules/interfaces/budget/budget-item-details.interface";
import { createBudgetItemDetailsValidation } from "@/modules/presentation/Admin/views/budget/budget_item_details/validations/budget-item-details.validation";
import { useProvinceStore } from "@/modules/presentation/Admin/stores/province.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiTextArea from "@/common/shared/components/Input/Textarea.vue";

const { t } = useI18n();
const provinceStore = useProvinceStore();
const { error } = useNotification();

const props = defineProps<{
  budgetItemDetails?: BudgetItemDetailsInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    data: {
      name: string;
      provinceId: number;
      description: string;
      allocated_amount: number;
    }
  ): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  name: "",
  provinceId: "", // Changed from province_id to provinceId
  description: "",
  allocated_amount: "",
});

// Loading state for provinces
const loadingProvinces = ref(false);

// Options for select inputs
const provinceOptions = ref<{ label: string; value: string }[]>([]);

// Load initial data
onMounted(async () => {
  try {
    loadingProvinces.value = true;
    await loadProvinces();
  } catch (err) {
    console.error("Failed to load initial data:", err);
    error(t("budget_item_details.error.loadDataFailed"));
  } finally {
    loadingProvinces.value = false;
  }
});

// Load provinces
const loadProvinces = async () => {
  try {
    const result = await provinceStore.fetchProvinces({
      page: 1,
      limit: 100,
    });

    provinceOptions.value = result.data.map((province) => ({
      label: province.name,
      value: province.id.toString(),
    }));
  } catch (err) {
    console.error("Failed to load provinces:", err);
    throw err;
  }
};

// Watch for budget item details changes
watch(
  () => props.budgetItemDetails,
  (newBudgetItemDetails) => {
    if (newBudgetItemDetails) {
      Object.assign(formState, {
        name: newBudgetItemDetails.name || "",
        provinceId: newBudgetItemDetails.province_id || "", // Handle incoming province_id
        description: newBudgetItemDetails.description || "",
        allocated_amount: newBudgetItemDetails.allocated_amount || "",
      });
    } else {
      Object.assign(formState, {
        name: "",
        provinceId: "",
        description: "",
        allocated_amount: "",
      });
    }
  },
  { immediate: true }
);

// Validation rules
const rules = createBudgetItemDetailsValidation(t);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    emit("submit", {
      name: formState.name,
      provinceId: parseInt(formState.provinceId), // Ensure provinceId is a number
      description: formState.description,
      allocated_amount: parseFloat(formState.allocated_amount),
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
    <UiFormItem :label="$t('budget_item_details.form.name')" name="name" required>
      <UiInput
        v-model="formState.name"
        :placeholder="$t('budget_item_details.form.namePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('budget_item_details.form.province')" name="provinceId" required>
      <UiInputSelect
        v-model="formState.provinceId"
        :options="provinceOptions"
        :placeholder="$t('budget_item_details.form.provincePlaceholder')"
        :loading="loadingProvinces"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('budget_item_details.form.description')" name="description">
      <UiTextArea
        v-model="formState.description"
        :placeholder="$t('budget_item_details.form.descriptionPlaceholder')"
        :disabled="loading"
        :rows="4"
      />
    </UiFormItem>

    <UiFormItem
      :label="$t('budget_item_details.form.allocatedAmount')"
      name="allocated_amount"
      required
    >
      <UiInput
        v-model="formState.allocated_amount"
        :placeholder="$t('budget_item_details.form.allocatedAmountPlaceholder')"
        :disabled="loading"
        type="number"
      />
    </UiFormItem>
  </UiForm>
</template>
