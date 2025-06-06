<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { BudgetItemInterface } from "@/modules/interfaces/budget/budget-item.interface";
import { createBudgetItemValidation } from "../../views/budget/budget_item/validation/bud-get-item.validation";
import { useBudgetAccountStore } from "@/modules/presentation/Admin/stores/budget/bud-get-account.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputSelect from "@/common/shared/components/Input/InputSelect.vue";

const { t } = useI18n();
const budgetAccountStore = useBudgetAccountStore();
const { error } = useNotification();

const props = defineProps<{
  budgetItem?: BudgetItemInterface | null;
  isEditMode: boolean;
  loading?: boolean;
  preselectedBudgetAccountId?: string; // ใช้เมื่อต้องการกำหนด budget_account_id ล่วงหน้า
}>();

const emit = defineEmits<{
  (
    e: "submit",
    data: {
      budget_account_id: string;
      name: string;
      allocated_amount: string;
    }
  ): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  budget_account_id: "",
  name: "",
  allocated_amount: "",
});

// Loading states
const loadingBudgetAccounts = ref(false);

// Options for select inputs
const budgetAccountOptions = ref<{ label: string; value: string }[]>([]);

// Load initial data
onMounted(async () => {
  try {
    loadingBudgetAccounts.value = true;
    await loadBudgetAccounts();

    // ตั้งค่า budget_account_id จาก props หากมีการระบุมา
    if (props.preselectedBudgetAccountId && !props.isEditMode) {
      formState.budget_account_id = props.preselectedBudgetAccountId;
    }
  } catch (err) {
    console.error("Failed to load initial data:", err);
    error(t("budget_items.error.loadDataFailed"));
  } finally {
    loadingBudgetAccounts.value = false;
  }
});

// Load budget accounts
const loadBudgetAccounts = async () => {
  try {
    const result = await budgetAccountStore.fetchBudgetAccounts({
      page: 1,
      limit: 100,
    });

    budgetAccountOptions.value = result.data.map((account) => ({
      label: `${account.code} - ${account.name}`,
      value: account.id,
    }));
  } catch (err) {
    console.error("Failed to load budget accounts:", err);
    throw err;
  }
};

// Watch for budget item changes
watch(
  () => props.budgetItem,
  (newBudgetItem) => {
    if (newBudgetItem) {
      Object.assign(formState, {
        budget_account_id: newBudgetItem.budget_account_id || "",
        name: newBudgetItem.name || "",
        allocated_amount: newBudgetItem.allocated_amount || "",
      });
    } else {
      Object.assign(formState, {
        budget_account_id: props.preselectedBudgetAccountId || "",
        name: "",
        allocated_amount: "",
      });
    }
  },
  { immediate: true }
);

// Validation rules
const rules = createBudgetItemValidation(t);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    emit("submit", {
      budget_account_id: formState.budget_account_id,
      name: formState.name,
      allocated_amount: formState.allocated_amount,
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
    <UiFormItem :label="$t('budget_items.form.budgetAccount')" name="budget_account_id" required>
      <UiInputSelect
        v-model="formState.budget_account_id"
        :options="budgetAccountOptions"
        :placeholder="$t('budget_items.form.budgetAccountPlaceholder')"
        :loading="loadingBudgetAccounts"
        :disabled="loading || !!props.preselectedBudgetAccountId"
      />
    </UiFormItem>

    <UiFormItem :label="$t('budget_items.form.name')" name="name" required>
      <UiInput
        v-model="formState.name"
        :placeholder="$t('budget_items.form.namePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('budget_items.form.allocatedAmount')" name="allocated_amount" required>
      <UiInput
        v-model="formState.allocated_amount"
        :placeholder="$t('budget_items.form.allocatedAmountPlaceholder')"
        :disabled="loading"
        type="number"
      />
    </UiFormItem>
  </UiForm>
</template>
