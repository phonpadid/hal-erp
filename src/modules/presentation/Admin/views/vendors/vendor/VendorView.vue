<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { VendorInterface } from "@/modules/interfaces/vendors/vendor/vendor.interfacce";
import { columns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useVendorStore } from "@/modules/presentation/Admin/stores/vendors/vendor.store";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import VendorForm from "@/modules/presentation/Admin/components/vendors/vendor/FormVendor.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { watch } from "vue";
import { useRouter } from "vue-router";

const { t } = useI18n();
const vendorStore = useVendorStore();
const { success, error } = useNotification();
const router = useRouter();

// State
const searchKeyword = ref<string>("");
// Modal State
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const selectedVendor = ref<VendorInterface | null>(null);
const isEditMode = ref<boolean>(false);
const vendorFormRef = ref();

// Computed properties
const loading = computed(() => vendorStore.loading);
const tablePagination = computed(() => ({
  current: vendorStore.pagination.page,
  pageSize: vendorStore.pagination.limit,
  total: vendorStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadVendors();
});

const loadVendors = async () => {
  try {
    await vendorStore.fetchVendors({
      page: vendorStore.pagination.page,
      limit: vendorStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("vendors.error.loadFailed"), errorMessage);
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("vendors.error.saveFailed"), errorMessage);
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("vendors.error.deleteFailed"), errorMessage);
  }
};

const handleSearch = async () => {
  await vendorStore.fetchVendors({
    page: 1,
    limit: vendorStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    vendorStore.setPagination({
      page: 1,
      limit: vendorStore.pagination.limit,
      total: vendorStore.pagination.total,
    })
    await loadVendors()
  }
})

const handleTableChange = (
  pagination: TablePaginationType) => {
  vendorStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  })

  loadVendors();
}

const viewDetail = (id: number) => {
 router.push({ name: "vendors.detail", params: { id } });
};
const viewAccDetail = (id: number) => {
 router.push({ name: "vendors.bank.index", params: { id } });
};
</script>

<template>
  <div class="vendor-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("vendors.list.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('currency.placeholder.search')"
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
      <!-- Actions column -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center">
          <UiButton
            type=""
            icon="ant-design:eye-outlined"
            colorClass="flex items-center justify-center text-green-700"
            size="small"
            @click="viewDetail(record.id)"
          />
          <UiButton
            type=""
            icon="ant-design:info-circle-outlined"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="viewAccDetail(record.id)"
          />

          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            shape="circle"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />

          <UiButton
            type=""
            danger
            shape="circle"
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
