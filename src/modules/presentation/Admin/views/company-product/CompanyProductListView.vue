<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, watch, ref, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { useCompanyProductStore } from "@/modules/presentation/Admin/stores/company-product.store";
import { getColumns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { usePermissions } from "@/modules/shared/utils/usePermissions";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiTag from "@/common/shared/components/tag/UiTag.vue";
import FormCompanyProduct from "@/modules/presentation/Admin/components/company-product/FormCompanyProduct.vue";

const { hasPermission } = usePermissions();
const { t } = useI18n();
const companyProductStore = useCompanyProductStore();
const { success, warning } = useNotification();
const companyProductFormRef = ref();

const canCreate = ref(hasPermission("create-company-product"));
const canEdit = ref(hasPermission("update-company-product"));
const canDelete = ref(hasPermission("delete-company-product"));

onMounted(async () => {
  await load();
});

onUnmounted(() => {
  companyProductStore.resetState();
});

const load = async () => {
  await companyProductStore.fetchCompanyProducts({
    page: companyProductStore.pagination.page,
    limit: companyProductStore.pagination.limit,
    search: companyProductStore.searchKeyword,
  });
};

const handleTableChange = (pagination: TablePaginationType) => {
  companyProductStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  });
  load();
};

const handleSearch = async () => {
  await companyProductStore.fetchCompanyProducts({
    page: 1,
    limit: companyProductStore.pagination.limit,
    search: companyProductStore.searchKeyword,
  });
};

watch(
  () => companyProductStore.searchKeyword,
  async (newVal: string) => {
    if (newVal === "") {
      companyProductStore.setPagination({
        page: 1,
        limit: companyProductStore.pagination.limit,
        total: companyProductStore.pagination.total,
      });
      await load();
    }
  }
);

const handleFormSubmit = async (formData: { product_ids: number[]; status: string; company_id?: number }) => {
  try {
    companyProductStore.submitLoading = true;
    if (companyProductStore.isEditMode && companyProductStore.selectedCompanyProductId) {
      await companyProductStore.updateCompanyProduct(companyProductStore.selectedCompanyProductId, {
        status: formData.status,
      });
      success(t("company_products.success.title"), t("company_products.success.updated"));
    } else {
      const created = await companyProductStore.assignCompanyProducts(formData);
      if (created.length === 0) {
        warning(t("company_products.success.title"), t("company_products.success.all_skipped"));
      } else {
        success(t("company_products.success.title"), t("company_products.success.assigned"));
      }
    }
    companyProductStore.modalVisible = false;
    await load();
  } catch (err: unknown) {
    warning(t("company_products.error.title"), String(err instanceof Error ? err.message : err));
  } finally {
    companyProductStore.submitLoading = false;
  }
};
</script>

<template>
  <div class="company-product-list-container p-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("company_products.title") }}</h1>
      </div>
      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="companyProductStore.searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('company_products.placeholder.search')"
        />
        <UiButton
          v-if="canCreate"
          type="primary"
          icon="ant-design:plus-outlined"
          @click="companyProductStore.showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("company_products.add") }}
        </UiButton>
      </div>
    </div>

    <Table
      :columns="getColumns(t)"
      :dataSource="companyProductStore.mappedCompanyProducts"
      :pagination="companyProductStore.tablePagination"
      :loading="companyProductStore.loading"
      row-key="id"
      @change="handleTableChange"
    >
      <template #status="{ record }">
        <UiTag :color="record.status === 'active' ? 'green' : 'red'">
          {{ record.status === "active" ? t("company_products.status_option.active") : t("company_products.status_option.inactive") }}
        </UiTag>
      </template>
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            v-if="canEdit"
            type=""
            icon="ant-design:edit-outlined"
            shape="circle"
            size="small"
            @click="companyProductStore.showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />
          <UiButton
            v-if="canDelete"
            type=""
            danger
            icon="ant-design:delete-outlined"
            shape="circle"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="companyProductStore.showDeleteModal(record)"
            :disabled="!!record.deleted_at"
          />
        </div>
      </template>
    </Table>

    <UiModal
      :title="companyProductStore.isEditMode ? t('company_products.header_form.edit') : t('company_products.header_form.add')"
      :visible="companyProductStore.modalVisible"
      :confirm-loading="companyProductStore.submitLoading"
      @update:visible="companyProductStore.modalVisible = $event"
      @ok="companyProductStore.handleModalOk(companyProductFormRef)"
      @cancel="companyProductStore.handleModalCancel"
      :okText="companyProductStore.isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <FormCompanyProduct
        ref="companyProductFormRef"
        :loading="companyProductStore.submitLoading"
        :isEdit="companyProductStore.isEditMode"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <UiModal
      :title="t('company_products.header_form.delete.title')"
      :visible="companyProductStore.deleteModalVisible"
      :confirm-loading="companyProductStore.submitLoading"
      @update:visible="companyProductStore.deleteModalVisible = $event"
      @ok="companyProductStore.handleDeleteConfirm"
      @cancel="companyProductStore.deleteModalVisible = false"
      ok-text="ຢືนຢັน"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ t("company_products.header_form.delete.content") }}</p>
      <p class="text-red-500">{{ t("company_products.header_form.delete.description") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.company-product-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
