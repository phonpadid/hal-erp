<script setup lang="ts">
import { ref, onMounted } from "vue";
import { columns } from "./column";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { userApprovalRulue } from "./validation/user-approval.validate";
import { useNotification } from "@/modules/shared/utils/useNotification";
import {
  approval_workflowItem,
  dataUserApv,
  documentItem,
  statusItem,
} from "@/modules/shared/utils/data-user-approval";
import { userApprovalStore } from "../../stores/user-approval.store";
import type { UserApprovalEntity } from "@/modules/domain/entities/user-approvals/user-approval.entity";
import type { UserApprovalApiModel } from "@/modules/interfaces/user-approvals/user-approval.interface";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
const { t } = useI18n();

// Initialize the unit store
const userApproval = userApprovalStore();
// departments data that will be displayed (from API or mock)
const user_aproval = ref<UserApprovalApiModel[]>([]);
const useRealApi = ref<boolean>(true); // Toggle between mock and real API
const { success, error } = useNotification();
// Form related

const formRef = ref();
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedDpm = ref<UserApprovalApiModel | null>(null);

// Form model
const formModel = userApproval.userApprovalFormModel;
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "padding":
      return "orange";
    case "approved":
      return "green";
    default:
      return "red"; // or any default/fallback color
  }
}

// Load data on component mount
onMounted(async () => {
  await loadDpm();
});

const loadDpm = async (): Promise<void> => {
  if (useRealApi.value) {
    try {
      loading.value = true;
      const result = await userApproval.fetchUserApproval({
        page: userApproval.pagination.page,
        limit: userApproval.pagination.limit,
      });

      user_aproval.value = result.data.map(
        (dpm: UserApprovalEntity): UserApprovalApiModel => {
          return {
            id: Number(dpm.getId()) || 0,
            approval_workflow_id: dpm.getApprovalId() ?? undefined,
            status_id: dpm.getStatusId() ?? undefined,
            document_id: dpm.getDocumentId() ?? undefined,

            approval_workflow_name: dpm.getApprovalName() ?? undefined,
            status_name: dpm.getStatusName() ?? undefined,
            doc_title: dpm.getDocumentName() ?? undefined,

            created_at: dpm.getCreatedAt() ?? undefined,
            updated_at: dpm.getUpdatedAt() ?? undefined,
          };
        }
      );
      console.log("user_aproval data loaded:", user_aproval.value);
    } catch (error) {
      console.error("Failed to fetch user_aproval from API:", error);
      user_aproval.value = [...dataUserApv.value];
    } finally {
      loading.value = false;
    }
  } else {
    user_aproval.value = [...dataUserApv.value];
  }
};

// CRUD operations
const showCreateModal = (): void => {
  formModel.status_id = "";
  formModel.document_id = "";
  formModel.approval_workflow_id = "";
  createModalVisible.value = true;
};

const showEditModal = (record: UserApprovalApiModel): void => {
  selectedDpm.value = record;
  formModel.status_id = "";
  formModel.document_id = "";
  formModel.approval_workflow_id = "";
  editModalVisible.value = true;
};

