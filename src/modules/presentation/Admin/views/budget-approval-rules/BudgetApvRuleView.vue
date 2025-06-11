<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { columns } from "./column";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { budgetApvRuleRules } from "./validation/BudgetApvRule.validate";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { departmentStore } from "../../stores/departments/department.store";
import { budgetApprovalRuleStore } from "../../stores/budget-apv-rule.store";
import type { BudgetApprovalRuleEntity } from "@/modules/domain/entities/budget-approval-rules/budget-approver-rules.entity";
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
// Initialize the unit store
const dpmStore = departmentStore();
// departments data that will be displayed (from API or mock)
const budget_apv_rules = ref<BudgetApprovalRuleApiModel[]>([]);
const useRealApi = ref<boolean>(true); // Toggle between mock and real API
const { success, error } = useNotification();
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
// Load data on component mount
onMounted(async () => {
  await loadDpm();
  await dpmStore.fetchDepartment();
  await userStore.fetchDepartmentUser({
    page: 1,
    limit: 1000,
    type: "approval_rules",
  });
});

const loadDpm = async (): Promise<void> => {
  if (useRealApi.value) {
    try {
      loading.value = true;
      const result = await budgetApvRuleStore.fetchBudgetApvRules({
        page: budgetApvRuleStore.pagination.page,
        limit: budgetApvRuleStore.pagination.limit,
      });
      budget_apv_rules.value = result.data.map(
        (
          budgetApvRule: BudgetApprovalRuleEntity
        ): BudgetApprovalRuleApiModel => {
          const department = budgetApvRule.getDepartment();
          const approver = budgetApvRule.getUser();

          return {
            id: budgetApvRule.getId() ?? "",
            department_id: Number(budgetApvRule.getDepartment_id()),
            approver_id: Number(budgetApvRule.getApprover_id()),
            min_amount: Number(budgetApvRule.getMin_amount()),
            max_amount: Number(budgetApvRule.getMax_amount()),
            department: department
              ? {
                  id: Number(department.getId()),
                  name: department.getName(),
                  code: department.getCode?.(),
                  created_at: department.getCreatedAt?.(),
                  updated_at: department.getUpdatedAt?.(),
                }
              : undefined,
            approver: approver
              ? {
                  id: Number(approver.getId()),
                  username: approver.getUsername(),
                  email: approver.getEmail?.(),
                  tel: approver.getTel?.(),
                  created_at: approver.getCreatedAt?.(),
                  updated_at: approver.getUpdatedAt?.(),
                }
              : undefined,

            created_at: budgetApvRule.getCreatedAt() ?? "",
            updated_at: budgetApvRule.getUpdatedAt() ?? "",
          };
        }
      );
    } catch (error) {
      console.error("Failed to fetch department from API:", error);
      // budget_apv_rules.value = [...dataDpm.value];
    } finally {
      loading.value = false;
    }
  } else {
    // budget_apv_rules.value = [...dataDpm.value];
  }
};

//search
const handleSearch = async () => {
  try {
    loading.value = true;
    const result = await budgetApvRuleStore.fetchBudgetApvRules({
      page: 1,
      limit: budgetApvRuleStore.pagination.limit,
      search: search.value,
    });

    budget_apv_rules.value = result.data.map(
      (budgetApvRule: BudgetApprovalRuleEntity): BudgetApprovalRuleApiModel => {
        const department = budgetApvRule.getDepartment();
        const approver = budgetApvRule.getUser();

        return {
          id: budgetApvRule.getId() ?? "",
          department_id: Number(budgetApvRule.getDepartment_id()),
          approver_id: Number(budgetApvRule.getApprover_id()),
          min_amount: Number(budgetApvRule.getMin_amount()),
          max_amount: Number(budgetApvRule.getMax_amount()),
          department: department
            ? {
                id: Number(department.getId()),
                name: department.getName(),
                code: department.getCode?.(),
                created_at: department.getCreatedAt?.(),
                updated_at: department.getUpdatedAt?.(),
              }
            : undefined,
          approver: approver
            ? {
                id: Number(approver.getId()),
                username: approver.getUsername(),
                email: approver.getEmail?.(),
                tel: approver.getTel?.(),
                created_at: approver.getCreatedAt?.(),
                updated_at: approver.getUpdatedAt?.(),
              }
            : undefined,

          created_at: budgetApvRule.getCreatedAt() ?? "",
          updated_at: budgetApvRule.getUpdatedAt() ?? "",
        };
      }
    );

    // Optional: Update pagination
    budgetApvRuleStore.setPagination({
      page: 1,
      limit: budgetApvRuleStore.pagination.limit,
      total: budgetApvRuleStore.pagination.total,
    });
  } catch (error) {
    console.error("Search failed:", error);
  } finally {
    loading.value = false;
  }
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
  try {
    loading.value = true;
    await formRef.value.submitForm();
    if (Number(formModel.max_amount) < Number(formModel.min_amount)) {
      error(mesage);
    } else {
      await budgetApvRuleStore.createBudgetApvRule({
        department_id: formModel.department_id,
        approver_id: formModel.approver_id,
        min_amount: formModel.min_amount ?? 0,
        max_amount: formModel.max_amount ?? 0,
      });
      success(t("departments.notify.created"));
      await loadDpm(); // Refresh the list
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
    }
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
  } catch (error) {
    console.error("Edit form validation failed:", error);
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
  } catch (error) {
    console.error("Delete failed:", error);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleTableChange = async (pagination: any) => {
  budgetApvRuleStore.setPagination({
    page: pagination.current | 1,
    limit: pagination.pageSize,
    total: pagination.total,
  });
  await loadDpm();
};
//format form amount
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
        </span></div>
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
      :dataSource="budget_apv_rules"
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
        <UiFormItem
          :label="t('budget-apv-rule.field.department')"
          name="department_id"
          required
        >
          <InputSelect
            v-model="formModel.department_id"
            :options="departmentItem"
            :placeholder="t('budget-apv-rule.placeholder.department')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('budget-apv-rule.field.user')"
          name="approver_id"
          required
        >
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

        <UiFormItem
          :label="t('budget-apv-rule.field.max')"
          name="max_amount"
          required
        >
          <UiInput
            v-model="formattedMaxAmount"
            placeholder="2xx.xxx.xxx"
            @keypress="NumberOnly"
          />
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
        <UiFormItem
          :label="t('budget-apv-rule.field.department')"
          name="department_id"
          required
        >
          <InputSelect
            v-model="formModel.department_id"
            :options="departmentItem"
            :placeholder="t('budget-apv-rule.placeholder.department')"
          />
        </UiFormItem>
        <UiFormItem
          :label="t('budget-apv-rule.field.user')"
          name="approver_id"
          required
        >
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

        <UiFormItem
          :label="t('budget-apv-rule.field.max')"
          name="max_amount"
          required
        >
          <UiInput
            v-model="formattedMaxAmount"
            placeholder="2xx.xxx"
            @keypress="NumberOnly"
          />
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
