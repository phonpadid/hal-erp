<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { columns } from "./column";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table, { type TablePaginationType } from "@/common/shared/components/table/Table.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { budgetApvRuleRules } from "./validation/BudgetApvRule.validate";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { departmentStore } from "../../stores/departments/department.store";
import { budgetApprovalRuleStore } from "../../stores/budget-apv-rule.store";
import type { BudgetApprovalRuleApiModel } from "@/modules/interfaces/budget-approval-rules/budget-approval-rule.interface";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import {
  formatPrice,
  NumberOnly,
  parsePrice,
} from "@/modules/shared/utils/format-price";
import { departmenUsertStore } from "../../stores/departments/department-user.store";

const search = ref<string>("");
const { t } = useI18n();
const dpmStore = departmentStore();
const budget_apv_rules = ref<BudgetApprovalRuleApiModel[]>([]);
const { success, error, warning } = useNotification();
// Form related
const formRef = ref();
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectData = ref<BudgetApprovalRuleApiModel | null>(null);
const budgetApvRuleStore = budgetApprovalRuleStore();
const userStore = departmenUsertStore();

const userItem = computed(() =>
  userStore.departmentUser.map((item) => ({
    value: item.getUser()?.getId() ?? "",
    label: item.getUser()?.getUsername() ?? "",
  }))
);

const departmentItem = computed(() =>
  dpmStore.departments.map((item) => ({
    value: item.getId(),
    label: item.getName(),
  }))
);

// Form model
const formModel = budgetApvRuleStore.formState;

// Initialize
onMounted(async () => {
  await loadDpm();
  await dpmStore.fetchDepartment({ page:1, limit:1000});
  await userStore.fetchDepartmentUser({
    page: 1,
    limit: 1000,
  });
});