const showDeleteModal = (record: UserApprovalApiModel): void => {
  selectedDpm.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    await userApproval.createUserApproval({
      document_id: formModel.document_id,
      approval_workflow_id: formModel.approval_workflow_id,
      status_id: formModel.status_id,
    });
    success(t("user_approval.notify.created"));
    await loadDpm(); // Refresh the list
    createModalVisible.value = false;
    formModel.status_id = "";
    formModel.document_id = "";
    formModel.approval_workflow_id = "";
  } catch (error) {
    console.error("Create form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleEdit = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    if (selectedDpm.value) {
      const id = selectedDpm.value.id.toString();
      await userApproval.updateUserApproval(id, {
        id,
        document_id: formModel.document_id,
        approval_workflow_id: formModel.approval_workflow_id,
        status_id: formModel.status_id,
      });
      success(t("user_approval.notify.update"));
      await loadDpm();
    }

    editModalVisible.value = false;
  } catch (error) {
    console.error("Edit form validation failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (): Promise<void> => {
  if (!selectedDpm.value) return;

  loading.value = true;
  try {
    // Use API to delete
    const id = selectedDpm.value.id.toString();
    await userApproval.deleteUserApproval(id);
    success(t("user_approval.notify.delete"));
    await loadDpm(); // Refresh the list
  } catch (error) {
    console.error("Delete failed:", error);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};
const handleTableChange = async (pagination: any) => {
  userApproval.setPagination({
    page: pagination.current,
    limit: pagination.pageSize,
  });
  await loadDpm();
};
</script>

<template>
  <div class="unit-list-container p-6">
    <div class="mb-6 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ $t("user_approval.user_apv.title") }}
      </h1>
      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch :placeholder="t('user_approval.user_apv.placeholder.search')" />
        </div>
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="flex items-center"
        >
          {{ $t("user_approval.user_apv.add") }}
        </UiButton>
      </div>
    </div>

    <!--  Table -->
    <Table
      :columns="columns(t)"
      :dataSource="user_aproval"
      :pagination="{
        current: userApproval.pagination.page,
        pageSize: userApproval.pagination.limit,
        total: userApproval.pagination.total,
      }"
      row-key="id"
      :loading="userApproval.loading"
      @change="handleTableChange"
    >
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ record.status }}
        </a-tag>
      </template>
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            type=""
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400"
          >
          </UiButton>
          <UiButton
            type=""
            danger
            icon="ant-design:delete-outlined"
            colorClass="flex items-center justify-center text-red-700"
            size="small"
            @click="showDeleteModal(record)"
          >
          </UiButton>
        </div>
      </template>
    </Table>

    <!-- Create Modal -->
    <UiModal
      :title="t('user_approval.user_apv.header_form.add')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
      :okText="t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="userApprovalRulue(t)">
        <UiFormItem
          :label="t('user_approval.user_apv.field.document')"
          name="document_id"
          required
        >
          <InputSelect
            v-model="formModel.document_id"
            :options="documentItem"
            :placeholder="t('user_approval.user_apv.placeholder.document')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('user_approval.user_apv.field.status')"
          name="status_id"
          required
        >
          <InputSelect
            v-model="formModel.status_id"
            :options="statusItem"
            :placeholder="t('user_approval.user_apv.placeholder.status')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('user_approval.user_apv.field.apv_workflow')"
          name="approval_workflow_id"
          required
        >
          <InputSelect
            v-model="formModel.approval_workflow_id"
            :options="approval_workflowItem"
            :placeholder="t('user_approval.user_apv.placeholder.apv_workflow')"
          />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('user_approval.user_apv.header_form.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
      :okText="t('button.edit')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="userApprovalRulue(t)">
        <UiFormItem
          :label="t('user_approval.user_apv.field.document')"
          name="document_id"
          required
        >
          <InputSelect
            v-model="formModel.document_id"
            :options="documentItem"
            :placeholder="t('user_approval.user_apv.placeholder.document')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('user_approval.user_apv.field.status')"
          name="status_id"
          required
        >
          <InputSelect
            v-model="formModel.status_id"
            :options="statusItem"
            :placeholder="t('user_approval.user_apv.placeholder.status')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('user_approval.user_apv.field.apv_workflow')"
          name="approval_workflow_id"
          required
        >
          <InputSelect
            v-model="formModel.approval_workflow_id"
            :options="approval_workflowItem"
            :placeholder="t('user_approval.user_apv.placeholder.apv_workflow')"
          />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('user_approval.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      :okText="t('button.ok')"
      :cancelText="t('button.cancel')"
      okType="primary"
    >
      <p>{{ $t("user_approval.alert.message") }}?</p>
      <p class="text-red-500">
        {{ t("user_approval.alert.remark") }}
      </p>
    </UiModal>
  </div>
</template>

<style scoped>
.unit-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
