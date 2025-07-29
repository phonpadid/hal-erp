<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { useBankStore } from "@/modules/presentation/Admin/stores/bank.store";
import { getColumns } from "./column";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import FormBank from "@/modules/presentation/Admin/components/bank/FormBank.vue";

const { t } = useI18n();
const bankStore = useBankStore();
const { success, error, warning } = useNotification();

const loading = ref(false);
const searchKeyword = ref("");
const modalVisible = ref(false);
const deleteModalVisible = ref(false);
const submitLoading = ref(false);

const formModel = reactive<{
  name: string;
  short_name: string;
  logo: string | File | null;
  logoUrl: string | File | null;
}>({ name: "", short_name: "", logo: null, logoUrl: null });
const isEditMode = ref(false);
const bankFormRef = ref();
const selectedBankId = ref<string | null>(null);

const tablePagination = computed(() => ({
  current: bankStore.pagination.page,
  pageSize: bankStore.pagination.limit,
  total: bankStore.pagination.total,
  showSizeChanger: true,
}));

const mappedBanks = computed(() => bankStore.banks);

onMounted(async () => {
  await loadBanks();
});

const loadBanks = async () => {
  loading.value = true;
  try {
    await bankStore.fetchBanks({
      page: bankStore.pagination.page,
      limit: bankStore.pagination.limit,
      search: searchKeyword.value,
    });
  } catch (err: unknown) {
    error(t("banks.error.loadFailed"), String(err instanceof Error ? err.message : err));
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pagination: TablePaginationType) => {
  bankStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  });
  loadBanks();
};

const handleSearch = async () => {
  await bankStore.fetchBanks({
    page: 1,
    limit: bankStore.pagination.limit,
    search: searchKeyword.value,
  });
};

watch(searchKeyword, async (newVal: string) => {
  if (newVal === "") {
    bankStore.setPagination({
      page: 1,
      limit: bankStore.pagination.limit,
      total: bankStore.pagination.total,
    });
    await loadBanks();
  }
});

const showCreateModal = () => {
  formModel.name = "";
  formModel.short_name = "";
  formModel.logo = null;
  isEditMode.value = false;
  selectedBankId.value = null;
  modalVisible.value = true;
};

const showEditModal = (bank: any) => {
  formModel.name = bank.name;
  formModel.short_name = bank.shortName;
  formModel.logo = bank.logo ?? "";
  formModel.logoUrl = bank.logoUrl ?? "";
  isEditMode.value = true;
  selectedBankId.value = bank.id;
  modalVisible.value = true;
};

const showDeleteModal = (bank: any) => {
  selectedBankId.value = bank.id;
  formModel.name = bank.name;
  formModel.short_name = bank.short_name;
  formModel.logo = bank.logo ?? "";
  deleteModalVisible.value = true;
};

const handleModalOk = () => {
  bankFormRef.value?.submitForm();
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleFormSubmit = async (formData: {
  name: string;
  short_name: string;
  logo: string | File | null;
}) => {
  try {
    submitLoading.value = true;
    if (isEditMode.value && selectedBankId.value) {
      await bankStore.updateBank(selectedBankId.value, {
        ...formData,
        id: Number(selectedBankId.value),
      });
      success(t("banks.success.title"), t("banks.success.updated"));
    } else {
      await bankStore.createBank(formData);
      success(t("banks.success.title"), t("banks.success.created"));
    }
    modalVisible.value = false;
    await loadBanks();
  } catch (err: unknown) {
    warning(t("banks.error.title"), String(err instanceof Error ? err.message : err));
  } finally {
    submitLoading.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedBankId.value) return;
  try {
    submitLoading.value = true;
    await bankStore.deleteBank(selectedBankId.value);
    success(t("banks.success.title"), t("banks.success.deleted"));
    deleteModalVisible.value = false;
    await loadBanks();
  } catch (err) {
    warning(t("banks.error.deleteFailed"), String(err instanceof Error ? err.message : err));
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div class="bank-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ t("banks.title") }}</h1>
      </div>
      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <InputSearch
          v-model:value="searchKeyword"
          @keyup.enter="handleSearch"
          :placeholder="t('banks.placeholder.search')"
        />
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="text-white flex items-center"
        >
          {{ t("banks.add") }}
        </UiButton>
      </div>
    </div>

    <Table
      :columns="getColumns(t)"
      :dataSource="mappedBanks"
      :pagination="tablePagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
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
      <template #logo="{ record }">
        <img
          v-if="record.logo"
          :src="record.logoUrl"
          alt="Logo"
          class="w-16 h-16 object-contain border"
        />
        <span v-else>—</span>
      </template>
    </Table>

    <UiModal
      :title="isEditMode ? t('banks.header_form.edit') : t('banks.header_form.add')"
      :visible="modalVisible"
      :confirm-loading="submitLoading"
      @update:visible="modalVisible = $event"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :okText="isEditMode ? t('button.edit') : t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <FormBank
        ref="bankFormRef"
        v-model="formModel"
        :loading="submitLoading"
        :isEdit="isEditMode"
        @submit="handleFormSubmit"
      />
    </UiModal>

    <UiModal
      :title="t('banks.header_form.delete.title')"
      :visible="deleteModalVisible"
      :confirm-loading="submitLoading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ t("banks.header_form.delete.content") }} "{{ formModel.name }}"?</p>
      <p class="text-red-500">{{ t("banks.header_form.delete.description") }}</p>
    </UiModal>
  </div>
</template>

<style scoped>
.bank-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
