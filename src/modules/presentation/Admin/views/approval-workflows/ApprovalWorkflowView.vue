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
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { apvStepRules } from "./validation/approval-workflow.validate";
import { useNotification } from "@/modules/shared/utils/useNotification";
// import { dataApprovalFlow } from "@/modules/shared/utils/approval-flow";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import type { ApprovalWorkflowApiModel } from "@/modules/interfaces/approval-workflow.interface";
import { approvalWorkflowStore } from "../../stores/approval-workflow.store";
import { useUserStore } from "../../stores/user.store";
import { useRouter } from "vue-router";
import { usePermissions } from "@/modules/shared/utils/usePermissions";

const search = ref<string>("");
const { t } = useI18n();
// const useRealApi = ref<boolean>(true); // Toggle between mock and real API
const { success, error, warning } = useNotification();

const { hasPermission, isSuperAdmin, isAdmin } = usePermissions();

// Form related
const formRef = ref();
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedData = ref<ApprovalWorkflowApiModel | null>(null);
const docTypeStore = useDocumentTypeStore();
const store = approvalWorkflowStore();
const userStore = useUserStore();
const { push } = useRouter()
const docTypeItems = computed(() =>
  docTypeStore.documentTypes.map((item) => ({
    value: item.getId(),
    label: item.getname(),
  }))
);
const userOptions = computed(() =>
  userStore.users.map((user) => ({
    value: Number(user.getId()),
    label: user.getEmail() ? `${user.getUsername()} (${user.getEmail()})` : user.getUsername(),
  }))
);
// Form model
const formModel = reactive({
  name: "",
  document_type_id: "",
});

// Verify confirmation modal state
const verifyModalVisible = ref<boolean>(false);
const verifyTargetRecord = ref<ApprovalWorkflowApiModel | null>(null);

// Send mail modal state
const sendMailModalVisible = ref<boolean>(false);
const sendMailLoading = ref<boolean>(false);
const sendMailFormRef = ref();
const sendMailForm = reactive({
  approver_user_id: undefined as number | undefined,
  description: "" as string,
});
const sendMailTargetId = ref<number | null>(null);
const sendMailRules = computed(() => ({
  approver_user_id: [
    {
      required: true,
      message: t("approval-workflow.send_mail.approver_required"),
      trigger: "change",
    },
  ],
}));

const canCreateStep = hasPermission('create-approval-workflow' )&& !isSuperAdmin.value && !isAdmin.value;
const canEditStep = hasPermission('update-approval-workflow') && !isSuperAdmin.value && !isAdmin.value;
const canViewStep = hasPermission('read-approval-workflow-step') && !isSuperAdmin.value && !isAdmin.value;
const canDeleteStep = hasPermission('delete-approval-workflow') && !isSuperAdmin.value && !isAdmin.value;

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
const openSendMailModal = (record: any) => {
  sendMailTargetId.value = Number(record.id);
  sendMailForm.approver_user_id = undefined;
  sendMailForm.description = "";
  sendMailModalVisible.value = true;
};

const handleSendMail = async (): Promise<void> => {
  if (sendMailTargetId.value == null) return;
  try {
    await sendMailFormRef.value?.submitForm?.();
  } catch {
    return;
  }
  if (!sendMailForm.approver_user_id) return;

  sendMailLoading.value = true;
  try {
    await store.sendApprovalMail(sendMailTargetId.value, {
      approver_user_id: sendMailForm.approver_user_id,
      description: sendMailForm.description,
    });
    success(t("approval-workflow.send_mail.success"));
    sendMailModalVisible.value = false;
    await loadData();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("approval-workflow.send_mail.failed"), errorMessage);
  } finally {
    sendMailLoading.value = false;
  }
};

const verify = (record: ApprovalWorkflowApiModel) => {
  verifyTargetRecord.value = record;
  verifyModalVisible.value = true;
};

