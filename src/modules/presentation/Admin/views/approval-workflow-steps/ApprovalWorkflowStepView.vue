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
import { approvalWorkflowStepRules } from "./validation/approval-workflow-step.validate";
import { useNotification } from "@/modules/shared/utils/useNotification";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { approvalWorkflowStore } from "../../stores/approval-workflow.store";
import { departmentStore } from "../../stores/departments/department.store";
import { NumberOnly } from "@/modules/shared/utils/format-price";
import { approvalWorkflowStepStore } from "../../stores/approval-workflow-step.store";
import type { IApprovalWorkflowStepApiModel } from "@/modules/interfaces/approval-workflow-step.interface";
import { useUserStore } from "../../stores/user.store";
import Radio from "@/common/shared/components/Input/Radio.vue";
import InputNumber from "@/common/shared/components/Input/InputNumber.vue";
import { useRoute } from "vue-router";
const {error} = useNotification()
const search = ref<string>("");
const { t } = useI18n();
const { success, warning } = useNotification();
const {params} = useRoute()
const id = params.id as string;
// Form related
const formRef = ref();
const modalVisible = ref<boolean>(false);
const isEdit = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedData = ref<IApprovalWorkflowStepApiModel | null>(null);

const store = approvalWorkflowStore();
const dpmStore = departmentStore();
const apvWorkflowStepStore = approvalWorkflowStepStore();
const userStore = useUserStore();

const userOption = computed(() =>
  userStore.users.map((user) => ({
    value: user.getId() ?? '',
    label: user.getUsername(),
  }))
);
const departmentItems = computed(() =>
  dpmStore.departments.map((item) => ({
    value: item.getId(),
    label: item.getName(),
  }))
);

// Form model
const formState = reactive({
  department_id: "",
  step_name: "",
  step_number: 0 as number,
  type: "",
  requires_file: "false",
  user_id: "",
  approval_workflow_id: ""
});

const typeEnum = computed(() => {
  return [
    {
      label: t("approval-workflow-step.enum.department_head"),
      value: "department_head",
    },
    { label: t("approval-workflow-step.enum.department"), value: "department" },
    {
      label: t("approval-workflow-step.enum.specific_user"),
      value: "specific_user",
    },
    {
      label: t("approval-workflow-step.enum.line_manager"),
      value: "line_manager",
    },
    { label: t("approval-workflow-step.enum.condition"), value: "condition" },
  ];
});

const typeOption = computed(() =>
  typeEnum.value.map((item) => ({
    value: item.value ?? "",
    label: item.label ?? "",
  }))
);

// Computed properties for modal
const modalTitle = computed(() =>
  isEdit.value
    ? t('approval-workflow-step.header_form.edit')
    : t('approval-workflow-step.header_form.add')
);

