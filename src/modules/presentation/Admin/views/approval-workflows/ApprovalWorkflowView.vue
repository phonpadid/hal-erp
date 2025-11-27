<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { columns } from "./column";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
// import { dataDpm } from "@/modules/shared/utils/data.department";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { apvStepRules } from "./validation/approval-workflow.validate";
import { useNotification } from "@/modules/shared/utils/useNotification";
// import { dataApprovalFlow } from "@/modules/shared/utils/approval-flow";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import type { ApprovalWorkflowApiModel } from "@/modules/interfaces/approval-workflow.interface";
import { approvalWorkflowStore } from "../../stores/approval-workflow.store";
import { useRouter } from "vue-router";
import { Modal } from "ant-design-vue";
import { useAuthStore } from "../../stores/authentication/auth.store";
const search = ref<string>("");
const { t } = useI18n();
// const useRealApi = ref<boolean>(true); // Toggle between mock and real API
const { success, error, warning } = useNotification();
// Form related
const formRef = ref();
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedData = ref<ApprovalWorkflowApiModel | null>(null);
const docTypeStore = useDocumentTypeStore();
const store = approvalWorkflowStore();
const { push } = useRouter()
const docTypeItems = computed(() =>
  docTypeStore.documentTypes.map((item) => ({
    value: item.getId(),
    label: item.getname(),
  }))
);
// Form model
const formModel = reactive({
  name: "",
  document_type_id: "",
});
const authStore = useAuthStore();
const isSuperAdmin = computed(() => authStore.isSuperAdmin); // ✅ ดึง getter isSuperAdmin\
const isCompanyAdmin = computed(() => authStore.isCompanyAdmin); // ✅ ดึง getter isSuperAdmin\