const handleVerifyConfirm = async (): Promise<void> => {
  if (!verifyTargetRecord.value) return;
  try {
    loading.value = true;
    const payload = {
      status:
        verifyTargetRecord.value.status === "approved" ? "pending" : "approved",
    };
    await store.approvalStatus(verifyTargetRecord.value.id, payload);
    success(t("approval-workflow.notify.verifySuccess"));
    verifyModalVisible.value = false;
    await loadData();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("approval-workflow.notify.verifyFailed"), errorMessage);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  store.setPagination({
    page: 1,
    limit: 10, // or whatever your default page size should be
    total: store.pagination.total,
  });
  await loadData();
  await docTypeStore.fetchdocumentType();
  await userStore.fetchUsers({ page: 1, limit: 1000 });
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
        <UiButton v-if="canCreateStep" type="primary" icon="ant-design:plus-outlined" @click="showCreateModal"
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
          <UiButton v-if="canEditStep" icon="ant-design:safety-outlined" size="small" shape="circle" @click="verify(record)" :colorClass="[
            'flex items-center justify-center',
            record.status === 'approved'
              ? 'text-green-600'
              : record.status === 'pending'
                ? 'text-orange-600'
                : 'text-gray-500'
          ].join(' ')">
          </UiButton>
          <UiButton
            v-if="canEditStep && record.status === 'pending'"
            icon="ant-design:mail-outlined"
            size="small"
            shape="circle"
            @click="openSendMailModal(record)"
            colorClass="flex items-center justify-center text-blue-500"
            :title="t('approval-workflow.send_mail.button')"
          >
          </UiButton>
          <UiButton v-if="canViewStep" icon="ant-design:eye-outlined" size="small" shape="circle" @click="info(record.id)"
            colorClass="flex items-center justify-center text-sky-500">
          </UiButton>

          <UiButton v-if="canEditStep" icon="ant-design:edit-outlined" size="small" shape="circle" @click="showEditModal(record)"
            colorClass="flex items-center justify-center text-orange-400">
          </UiButton>

          <UiButton v-if="canDeleteStep" danger icon="ant-design:delete-outlined" shape="circle"
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

    <!-- Verify Status Confirmation Modal -->
    <UiModal
      :title="t('approval-workflow.confirm.title')"
      :visible="verifyModalVisible"
      :confirm-loading="loading"
      @update:visible="verifyModalVisible = $event"
      @ok="handleVerifyConfirm"
      @cancel="verifyModalVisible = false"
      :ok-text="t('button.confirm')"
      :cancel-text="t('button.cancel')"
      ok-type="primary"
    >
      <p>
        {{
          verifyTargetRecord?.status === "approved"
            ? t("approval-workflow.confirm.toPending")
            : t("approval-workflow.confirm.toApproved")
        }}
      </p>
    </UiModal>

    <!-- Send Approval Mail Modal -->
    <UiModal
      :title="t('approval-workflow.send_mail.title')"
      :visible="sendMailModalVisible"
      :confirm-loading="sendMailLoading"
      @update:visible="sendMailModalVisible = $event"
      @ok="handleSendMail"
      @cancel="sendMailModalVisible = false"
      :okText="t('approval-workflow.send_mail.button')"
      :cancelText="t('button.cancel')"
      okType="primary"
    >
      <UiForm ref="sendMailFormRef" :model="sendMailForm" :rules="sendMailRules">
        <UiFormItem
          :label="t('approval-workflow.send_mail.approver_label')"
          name="approver_user_id"
          required
        >
          <InputSelect
            v-model="sendMailForm.approver_user_id"
            :options="userOptions"
            :placeholder="t('approval-workflow.send_mail.approver_placeholder')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('approval-workflow.send_mail.description_label')"
          name="description"
        >
          <Textarea
            v-model="sendMailForm.description"
            :placeholder="t('approval-workflow.send_mail.description_placeholder')"
            :rows="4"
            :maxLength="1000"
          />
          <p class="text-xs text-gray-500 mt-1">
            {{ t('approval-workflow.send_mail.description_hint') }}
          </p>
        </UiFormItem>
      </UiForm>
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
