<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import type { UserInterface } from "@/modules/interfaces/user.interface";
import { useUserStore } from "../../stores/user.store";
import { columns } from "./column";
import { formatDate } from "@/modules/shared/formatdate";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UserForm from "../../components/user/UserForm.vue";

const { t } = useI18n();
const userStore = useUserStore();
const { success, error } = useNotification();
// State
const users = ref<UserInterface[]>([]);
const loading = ref<boolean>(false);
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
const submitLoading = ref<boolean>(false);
const selectedUser = ref<UserInterface | null>(null);
const isEditMode = ref<boolean>(false);
const userFormRef = ref();

// Table pagination
const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadUsers();
});

const loadUsers = async (
  page: number = pagination.current,
  pageSize: number = pagination.pageSize,
  search: string = searchKeyword.value,
  sortBy?: string
) => {
  loading.value = true;

  try {
    const result = await userStore.fetchUsers(
      {
        page,
        limit: pageSize,
        search,
        sortBy,
      },
      true
    );
    users.value = result.data;
    pagination.current = result.page;
    pagination.pageSize = result.limit;
    pagination.total = result.total;
    pagination.totalPages = result.totalPages;
  } catch (err) {
    console.error("Error loading users:", err);
    error(t("user.error.loadFailed"));
  } finally {
    loading.value = false;
  }
};

// (pagination, sorting)
const handleTableChange = (
  paginationInfo: TablePaginationType,
  _filters: Record<string, string[]>,
  sorter: any
) => {
  const page = paginationInfo.current || 1;
  const pageSize = paginationInfo.pageSize || 10;

  pagination.current = page;
  pagination.pageSize = pageSize;

  let sortBy;

  if (sorter && sorter.field) {
    sortBy = sorter.field;
  }
  loadUsers(page, pageSize, searchKeyword.value, sortBy);
};

const handleSearch = () => {
  pagination.current = 1;
  loadUsers(1, pagination.pageSize, searchKeyword.value);
};

// Modal handlers
const showCreateModal = () => {
  selectedUser.value = null;
  isEditMode.value = false;
  modalVisible.value = true;
};

const showEditModal = (user: UserInterface) => {
  selectedUser.value = { ...user };
  isEditMode.value = true;
  modalVisible.value = true;
};

const showDeleteModal = (user: UserInterface) => {
  selectedUser.value = user;
  deleteModalVisible.value = true;
};
const handleModalOk = () => {
  userFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: any) => {
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
  } catch (error: any) {
    console.error("Error saving user:", error);
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
  } catch (err) {
    console.error("Error deleting user:", err);
    error(t("user.error.deleteFailed"));
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
        <UiInput
          v-model="searchKeyword"
          :placeholder="t('user.list.search')"
          allowClear
          @update:modelvalue="handleSearch"
          class="w-64"
        />

        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="flex items-center"
        >
          {{ t("user.list.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Users Table -->
    <Table
      :columns="columns(t)"
      :dataSource="users"
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
    <!-- Create/Edit User Modal -->
    <UiModal
      :title="isEditMode ? t('user.modal.edit') : t('user.modal.create')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <UserForm
        ref="userFormRef"
        :user="selectedUser"
        :is-edit-mode="isEditMode"
        :loading="submitLoading"
        @submit="handleFormSubmit"
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
