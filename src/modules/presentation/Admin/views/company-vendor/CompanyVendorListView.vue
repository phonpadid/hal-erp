<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, watch, ref, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { useCompanyVendorStore } from "@/modules/presentation/Admin/stores/company-vendor.store";
import { getColumns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { usePermissions } from "@/modules/shared/utils/usePermissions";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiTag from "@/common/shared/components/tag/UiTag.vue";
import FormCompanyVendor from "@/modules/presentation/Admin/components/company-vendor/FormCompanyVendor.vue";

const { hasPermission } = usePermissions();
const { t } = useI18n();
const companyVendorStore = useCompanyVendorStore();
const { success, warning } = useNotification();
const companyVendorFormRef = ref();

const canCreate = ref(hasPermission("create-company-vendor"));
const canEdit = ref(hasPermission("update-company-vendor"));
const canDelete = ref(hasPermission("delete-company-vendor"));

onMounted(async () => {
  await load();
});

onUnmounted(() => {
  companyVendorStore.resetState();
});

const load = async () => {
  await companyVendorStore.fetchCompanyVendors({
    page: companyVendorStore.pagination.page,
    limit: companyVendorStore.pagination.limit,
    search: companyVendorStore.searchKeyword,
  });
};

const handleTableChange = (pagination: TablePaginationType) => {
  companyVendorStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  });
  load();
};

const handleSearch = async () => {
  await companyVendorStore.fetchCompanyVendors({
    page: 1,
    limit: companyVendorStore.pagination.limit,
    search: companyVendorStore.searchKeyword,
  });
};

watch(
  () => companyVendorStore.searchKeyword,
  async (newVal: string) => {
    if (newVal === "") {
      companyVendorStore.setPagination({
        page: 1,
        limit: companyVendorStore.pagination.limit,
        total: companyVendorStore.pagination.total,
      });
      await load();
    }
  }
);

const handleFormSubmit = async (formData: {
  vendor_id: number | undefined;
  status: string;
  credit_term_days: number;
  credit_limit: number;
  payment_term: string;
  company_id?: number;
}) => {
  try {
    companyVendorStore.submitLoading = true;
    if (companyVendorStore.isEditMode && companyVendorStore.selectedCompanyVendorId) {
      await companyVendorStore.updateCompanyVendor(companyVendorStore.selectedCompanyVendorId, {
        status: formData.status,
        credit_term_days: formData.credit_term_days,
        credit_limit: formData.credit_limit,
        payment_term: formData.payment_term || null,
      });
      success(t("company_vendors.success.title"), t("company_vendors.success.updated"));
    } else {
      await companyVendorStore.assignCompanyVendor({
        vendor_id: formData.vendor_id as number,
        status: formData.status,
        credit_term_days: formData.credit_term_days,
        credit_limit: formData.credit_limit,
        payment_term: formData.payment_term || null,
        company_id: formData.company_id,
      });
      success(t("company_vendors.success.title"), t("company_vendors.success.assigned"));
    }
    companyVendorStore.modalVisible = false;
    await load();
  } catch (err: unknown) {
    warning(t("company_vendors.error.title"), String(err instanceof Error ? err.message : err));
  } finally {
    companyVendorStore.submitLoading = false;
  }
};
</script>

<template>
  <div class="company-vendor-list-container p-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("company_vendors.title") }}</h1>
      </div>
      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="companyVendorStore.searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('company_vendors.placeholder.search')"
        />
        <UiButton
          v-if="canCreate"
          type="primary"
          icon="ant-design:plus-outlined"
          @click="companyVendorStore.showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("company_vendors.add") }}
        </UiButton>
      </div>
    </div>

    <Table
      :columns="getColumns(t)"
      :dataSource="companyVendorStore.mappedCompanyVendors"
      :pagination="companyVendorStore.tablePagination"
      :loading="companyVendorStore.loading"
      row-key="id"
      @change="handleTableChange"
    >
      <template #status="{ record }">
        <UiTag :color="record.status === 'active' ? 'green' : 'red'">
          {{ record.status === "active" ? t("company_vendors.status_option.active") : t("company_vendors.status_option.inactive") }}
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
            @click="companyVendorStore.showEditModal(record)"
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
            @click="companyVendorStore.showDeleteModal(record)"
            :disabled="!!record.deleted_at"
          />
        </div>
      </template>
    </Table>

    <UiModal
      :title="companyVendorStore.isEditMode ? t('company_vendors.header_form.edit') : t('company_vendors.header_form.add')"
      :visible="companyVendorStore.modalVisible"
      :confirm-loading="companyVendorStore.submitLoading"
      @update:visible="companyVendorStore.modalVisible = $event"
      @ok="companyVendorStore.handleModalOk(companyVendorFormRef)"
      @cancel="companyVendorStore.handleModalCancel"
      :okText="companyVendorStore.isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <FormCompanyVendor
        ref="companyVendorFormRef"
        :loading="companyVendorStore.submitLoading"
        :isEdit="companyVendorStore.isEditMode"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <UiModal
      :title="t('company_vendors.header_form.delete.title')"
      :visible="companyVendorStore.deleteModalVisible"
      :confirm-loading="companyVendorStore.submitLoading"
      @update:visible="companyVendorStore.deleteModalVisible = $event"
      @ok="companyVendorStore.handleDeleteConfirm"
      @cancel="companyVendorStore.deleteModalVisible = false"
      ok-text="ຢືนຢັน"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ t("company_vendors.header_form.delete.content") }}</p>
      <p class="text-red-500">{{ t("company_vendors.header_form.delete.description") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.company-vendor-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
