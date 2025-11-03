<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { CompanyUserInterface } from "@/modules/interfaces/company-user.interface";
import { useCompanyUserStore } from "../../stores/company-user.store";
import { Columns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { useRouter } from "vue-router";
import { formatDate } from "@/modules/shared/formatdate";

const { t } = useI18n();
const router = useRouter();

const companyUserStore = useCompanyUserStore();
const { success, error, warning } = useNotification();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");

// Delete Modal state
const deleteModalVisible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const selectedCompanyUser = ref<CompanyUserInterface | null>(null);

// Table pagination
const tablePagination = computed(() => ({
  current: companyUserStore.pagination.page,
  pageSize: companyUserStore.pagination.limit,
  total: companyUserStore.pagination.total,
  showSizeChanger: true,
}));

onMounted(async () => {
  await loadCompanyUsers();
});

const loadCompanyUsers = async () => {
  loading.value = true;

  try {
    await companyUserStore.fetchCompanyUsers({
      page: companyUserStore.pagination.page,
      limit: companyUserStore.pagination.limit,
      search: searchKeyword.value,
    });

    // Debug: Log the loaded data
    console.log("Company users loaded:", companyUserStore.companyUsers);
    console.log("Store state:", {
      users: companyUserStore.companyUsers,
      pagination: companyUserStore.pagination
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("company-user.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

// Handle pagination and sorting
const handleTableChange = (
  pagination: TablePaginationType
) => {
  companyUserStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  })
  loadCompanyUsers();
};

const handleSearch = async () => {
  await companyUserStore.fetchCompanyUsers({
    page: 1,
    limit: companyUserStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async(newVal: string) => {
  if(newVal === '') {
    companyUserStore.setPagination({
      page: 1,
      limit: companyUserStore.pagination.limit,
      total: companyUserStore.pagination.total,
    })
    await loadCompanyUsers()
  }
})

// Navigation handlers
const showCreatePage = () => {
  router.push('/companies/users/create');
};

const showEditPage = (companyUser: CompanyUserInterface) => {
  router.push(`/companies/users/edit/${companyUser.id}`);
};

const showDeleteModal = (companyUser: CompanyUserInterface) => {
  selectedCompanyUser.value = companyUser;
  deleteModalVisible.value = true;
};

const handleDeleteConfirm = async () => {
  if (!selectedCompanyUser.value) return;

  try {
    submitLoading.value = true;
    await companyUserStore.deleteCompanyUser(selectedCompanyUser.value.id);
    success(t("company-user.success.title"), t("company-user.success.deleted"));

    deleteModalVisible.value = false;
    await loadCompanyUsers();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("company-user.error.deleteFailed"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const openSignature = (signatureUrl: string) => {
  window.open(signatureUrl, '_blank');
};
</script>

<template>
  <div class="company-user-container p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">
          {{ t("company-user.title") }}
        </h1>
        <p class="text-gray-600">{{ t("company-user.description") }}</p>
      </div>

      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('company-user.placeholder.search')"
        />
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreatePage"
          colorClass="text-white flex items-center"
        >
          {{ t("company-user.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Company Users Table -->
    <Table
      :columns="Columns(t)"
      :dataSource="companyUserStore.companyUsers"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <!-- Username column -->
      <template #username="{ record }">
        <span>{{ record.user?.username }}</span>
      </template>

      <!-- Email column -->
      <template #email="{ record }">
        <span>{{ record.user?.email }}</span>
      </template>

      <!-- Tel column -->
      <template #tel="{ record }">
        <span>{{ record.user?.tel }}</span>
      </template>

      <!-- Roles column -->
      <template #roles="{ record }">
        <div>
          <span v-if="!record.user?.roles || record.user?.roles.length === 0">-</span>
          <span v-else>
            {{ record.user?.roles.map((role: any) => role.name).join(", ") }}
          </span>
        </div>
      </template>

      <!-- Permissions column -->
      <!-- <template #permissions="{ record }">
        <div>
          <span v-if="!record.user?.permissions || record.user.permissions.length === 0">-</span>
          <span v-else>
            {{ record.user.permissions.length }} {{ t("company-user.field.permissions") }}
          </span>
        </div>
      </template> -->

      <!-- Signature column -->
      <template #signature_url="{ record }">
        <div>
          <span v-if="!record.user?.user_signature?.signature_url">-</span>
          <img
            v-else
            :src="record.user.user_signature.signature_url"
            alt="signature"
            style="
              width: 40px;
              height: 40px;
              object-fit: cover;
              border-radius: 4px;
              cursor: pointer;
            "
            @click="openSignature(record.user.user_signature.signature_url)"
          />
        </div>
      </template>

      <!-- Created column -->
      <template #created_at="{ record }">
        <span v-if="!record.created_at">-</span>
        <span v-else>
          {{ formatDate(record.created_at) }}
        </span>
      </template>
      <!-- Actions column -->
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            shape="circle"
            size="small"
            @click="showEditPage(record)"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="!!record.deleted_at"
          />

          <UiButton
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
      :title="t('company-user.modal.delete')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ $t("company-user.modal.deleteConfirm", { name: selectedCompanyUser?.username }) }}</p>
      <p class="text-red-500">{{ $t("company-user.modal.deleteWarning") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.company-user-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>