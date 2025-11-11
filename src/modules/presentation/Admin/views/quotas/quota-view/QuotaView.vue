<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { columns } from "../column";
import { useQuotaStore } from "@/modules/presentation/Admin/stores/quotas/quota.store";
import { useCompanyStore } from "@/modules/presentation/Admin/stores/company.store";
import { useVendorStore } from "@/modules/presentation/Admin/stores/vendors/vendor.store";
import { useProductStore } from "@/modules/presentation/Admin/stores/product.store";
import type { QuotaApiModel } from "@/modules/interfaces/quotas/quota.interface";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table, { type TablePaginationType } from "@/common/shared/components/table/Table.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import InputNumber from "@/common/shared/components/Input/InputNumber.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { quotaRules } from "../validation/quota.validate";

const { t } = useI18n();
const route = useRoute();
const quotaStore = useQuotaStore();
const companyStore = useCompanyStore();
const vendorStore = useVendorStore();
const productStore = useProductStore();
const { success, error } = useNotification();

// Extract query parameters if they exist
const companyId = ref<number | undefined>(
  route.query.company_id ? Number(route.query.company_id) : undefined
);
const vendorId = ref<number | undefined>(
  route.query.vendor_id ? Number(route.query.vendor_id) : undefined
);
const productId = ref<number | undefined>(
  route.query.product_id ? Number(route.query.product_id) : undefined
);
const year = ref<string>(
  route.query.year ? String(route.query.year) : new Date().getFullYear().toString()
);

// Search state
const search = ref<string>("");

// Form related
const formRef = ref();
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedQuota = ref<QuotaApiModel | null>(null);

// Form model
const formModel = reactive({
  company_id: null as number | null,
  vendor_id: null as number | null,
  product_id: null as number | null,
  qty: null as number | null,
  year: new Date().getFullYear().toString(),
});

// Computed properties
// const loading = computed(() => quotaStore.loading);

const filteredVendors = computed(() => {
  // For now, return all vendors since vendor entity doesn't have company_id
  return vendorStore.vendors || [];
});

const filteredProducts = computed(() => {
  return productStore.activeProducts; // All products are available regardless of vendor
});

const companyOptions = computed(() => {
  return companyStore.companies.map(company => ({
    label: company.getName(),
    value: parseInt(company.getId()),
  }));
});

const vendorOptions = computed(() => {
  return filteredVendors.value.map(vendor => ({
    label: vendor.getname(),
    value: parseInt(vendor.getId()),
  }));
});

const productOptions = computed(() => {
  return filteredProducts.value.map(product => ({
    label: product.getName(),
    value: parseInt(product.getId()),
  }));
});

const tablePagination = computed(() => ({
  current: quotaStore.pagination.page,
  pageSize: quotaStore.pagination.limit,
  total: quotaStore.pagination.total,
  showSizeChanger: true,
}));

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  // Generate year options from 2023 to current year
  for (let year = currentYear; year >= 2023; year--) {
    years.push({
      label: year.toString(),
      value: year.toString(),
    });
  }
  return years;
});

// Load data on component mount
onMounted(async () => {
  await loadQuotas();
  await loadRelatedData();
});

