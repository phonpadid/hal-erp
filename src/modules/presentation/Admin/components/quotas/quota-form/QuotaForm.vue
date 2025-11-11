<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCompanyStore } from "@/modules/presentation/Admin/stores/company.store";
import { useProductStore } from "@/modules/presentation/Admin/stores/product.store";
import type { FormInstance } from "ant-design-vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useVendorStore } from "../../../stores/vendors/vendor.store";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quota?: any | null;
  isEditMode?: boolean;
  loading?: boolean;
  companyId?: number;
  vendorId?: number;
  productId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
  loading: false,
});

const emit = defineEmits<{
  submit: [data: {
    company_id: number;
    vendor_id: number;
    product_id: number;
    qty: number;
    year: string;
  }];
  cancel: [];
}>();

const { t } = useI18n();
const companyStore = useCompanyStore();
const vendorStore = useVendorStore();
const productStore = useProductStore();
const { error } = useNotification();

// Form reference
const formRef = ref<FormInstance>();

// Form state
const formData = ref({
  company_id: props.companyId || null as number | null,
  vendor_id: props.vendorId || null as number | null,
  product_id: props.productId || null as number | null,
  qty: null as number | null,
  year: new Date().getFullYear().toString(),
});

// Validation rules
const rules = computed(() => ({
  company_id: [
    { required: true, message: t("quota.validation.companyRequired"), trigger: "change" },
  ],
  vendor_id: [
    { required: true, message: t("quota.validation.vendorRequired"), trigger: "change" },
  ],
  product_id: [
    { required: true, message: t("quota.validation.productRequired"), trigger: "change" },
  ],
  qty: [
    { required: true, message: t("quota.validation.qtyRequired"), trigger: "blur" },
    { type: "number", min: 1, message: t("quota.validation.qtyMin"), trigger: "blur" },
  ],
  year: [
    { required: true, message: t("quota.validation.yearRequired"), trigger: "blur" },
    {
      pattern: /^(19|20)\d{2}$/,
      message: t("quota.validation.yearFormat"),
      trigger: "blur"
    },
  ],
}));

// Computed properties
const filteredVendors = computed(() => {
  if (!formData.value.company_id) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return vendorStore.vendors.filter((vendor: any) => vendor.company_id === formData.value.company_id);
});

const filteredProducts = computed(() => {
  return productStore.activeProducts; // All products are available regardless of vendor
});

// Watch for changes in props
watch(
  () => props.quota,
  (newQuota) => {
    if (newQuota) {
      formData.value = {
        company_id: newQuota.company_id,
        vendor_id: newQuota.vendor_id,
        product_id: newQuota.product_id,
        qty: newQuota.qty,
        year: newQuota.year,
      };
    }
  },
  { immediate: true }
);

// Watch for company change to reset vendor and product
watch(
  () => formData.value.company_id,
  (newCompanyId) => {
    if (newCompanyId !== props.quota?.company_id) {
      formData.value.vendor_id = null;
      formData.value.product_id = null;
    }
  }
);

// Watch for vendor change to reset product
watch(
  () => formData.value.vendor_id,
  (newVendorId) => {
    if (newVendorId !== props.quota?.vendor_id) {
      formData.value.product_id = null;
    }
  }
);

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      // companyStore.getCompanies(),
      vendorStore.fetchVendors({ page: 1, limit: 1000 }),
      productStore.fetchProducts({ page: 1, limit: 1000 }),
    ]);
  } catch (err) {
    console.error("Failed to load form data:", err);
  }
});

