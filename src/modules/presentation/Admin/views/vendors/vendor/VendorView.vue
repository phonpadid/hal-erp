<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
/**
 * Vendor List Component
 * @created 2025-05-29 07:19:46
 * @author phonpadid
 */
import { ref, computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import type { VendorInterface } from "@/modules/interfaces/vendors/vendor/vendor.interfacce";
import { columns } from "./column";
import { formatDate } from "@/modules/shared/formatdate";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useVendorStore } from "@/modules/presentation/Admin/stores/vendors/vendor.store";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import VendorForm from "@/modules/presentation/Admin/components/vendors/vendor/FormVendor.vue";

const { t } = useI18n();
const vendorStore = useVendorStore();
const { success, error } = useNotification();

// State
const searchKeyword = ref<string>("");
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
});

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const selectedVendor = ref<VendorInterface | null>(null);
const isEditMode = ref<boolean>(false);
const vendorFormRef = ref();

// Computed properties
const loading = computed(() => vendorStore.loading);
const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadVendors();
});

const loadVendors = async (
  page: number = pagination.current,
  pageSize: number = pagination.pageSize,
  search: string = searchKeyword.value,
  sortBy?: string
) => {
  try {
    const result = await vendorStore.fetchVendors({
      page,
      limit: pageSize,
      search,
      sortBy,
    });

    pagination.current = result.page;
    pagination.pageSize = result.limit;
    pagination.total = result.total;
    pagination.totalPages = result.totalPages;
  } catch (err) {
    console.error("Error loading vendors:", err);
    error(t("vendors.error.loadFailed"));
  }
};

// Modal handlers
const showCreateModal = () => {
  selectedVendor.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (vendor: VendorInterface) => {
  selectedVendor.value = { ...vendor };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (vendor: VendorInterface) => {
  selectedVendor.value = vendor;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  vendorFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: { name: string; contact_info: string }) => {
  try {
    if (isEditMode.value && selectedVendor.value) {
      await vendorStore.updateVendor(selectedVendor.value.id, formData);
      success(t("vendors.success.title"), t("vendors.success.updated"));
    } else {
      await vendorStore.createVendor(formData);
      success(t("vendors.success.title"), t("vendors.success.created"));
    }

    modalVisible.value = false;
    await loadVendors();
  } catch (err) {
    console.error("Error saving vendor:", err);
    error(t("vendors.error.saveFailed"));
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedVendor.value) return;

  try {
    await vendorStore.deleteVendor(selectedVendor.value.id);
    success(t("vendors.success.title"), t("vendors.success.deleted"));
    deleteModalVisible.value = false;
    await loadVendors();
  } catch (err) {
    console.error("Error deleting vendor:", err);
    error(t("vendors.error.deleteFailed"));
  }
};

const handleSearch = () => {
  pagination.current = 1;
  loadVendors(1, pagination.pageSize, searchKeyword.value);
};

const handleTableChange = (
  paginationInfo: TablePaginationType,
  _filters: Record<string, string[]>,
  sorter: any
) => {
  const page = paginationInfo.current || 1;
  const pageSize = paginationInfo.pageSize || 10;

  let sortBy;
  if (sorter && sorter.field) {
    sortBy = `${sorter.field}:${sorter.order === "ascend" ? "asc" : "desc"}`;
  }

  loadVendors(page, pageSize, searchKeyword.value, sortBy);
};
</script>

<template>
  <div class="vendor-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("vendors.list.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <UiInput
          v-model="searchKeyword"
          :placeholder="t('vendors.list.search')"
          allowClear
          @update:modelvalue="handleSearch"
          class="w-64"
        />
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("vendors.list.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Vendors Table -->
    <Table
      :columns="columns(t)"
      :dataSource="vendorStore.activeVendors"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <!-- Date columns -->
      <template #created_at="{ record }">
        {{ formatDate(record.created_at) }}
      </template>

      <template #updated_at="{ record }">
        {{ formatDate(record.updated_at) }}
      </template>

      <!-- Actions column -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />

          <UiButton
            type=""
            danger
            icon="ant-design:delete-outlined"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="showDeleteModal(record)"
          />
        </div>
      </template>
    </Table>

    <!-- Create/Edit Vendor Modal -->
    <UiModal
      :title="isEditMode ? t('vendors.modal.edit') : t('vendors.modal.create')"
      :visible="modalVisible"
      :confirm-loading="loading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <VendorForm
        ref="vendorFormRef"
        :vendor="selectedVendor"
        :is-edit-mode="isEditMode"
        :loading="loading"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('vendors.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("vendors.modal.deleteConfirm", { name: selectedVendor?.name }) }}</p>
      <p class="text-red-500">{{ $t("vendors.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.vendor-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
