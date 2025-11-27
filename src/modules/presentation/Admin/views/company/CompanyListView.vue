<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { CompanyInterface } from "@/modules/interfaces/company.interface";
import { useCompanyStore } from "../../stores/company.store";
import { usePermissions } from "@/modules/shared/utils/usePermissions";
import { Columns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

const companyStore = useCompanyStore();
const { success, error, warning } = useNotification();
const {
  canCreateCompany,
  hasPermission
} = usePermissions();

// check show button permission
const canEditCompany = computed(() => hasPermission('update-company'));
const canDeleteCompany = computed(() => hasPermission('delete-company'));
const canManageCompanyUsers = computed(() => hasPermission('read-company-user'));

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Delete Modal state
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedCompany = ref<CompanyInterface | null>(null);
// Table pagination
const tablePagination = computed(() => ({
  current: companyStore.pagination.page,
  pageSize: companyStore.pagination.limit,
  total: companyStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  // checkPermissions();
  await loadCompanies();
});

const loadCompanies = async () => {
  loading.value = true;

  try {
    await companyStore.fetchCompanies({
      page: companyStore.pagination.page,
      limit: companyStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("company.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (
  pagination: TablePaginationType
) => {
  companyStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  })
  loadCompanies();
};

const handleSearch = async () => {
  await companyStore.fetchCompanies({
    page: 1,
    limit: companyStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    companyStore.setPagination({
      page: 1,
      limit: companyStore.pagination.limit,
      total: companyStore.pagination.total,
    })
    await loadCompanies()
  }
})

// Navigation handlers
const showCreatePage = () => {
  router.push('/companies/create');
};

const showCompanyUsers = (company: CompanyInterface) => {
  router.push(`/companies/users?company_id=${company.id}`);
};

const showEditPage = (company: CompanyInterface) => {
  router.push(`/companies/edit/${company.id}`);
};

const showDeleteModal = (company: CompanyInterface) => {
  selectedCompany.value = company;
  deleteModalVisible.value = true;
};


const handleDeleteConfirm = async () => {
  if (!selectedCompany.value) return;

  try {
    submitLoading.value = true;
    await companyStore.deleteCompany(selectedCompany.value.id.toString());
    success(t("company.success.title"), t("company.success.deleted"));

    deleteModalVisible.value = false;
    await loadCompanies();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("company.error.deleteFailed"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div class="company-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("company.title") }}</h1>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('company.placeholder.search')"
        />
        <!-- Create Company Button - Only visible to super-admin -->
        <UiButton
          v-if="canCreateCompany"
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreatePage"
          colorClass="text-white flex items-center"
        >
          {{ t("company.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Companies Table -->
    <Table
      :columns="Columns(t)"
      :dataSource="companyStore.companies"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >

      <!-- Logo column -->
      <template #name="{ record }">
        <div class="flex items-center gap-2">
          <img
            v-if="record.logo_url"
            :src="record.logo_url"
            :alt="record.name"
            class="w-8 h-8 object-cover rounded"
          />
          <div
            v-else
            class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500"
          >
            {{ record.name.charAt(0).toUpperCase() }}
          </div>
          <span>{{ record.name }}</span>
        </div>
      </template>

      <!-- Actions column -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            v-if="canManageCompanyUsers"
            type=""
            icon="ant-design:team-outlined"
            shape="circle"
            size="small"
            @click="showCompanyUsers(record)"
            colorClass="flex items-center justify-center text-blue-500"
            title="ຈັດການຜູ້ໃຊ້ບັນຊີ"
          />

          <UiButton
            v-if="canEditCompany"
            type=""
            icon="ant-design:edit-outlined"
            shape="circle"
            size="small"
            @click="showEditPage(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />
          <UiButton
            v-if="canDeleteCompany"
            type=""
            danger
            icon="ant-design:delete-outlined"
            shape="circle"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="showDeleteModal(record)"
          />
        </div>
      </template>
    </Table>

    
    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('company.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("company.modal.deleteConfirm", { name: selectedCompany?.name }) }}</p>
      <p class="text-red-500">{{ $t("company.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.company-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>