// Form methods
const submitForm = async () => {
  try {
    await formRef.value?.validate();

    if (!formData.value.company_id || !formData.value.vendor_id || !formData.value.product_id || !formData.value.qty || !formData.value.year) {
      error(t("quota.error.fillAllFields"), "");
      return;
    }

    emit("submit", {
      company_id: formData.value.company_id,
      vendor_id: formData.value.vendor_id,
      product_id: formData.value.product_id,
      qty: formData.value.qty,
      year: formData.value.year,
    });
  } catch (err) {
    console.error("Form validation failed:", err);
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
  if (props.quota) {
    formData.value = {
      company_id: props.quota.company_id,
      vendor_id: props.quota.vendor_id,
      product_id: props.quota.product_id,
      qty: props.quota.qty,
      year: props.quota.year,
    };
  } else {
    formData.value = {
      company_id: props.companyId || null,
      vendor_id: props.vendorId || null,
      product_id: props.productId || null,
      qty: null,
      year: new Date().getFullYear().toString(),
    };
  }
};

const handleCancel = () => {
  resetForm();
  emit("cancel");
};
</script>

<template>
  <a-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    layout="vertical"
    @finish="submitForm"
  >
    <!-- Company Selection -->
    <a-form-item :label="t('quota.form.company')" name="company_id">
      <a-select
        v-model:value="formData.company_id"
        :placeholder="t('quota.placeholder.selectCompany')"
        :loading="companyStore.loading"
        :disabled="isEditMode || !!companyId"
        show-search
        :filter-option="(input: string, option: any) =>
          option?.label?.toLowerCase().includes(input.toLowerCase())
        "
      >
        <a-select-option
          v-for="company in companyStore.companies"
          :key="company.getId()"
          :value="company.getId()"
          :label="company.getName()"
        >
          {{ company.getName() }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <!-- Vendor Selection -->
    <a-form-item :label="t('quota.form.vendor')" name="vendor_id">
      <a-select
        v-model:value="formData.vendor_id"
        :placeholder="t('quota.placeholder.selectVendor')"
        :loading="vendorStore.loading"
        :disabled="!formData.company_id || isEditMode || !!vendorId"
        show-search
        :filter-option="(input: string, option: any) =>
          option?.label?.toLowerCase().includes(input.toLowerCase())
        "
      >
        <a-select-option
          v-for="vendor in filteredVendors"
          :key="vendor.getId()"
          :value="vendor.getId()"
          :label="vendor.getname()"
        >
          {{ vendor.getname() }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <!-- Product Selection -->
    <a-form-item :label="t('quota.form.product')" name="product_id">
      <a-select
        v-model:value="formData.product_id"
        :placeholder="t('quota.placeholder.selectProduct')"
        :loading="productStore.loading"
        :disabled="isEditMode || !!productId"
        show-search
        :filter-option="(input: string, option: any) =>
          option?.label?.toLowerCase().includes(input.toLowerCase())
        "
      >
        <a-select-option
          v-for="product in filteredProducts"
          :key="product.getId()"
          :value="product.getId()"
          :label="product.getName()"
        >
          {{ product.getName() }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <!-- Quantity -->
    <a-form-item :label="t('quota.form.quantity')" name="qty">
      <a-input-number
        v-model:value="formData.qty"
        :placeholder="t('quota.placeholder.enterQuantity')"
        :min="1"
        style="width: 100%"
      />
    </a-form-item>

    <!-- Year -->
    <a-form-item :label="t('quota.form.year')" name="year">
      <a-input
        v-model:value="formData.year"
        :placeholder="t('quota.placeholder.enterYear')"
        :maxlength="4"
      />
    </a-form-item>

    <!-- Form Actions -->
    <a-form-item class="mb-0">
      <div class="flex justify-end gap-2">
        <a-button @click="handleCancel">
          {{ t("button.cancel") }}
        </a-button>
        <a-button
          type="primary"
          html-type="submit"
          :loading="loading"
        >
          {{ isEditMode ? t("button.update") : t("button.create") }}
        </a-button>
      </div>
    </a-form-item>
  </a-form>
</template>

<style scoped>
.ant-form-item {
  margin-bottom: 16px;
}

.ant-form-item.mb-0 {
  margin-bottom: 0;
}
</style>
