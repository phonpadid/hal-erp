<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { columns } from "./column";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table, { type TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { useRouter } from "vue-router";
import { departmenUsertStore } from "../../../stores/departments/department-user.store";
import type { DepartmentUserApiModel } from "@/modules/interfaces/departments/department-user.interface";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { usePermissions } from "@/modules/shared/utils/usePermissions";
import { useUserStore } from "../../../stores/user.store";
import ResetPasswordForm from "../../../components/user/ResetPasswordForm.vue";

const { warning, success } = useNotification();
const { t } = useI18n();
const dpmUserStore = departmenUsertStore();
const userStore = useUserStore();
const search = ref<string>("");

// Change password modal state
const changePasswordModalVisible = ref<boolean>(false);
const resetPasswordFormRef = ref();
const passwordSubmitLoading = ref(false);
const selectedUser = ref<DepartmentUserApiModel | null>(null);

const { hasPermission, isSuperAdmin, isAdmin } = usePermissions();
// check show or hide buttons based on permissions
// Super-admin and admin can only view (no edit buttons)
// Company-admin can create, edit, and delete
const canCreate = hasPermission("write-department-user") && !isSuperAdmin.value && !isAdmin.value;
const canEdit = hasPermission("update-department-user") && !isSuperAdmin.value && !isAdmin.value;
const canDelete = hasPermission("delete-department-user") && !isSuperAdmin.value && !isAdmin.value;
const canResetPassword = hasPermission("reset-password-user") && !isSuperAdmin.value && !isAdmin.value;

// Form related
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedDpm = ref<DepartmentUserApiModel | null>(null);
// Load data on component mount
onMounted(async () => {
  await departmentUser();
});

const departmentUser = async (): Promise<void> => {
  try {
      loading.value = true;
      dpmUserStore.fetchDepartmentUser({
        page: dpmUserStore.pagination.page,
        limit: dpmUserStore.pagination.limit,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      warning(t("departments.error.title"), String(errorMessage));
    } finally {
      loading.value = false;
    }
};

//search
const handleSearch = async () => {
  try {
    loading.value = true;
    await dpmUserStore.fetchDepartmentUser({
      page: dpmUserStore.pagination.page,
      limit: dpmUserStore.pagination.limit,
      search: search.value,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warning(t("departments.error.title"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async (pagination: TablePaginationType) => {
  dpmUserStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total ?? 0,
  });
  await departmentUser();
};
const router = useRouter();
// CRUD operations
const creation = (): void => {
  router.push({ name: "add_department_user.index" });
};

const update = (record: DepartmentUserApiModel): void => {
  router.push({
    name: "edit_department_user.index",
    params: { id: record.id },
  });
};

const showDeleteModal = (record: DepartmentUserApiModel): void => {
  selectedDpm.value = record;
  deleteModalVisible.value = true;
};

const handleDelete = async (): Promise<void> => {
  if (!selectedDpm.value) return;

  loading.value = true;
  try {
    // Use API to delete
    const id = selectedDpm.value.id ?? "";
    await dpmUserStore.deleteDepartmentUser(id);

    await departmentUser(); // Refresh the list
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warning(t("departments.error.title"), String(errorMessage));
  } finally {
    deleteModalVisible.value = false;
    loading.value = false;
  }
};

// Change password handlers
const showChangePasswordModal = (record: DepartmentUserApiModel) => {
  selectedUser.value = record;
  changePasswordModalVisible.value = true;
};

const hideChangePasswordModal = () => {
  changePasswordModalVisible.value = false;
  selectedUser.value = null;
};

const handleResetPassword = async (data: { old_password: string; new_password: string }) => {
  if (!selectedUser.value?.user?.id) {
    warning("ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້");
    return;
  }

  try {
    passwordSubmitLoading.value = true;

    await userStore.resetPassword(
      selectedUser.value.user.id.toString(),
      data.old_password,
      data.new_password
    );

    success("ສຳເລັດ", "ປ່ຽນລະຫັດຜ່ານສຳເລັດ");
    hideChangePasswordModal();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning("ປ່ຽນລະຫັດຜ່ານລົ້ມເຫລວ", errorMessage);
  } finally {
    passwordSubmitLoading.value = false;
  }
};
watch(search, async(load) => {
  if(load === '') {
    await departmentUser()
  }
})
</script>

<template>
  <div class="list-container p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold">
        {{ $t("departments.dpm_user.title") }}
      </h1>
      <div class="flex items-center justify-between">
        <div class="w-[20rem]">
          <InputSearch
            v-model="search"
            @keyup.enter="handleSearch"
            :placeholder="t('departments.dpm_user.placeholder.search')"
          />
        </div>
        <UiButton
          v-if="canCreate"  
          type="primary"
          icon="ant-design:plus-outlined"
          @click="creation"
          colorClass="flex items-center"
        >
          {{ $t("departments.dpm.add") }}
        </UiButton>
      </div>
      <div class="mt-4 text-slate-700 space-y-2">
        <!-- <span
          :loading="dpmUserStore.loading"
          class="block text-lg font-semibold"
          v-if="dpmUserStore.departmentUser.length > 0 && dpmUserStore.departmentUser[0].department.name"
        >
          {{ dpmUserStore.departmentUser[0].department?.name }}
        </span> -->
      </div>
    </div>

    <!-- Table -->
    <Table
      :columns="columns(t)"
      :dataSource="dpmUserStore.departmentUser"
      :pagination="{
        current: dpmUserStore.pagination.page,
        pageSize: dpmUserStore.pagination.limit,
        total: dpmUserStore.pagination.total,
      }"
      @change="handleTableChange"
      row-key="id"
      :loading="dpmUserStore.loading"
    >
      <!-- Named slot: signature_file -->
      <template #signature_file="{ record }">
        <a-image :src="record.signature_file_url" :width="60" />
      </template>

      <!-- Named slot: actions -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            v-if="canEdit"
            icon="ant-design:edit-outlined"
            size="small"
            shape="circle"
            @click="update(record)"
            colorClass="flex items-center justify-center text-orange-400"
          />
          <UiButton
            v-if="canResetPassword"
            icon="ant-design:key-outlined"
            size="small"
            shape="circle"
            @click="showChangePasswordModal(record)"
            colorClass="flex items-center justify-center text-blue-600"
            title="ປ່ຽນລະຫັດຜ່ານ"
          />
          <UiButton
            v-if="canDelete"
            icon="ant-design:delete-outlined"
            size="small"
            shape="circle"
            danger
            @click="showDeleteModal(record)"
            colorClass="flex items-center justify-center text-red-700"
          />
        </div>
      </template>
    </Table>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('departments.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      okType="primary"
      :okText="t('button.ok')"
      :cancel-text="t('button.cancel')"
    >
      <p>
        {{ t("departments.alert.message") }}: "{{
          selectedDpm?.user?.username
        }}"?
      </p>
      <p class="text-red-500">
        {{ t("departments.alert.remark") }}
      </p>
    </UiModal>

    <!-- Change Password Modal -->
    <UiModal
      :title="'ປ່ຽນລະຫັດຜ່ານຜູ້ໃຊ້'"
      :visible="changePasswordModalVisible"
      :confirm-loading="passwordSubmitLoading"
      @update:visible="changePasswordModalVisible = $event"
      @ok="resetPasswordFormRef?.submitForm"
      @cancel="hideChangePasswordModal"
      :okText="'ປ່ຽນລະຫັດຜ່ານ'"
      :cancelText="'ຍົກເລີກ'"
    >
      <p class="mb-4">
        ປ່ຽນລະຫັດຜ່ານສຳລັບຜູ້ໃຊ້: <strong>{{ selectedUser?.user?.username || 'N/A' }}</strong>
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
/* @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao&display=swap"); */
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
