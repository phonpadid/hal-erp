<script setup lang="ts" name="FormCompanyProduct.vue">
import { ref, computed, onMounted } from "vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { useI18n } from "vue-i18n";
import { useCompanyProductStore } from "@/modules/presentation/Admin/stores/company-product.store";
import { useProductStore } from "@/modules/presentation/Admin/stores/product.store";
import { useCompanyStore } from "@/modules/presentation/Admin/stores/company.store";

const { t } = useI18n();
const companyProductStore = useCompanyProductStore();
const productStore = useProductStore();
const companyStore = useCompanyStore();

const props = defineProps<{
  loading?: boolean;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: { product_ids: number[]; status: string; company_id?: number }): void;
}>();

const formRef = ref();

const productOptions = computed(() =>
  productStore.products.map((p) => ({ label: p.getName(), value: Number(p.getId()) }))
);

const companyOptions = computed(() =>
  companyStore.companies.map((c) => ({ label: c.getName(), value: Number(c.getId()) }))
);

const statusOptions = computed(() => [
  { label: t("company_products.status_option.active"), value: "active" },
  { label: t("company_products.status_option.inactive"), value: "inactive" },
]);

onMounted(async () => {
  if (productStore.products.length === 0) {
    await productStore.fetchProducts({ page: 1, limit: 1000 });
  }
  if (companyStore.companies.length === 0) {
    await companyStore.fetchCompanies({ page: 1, limit: 1000 });
  }
});

const rules = computed(() => ({
  product_ids: [
    {
      required: true,
      type: "array" as const,
      min: 1,
      message: t("company_products.validation.productRequired"),
      trigger: "change",
    },
  ],
  status: [{ required: true, message: t("company_products.validation.statusRequired"), trigger: "change" }],
}));

function submitForm() {
  formRef.value
    ?.validate?.()
    .then(() => {
      emit("submit", {
        product_ids: companyProductStore.companyProductFormModel.product_ids,
        status: companyProductStore.companyProductFormModel.status,
        company_id: companyProductStore.companyProductFormModel.company_id,
      });
    })
    .catch(() => {
      /* validation errors are shown inline */
    });
}

defineExpose({ submitForm });
</script>

<template>
  <UiForm ref="formRef" :model="companyProductStore.companyProductFormModel" :rules="rules">
    <!-- Company selector: only admin/super-admin needs it; non-admins are auto-scoped server-side -->
    <UiFormItem :label="t('company_products.field.company')" name="company_id">
      <InputSelect
        v-model="companyProductStore.companyProductFormModel.company_id"
        :options="companyOptions"
        :placeholder="t('company_products.placeholder.company')"
        :disabled="props.isEdit"
      />
    </UiFormItem>

    <UiFormItem :label="t('company_products.field.product')" name="product_ids" required>
      <a-select
        v-model:value="companyProductStore.companyProductFormModel.product_ids"
        mode="multiple"
        :options="productOptions"
        :placeholder="t('company_products.placeholder.product')"
        :disabled="props.isEdit"
        option-filter-prop="label"
        show-search
        :filter-option="true"
        style="width: 100%"
      />
    </UiFormItem>

    <UiFormItem :label="t('company_products.field.status')" name="status" required>
      <InputSelect
        v-model="companyProductStore.companyProductFormModel.status"
        :options="statusOptions"
        :placeholder="t('company_products.placeholder.status')"
      />
    </UiFormItem>
  </UiForm>
</template>