const loadDpm = async (): Promise<void> => {
  try {
    loading.value = true;
    await budgetApvRuleStore.fetchBudgetApvRules({
      page: budgetApvRuleStore.pagination.page,
      limit: budgetApvRuleStore.pagination.limit,
      search: search.value,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warning(t("messages.error.title"), errorMessage);
  } finally {
    loading.value = false;
  }
};

/** Search */
const handleSearch = async () => {
  await budgetApvRuleStore.fetchBudgetApvRules({
    page: 1,
    limit: budgetApvRuleStore.pagination.limit,
    search: search.value,
  });
};

// CRUD operations
const showCreateModal = (): void => {
  formModel.department_id = "";
  formModel.approver_id = "";
  formModel.min_amount = undefined;
  formModel.max_amount = undefined;
  createModalVisible.value = true;
};

const showEditModal = (record: BudgetApprovalRuleApiModel): void => {
  const dpmId = record.department?.id ?? "";
  selectData.value = record;
  formModel.approver_id = record.approver?.id.toString() ?? "";
  formModel.department_id = dpmId.toString();
  formModel.min_amount = record.min_amount;
  formModel.max_amount = record.max_amount;
  editModalVisible.value = true;
};

const showDeleteModal = (record: BudgetApprovalRuleApiModel): void => {
  selectData.value = record;
  deleteModalVisible.value = true;
};
const mesage = `"${t("budget-apv-rule.field.max")}" ${t(
  "budget-apv-rule.error.max_cannot_min"
)} "${t("budget-apv-rule.field.min")}"`;

const handleCreate = async (): Promise<void> => {
  await formRef.value.submitForm();
  try {
    loading.value = true;
    await budgetApvRuleStore.createBudgetApvRule({
      department_id: formModel.department_id,
      approver_id: formModel.approver_id,
      min_amount: formModel.min_amount ?? 0,
      max_amount: formModel.max_amount ?? 0,
    });
    success(t("departments.notify.created"));
    await loadDpm();
    await userStore.fetchDepartmentUser({
      page: 1,
      limit: 1000,
      type: "approval_rules",
    });
    createModalVisible.value = false;
    formModel.department_id = "";
    formModel.approver_id = "";
    formModel.min_amount = undefined;
    formModel.max_amount = undefined;
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (typeof error === 'object' && error !== null) {
      const maybeRef = error as { value?: Error; _value?: Error } | Error;

      if (typeof maybeRef === 'object' && maybeRef !== null && 'value' in maybeRef && maybeRef.value instanceof Error) {
        errorMessage = maybeRef.value.message;
      } else if (typeof maybeRef === 'object' && maybeRef !== null && '_value' in maybeRef && maybeRef._value instanceof Error) {
        errorMessage = maybeRef._value.message;
      } else if (maybeRef instanceof Error) {
        errorMessage = maybeRef.message;
      }
    }
    warning(t("messages.error.title"), errorMessage);
  } finally {
    loading.value = false;
  }
};

const handleEdit = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    if (selectData.value) {
      if (Number(formModel.max_amount) < Number(formModel.min_amount)) {
        error(mesage);
      } else {
        const id = selectData.value.id.toString();
        await budgetApvRuleStore.updateBudgetApvRule(id, {
          id,
          department_id: formModel.department_id,
          approver_id: formModel.approver_id,
          min_amount: formModel.min_amount ?? 0,
          max_amount: formModel.max_amount ?? 0,
        });
        success(t("departments.notify.update"));
        await loadDpm();
        await userStore.fetchDepartmentUser({
          page: 1,
          limit: 1000,
          type: "approval_rules",
        });
        editModalVisible.value = false;
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warning(t("messages.error.title"), errorMessage);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (): Promise<void> => {
  if (!selectData.value) return;

  loading.value = true;
  try {
    // Use API to delete
    const id = selectData.value.id.toString();
    await budgetApvRuleStore.deleteBudgetApvRule(id);
    success(t("departments.notify.delete"));
    await loadDpm(); // Refresh the list
    await userStore.fetchDepartmentUser({
      page: 1,
      limit: 1000,
      type: "approval_rules",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warning(t("messages.error.title"), errorMessage);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};


const handleTableChange = async (pagination: TablePaginationType) => {
  budgetApvRuleStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total || 0,
  });
  await loadDpm();
};

// format form amount
const formattedMinAmount = computed({
  get() {
    return formatPrice(formModel.min_amount);
  },
  set(val: string) {
    const digitsOnly = val.replace(/\D/g, "");
    formModel.min_amount = parsePrice(digitsOnly);
  },
});

// Computed for formatted max_amount
const formattedMaxAmount = computed({
  get() {
    return formatPrice(formModel.max_amount);
  },
  set(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    formModel.max_amount = parsePrice(digitsOnly);
  },
});

const checkedRadio = ref("personal");
</script>

<template>
  <div class="ist-container p-6">
    <div class="mb-6 gap-4">
      <h1 class="text-2xl font-semibold">
        {{ $t("budget-apv-rule.title") }}
      </h1>
      <div class="flex justify-between gap-20">
        <div class="w-[20rem]">
          <InputSearch
            v-model:value="search"
            @change="handleSearch"
            :placeholder="t('budget-apv-rule.placeholder.search')"
          />
        </div>
        <UiButton
          type="primary"
          icon="ant-design:plus-outlined"
          @click="showCreateModal"
          colorClass="flex items-center"
        >
          {{ $t("budget-apv-rule.add") }}
        </UiButton>
      </div>
      <div class="mt-4 text-slate-700 space-y-2">
        <span
          :loading="budgetApvRuleStore.loading"
          class="block text-lg font-semibold"
          v-if="budget_apv_rules.length > 0 && budget_apv_rules[0].department"
        >
          {{ budget_apv_rules[0].department?.name }}
        </span>
      </div>
      <!-- <div class="total-item mt-4 text-slate-700">
        <a-tag color="red"
          >{{
            t("budget-apv-rule.totalPeople", {
              count: budgetApvRuleStore.pagination.total,
            })
          }}
        </a-tag>
      </div> -->
    </div>

    <!--  Table -->
    <Table
      :columns="columns(t)"
      :dataSource="budgetApvRuleStore.budget_apv_rule"
      :pagination="{
        current: budgetApvRuleStore.pagination.page,
        pageSize: budgetApvRuleStore.pagination.limit,
        total: budgetApvRuleStore.pagination.total,
      }"
      row-key="id"
      :loading="budgetApvRuleStore.loading"
      @change="handleTableChange"
    >
      <template #min_amount="{ record }">
        {{ formatPrice(record.min_amount) }}
      </template>
      <template #max_amount="{ record }">
        {{ formatPrice(record.max_amount) }}
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
      :title="t('budget-apv-rule.header_form.add')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
      :okText="t('button.save')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="budgetApvRuleRules(t)">
        <div class="mb-4 mt-4">
          <a-radio-group v-model:value="checkedRadio">
            <a-radio-button value="personal">Personal</a-radio-button>
            <a-radio-button value="department">Department</a-radio-button>
          </a-radio-group>
        </div>

        <UiFormItem
          :label="t('budget-apv-rule.field.department')"
          name="department_id"
          v-if="checkedRadio === 'department'"
          required
        >
          <InputSelect
            v-model="formModel.department_id"
            :options="departmentItem"
            :placeholder="t('budget-apv-rule.placeholder.department')"
          />
        </UiFormItem>
        <UiFormItem :label="t('budget-apv-rule.field.user')" name="approver_id" required>
          <InputSelect
            v-model="formModel.approver_id"
            :options="userItem"
            :placeholder="t('departments.dpm_user.placeholder.user')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('budget-apv-rule.field.min')"
          name="min_amount"
          required
          @keypress="NumberOnly"
        >
          <UiInput v-model="formattedMinAmount" placeholder="1xx.xxx.xxx" />
        </UiFormItem>

        <UiFormItem :label="t('budget-apv-rule.field.max')" name="max_amount" required>
          <UiInput v-model="formattedMaxAmount" placeholder="2xx.xxx.xxx" @keypress="NumberOnly" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('budget-apv-rule.header_form.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
      :okText="t('button.edit')"
      :cancelText="t('button.cancel')"
    >
      <UiForm ref="formRef" :model="formModel" :rules="budgetApvRuleRules(t)">
        <UiFormItem :label="t('budget-apv-rule.field.department')" name="department_id" :rules="[]">
          <InputSelect
            v-model="formModel.department_id"
            :options="departmentItem"
            :placeholder="t('budget-apv-rule.placeholder.department')"
          />
        </UiFormItem>
        <UiFormItem :label="t('budget-apv-rule.field.user')" name="approver_id" required>
          <InputSelect
            v-model="formModel.approver_id"
            :options="userItem"
            :placeholder="t('departments.dpm_user.placeholder.user')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('budget-apv-rule.field.min')"
          name="min_amount"
          required
          @keypress="NumberOnly"
        >
          <UiInput v-model="formattedMinAmount" placeholder="1xx.xxx" />
        </UiFormItem>

        <UiFormItem :label="t('budget-apv-rule.field.max')" name="max_amount" required>
          <UiInput v-model="formattedMaxAmount" placeholder="2xx.xxx" @keypress="NumberOnly" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('budget-apv-rule.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      :okText="t('button.ok')"
      :cancelText="t('button.cancel')"
      okType="primary"
    >
      <p>{{ $t("budget-apv-rule.alert.message") }}?</p>
      <p class="text-red-500">
        {{ t("budget-apv-rule.alert.remark") }}
      </p>
    </UiModal>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao&display=swap");
.ist-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.total-item .ant-tag {
  font-family: "Noto Sans Lao", sans-serif;
  font-size: 14px;
}
</style>
