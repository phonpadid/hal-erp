<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { CompanyInterface } from "@/modules/interfaces/company.interface";
import { useCompanyStore } from "../../stores/company.store";
import { usePermissions } from "@/modules/shared/utils/usePermissions";
import { useUserStore } from "../../stores/user.store";
import { useCompanyUserStore } from "../../stores/company-user.store";
import ResetPasswordForm from "../../components/user/ResetPasswordForm.vue";
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
const userStore = useUserStore();
const companyUserStore = useCompanyUserStore();
const { success, error, warning } = useNotification();
const {
  canCreateCompany,
  hasPermission
} = usePermissions();

// check show button permission
const canEditCompany = computed(() => hasPermission('update-company'));
const canDeleteCompany = computed(() => hasPermission('delete-company'));
const canManageCompanyUsers = computed(() => hasPermission('read-company-user'));
const canResetCompanyAdminPassword = computed(() => hasPermission('reset-password-company-admin'));

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Delete Modal state
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedCompany = ref<CompanyInterface | null>(null);

// Change Password Modal state
const changePasswordModalVisible = ref<boolean>(false);
const resetPasswordFormRef = ref();
const passwordSubmitLoading = ref(false);
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

// Change password handlers
const showChangePasswordModal = (company: CompanyInterface) => {
  selectedCompany.value = company;
  changePasswordModalVisible.value = true;
};

const hideChangePasswordModal = () => {
  changePasswordModalVisible.value = false;
  selectedCompany.value = null;
};

const handleResetPassword = async (data: { old_password: string; new_password: string }) => {
  if (!selectedCompany.value) return;

  try {
    passwordSubmitLoading.value = true;

   

    await companyUserStore.fetchCompanyUsers({
      page: 1,
      limit: 1000, // Get all users to find admin
      company_id: selectedCompany.value.id,
    });


    // Look for admin user (user with admin role or first user as fallback)
    let adminUserId: string | undefined;

    // Try to find user with admin role first
    const adminUser = companyUserStore.companyUsers.find((companyUser: any) => {
      const user = companyUser.user;
      return user?.roles?.some((role: any) =>
        role.name?.toLowerCase().includes('admin')
      );
    });

    if (adminUser?.user) {
      const userObj = adminUser.user as any;
      adminUserId = userObj.id?.toString();

    } else {
      // Fallback: use the first user
      if (companyUserStore.companyUsers.length > 0) {
        const firstUser = companyUserStore.companyUsers[0].user as any;
        adminUserId = firstUser?.id?.toString();

      }
    }

   

    if (!adminUserId) {
      warning("ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ຜູ້ດູແລຂອງບໍລິສັດ");
      return;
    }

    await userStore.resetPassword(
      adminUserId,
      data.old_password,
      data.new_password
    );

    success("ສຳເລັດ", "ປ່ຽນລະຫັດຜ່ານຜູ້ດູແລຂອງບໍລິສັດສຳເລັດ");
    hideChangePasswordModal();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning("ປ່ຽນລະຫັດຜ່ານລົ້ມເຫລວ", errorMessage);
  } finally {
    passwordSubmitLoading.value = false;
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
            v-if="canResetCompanyAdminPassword"
            icon="ant-design:key-outlined"
            size="small"
            shape="circle"
            @click="showChangePasswordModal(record)"
            colorClass="flex items-center justify-center text-purple-600"
            title="ປ່ຽນລະຫັດຜ່ານຜູ້ດູແລຂອງບໍລິສັດ"
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

    <!-- Change Password Modal -->
    <UiModal
      :title="'ປ່ຽນລະຫັດຜ່ານຜູ້ດູແລຂອງບໍລິສັດ'"
      :visible="changePasswordModalVisible"
      :confirm-loading="passwordSubmitLoading"
      @update:visible="changePasswordModalVisible = $event"
      @ok="resetPasswordFormRef?.submitForm"
      @cancel="hideChangePasswordModal"
      :okText="'ປ່ຽນລະຫັດຜ່ານ'"
      :cancelText="'ຍົກເລີກ'"
    >
      <p class="mb-4">
        ປ່ຽນລະຫັດຜ່ານສຳລັບຜູ້ດູແລຂອງບໍລິສັດ: <strong>{{ selectedCompany?.name || 'N/A' }}</strong>
      </p>
      <ResetPasswordForm
        ref="resetPasswordFormRef"
        :loading="passwordSubmitLoading"
        @submit="handleResetPassword"
      />
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