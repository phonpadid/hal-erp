<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import type { BankApiModel } from "@/modules/interfaces/bank.interface";
import { useBankStore } from "@/modules/presentation/Admin/stores/bank.store";
import { Bank } from "@/modules/domain/entities/bank.entity";
import { getColumns } from "./column";
import { rules } from "./validation/bank.validate";
import { useNotification } from "@/modules/shared/utils/useNotification";
import Table, { type TablePaginationType } from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";

const { success } = useNotification();
const search = ref<string>("");
const { t } = useI18n();
const columns = computed(() => getColumns(t));
const bankStore = useBankStore();
const banks = ref<BankApiModel[]>([]);
const formRef = ref();
const createModalVisible = ref(false);
const editModalVisible = ref(false);
const deleteModalVisible = ref(false);
const loading = ref(false);
const selectedBank = ref<BankApiModel | null>(null);
const formModel = reactive({
  name: "",
  short_name: "",
  logo: "",
});

const showLogoModal = ref(false);
const logoPreview = ref<string>("");

const handleLogoUpload = (file: File, previewUrl: string) => {
  formModel.logo = previewUrl;
  logoPreview.value = previewUrl;
};

const pageSizeOptions = ["10", "20", "50", "100"];

onMounted(async () => {
  await loadBanks();
});

watch(search, async (newValue) => {
  if (!newValue) {
    await loadBanks();
  }
});

const loadBanks = async (): Promise<void> => {
  loading.value = true;
  try {
    const result = await bankStore.fetchBanks({
      page: bankStore.pagination.page,
      limit: bankStore.pagination.limit,
      search: search.value || undefined,
    });
    banks.value = result.data.map((bank: Bank) => ({
      id: bank.getId(),
      name: bank.getName(),
      short_name: bank.getShortName(),
      logo: bank.getLogo(),
      created_at: bank.getCreatedAt(),
      updated_at: bank.getUpdatedAt(),
      deleted_at: bank.getDeletedAt() ?? null,
    }));
    bankStore.setPagination({
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (error) {
    console.error("Failed to load banks:", error);
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async (pagination: TablePaginationType) => {
  bankStore.setPagination({
    page: pagination.current ?? 1,
    limit: pagination.pageSize ?? 10,
    total: pagination.total ?? 0,
  });
  await loadBanks();
};

const showCreateModal = (): void => {
  formModel.name = "";
  formModel.short_name = "";
  formModel.logo = "";
  createModalVisible.value = true;
};

const showEditModal = (record: BankApiModel): void => {
  selectedBank.value = record;
  formModel.name = record.name;
  formModel.short_name = record.short_name;
  formModel.logo = record.logo ?? "";
  editModalVisible.value = true;
};

const showDeleteModal = (record: BankApiModel): void => {
  selectedBank.value = record;
  deleteModalVisible.value = true;
};

const handleSearch = async () => {
  loading.value = true;
  try {
    const result = await bankStore.fetchBanks({
      page: 1,
      limit: bankStore.pagination.limit,
      search: search.value,
    });
    banks.value = result.data.map((bank: Bank) => ({
      id: bank.getId(),
      name: bank.getName(),
      short_name: bank.getShortName(),
      logo: bank.getLogo(),
      created_at: bank.getCreatedAt(),
      updated_at: bank.getUpdatedAt(),
      deleted_at: bank.getDeletedAt() ?? null,
    }));
    bankStore.setPagination({
      page: 1,
      limit: bankStore.pagination.limit,
      total: result.total ?? 0,
    });
  } catch (error) {
    console.error("Search failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleCreate = async (): Promise<void> => {
  loading.value = true;
  try {
    await formRef.value.submitForm();
    await bankStore.createBank({
      name: formModel.name,
      short_name: formModel.short_name,
      logo: formModel.logo || null,
    });
    success(t("banks.notify.created"));
    await loadBanks();
    createModalVisible.value = false;
    formModel.name = "";
    formModel.short_name = "";
    formModel.logo = "";
  } catch (error) {
    console.error("Create form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleEdit = async (): Promise<void> => {
  loading.value = true;
  try {
    await formRef.value.submitForm();

    if (selectedBank.value) {
      const id = selectedBank.value.id.toString();
      await bankStore.updateBank(id, {
        name: formModel.name,
        short_name: formModel.short_name,
        logo: formModel.logo || null,
      });
      success(t("banks.notify.updated"));
      await loadBanks();
    }
    editModalVisible.value = false;
  } catch (error) {
    console.error("Edit form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (): Promise<void> => {
  if (!selectedBank.value) return;
  loading.value = true;
  try {
    const id = selectedBank.value.id.toString();
    await bankStore.deleteBank(id);
    success(t("banks.notify.deleted"));
    await loadBanks();
    deleteModalVisible.value = false;
  } catch (error) {
    console.error("Delete failed:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="bank-list-container p-6">
    <div class="mb-6 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ t("banks.title") }}
      </h1>
      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch
            v-model:value="search"
            @keyup.enter="handleSearch"
            :placeholder="t('banks.placeholder.search')"
          />
        </div>
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="flex items-center"
        >
          {{ t("banks.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Table -->
    <Table
      :columns="columns"
      :dataSource="banks"
      :pagination="{
        current: bankStore.pagination.page,
        pageSize: bankStore.pagination.limit,
        total: bankStore.pagination.total,
        showSizeChanger: true,
        pageSizeOptions,
      }"
      row-key="id"
      :loading="bankStore.loading"
      @change="handleTableChange"
    >
      <template #actions="{ record }">
        <div class="flex gap-2">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
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

    <!-- Create Modal -->
    <UiModal
      :title="t('banks.header_form.add')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
      :cancelText="t('button.cancel')"
      :okText="t('button.confirm')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem :label="t('banks.field.upload_logo')" name="logo">
          <div class="flex items-center gap-4">
            <img
              v-if="formModel.logo"
              :src="formModel.logo"
              class="w-16 h-16 object-contain border"
            />
            <UiButton @click="showLogoModal = true" icon="ant-design:upload-outlined">
              <!-- {{ t("banks.button.upload_logo") }} -->
            </UiButton>
          </div>
        </UiFormItem>
        <UiFormItem :label="t('banks.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('banks.placeholder.name')" />
        </UiFormItem>
        <UiFormItem :label="t('banks.field.short_name')" name="short_name" required>
          <UiInput
            v-model="formModel.short_name"
            :placeholder="t('banks.placeholder.short_name')"
          />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('banks.header_form.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
      :cancelText="t('button.cancel')"
      :okText="t('button.confirm')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem :label="t('banks.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('banks.placeholder.name')" />
        </UiFormItem>
        <UiFormItem :label="t('banks.field.short_name')" name="short_name" required>
          <UiInput
            v-model="formModel.short_name"
            :placeholder="t('banks.placeholder.short_name')"
          />
        </UiFormItem>
        <UiFormItem :label="t('banks.field.logo')" name="logo">
          <UiInput v-model="formModel.logo" :placeholder="t('banks.placeholder.logo')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('banks.header_form.delete.title')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      :cancelText="t('button.cancel')"
      @cancel="deleteModalVisible = false"
      :okText="t('button.confirm')"
      okType="primary"
    >
      <p>{{ t("banks.header_form.delete.content") }} "{{ selectedBank?.name }}"?</p>
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
