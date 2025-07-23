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
import type { ApprovalWorkflowStepApiModel } from "@/modules/interfaces/approval-workflow-step.interface";
import type { ApprovalWorkflowStepEntity } from "@/modules/domain/entities/approval-workflows-step.entity";
import { useRoute } from "vue-router";
const search = ref<string>("");
const { t } = useI18n();
const {params} = useRoute()
const approval_workflow_step = ref<ApprovalWorkflowStepApiModel[]>([]);
// const useRealApi = ref<boolean>(true); // Toggle between mock and real API
const { success } = useNotification();
// Form related
const formRef = ref();
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedData = ref<ApprovalWorkflowStepApiModel | null>(null);
const store = approvalWorkflowStore();
const dpmStore = departmentStore();
const apvWorkflowStepStore = approvalWorkflowStepStore();
const approvalWorkflowItems = computed(() =>
  store.approval_workflows.map((item) => ({
    value: item.getId() ?? "",
    label: item.getName() ?? "",
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
  approval_workflow_id: "",
  department_id: "",
  step_name: "",
  step_number: "",
});

// Load data on component mount
onMounted(async () => {
  await recordLists();
  await dpmStore.fetchDepartment({ page: 1, limit: 1000 });
  await store.fetchApprovalWorkflows({ page: 1, limit: 1000 });
});

const recordLists = async (): Promise<void> => {
  // if (useRealApi.value) {
  try {
    loading.value = true;
    const id = params.id as string
    if(id) {
      const result = await apvWorkflowStepStore.fetchApprovalWorkflowSteps(id,{
      page: apvWorkflowStepStore.pagination.page,
      limit: apvWorkflowStepStore.pagination.limit,
    });

    approval_workflow_step.value = result.data.map(
      (data: ApprovalWorkflowStepEntity) => {
        const dpm = data.getDepartment();
        return {
          id: Number(data.getId()), // convert to number
          step_name: data.getStepName(),
          step_number: data.getStepNumber(),
          departmentId: Number(data.getDepartemntId()), // make sure it's a string if needed
          approval_workflow_id: Number(data.getApprovalWorkflowId()), // make sure it's a string if needed
          department: dpm
            ? {
                id: Number(dpm.getId()),
                name: dpm.getName(),
                code: dpm.getCode(),
                created_at: dpm.getCreatedAt() ?? undefined,
                updated_at: dpm.getUpdatedAt() ?? undefined,
              }
            : undefined,
          created_at: data.getCreatedAt() ?? undefined,
          updated_at: data.getUpdatedAt() ?? undefined,
        };
      }
    );
    }
    // console.log("Department data loaded:", department.value);
  } catch (error) {
    console.error("Failed to fetch department from API:", error);
    // department.value = [...dataApprovalFlow.value];
  } finally {
    loading.value = false;
  }
  // } else {
  // approval_workflow.value = [...dataApprovalFlow.value];
  // }
};

//search
const handleSearch = async () => {
  try {
    loading.value = true;
    loading.value = true;
    const id = params.id as string;
    const result = await apvWorkflowStepStore.fetchApprovalWorkflowSteps(id, {
      page: apvWorkflowStepStore.pagination.page,
      limit: apvWorkflowStepStore.pagination.limit,
      search: search.value
    });

    approval_workflow_step.value = result.data.map(
      (data: ApprovalWorkflowStepEntity) => {
        const dpm = data.getDepartment();
        return {
          id: Number(data.getId()), // convert to number
          step_name: data.getStepName(),
          step_number: data.getStepNumber(),
          departmentId: Number(data.getDepartemntId()), // make sure it's a string if needed
          approval_workflow_id: Number(data.getApprovalWorkflowId()), // make sure it's a string if needed
          department: dpm
            ? {
                id: Number(dpm.getId()),
                name: dpm.getName(),
                code: dpm.getCode(),
                created_at: dpm.getCreatedAt() ?? undefined,
                updated_at: dpm.getUpdatedAt() ?? undefined,
              }
            : undefined,
          created_at: data.getCreatedAt() ?? undefined,
          updated_at: data.getUpdatedAt() ?? undefined,
        };
      }
    );
    // Optional: Update pagination
    apvWorkflowStepStore.setPagination({
      page: 1,
      limit: apvWorkflowStepStore.pagination.limit,
      total: apvWorkflowStepStore.pagination.total,
    });
  } catch (error) {
    console.error("Search failed:", error);
  } finally {
    loading.value = false;
  }
};
// CRUD operations
const showCreateModal = (): void => {
  formState.approval_workflow_id = "";
  formState.department_id = "";
  formState.step_name = "";
  formState.step_number = "";
  createModalVisible.value = true;
};

const showEditModal = (record: ApprovalWorkflowStepApiModel): void => {
  selectedData.value = record;
  const department_id = record.department?.id.toString() ?? ""
  formState.approval_workflow_id = record.approval_workflow_id?.toString();
  formState.department_id = department_id;
  formState.step_name = record.step_name;
  formState.step_number = record.step_number?.toString();
  editModalVisible.value = true;
};

const showDeleteModal = (record: ApprovalWorkflowStepApiModel): void => {
  selectedData.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();
    await apvWorkflowStepStore.create({
      approval_workflow_id: formState.approval_workflow_id,
      department_id: formState.department_id,
      step_name: formState.step_name,
      step_number: Number(formState.step_number),
    });
    success(t("approval-workflow-step.notify.created"));
    await recordLists(); // Refresh the list
    createModalVisible.value = false;
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

    if (selectedData.value) {
      const id = selectedData.value.id.toString();
      await apvWorkflowStepStore.update(id, {
        id,
        approval_workflow_id: formState.approval_workflow_id,
        department_id: formState.department_id,
        step_name: formState.step_name,
        step_number: Number(formState.step_number),
      });
      success(t("approval-workflow-step.notify.update"));
      await recordLists();
    }

    editModalVisible.value = false;
  } catch (error) {
    console.error("Edit form validation failed:", error);
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
    await apvWorkflowStepStore.remove(id);
    success(t("approval-workflow-step.notify.delete"));
    await recordLists(); // Refresh the list
  } catch (error) {
    console.error("Delete failed:", error);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleTableChange = async (pagination: any) => {
  apvWorkflowStepStore.setPagination({
    page: pagination.current | 1,
    limit: pagination.pageSize,
    total: pagination.total,
  });
  await recordLists();
};
watch(search, async (newValue) => {
  if (newValue === "") {
    await recordLists();
  }
});
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
      :dataSource="approval_workflow_step"
      :pagination="{
        current: store.pagination.page,
        pageSize: store.pagination.limit,
        total: store.pagination.total,
      }"
      row-key="id"
      :loading="store.loading"
      @change="handleTableChange"
    >
      <template #step_number="{ record }">
        <div class="flex items-center justify-start gap-2">
          {{ t('approval-workflow-step.field.step') }} ({{ record.step_number }})
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

    <!-- Create Modal -->
    <UiModal
      :title="t('approval-workflow-step.header_form.add')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
      :okText="t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <UiForm
        ref="formRef"
        :model="formState"
        :rules="approvalWorkflowStepRules(t)"
      >
        <UiFormItem
          :label="t('approval-workflow-step.field.step_number')"
          name="step_number"
          @keypress="NumberOnly"
          required
        >
          <UiInput
            v-model="formState.step_number"
            :placeholder="t('approval-workflow-step.placeholder.step_number')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('approval-workflow-step.field.step_name')"
          name="step_name"
          required
        >
          <UiInput
            v-model="formState.step_name"
            :placeholder="t('approval-workflow-step.placeholder.step_name')"
          />
        </UiFormItem>

        <UiFormItem
          :label="t('approval-workflow-step.field.approval_workflow')"
          name="approval_workflow_id"
          required
        >
          <InputSelect
            v-model="formState.approval_workflow_id"
            :options="approvalWorkflowItems"
            :placeholder="
              t('approval-workflow-step.placeholder.approval_workflow')
            "
          />
        </UiFormItem>
        <UiFormItem
          :label="t('approval-workflow-step.field.department')"
          name="department_id"
          required
        >
          <InputSelect
            v-model="formState.department_id"
            :options="departmentItems"
            :placeholder="t('approval-workflow-step.placeholder.department')"
          />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('approval-workflow-step.header_form.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
      :okText="t('button.edit')"
      :cancelText="t('button.cancel')"
    >
      <UiForm
        ref="formRef"
        :model="formState"
        :rules="approvalWorkflowStepRules(t)"
      >
        <UiFormItem
          :label="t('approval-workflow-step.field.step_number')"
          name="step_number"
          @keypress="NumberOnly"
          required
        >
          <UiInput
            v-model="formState.step_number"
            :placeholder="t('approval-workflow-step.placeholder.step_number')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('approval-workflow-step.field.step_name')"
          name="step_name"
          required
        >
          <UiInput
            v-model="formState.step_name"
            :placeholder="t('approval-workflow-step.placeholder.step_name')"
          />
        </UiFormItem>

        <UiFormItem
          :label="t('approval-workflow-step.field.approval_workflow')"
          name="approval_workflow_id"
          required
        >
          <InputSelect
            v-model="formState.approval_workflow_id"
            :options="approvalWorkflowItems"
            :placeholder="
              t('approval-workflow-step.placeholder.approval_workflow')
            "
          />
        </UiFormItem>
        <UiFormItem
          :label="t('approval-workflow-step.field.department')"
          name="department_id"
          required
        >
          <InputSelect
            v-model="formState.department_id"
            :options="departmentItems"
            :placeholder="t('approval-workflow-step.placeholder.department')"
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
        {{ $t("approval-workflow-step.alert.message") }}: "{{ t('approval-workflow-step.field.step') }} ({{
          selectedData?.step_number
        }})"?
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
