<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { VendorVankAccountInterface } from "@/modules/interfaces/vendors/vendor_bank_accounts/vendor-bank-accounts.interface";
import { createVendorBankAccountValidation } from "@/modules/presentation/Admin/views/vendors/vendor_bank_accounts/validations/vendor-bank-account.validatetion";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { useVendorStore } from "@/modules/presentation/Admin/stores/vendors/vendor.store";

const { t } = useI18n();
const vendorStore = useVendorStore();

const props = defineProps<{
  bankAccount?: VendorVankAccountInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", data: {
    vendor_id: string;
    currency_id: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    is_selected: boolean;
  }): void;
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

// Options for select inputs
const vendorOptions = ref<{ label: string; value: string }[]>([]);
const currencyOptions = ref([
  { label: "LAK (₭)", value: "LAK" },
  { label: "USD ($)", value: "USD" },
  { label: "THB (฿)", value: "THB" },
]);

// Load vendors for select options
onMounted(async () => {
  try {
    const result = await vendorStore.fetchVendors();
    vendorOptions.value = result.data.map(vendor => ({
      label: vendor.name,
      value: vendor.id
    }));
  } catch (error) {
    console.error("Failed to load vendors:", error);
  }
});

// Watch for bank account changes
watch(
  () => props.bankAccount,
  (newBankAccount) => {
    if (newBankAccount) {
      formState.vendor_id = newBankAccount.vendor_id;
      formState.currency_id = newBankAccount.currency_id;
      formState.bank_name = newBankAccount.bank_name;
      formState.account_name = newBankAccount.account_name;
      formState.account_number = newBankAccount.account_number;
      formState.is_selected = newBankAccount.is_selected;
    } else {
      formState.vendor_id = "";
      formState.currency_id = "";
      formState.bank_name = "";
      formState.account_name = "";
      formState.account_number = "";
      formState.is_selected = false;
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
        :disabled="loading || isEditMode"
      />
    </UiFormItem>

    <UiFormItem :label="$t('vendors_bank.form.currency')" name="currency_id" required>
      <UiInputSelect
        v-model="formState.currency_id"
        :options="currencyOptions"
        :placeholder="$t('vendors_bank.form.currencyPlaceholder')"
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
      <a-switch
        v-model:checked="formState.is_selected"
        :disabled="loading"
      />
    </UiFormItem>
  </UiForm>
</template>