const loadData = async (): Promise<void> => {
  // if (useRealApi.value) {
  loading.value = true;
  try {
    await store.fetchApprovalWorkflows({
      page: store.pagination.page,
      limit: store.pagination.limit,
      search: search.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("documentType.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

//search
const handleSearch = async () => {
  await store.fetchApprovalWorkflows({
    page: 1,
    limit: store.pagination.limit,
    search: search.value,
  });
};
// CRUD operations
const showCreateModal = (): void => {
  push({ name: 'create-approval-workflow' })
};

const showEditModal = (record: ApprovalWorkflowApiModel): void => {
  const id = record.document_type?.id ?? ''
  selectedData.value = record;
  formModel.name = record.name;
  formModel.document_type_id = id?.toString();
  editModalVisible.value = true;
};
const info = (id: string) => {
  push({ name: 'approval_workflow_step.index', params: { id: id } })
};

const showDeleteModal = (record: ApprovalWorkflowApiModel): void => {
  selectedData.value = record;
  deleteModalVisible.value = true;
};
const handleEdit = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    if (selectedData.value) {
      const id = selectedData.value.id.toString();
      await store.update(id, {
        id,
        name: formModel.name,
        document_type_id: formModel.document_type_id,
      });
      success(t("departments.notify.update"));
      await loadData();
    }

    editModalVisible.value = false;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("documentType.error.title"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (): Promise<void> => {
  if (!selectedData.value) return;

  loading.value = true;
  try {
    // Use API to delete
    const id = selectedData.value.id.toString();
    await store.remove(id);
    success(t("departments.notify.delete"));
    await loadData(); // Refresh the list
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("documentType.error.title"), String(errorMessage));
  }

  deleteModalVisible.value = false;
  loading.value = false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleTableChange = async (pagination: any) => {
  store.setPagination({
    page: pagination.current || 10,
    limit: pagination.pageSize,
    total: pagination.total,
  });
  await loadData();
};

const tablePagination = computed(() => ({
  current: store.pagination.page,
  pageSize: store.pagination.limit,
  total: store.pagination.total,
  showSizeChanger: true,
}));
watch(search, async (newValue) => {
  if (newValue === '') {
    await loadData()
  }
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const verify = async (record: any) => {
  Modal.confirm({
    title: t("approval-workflow.confirm.title"),
    content:
      record.status === "approved"
        ? t("approval-workflow.confirm.toPending")
        : t("approval-workflow.confirm.toApproved"),
    okText: t("button.confirm"),
    cancelText: t("button.cancel"),
    okType: "primary",
    async onOk() {
      try {
        loading.value = true;
        const payload = {
          status: record.status === "approved" ? "pending" : "approved",
        };
        await store.approvalStatus(record.id, payload);

        success(t("approval-workflow.notify.verifySuccess"));
        await loadData();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        warning(t("approval-workflow.error.verifyFailed"), errorMessage);
      } finally {
        loading.value = false;
      }
    },
  });
};

onMounted(async () => {
  store.setPagination({
    page: 1,
    limit: 10, // or whatever your default page size should be
    total: store.pagination.total,
  });
  await loadData();
  await docTypeStore.fetchdocumentType();
});
</script>

<template>
  <div class="unit-list-container p-6">
    <div class="mb-6 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ $t("approval-workflow.title") }}
      </h1>
      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch v-model:value="search" @keyup.enter="handleSearch"
            :placeholder="t('approval-workflow.placeholder.search')" />
        </div>
        <UiButton type="primary" icon="ant-design:plus-outlined" @click="showCreateModal"
          colorClass="flex items-center">
          {{ $t("approval-workflow.add") }}
        </UiButton>
      </div>
      <div class="total-item mt-4 text-slate-700">
        <a-tag color="red">{{ t("approval-workflow.total") }}: {{ store.pagination.total }}
          {{ t("approval-workflow.item") }}</a-tag>
      </div>
    </div>

    <!--  Table -->
    <Table :columns="columns(t)" :dataSource="store.approval_workflows" :pagination="tablePagination" row-key="id"
      :loading="store.loading" @change="handleTableChange">
      <template #status="{ record }">
        <span class="px-3 py-1 rounded-full text-xs font-medium" :class="{
          'bg-green-100 text-green-700': record.status === 'approved',
          'bg-yellow-100 text-yellow-700': record.status === 'pending',
          'bg-gray-100 text-gray-700': !['approved', 'pending'].includes(record.status),
        }">
          {{
            record.status === 'approved'
              ? t('approval-workflow.status.approved')
              : record.status === 'pending'
                ? t('approval-workflow.status.pending')
                : t('approval-workflow.status.unknown')
          }}
        </span>
      </template>
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <!-- <SettingOutlined /> -->
          <UiButton v-if="isSuperAdmin || isCompanyAdmin" icon="ant-design:safety-outlined" size="small" shape="circle" @click="verify(record)" :colorClass="[
            'flex items-center justify-center',
            record.status === 'approved'
              ? 'text-green-600'
              : record.status === 'pending'
                ? 'text-orange-600'
                : 'text-gray-500'
          ].join(' ')">
          </UiButton>
          <UiButton icon="ant-design:eye-outlined" size="small" shape="circle" @click="info(record.id)"
            colorClass="flex items-center justify-center text-sky-500">
          </UiButton>

          <UiButton icon="ant-design:edit-outlined" size="small" shape="circle" @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400">
          </UiButton>

          <UiButton danger icon="ant-design:delete-outlined" shape="circle"
            colorClass="flex items-center justify-center text-red-700" size="small" @click="showDeleteModal(record)">
          </UiButton>
        </div>
      </template>
    </Table>
    <!-- Edit Modal -->
    <UiModal :title="t('approval-workflow.header_form.edit')" :visible="editModalVisible" :confirm-loading="loading"
      @update:visible="editModalVisible = $event" @ok="handleEdit" @cancel="editModalVisible = false"
      :okText="t('button.edit')" :cancelText="t('button.cancel')">
      <UiForm ref="formRef" :model="formModel" :rules="apvStepRules(t)">
        <UiFormItem :label="t('approval-workflow.field.form_name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('approval-workflow.placeholder.name')" />
        </UiFormItem>
        <UiFormItem :label="t('approval-workflow.field.doc_type')" name="document_type_id" required>
          <InputSelect v-model="formModel.document_type_id" :options="docTypeItems"
            :placeholder="t('approval-workflow.placeholder.doc_type')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal :title="t('departments.alert.confirm')" :visible="deleteModalVisible" :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event" @ok="handleDelete" @cancel="deleteModalVisible = false"
      :okText="t('button.ok')" :cancelText="t('button.cancel')" okType="primary">
      <p>{{ $t("departments.alert.message") }}: "{{ selectedData?.name }}"?</p>
      <p class="text-red-500">
        {{ t("departments.alert.remark") }}
      </p>
    </UiModal>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao&display=swap");

.unit-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.total-item .ant-tag {
  font-family: "Noto Sans Lao", sans-serif;
  font-size: 14px;
}
</style>