const modalOkText = computed(() =>
  isEdit.value
    ? t('button.edit')
    : t('button.save')
);
const loadApvWorkFlowStep = async () => {
  loading.value = true;

  try {
    await apvWorkflowStepStore.fetchApprovalWorkflowSteps(id, {
      page: apvWorkflowStepStore.pagination.page,
      limit: apvWorkflowStepStore.pagination.limit,
      search: search.value,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(t("documentType.error.loadFailed"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};
// Load data on component mount
onMounted(async () => {
  await dpmStore.fetchDepartment({ page: 1, limit: 1000 });
  await store.fetchApprovalWorkflows({ page: 1, limit: 1000 });
  await userStore.fetchUsers({ page: 1, limit: 1000 });
  await loadApvWorkFlowStep();
});

// Search
const handleSearch = async () => {
  await apvWorkflowStepStore.fetchApprovalWorkflowSteps(id, {
    page: 1,
    limit: apvWorkflowStepStore.pagination.limit,
    search: search.value,
  });
};
// Reset form function
const resetForm = (): void => {
  formState.department_id = "";
  formState.step_name = "";
  formState.step_number = 0;
  formState.type = "";
  formState.user_id = "";
  formState.requires_file = "false";
  formState.approval_workflow_id = "";
};

// CRUD operations
const showCreateModal = (): void => {
  resetForm();
  isEdit.value = false;
  selectedData.value = null;
  modalVisible.value = true;
};

const showEditModal = (record: IApprovalWorkflowStepApiModel): void => {
  selectedData.value = record;
  isEdit.value = true;
  // Populate form with existing data
  formState.department_id = record.department?.id.toString() ?? "";
  formState.step_name = record.step_name;
  formState.step_number = record.step_number;
  formState.type = record.type;
  formState.user_id = record.user_id?.toString() ?? "";
  formState.requires_file = String(record.requires_file);
  formState.approval_workflow_id = record.approval_workflow_id?.toString() ?? "";

  modalVisible.value = true;
};

const showDeleteModal = (record: IApprovalWorkflowStepApiModel): void => {
  selectedData.value = record;
  deleteModalVisible.value = true;
};

// Single handler for both create and update
const handleSubmit = async (): Promise<void> => {
  try {
    loading.value = true;

    if (isEdit.value && selectedData.value) {
      const id = selectedData.value.id.toString();
      await apvWorkflowStepStore.update(id, {
        id,
        department_id: formState.department_id,
        step_name: formState.step_name,
        step_number: Number(formState.step_number),
        user_id: Number(formState.user_id),
        type: formState.type,
        requires_file: formState.requires_file,
        approval_workflow_id: formState.approval_workflow_id,
      });
      success(t("approval-workflow-step.notify.update"));
    } else {
      await apvWorkflowStepStore.create(Number(id),{
        department_id: formState.department_id,
        step_name: formState.step_name,
        step_number: Number(formState.step_number),
        type: formState.type,
        user_id: Number(formState.user_id),
        requires_file: formState.requires_file,
        approval_workflow_id: formState.approval_workflow_id,
      });
      success(t("approval-workflow-step.notify.created"));
    }

    modalVisible.value = false;
    await loadApvWorkFlowStep(); // Refresh the list
  } catch (err: unknown) {
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
    const id = selectedData.value.id.toString();
    await apvWorkflowStepStore.remove(id);
    success(t("approval-workflow-step.notify.delete"));
    await loadApvWorkFlowStep();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("documentType.error.title"), String(errorMessage));
  }

  deleteModalVisible.value = false;
  loading.value = false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleTableChange = async (pagination: any) => {
  apvWorkflowStepStore.setPagination({
    page: pagination.current || 10,
    limit: pagination.pageSize,
    total: pagination.total,
  });
  await loadApvWorkFlowStep();
};
const tablePagination = computed(() => ({
  current: apvWorkflowStepStore.pagination.page,
  pageSize: apvWorkflowStepStore.pagination.limit,
  total: apvWorkflowStepStore.pagination.total,
  showSizeChanger: true,
}));
watch(search, async (newValue) => {
  if (newValue === "") {
    await loadApvWorkFlowStep();
  }
});

const rateOptions = computed(() => [
  { label: t("approval-workflow-step.yes"), value: "true" },
  { label: t("approval-workflow-step.no"), value: "false" },
]);
</script>

<template>
  <div class="list-container p-6">
    <div class="mb-6 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ $t("approval-workflow-step.title") }}
      </h1>
      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch
            v-model:value="search"
            @keyup.enter="handleSearch"
            :placeholder="t('approval-workflow-step.placeholder.search')"
          />
        </div>
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="flex items-center"
        >
          {{ $t("approval-workflow-step.add") }}
        </UiButton>
      </div>
      <div class="total-item mt-4 text-slate-700">
        <a-tag color="red"
          >{{ t("approval-workflow-step.total") }}:
          {{ apvWorkflowStepStore.pagination.total }}
          {{ t("approval-workflow-step.item") }}</a-tag
        >
      </div>
    </div>

    <!--  Table -->
    <Table
      :columns="columns(t)"
      :dataSource="apvWorkflowStepStore.approval_workflow_steps"
      :pagination="tablePagination"
      row-key="id"
      :loading="store.loading"
      @change="handleTableChange"
    >
      <template #step_number="{ record }">
        <div class="flex items-center justify-start gap-2">
          {{ t("approval-workflow-step.field.step") }} ({{
            record.step_number
          }})
        </div>
      </template>
      <template #requires_file="{ record }">
        <div class="flex items-center justify-start gap-2">
         {{
          record.requires_file === "true" ? t("approval-workflow-step.yes") : t("approval-workflow-step.no")
          }}
        </div>
      </template>
      <template #user="{ record }">
        <div class="flex items-center justify-start gap-2">
         {{
          record.user ? record.user.getUsername(): '. . . . .'
          }}
        </div>
      </template>
      <template #department="{ record }">
        <div class="flex items-center justify-start gap-2">
         {{
          record.department ? record.department.getName(): '. . . . .'
          }}
        </div>
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

    <!-- Single Modal for Create/Edit -->
    <UiModal
      :title="modalTitle"
      :visible="modalVisible"
      :confirm-loading="loading"
      @update:visible="modalVisible = $event"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
      :okText="modalOkText"
      :cancelText="t('button.cancel')"
      width="600px"
    >
      <UiForm
        ref="formRef"
        :model="formState"
        :rules="approvalWorkflowStepRules(t)"
      >
        <div class="flex gap-4 w-full items-start">
          <UiFormItem
            class="w-1/4"
            :label="t('approval-workflow-step.field.step_number')"
            name="step_number"
            @keypress="NumberOnly"
            required
          >
            <InputNumber
              v-model="formState.step_number"
              :placeholder="t('approval-workflow-step.placeholder.step_number')"
              class="w-full"
            />
          </UiFormItem>

          <UiFormItem
            class="flex-1"
            :label="t('approval-workflow-step.field.step_name')"
            name="step_name"
            required
          >
            <UiInput
              v-model="formState.step_name"
              :placeholder="t('approval-workflow-step.placeholder.step_name')"
              class="w-full"
            />
          </UiFormItem>
        </div>

        <UiFormItem
          :label="t('approval-workflow-step.field.type')"
          name="type"
          required
        >
          <InputSelect
            v-model="formState.type"
            :options="typeOption"
            :placeholder="t('approval-workflow-step.placeholder.type')"
          />
        </UiFormItem>

        <UiFormItem
          :label="t('approval-workflow-step.field.department')"
          name="department_id"
          required
          v-if="formState.type === 'department'"
        >
          <InputSelect
            v-model="formState.department_id"
            :options="departmentItems"
            :placeholder="t('approval-workflow-step.placeholder.department')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('approval-workflow-step.field.user')"
          name="user_id"
          required
          v-if="formState.type === 'specific_user'"
        >
          <InputSelect
            v-model="formState.user_id"
            :options="userOption"
            :placeholder="t('approval-workflow-step.placeholder.user')"
          />
        </UiFormItem>

        <UiFormItem
          :label="t('approval-workflow-step.field.requires_file')"
          name="requires_file_upload"
        >
          <Radio
            v-model="formState.requires_file"
            :options="rateOptions"
            :disabled="loading"
          />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('approval-workflow-step.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      :okText="t('button.ok')"
      :cancelText="t('button.cancel')"
      okType="primary"
    >
      <p>
        {{ $t("approval-workflow-step.alert.message") }}: "{{
          t("approval-workflow-step.field.step")
        }}
        ({{ selectedData?.step_number }})"?
      </p>
      <p class="text-red-500">
        {{ t("approval-workflow-step.alert.remark") }}
      </p>
    </UiModal>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao&display=swap");
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
