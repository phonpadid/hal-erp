<script setup lang="ts" name="FormCompanyVendor.vue">
import { ref, computed, onMounted } from "vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import InputNumber from "@/common/shared/components/Input/InputNumber.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { useI18n } from "vue-i18n";
import { useCompanyVendorStore } from "@/modules/presentation/Admin/stores/company-vendor.store";
import { useVendorStore } from "@/modules/presentation/Admin/stores/vendors/vendor.store";
import { useCompanyStore } from "@/modules/presentation/Admin/stores/company.store";

const { t } = useI18n();
const companyVendorStore = useCompanyVendorStore();
const vendorStore = useVendorStore();
const companyStore = useCompanyStore();

const props = defineProps<{
  loading?: boolean;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    value: {
      vendor_id: number | undefined;
      status: string;
      credit_term_days: number;
      credit_limit: number;
      payment_term: string;
      company_id?: number;
    }
  ): void;
}>();

const formRef = ref();

const vendorOptions = computed(() =>
  vendorStore.vendors.map((v) => ({ label: v.getname(), value: Number(v.getId()) }))
);

const companyOptions = computed(() =>
  companyStore.companies.map((c) => ({ label: c.getName(), value: Number(c.getId()) }))
);

const statusOptions = computed(() => [
  { label: t("company_vendors.status_option.active"), value: "active" },
  { label: t("company_vendors.status_option.inactive"), value: "inactive" },
]);

onMounted(async () => {
  if (vendorStore.vendors.length === 0) {
    await vendorStore.fetchVendors({ page: 1, limit: 1000 });
  }
  if (companyStore.companies.length === 0) {
    await companyStore.fetchCompanies({ page: 1, limit: 1000 });
  }
});

const rules = computed(() => ({
  vendor_id: [{ required: true, message: t("company_vendors.validation.vendorRequired"), trigger: "change" }],
  status: [{ required: true, message: t("company_vendors.validation.statusRequired"), trigger: "change" }],
}));

function submitForm() {
  formRef.value
    ?.validate?.()
    .then(() => {
      const m = companyVendorStore.companyVendorFormModel;
      emit("submit", {
        vendor_id: m.vendor_id,
        status: m.status,
        credit_term_days: Number(m.credit_term_days) || 0,
        credit_limit: Number(m.credit_limit) || 0,
        payment_term: m.payment_term,
        company_id: m.company_id,
      });
    })
    .catch(() => {
      /* validation errors are shown inline */
    });
}

defineExpose({ submitForm });
</script>

<template>
  <UiForm ref="formRef" :model="companyVendorStore.companyVendorFormModel" :rules="rules">
    <!-- Company selector: only admin/super-admin needs it; non-admins are auto-scoped server-side -->
    <UiFormItem :label="t('company_vendors.field.company')" name="company_id">
      <InputSelect
        v-model="companyVendorStore.companyVendorFormModel.company_id"
        :options="companyOptions"
        :placeholder="t('company_vendors.placeholder.company')"
        :disabled="props.isEdit"
      />
    </UiFormItem>

    <UiFormItem :label="t('company_vendors.field.vendor')" name="vendor_id" required>
      <InputSelect
        v-model="companyVendorStore.companyVendorFormModel.vendor_id"
        :options="vendorOptions"
        :placeholder="t('company_vendors.placeholder.vendor')"
        :disabled="props.isEdit"
      />
    </UiFormItem>

    <UiFormItem :label="t('company_vendors.field.credit_term_days')" name="credit_term_days">
      <InputNumber
        v-model="companyVendorStore.companyVendorFormModel.credit_term_days"
        :min="0"
        :placeholder="t('company_vendors.placeholder.credit_term_days')"
        style="width: 100%"
      />
    </UiFormItem>

    <UiFormItem :label="t('company_vendors.field.credit_limit')" name="credit_limit">
      <InputNumber
        v-model="companyVendorStore.companyVendorFormModel.credit_limit"
        :min="0"
        :placeholder="t('company_vendors.placeholder.credit_limit')"
        style="width: 100%"
      />
    </UiFormItem>

    <UiFormItem :label="t('company_vendors.field.payment_term')" name="payment_term">
      <UiInput
        v-model="companyVendorStore.companyVendorFormModel.payment_term"
        :placeholder="t('company_vendors.placeholder.payment_term')"
        :disabled="props.loading"
      />
    </UiFormItem>

    <UiFormItem :label="t('company_vendors.field.status')" name="status" required>
      <InputSelect
        v-model="companyVendorStore.companyVendorFormModel.status"
        :options="statusOptions"
        :placeholder="t('company_vendors.placeholder.status')"
      />
    </UiFormItem>
  </UiForm>
</template>
