<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { VendorInterface } from "@/modules/interfaces/vendors/vendor/vendor.interfacce";
import { createVendorValidation } from "../../../views/vendors/vendor/validations/vendor.validation";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { currencyStore } from "@/modules/presentation/Admin/stores/currency.store";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const { t } = useI18n();
const rules = createVendorValidation(t);
const store = currencyStore();

const props = defineProps<{
  vendor?: VendorInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    data: {
      name: string;
      contact_info: string;
      vendor_bank_account?: {
        currency_id: number;
        bank_name: string;
        account_name: string;
        account_number: string;
      }[];
    }
  ): void;
  (e: "cancel"): void;
}>();

// Modified: Removed validation to allow adding multiple accounts freely
const addBankAccount = () => {
  formState.vendor_bank_account.push({
    currency_id: undefined as unknown as number,
    bank_name: "",
    account_name: "",
    account_number: "",
  });
};

const formRef = ref();
const formState = reactive({
  name: "",
  contact_info: "",
  vendor_bank_account: [] as {
    currency_id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
  }[],
});

const currencyOptions = computed(() =>
  store.currencies.map((currency) => ({
    label: `${currency.getName()} (${currency.getCode()})`,
    value: Number(currency.getId()),
  }))
);

// Remove bank account
const removeBankAccount = (index: number) => {
  formState.vendor_bank_account.splice(index, 1);
};

watch(
  () => props.vendor,
  (newVendor) => {
    if (newVendor) {
      formState.name = newVendor.name || "";
      formState.contact_info = newVendor.contact_info || "";

      if (!props.isEditMode) {
        formState.vendor_bank_account = newVendor.vendor_bank_account || [];
      }
    } else {
      formState.name = "";
      formState.contact_info = "";
      formState.vendor_bank_account = [];
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();

    if (props.isEditMode) {
      emit("submit", {
        name: formState.name,
        contact_info: formState.contact_info,
      });
    } else {
      emit("submit", {
        name: formState.name,
        contact_info: formState.contact_info,
        vendor_bank_account: formState.vendor_bank_account,
      });
    }
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};

defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});

onMounted(async () => {
  await store.fetchCurrencies({ page: 1, limit: 100 });
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
      <UiInput
        v-model="formState.contact_info"
        :placeholder="$t('vendors.form.contactInfoPlaceholder')"
        :disabled="loading"
      />
    </UiFormItem>

    <!-- Bank Accounts Section -->
    <template v-if="!isEditMode">
      <div class="bank-accounts-section mt-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">{{ $t("vendors.form.bankAccounts") }}</h3>
          <UiButton
            type="dashed"
            @click="addBankAccount"
            :disabled="loading"
            icon="ant-design:plus-outlined"
            colorClass="flex items-center "
          >
            <template #icon>
              <PlusOutlined />
            </template>
            {{ $t("vendors.form.addBankAccount") }}
          </UiButton>
        </div>
        <a-divider style="height: 2px; background-color: #b6b09f" />

        <div
          v-for="(bankAccount, index) in formState.vendor_bank_account"
          :key="index"
          class="bank-account-item p-4 mb-4 border rounded-lg relative"
        >
          <div class="top-2 right-2">
            <UiButton type="text" danger @click="removeBankAccount(index)" :disabled="loading">
              <DeleteOutlined />
            </UiButton>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiFormItem
              :label="$t('vendors.form.currency')"
              :name="['vendor_bank_account', String(index), 'currency_id']"
              required
            >
              <UiInputSelect
                v-model:value="bankAccount.currency_id"
                :options="currencyOptions"
                :placeholder="$t('vendors.form.currencyPlaceholder')"
                :disabled="loading"
              />
            </UiFormItem>

            <UiFormItem
              :label="$t('vendors.form.bankName')"
              :name="['vendor_bank_account', String(index), 'bank_name']"
              required
            >
              <UiInput
                v-model="bankAccount.bank_name"
                :placeholder="$t('vendors.form.bankNamePlaceholder')"
                :disabled="loading"
              />
            </UiFormItem>

            <UiFormItem
              :label="$t('vendors.form.accountName')"
              :name="['vendor_bank_account', String(index), 'account_name']"
              required
            >
              <UiInput
                v-model="bankAccount.account_name"
                :placeholder="$t('vendors.form.accountNamePlaceholder')"
                :disabled="loading"
              />
            </UiFormItem>

            <UiFormItem
              :label="$t('vendors.form.accountNumber')"
              :name="['vendor_bank_account', String(index), 'account_number']"
              required
            >
              <UiInput
                v-model="bankAccount.account_number"
                :placeholder="$t('vendors.form.accountNumberPlaceholder')"
                :disabled="loading"
              />
            </UiFormItem>
          </div>
        </div>
      </div>
    </template>
  </UiForm>
</template>

<style scoped>
.bank-accounts-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
}

.bank-account-item {
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.bank-account-item:hover {
  background-color: #f5f5f5;
}
</style>
