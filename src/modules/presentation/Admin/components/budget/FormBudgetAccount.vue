<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { BudgetAccountInterface } from "@/modules/interfaces/budget/budget-account.interface";
import { createBudgetAccountValidation } from "../../views/budget/budget_account/validation/bud-get-account.validation";
import { departmentStore } from "@/modules/presentation/Admin/stores/departments/department.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputSelect from "@/common/shared/components/Input/InputSelect.vue";
import Radio from "@/common/shared/components/Input/Radio.vue";
import { formatPrice, NumberOnly, parsePrice } from "@/modules/shared/utils/format-price";

const { t } = useI18n();
const departmentStoreInstance = departmentStore();
const { error } = useNotification();

const props = defineProps<{
  budgetAccount?: BudgetAccountInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    data: {
      name: string;
      fiscal_year: number;
      allocated_amount: number;
      departmentId: number;
      type: string;
    }
  ): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  code: "",
  name: "",
  fiscal_year: "",
  allocated_amount: undefined as number | undefined,
  departmentId: undefined as string | undefined,
  type: ""
});

// Loading states
const loadingDepartments = ref(false);

// Options for select inputs
const departmentOptions = ref<{ label: string; value: string }[]>([]);
// const fiscalYearOptions = ref<{ label: string; value: string }[]>([]);

// Generate fiscal year options (current year - 2 to current year + 3)
// const generateFiscalYearOptions = () => {
//   const currentYear = new Date().getFullYear();
//   const years = [];

//   for (let year = currentYear - 2; year <= currentYear + 3; year++) {
//     years.push({
//       label: year.toString(),
//       value: year.toString(),
//     });
//   }

//   fiscalYearOptions.value = years;
// };

// Load initial data
onMounted(async () => {
  try {
    loadingDepartments.value = true;
    // generateFiscalYearOptions();
    await loadDepartments();
    formState.departmentId = props.budgetAccount?.department_id !== undefined ? String(props.budgetAccount.department_id) : "";
  } catch (err) {
    console.error("Failed to load initial data:", err);
    error(t("budget_accounts.error.loadDataFailed"));
  } finally {
    loadingDepartments.value = false;
  }
});

// Load departments
const loadDepartments = async () => {
  try {
    await departmentStoreInstance.fetchDepartment({
      page: 1,
      limit: 1000,
    });

    departmentOptions.value = departmentStoreInstance.departments.map((department) => ({
      label: `${department.getCode()} - ${department.getName()}`,
      value: department.getId() || "",
    }));
  } catch (err) {
    console.error("Failed to load departments:", err);
    throw err;
  }
};

// Watch for budget account changes
watch(
  () => props.budgetAccount,
  (newBudgetAccount) => {
    if (newBudgetAccount) {
      Object.assign(formState, {
        code: newBudgetAccount.code || "",
        name: newBudgetAccount.name || "",
        fiscal_year: new Date().getFullYear().toString(),
        allocated_amount: newBudgetAccount.allocated_amount || 0,
        departmentId: newBudgetAccount.departmentId || "",
        type: newBudgetAccount.type || "",
      });
    } else {
      Object.assign(formState, {
        code: "",
        name: "",
        fiscal_year: new Date().getFullYear().toString(),
        allocated_amount: undefined as number | undefined,
        departmentId: "",
        type: ""
      });
    }
  },
  { immediate: true }
);

// Validation rules
const rules = createBudgetAccountValidation(t);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    emit("submit", {
      name: formState.name,
      fiscal_year: parseInt(formState.fiscal_year),
      allocated_amount: formState.allocated_amount ?? 0,
      departmentId: parseInt(formState.departmentId!),
      type: formState.type
    });
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};

defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
const typeOptions = computed(() => [
  { label: t('approval-workflow.expenditure'), value: "expenditure" },
  { label: t('approval-workflow.advance'), value: "advance" },
]);
const formattedPrice = computed<string>({
  get() {
    return formatPrice(formState.allocated_amount);
  },
  set(value: string) {
    formState.allocated_amount = parsePrice(value);
  },
});


</script>

<template>
  <UiForm ref="formRef" :model="formState" :rules="rules">
    <UiFormItem :label="$t('budget_accounts.form.department')" name="departmentId" required>
      <UiInputSelect
        v-model="formState.departmentId"
        :options="departmentOptions"
        :placeholder="$t('budget_accounts.form.departmentPlaceholder')"
        :loading="loadingDepartments"
        :disabled="loading"
      />
    </UiFormItem>
    <UiFormItem :label="$t('budget_accounts.form.name')" name="name" required>
      <UiInput
        v-model="formState.name"
        :placeholder="$t('budget_accounts.form.namePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('budget_accounts.form.fiscalYear')" name="fiscal_year" required>
      <UiInput
        readonly
        v-model="formState.fiscal_year"
        :placeholder="$t('budget_accounts.form.fiscalYearPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem
      :label="$t('budget_accounts.form.allocatedAmount')"
      name="allocated_amount"
      required
      @keypress="NumberOnly"
    >
      <UiInput
        v-model="formattedPrice"
        :placeholder="$t('budget_accounts.form.allocatedAmountPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>
    <UiFormItem
      :label="$t('approval-workflow.field.type')"
      name="type"
      required
    >
    <Radio v-model="formState.type" :options="typeOptions" />
    </UiFormItem>
  </UiForm>
</template>