const loadQuotas = async (): Promise<void> => {
  try {
    loading.value = true;
    await quotaStore.fetchQuotas({
      page: quotaStore.pagination.page,
      limit: quotaStore.pagination.limit,
      search: search.value,
      company_id: companyId.value,
      vendor_id: vendorId.value,
      product_id: productId.value,
      year: year.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("quota.error.title"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

const loadRelatedData = async () => {
  try {
    await Promise.all([
      companyStore.fetchCompanies({ page: 1, limit: 1000 }),
      vendorStore.fetchVendors({ page: 1, limit: 1000 }),
      productStore.fetchProducts({ page: 1, limit: 1000 }),
    ]);
  } catch (err: unknown) {
    console.error("Failed to load related data:", err);
  }
};

// Search
const handleSearch = async () => {
  try {
    loading.value = true;
    await quotaStore.fetchQuotas({
      page: 1,
      limit: quotaStore.pagination.limit,
      search: search.value,
      company_id: companyId.value,
      vendor_id: vendorId.value,
      product_id: productId.value,
      year: year.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("quota.error.title"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Watch for search changes
watch(search, async (newValue) => {
  if (newValue === "") {
    await loadQuotas();
  }
});

// Watch for filter changes
watch([companyId, vendorId, productId, year], async () => {
  await loadQuotas();
});

// Watch for company change to reset vendor and product
watch(
  () => formModel.company_id,
  () => {
    formModel.vendor_id = null;
    formModel.product_id = null;
  }
);

// Watch for vendor change to reset product
watch(
  () => formModel.vendor_id,
  () => {
    formModel.product_id = null;
  }
);

// CRUD operations
const showCreateModal = (): void => {
  formModel.company_id = companyId.value || null;
  formModel.vendor_id = vendorId.value || null;
  formModel.product_id = productId.value || null;
  formModel.qty = null;
  formModel.year = new Date().getFullYear().toString();
  createModalVisible.value = true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const showEditModal = async (record: any): Promise<void> => {
  try {
    selectedQuota.value = record;
    formModel.company_id = record.company_id;
    formModel.vendor_id = record.vendor_id;
    formModel.product_id = record.product_id;
    formModel.qty = record.qty;
    formModel.year = record.year;
    editModalVisible.value = true;
  } catch (err) {
    console.error('Error in showEditModal:', err);
    error(t("quota.error.title"), String(err));
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const showDeleteModal = (record: any): void => {
  selectedQuota.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    await quotaStore.createQuota({
      company_id: formModel.company_id!,
      vendor_id: formModel.vendor_id!,
      product_id: formModel.product_id!,
      qty: formModel.qty!,
      year: formModel.year,
    });

    success(t("quota.success.title"), t("quota.success.created"));
    await loadQuotas(); // Refresh the list
    createModalVisible.value = false;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(error);
    error(t("quota.error.title"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

const handleEdit = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    if (selectedQuota.value) {
      const id = selectedQuota.value.id.toString();
      await quotaStore.updateQuota(id, {
        id,
        company_id: formModel.company_id!,
        vendor_id: formModel.vendor_id!,
        product_id: formModel.product_id!,
        qty: formModel.qty!,
        year: formModel.year,
      });

      success(t("quota.success.title"), t("quota.success.updated"));
      await loadQuotas();
    }

    editModalVisible.value = false;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("quota.error.title"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (): Promise<void> => {
  if (!selectedQuota.value) return;

  loading.value = true;
  try {
    const id = selectedQuota.value.id.toString();
    await quotaStore.deleteQuota(id);
    success(t("quota.success.title"), t("quota.success.deleted"));
    await loadQuotas(); // Refresh the list
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("quota.error.title"), String(errorMessage));
  }

  deleteModalVisible.value = false;
  loading.value = false;
};

const handleTableChange = (pagination: TablePaginationType) => {
  quotaStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  });
  loadQuotas();
};

// Helper functions
const getCompanyName = (companyId: number): string => {
  const company = companyStore.companies.find(c => parseInt(c.getId()) === companyId);
  return company ? company.getName() : `Company ${companyId}`;
};

const getVendorName = (vendorId: number): string => {
  const vendor = vendorStore.vendors.find(v => parseInt(v.getId()) === vendorId);
  return vendor ? vendor.getname() : `Vendor ${vendorId}`;
};

const getProductName = (productId: number): string => {
  const product = productStore.activeProducts.find(p => parseInt(p.getId()) === productId);
  return product ? product.getName() : `Product ${productId}`;
};
</script>

<template>
  <div class="list-container p-6">
    <div class="mb-3 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ $t("quota.title") }}
      </h1>

      <!-- Filters Section -->
      <div class="mb-4 p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t("quota.field.company") }}
            </label>
            <InputSelect
              v-model="companyId"
              :options="companyOptions"
              :loading="companyStore.loading"
              :placeholder="t('quota.placeholder.company')"
              allowClear
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t("quota.field.vendor") }}
            </label>
            <InputSelect
              v-model="vendorId"
              :options="vendorOptions"
              :loading="vendorStore.loading"
              :placeholder="t('quota.placeholder.vendor')"
              allowClear
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t("quota.field.year") }}
            </label>
            <InputSelect
              v-model="year"
              :options="yearOptions"
              :placeholder="t('quota.placeholder.year')"
              allowClear
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t("button.search") }}
            </label>
            <InputSearch
              v-model:value="search"
              @keyup.enter="handleSearch"
              :placeholder="t('quota.placeholder.search')"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-between gap-20">
        <div class="total-item text-slate-700">
          <a-tag color="red">
            {{ $t("quota.total", { count: quotaStore.pagination.total }) }}
          </a-tag>
        </div>
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="flex items-center"
        >
          {{ $t("quota.list.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Table -->
    <Table
      :columns="columns(t)"
      :dataSource="quotaStore.activeQuotas.map(quota => ({
        key: quota.getId(),
        id: quota.getId(),
        company_name: getCompanyName(quota.getCompanyId()),
        vendor_name: getVendorName(quota.getVendorId()),
        product_name: getProductName(quota.getProductId()),
        qty: quota.getQty(),
        year: quota.getYear(),
        created_at: new Date(quota.getCreatedAt()).toLocaleDateString(),
        updated_at: new Date(quota.getUpdatedAt()).toLocaleDateString(),
        quota: quota,
      }))"
      :pagination="tablePagination"
      row-key="id"
      :loading="loading"
      @change="handleTableChange"
    >
      <template #qty="{ record }">
        <span class="font-medium">{{ record.qty }}</span>
      </template>

      <template #year="{ record }">
        <span class="text-gray-900">{{ record.year }}</span>
      </template>

      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            shape="circle"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
          >
          </UiButton>
          <UiButton
            type=""
            danger
            shape="circle"
            icon="ant-design:delete-outlined"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="showDeleteModal(record)"
          >
          </UiButton>
        </div>
      </template>
    </Table>

    <!-- Create Modal -->
    <UiModal
      :title="t('quota.modal.create')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
      :okText="t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="quotaRules(t)">
        <UiFormItem :label="t('quota.field.company')" name="company_id" required>
          <InputSelect
            v-model="formModel.company_id"
            :options="companyOptions"
            :loading="companyStore.loading"
            :placeholder="t('quota.placeholder.company')"
            :disabled="!!companyId"
          />
        </UiFormItem>

        <UiFormItem :label="t('quota.field.vendor')" name="vendor_id" required>
          <InputSelect
            v-model="formModel.vendor_id"
            :options="vendorOptions"
            :loading="vendorStore.loading"
            :placeholder="t('quota.placeholder.vendor')"
            :disabled="!formModel.company_id || !!vendorId"
          />
        </UiFormItem>

        <UiFormItem :label="t('quota.field.product')" name="product_id" required>
          <InputSelect
            v-model="formModel.product_id"
            :options="productOptions"
            :loading="productStore.loading"
            :placeholder="t('quota.placeholder.product')"
            :disabled="!!productId"
          />
        </UiFormItem>

        <UiFormItem :label="t('quota.field.quantity')" name="qty" required>
          <InputNumber
            v-model="formModel.qty"
            :placeholder="t('quota.placeholder.quantity')"
            :min="1"
            style="width: 100%"
          />
        </UiFormItem>

        <UiFormItem :label="t('quota.field.year')" name="year" required>
          <UiInput
            v-model="formModel.year"
            :placeholder="t('quota.placeholder.year')"
            :maxlength="4"
          />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('quota.modal.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
      :okText="t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="quotaRules(t)">
        <UiFormItem :label="t('quota.field.company')" name="company_id" required>
          <InputSelect
            v-model="formModel.company_id"
            :options="companyOptions"
            :loading="companyStore.loading"
            :placeholder="t('quota.placeholder.company')"
            disabled
          />
        </UiFormItem>

        <UiFormItem :label="t('quota.field.vendor')" name="vendor_id" required>
          <InputSelect
            v-model="formModel.vendor_id"
            :options="vendorOptions"
            :loading="vendorStore.loading"
            :placeholder="t('quota.placeholder.vendor')"
            disabled
          />
        </UiFormItem>

        <UiFormItem :label="t('quota.field.product')" name="product_id" required>
          <InputSelect
            v-model="formModel.product_id"
            :options="productOptions"
            :loading="productStore.loading"
            :placeholder="t('quota.placeholder.product')"
            disabled
          />
        </UiFormItem>

        <UiFormItem :label="t('quota.field.quantity')" name="qty" required>
          <InputNumber
            v-model="formModel.qty"
            :placeholder="t('quota.placeholder.quantity')"
            :min="1"
            style="width: 100%"
          />
        </UiFormItem>

        <UiFormItem :label="t('quota.field.year')" name="year" required>
          <UiInput
            v-model="formModel.year"
            :placeholder="t('quota.placeholder.year')"
            :maxlength="4"
          />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('quota.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      :okText="t('button.ok')"
      :cancelText="t('button.cancel')"
      okType="primary"
    >
      <p>{{ $t("quota.modal.deleteConfirm", {
        company: getCompanyName(selectedQuota?.company_id || 0),
        vendor: getVendorName(selectedQuota?.vendor_id || 0),
        product: getProductName(selectedQuota?.product_id || 0),
        year: selectedQuota?.year
      }) }}</p>
      <p class="text-red-500">
        {{ $t("quota.modal.deleteWarning") }}
      </p>
    </UiModal>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao&display=swap");
.list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.total-item .ant-tag {
  font-family: "Noto Sans Lao", sans-serif;
  font-size: 14px;
}
</style>
