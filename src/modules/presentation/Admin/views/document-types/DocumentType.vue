<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { DoucmentTypeInterface } from "@/modules/interfaces/documenet-type.interface";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import { columns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import DocumentTypeForm from "@/modules/presentation/Admin/components/document-type/FormDocumentType.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";

const { t } = useI18n();
const documentTypeStore = useDocumentTypeStore();
const { success, error, warning } = useNotification();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedDocumentType = ref<DoucmentTypeInterface | null>(null);
const isEditMode = ref<boolean>(false);
const documentTypeFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: documentTypeStore.pagination.page,
  pageSize: documentTypeStore.pagination.limit,
  total: documentTypeStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadDocumentTypes();
});

const loadDocumentTypes = async () => {
  loading.value = true;

  try {
    await documentTypeStore.fetchdocumentType({
      page: documentTypeStore.pagination.page,
      limit: documentTypeStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("documentType.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (
  pagination: TablePaginationType
) => {
  documentTypeStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  })
  loadDocumentTypes();
};

const handleSearch = async () => {
  await documentTypeStore.fetchdocumentType({
    page: 1,
    limit: documentTypeStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    documentTypeStore.setPagination({
      page: 1,
      limit: documentTypeStore.pagination.limit,
      total: documentTypeStore.pagination.total,
    })
    await loadDocumentTypes()
  }
})

// Modal handlers
const showCreateModal = () => {
  selectedDocumentType.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (documentType: DoucmentTypeInterface) => {
  selectedDocumentType.value = { ...documentType };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (documentType: DoucmentTypeInterface) => {
  selectedDocumentType.value = documentType;
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  documentTypeFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: { name: string; code: string }) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedDocumentType.value) {
      await documentTypeStore.updateDocumentType(selectedDocumentType.value.id.toString(), {
        ...formData,
        id: selectedDocumentType.value.id,
      });
      success(t("documentType.success.title"), t("documentType.success.updated"));
    } else {
      await documentTypeStore.createDocumentType(formData);
      success(t("documentType.success.title"), t("documentType.success.created"));
    }

    modalVisible.value = false;
    await loadDocumentTypes();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("documentType.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedDocumentType.value) return;

  try {
    submitLoading.value = true;
    await documentTypeStore.deleteDocument(selectedDocumentType.value.id.toString());
    success(t("documentType.success.title"), t("documentType.success.deleted"));

    deleteModalVisible.value = false;
    await loadDocumentTypes();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("documentType.error.deleteFailed"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div class="document-type-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("documentType.list.title") }}</h1>
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
          {{ t("documentType.list.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Document Types Table -->
    <Table
      :columns="columns(t)"
      :dataSource="documentTypeStore.documentTypes"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >

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

    <!-- Create/Edit Document Type Modal -->
    <UiModal
      :title="isEditMode ? t('documentType.modal.edit') : t('documentType.modal.create')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <DocumentTypeForm
        ref="documentTypeFormRef"
        :document-type="selectedDocumentType"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('documentType.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("documentType.modal.deleteConfirm", { name: selectedDocumentType?.name }) }}</p>
      <p class="text-red-500">{{ $t("documentType.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.document-type-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
