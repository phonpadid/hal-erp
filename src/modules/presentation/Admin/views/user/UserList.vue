<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { UserCreatePayload, UserInterface } from "@/modules/interfaces/user.interface";
import { useUserStore } from "../../stores/user.store";
import { columns } from "./column";
import { useRouter } from "vue-router";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { usePermissions } from "@/modules/shared/utils/usePermissions";
import ResetPasswordForm from "../../components/user/ResetPasswordForm.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UserForm from "../../components/user/UserForm.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";


const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();
const { success, error } = useNotification();
const { hasRole, hasCompanyPermission } = usePermissions();
// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Modal state
const modalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedUser = ref<UserInterface | null>(null);
const isEditMode = ref<boolean>(false);
const resetPasswordModalVisible = ref<boolean>(false);
const resetPasswordFormRef = ref();
const userFormRef = ref();

// check show buttons - Company-admin ไม่สามารถจัดการ user ได้
const canCreateUser = computed(() => {
  return !hasRole("company-admin") && hasCompanyPermission("write-user");
});
const canEditUser = computed(() => {
  return !hasRole("company-admin") && hasCompanyPermission("update-user");
});
const canDeleteUser = computed(() => {
  return !hasRole("company-admin") && hasCompanyPermission("delete-user");
});
const canResetUserPassword = computed(() => {
  return !hasRole("company-admin") && hasCompanyPermission("reset-password-user");
});

// Table pagination
const tablePagination = computed(() => ({
  current: userStore.pagination.page,
  pageSize: userStore.pagination.limit,
  total: userStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadUsers();
});

const loadUsers = async () => {
  loading.value = true;

  try {
    await userStore.fetchUsers({
      page: userStore.pagination.page,
      limit: userStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("user.error.loadFailed"), errorMessage);
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (
  pagination: TablePaginationType
) => {
  userStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total ?? 0,
  })

  loadUsers();
};

const handleSearch = async () => {
  await userStore.fetchUsers({
    page: 1,
    limit: userStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    userStore.setPagination({
      page: 1,
      limit: userStore.pagination.limit,
      total: userStore.pagination.total,
    })
    await loadUsers()
  }
})

const addUser = () => {
  router.push({ name: "UserAdd" });
};
const editUser = (user: UserInterface) => {
  router.push({
    name: "UserEdit",
    params: { id: user.id.toString() }
  });
};

const showDeleteModal = (user: UserInterface) => {
  selectedUser.value = user;
  deleteModalVisible.value = true;
};
const showResetPasswordModal = (user: UserInterface) => {
  selectedUser.value = user;
  resetPasswordModalVisible.value = true;
};

const handleModalOk = () => {
  userFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: UserCreatePayload) => {
  try {
    submitLoading.value = true;

    if (isEditMode.value && selectedUser.value) {
      if (formData.password === "") {
        delete formData.password;
      }
      await userStore.updateUser(selectedUser.value.id.toString(), formData);
      success(t("user.success.title"), t("user.success.updated"));
    } else {
      await userStore.createUser(formData);
      success(t("user.success.title"), t("user.success.created"));
    }

    modalVisible.value = false;
    await loadUsers();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error saving user:", errorMessage);
  } finally {
    submitLoading.value = false;
  }
};

const handleResetPassword = async (data: { old_password: string; new_password: string }) => {
  if (!selectedUser.value) return;

  try {
    submitLoading.value = true;

    await userStore.resetPassword(
      selectedUser.value.id.toString(),
      data.old_password,
      data.new_password
    );
    success(t("user.success.title"), t("user.success.passwordReset"));
    resetPasswordModalVisible.value = false;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("user.error.passwordResetFailed"), errorMessage);
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedUser.value) return;

  try {
    submitLoading.value = true;
    await userStore.deleteUser(selectedUser.value.id.toString());
    success(t("user.success.title"), t("user.success.deleted"));

    deleteModalVisible.value = false;
    await loadUsers();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("user.error.deleteFailed"), errorMessage);
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div class="user-management-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("user.list.title") }}</h1>
      </div>

      <div class="flex gap-2">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('currency.placeholder.search')"
        />
        <UiButton
          v-if="canCreateUser"
          type="primary"
          icon="material-symbols:add"
          @click="addUser"
          colorClass="flex items-center"
        >
          {{ t("user.list.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Users Table -->
    <Table
      :columns="columns(t)"
      :dataSource="userStore.users"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <!-- Status column -->
      <template #status="{ record }">
        <a-tag :color="record.deleted_at ? 'red' : 'green'">
          {{ record.deleted_at ? t("user.status.inactive") : t("user.status.active") }}
        </a-tag>
      </template>

      <!-- Actions column -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center">
          <UiButton
            v-if="canEditUser"
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            shape="circle" 
            @click="editUser(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />
          <UiButton
            v-if="canResetUserPassword"
            type=""
            size="small"
            shape="circle"
            icon="ant-design:key-outlined"
            @click="showResetPasswordModal(record)"
            colorClass="flex items-center justify-center text-blue-500"
            title="ປ່ຽນລະຫັດຜ່ານຜູ້ໃຊ້"
            :disabled="!!record.deleted_at"
          >
          </UiButton>

          <UiButton
            v-if="canDeleteUser"
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

    <!-- Create/Edit User Modal -->
    <UiModal
      :title="isEditMode ? t('user.modal.edit') : t('user.modal.create')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <UserForm
        ref="userFormRef"
        :user="selectedUser"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        @submit="handleFormSubmit"
      />
    </UiModal>
    <UiModal
      :title="'ປ່ຽນລະຫັດຜ່ານຜູ້ໃຊ້'"
      :visible="resetPasswordModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="resetPasswordModalVisible = $event"
      @ok="resetPasswordFormRef?.submitForm()"
      @cancel="resetPasswordModalVisible = false"
      :okText="'ປ່ຽນລະຫັດຜ່ານ'"
      :cancelText="'ຍົກເລີກ'"
    >
      <p class="mb-4">
        ປ່ຽນລະຫັດຜ່ານສຳລັບຜູ້ໃຊ້: <strong>{{ selectedUser?.username || 'N/A' }}</strong>
      </p>
      <ResetPasswordForm
        ref="resetPasswordFormRef"
        :loading="submitLoading"
        @submit="handleResetPassword"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('user.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("user.modal.deleteConfirm", { username: selectedUser?.username }) }}</p>
      <p class="text-red-500">{{ $t("user.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.user-management-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
