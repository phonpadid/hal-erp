<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { columns } from "./column";
import { departmentStore } from "../../../stores/departments/department.store";
import type { DepartmentApiModel } from "@/modules/interfaces/departments/department.interface";
import type { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Table from "@/common/shared/components/table/Table.vue";
import { dataDpm } from "@/modules/shared/utils/data.department";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { dpmRules } from "../../unit/validation/departments/department.validate";
import { useI18n } from "vue-i18n";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";

const { t } = useI18n();
// Initialize the unit store
const dpmStore = departmentStore();
// departments data that will be displayed (from API or mock)
const department = ref<DepartmentApiModel[]>([]);
const useRealApi = ref<boolean>(true); // Toggle between mock and real API

// Form related
const formRef = ref();
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedDpm = ref<DepartmentApiModel | null>(null);

// Form model
const formModel = reactive({
  name: "",
  code: "",
});

// Function to parse date string in DD-MM-YYYY HH:MM:SS format
const parseLaoDateFormat = (dateStr: string): Date | null => {
  try {
    // Expected format: "20-05-2025 00:28:51"
    const [datePart, timePart] = dateStr.split(" ");
    if (!datePart || !timePart) return null;

    const [day, month, year] = datePart.split("-").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    // Create date using UTC to prevent timezone issues
    // Month is 0-indexed in JavaScript Date
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
  } catch (error) {
    console.error("Error parsing date string:", dateStr, error);
    return null;
  }
};

// Function to safely format dates for display
const formatDateForDisplay = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return "";

  try {
    let date: Date | null = null;

    // If it's already a Date object
    if (dateValue instanceof Date) {
      date = dateValue;
    }
    // If it's a string in Lao format (DD-MM-YYYY HH:MM:SS)
    else if (typeof dateValue === "string" && dateValue.includes("-") && dateValue.includes(":")) {
      date = parseLaoDateFormat(dateValue);
    }
    // If it's any other string format
    else if (typeof dateValue === "string") {
      date = new Date(dateValue);
    }

    // Check if we have a valid date
    if (date && !isNaN(date.getTime())) {
      // Format as DD-MM-YYYY HH:MM:SS for consistency with API
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }

    // If all else fails, return the original string if it's a string
    return typeof dateValue === "string" ? dateValue : "";
  } catch (error) {
    console.warn("Error formatting date:", error, "Value was:", dateValue);
    return typeof dateValue === "string" ? dateValue : "";
  }
};

// Load data on component mount
onMounted(async () => {
  await loadDpm();
});

const loadDpm = async (): Promise<void> => {
  if (useRealApi.value) {
    try {
      loading.value = true;
      const result = await dpmStore.fetchDepartment();

      department.value = result.data.map((dpm: any) => {
        return {
          id: dpm.id ? parseInt(dpm.id) : 0,
          name: dpm.name || "",
          code: dpm.code || "",
          createdAt: dpm.createdAt || "",
          updatedAt: dpm.updatedAt || "",
        };
      });

      console.log("Department data loaded:", department.value);
    } catch (error) {
      console.error("Failed to fetch department from API:", error);
      department.value = [...dataDpm.value];
    } finally {
      loading.value = false;
    }
  } else {
    department.value = [...dataDpm.value];
  }
};

// CRUD operations
const showCreateModal = (): void => {
  formModel.name = "";
  formModel.code = "";
  createModalVisible.value = true;
};

const showEditModal = (record: DepartmentApiModel): void => {
  selectedDpm.value = record;
  formModel.name = record.name;
  formModel.code = record.code || "";
  editModalVisible.value = true;
};

const showDeleteModal = (record: DepartmentApiModel): void => {
  selectedDpm.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    if (useRealApi.value) {
      // Use API to create
      await dpmStore.createDepartment({ name: formModel.name, code: formModel.code });
      await loadDpm(); // Refresh the list
    } else {
      // Create new unit with current timestamp (mock)
      const now = formatDateForDisplay(new Date());
      const newDpm: DepartmentApiModel = {
        id: department.value.length + 1,
        name: formModel.name,
        code: formModel.code,
        created_at: now,
        updated_at: now,
      };
      department.value.push(newDpm);
    }

    createModalVisible.value = false;
    formModel.name = "";
    formModel.code = "";
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
      if (useRealApi.value) {
        // Use API to update
        const id = selectedDpm.value.id.toString();
        await dpmStore.updateDepartment(id, { id, name: formModel.name, code: formModel.code });
        await loadDpm();
      } else {
        // Update the unit locally (mock)
        const index = department.value.findIndex((u) => u.id === selectedDpm.value!.id);
        if (index !== -1) {
          const now = formatDateForDisplay(new Date());
          department.value[index] = {
            ...department.value[index],
            name: formModel.name,
            code: formModel.code,
            updated_at: now,
          };
        }
      }
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

  if (useRealApi.value) {
    try {
      // Use API to delete
      const id = selectedDpm.value.id.toString();
      await dpmStore.deleteDepartment(id);
      await loadDpm(); // Refresh the list
    } catch (error) {
      console.error("Delete failed:", error);
    }
  } else {
    // Filter out the deleted unit locally
    department.value = department.value.filter((u) => u.id !== selectedDpm.value!.id);
    // Update mock data too
    dataDpm.value = dataDpm.value.filter((u) => u.id !== selectedDpm.value!.id);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};
</script>

<template>
  <div class="unit-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ $t("departments.dpm.title") }}</h1>
      </div>

      <UiButton
        type="primary"
        icon="ant-design:plus-outlined"
        @click="showCreateModal"
        colorClass="flex items-center"
      >
        {{ $t("departments.dpm.add") }}
      </UiButton>
    </div>

    <!-- Loading indicator -->
    <div v-if="dpmStore.loading || loading" class="text-center py-4">
      <p>{{ $t("messages.loading") }}</p>
    </div>

    <!-- Units Table -->
    <Table
      :columns="columns(t)"
      :dataSource="department"
      :pagination="{ pageSize: 10 }"
      row-key="id"
    >
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
      :title="t('departments.dpm.header_form.add')"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
    >
      <UiForm ref="formRef" :model="formModel" :rules="dpmRules(t)">
        <UiFormItem :label="t('departments.dpm.field.code')" name="code" required>
          <UiInput v-model="formModel.code" :placeholder="t('departments.dpm.placeholder.code')" />
        </UiFormItem>
        <UiFormItem :label="t('departments.dpm.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('departments.dpm.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      :title="t('departments.dpm.header_form.edit')"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
    >
      <UiForm ref="formRef" :model="formModel" :rules="dpmRules(t)">
        <UiFormItem :label="t('departments.dpm.field.code')" name="code" required>
          <UiInput v-model="formModel.code" :placeholder="t('departments.dpm.placeholder.code')" />
        </UiFormItem>
        <UiFormItem :label="t('departments.dpm.field.name')" name="name" required>
          <UiInput v-model="formModel.name" :placeholder="t('departments.dpm.placeholder.name')" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      title="ຢືນຢັນການລຶບ"
      :visible="deleteModalVisible"
      :confirm-loading="loading"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      okText="ຢືນຢັນ"
      okType="primary"
    >
      <p>ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບພະແພກ: "{{ selectedDpm?.name }}"?</p>
      <p class="text-red-500">ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້ ຫຼັງຈາກທ່ານຢືນຢັນສຳເລັດ.</p>
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
