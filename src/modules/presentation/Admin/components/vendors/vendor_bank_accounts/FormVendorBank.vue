<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { VendorBankAccountInterface } from "@/modules/interfaces/vendors/vendor_bank_accounts/vendor-bank-accounts.interface";
import { createVendorBankAccountValidation } from "@/modules/presentation/Admin/views/vendors/vendor_bank_accounts/validations/vendor-bank-account.validatetion";
import { useVendorStore } from "@/modules/presentation/Admin/stores/vendors/vendor.store";
import { currencyStore } from "@/modules/presentation/Admin/stores/currency.store";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";

const { t } = useI18n();
const vendorStore = useVendorStore();
const currencyStoreInstance = currencyStore();
const { error } = useNotification();

const props = defineProps<{
  bankAccount?: VendorBankAccountInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    data: {
      vendor_id: string;
      currency_id: string;
      bank_name: string;
      account_name: string;
      account_number: string;
      is_selected: boolean;
    }
  ): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  vendor_id: "",
  currency_id: "",
  bank_name: "",
  account_name: "",
  account_number: "",
  is_selected: false,
});

// Loading states
const loadingVendors = ref(false);
const loadingCurrencies = ref(false);
// Options for select inputs
const vendorOptions = ref<{ label: string; value: string }[]>([]);
const currencyOptions = ref<{ label: string; value: string }[]>([]);

// Load initial data
onMounted(async () => {
  try {
    loadingVendors.value = true;
    loadingCurrencies.value = true;
    await Promise.all([loadVendors(), loadCurrencies()]);
  } catch (err) {
    console.error("Failed to load initial data:", err);
    error(t("vendors_bank.error.loadDataFailed"));
  } finally {
    loadingVendors.value = false;
    loadingCurrencies.value = false;
  }
});

// Load vendors
const loadVendors = async () => {
  try {
    const result = await vendorStore.fetchVendors();
    vendorOptions.value = result.data.map((vendor) => ({
      label: vendor.name,
      value: vendor.id,
    }));
  } catch (err) {
    console.error("Failed to load vendors:", err);
    throw err;
  }
};

// Load currencies
const loadCurrencies = async () => {
  try {
    const result = await currencyStoreInstance.fetchCurrencies({
      page: 1,
      limit: 100, // Load all currencies
    });
    currencyOptions.value = result.data.map((currency) => ({
      label: `${currency.getCode()} (${getCurrencySymbol(currency.getCode())})`,
      value: currency.getId() ?? '',
    }));
  } catch (err) {
    console.error("Failed to load currencies:", err);
    throw err;
  }
};

// Helper function to get currency symbols
const getCurrencySymbol = (code: string): string => {
  const symbols: { [key: string]: string } = {
    LAK: "₭",
    USD: "$",
    THB: "฿",
    // Add more currency symbols as needed
  };
  return symbols[code] || code;
};

// Watch for bank account changes
watch(
  () => props.bankAccount,
  (newBankAccount) => {
    if (newBankAccount) {
      Object.assign(formState, {
        vendor_id: newBankAccount.vendor_id,
        currency_id: newBankAccount.currency_id,
        bank_name: newBankAccount.bank_name,
        account_name: newBankAccount.account_name,
        account_number: newBankAccount.account_number,
        is_selected: newBankAccount.is_selected,
      });
    } else {
      Object.assign(formState, {
        vendor_id: "",
        currency_id: "",
        bank_name: "",
        account_name: "",
        account_number: "",
        is_selected: false,
      });
    }
  },
  { immediate: true }
);

// Validation rules
const rules = createVendorBankAccountValidation(t);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    emit("submit", {
      vendor_id: formState.vendor_id,
      currency_id: formState.currency_id,
      bank_name: formState.bank_name,
      account_name: formState.account_name,
      account_number: formState.account_number,
      is_selected: formState.is_selected,
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
    <UiFormItem :label="$t('vendors_bank.form.vendor')" name="vendor_id" required>
      <UiInputSelect
        v-model="formState.vendor_id"
        :options="vendorOptions"
        :placeholder="$t('vendors_bank.form.vendorPlaceholder')"
        :loading="loadingVendors"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('vendors_bank.form.currency')" name="currency_id" required>
      <UiInputSelect
        v-model="formState.currency_id"
        :options="currencyOptions"
        :placeholder="$t('vendors_bank.form.currencyPlaceholder')"
        :loading="loadingCurrencies"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('vendors_bank.form.bankName')" name="bank_name" required>
      <UiInput
        v-model="formState.bank_name"
        :placeholder="$t('vendors_bank.form.bankNamePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('vendors_bank.form.accountName')" name="account_name" required>
      <UiInput
        v-model="formState.account_name"
        :placeholder="$t('vendors_bank.form.accountNamePlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('vendors_bank.form.accountNumber')" name="account_number" required>
      <UiInput
        v-model="formState.account_number"
        :placeholder="$t('vendors_bank.form.accountNumberPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <UiFormItem :label="$t('vendors_bank.form.isSelected')" name="is_selected">
      <a-switch v-model:checked="formState.is_selected" :disabled="loading" />
      <span class="ml-2 text-sm text-gray-500">
        {{
          formState.is_selected
            ? t("vendors_bank.form.isSelectedActive")
            : t("vendors_bank.form.isSelectedInactive")
        }}
      </span>
    </UiFormItem>
  </UiForm>
</template>
