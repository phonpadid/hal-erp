<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import type { UnitApiModel } from "@/modules/interfaces/unit.interface";
import { useUnitStore } from "@/modules/presentation/Admin/stores/unit.store";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import { Unit } from "@/modules/domain/entities/unit.entities";

// Initialize the unit store
const unitStore = useUnitStore();

// Table columns definition
const columns = [
  {
    title: "ຊື່ຫົວໜ່ວຍ",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "ເວລາສ້າງ",
    dataIndex: "created_at",
    key: "created_at",
  },
  {
    title: "ເວລາອັບເດດ",
    dataIndex: "updated_at",
    key: "updated_at",
  },
  {
    title: "ຈັດການຂໍ້ມູນ",
    dataIndex: "actions",
    key: "actions",
  },
];

// Mock data for units (keep it for fallback)
const mockUnits = ref<UnitApiModel[]>([
  {
    id: 1,
    name: "ກິໂລກຣາມ",
    created_at: "2025-05-10 09:30:00",
    updated_at: "2025-05-10 09:30:00",
  },
  {
    id: 2,
    name: "ລິດ",
    created_at: "2025-05-10 10:15:00",
    updated_at: "2025-05-18 14:22:00",
  },
  {
    id: 3,
    name: "ຊິ້ນ",
    created_at: "2025-05-11 08:45:00",
    updated_at: "2025-05-11 08:45:00",
  },
  {
    id: 4,
    name: "ແມັດ",
    created_at: "2025-05-12 13:20:00",
    updated_at: "2025-05-15 11:10:00",
  },
  {
    id: 5,
    name: "ກ່ອງ",
    created_at: "2025-05-13 15:30:00",
    updated_at: "2025-05-13 15:30:00",
  },
]);

// Units data that will be displayed (from API or mock)
const units = ref<UnitApiModel[]>([]);
const useRealApi = ref<boolean>(false); // Toggle between mock and real API

// Form related
const formRef = ref();
const createModalVisible = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const deleteModalVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const selectedUnit = ref<UnitApiModel | null>(null);

// Form model
const formModel = reactive({
  name: "",
});

// Form validation rules
const rules = {
  name: [{ required: true, message: "ກະລຸນາປ້ອນຊື່ຫົວໜ່ວຍ", trigger: "blur" }],
};

// Load data on component mount
onMounted(async () => {
  await loadUnits();
});

// Function to load units from API or use mock data
const loadUnits = async (): Promise<void> => {
  if (useRealApi.value) {
    try {
      loading.value = true;
      const result = await unitStore.fetchUnits();

      // Convert domain entities to API model format
      units.value = result.data.map((unit: Unit) => ({
        id: parseInt(unit.getId()),
        name: unit.getName(),
        created_at: unit.getCreatedAt().toISOString().replace("T", " ").substring(0, 19),
        updated_at: unit.getUpdatedAt().toISOString().replace("T", " ").substring(0, 19),
      }));
    } catch (error) {
      console.error("Failed to fetch units from API:", error);
      // Fallback to mock data if API fails
      units.value = [...mockUnits.value];
    } finally {
      loading.value = false;
    }
  } else {
    // Use mock data
    units.value = [...mockUnits.value];
  }
};

// Toggle between mock and real API
const toggleApiMode = (): void => {
  useRealApi.value = !useRealApi.value;
  loadUnits();
};

// CRUD operations
const showCreateModal = (): void => {
  formModel.name = "";
  createModalVisible.value = true;
};

const showEditModal = (record: UnitApiModel): void => {
  selectedUnit.value = record;
  formModel.name = record.name;
  editModalVisible.value = true;
};

const showDeleteModal = (record: UnitApiModel): void => {
  selectedUnit.value = record;
  deleteModalVisible.value = true;
};

const handleCreate = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();

    if (useRealApi.value) {
      // Use API to create
      await unitStore.createUnit({ name: formModel.name });
      await loadUnits(); // Refresh the list
    } else {
      // Create new unit with current timestamp (mock)
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      const newUnit: UnitApiModel = {
        id: units.value.length + 1,
        name: formModel.name,
        created_at: now,
        updated_at: now,
      };
      units.value.push(newUnit);
      mockUnits.value.push(newUnit); // Update mock data for consistency
    }

    createModalVisible.value = false;
    formModel.name = "";
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

    if (selectedUnit.value) {
      if (useRealApi.value) {
        // Use API to update
        const id = selectedUnit.value.id.toString();
        await unitStore.updateUnit(id, { name: formModel.name });
        await loadUnits(); // Refresh the list
      } else {
        // Update the unit locally (mock)
        const index = units.value.findIndex((u) => u.id === selectedUnit.value!.id);
        if (index !== -1) {
          const now = new Date().toISOString().replace("T", " ").substring(0, 19);
          units.value[index] = {
            ...units.value[index],
            name: formModel.name,
            updated_at: now,
          };
          // Update mock data too
          const mockIndex = mockUnits.value.findIndex((u) => u.id === selectedUnit.value!.id);
          if (mockIndex !== -1) {
            mockUnits.value[mockIndex] = { ...units.value[index] };
          }
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
  if (!selectedUnit.value) return;

  loading.value = true;

  if (useRealApi.value) {
    try {
      // Use API to delete
      const id = selectedUnit.value.id.toString();
      await unitStore.deleteUnit(id);
      await loadUnits(); // Refresh the list
    } catch (error) {
      console.error("Delete failed:", error);
    }
  } else {
    // Filter out the deleted unit locally
    units.value = units.value.filter((u) => u.id !== selectedUnit.value!.id);
    // Update mock data too
    mockUnits.value = mockUnits.value.filter((u) => u.id !== selectedUnit.value!.id);
  }

  deleteModalVisible.value = false;
  loading.value = false;
};
</script>

<template>
  <div class="unit-list-container p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold">ລາຍການຫົວໜ່ວຍ</h1>
        <div class="flex items-center mt-2">
          <span class="mr-2 text-sm">ໂໝດ: {{ useRealApi ? "API ແທ້" : "Mock Data" }}</span>
          <button
            @click="toggleApiMode"
            class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            ສະລັບໂໝດ
          </button>
        </div>
      </div>

      <UiButton
        type="primary"
        icon="ant-design:plus-outlined"
        @click="showCreateModal"
        colorClass="flex items-center"
      >
        ເພີ່ມຫົວໜ່ວຍໃໝ່
      </UiButton>
    </div>

    <!-- Loading indicator -->
    <div v-if="unitStore.loading || loading" class="text-center py-4">
      <p>ກຳລັງໂຫຼດ...</p>
    </div>

    <!-- Units Table -->
    <Table :columns="columns" :dataSource="units" :pagination="{ pageSize: 10 }" row-key="id">
      <template #actions="{ record }">
        <div class="flex gap-2">
          <UiButton
            type="primary"
            icon="ant-design:edit-outlined"
            size="small"
            @click="showEditModal(record)"
            colorClass="flex items-center"
          >
            ແກ້ໄຂ
          </UiButton>
          <UiButton
            type="primary"
            danger
            icon="ant-design:delete-outlined"
            colorClass="flex items-center"
            size="small"
            @click="showDeleteModal(record)"
          >
            ລຶບ
          </UiButton>
        </div>
      </template>
    </Table>

    <!-- Create Modal -->
    <UiModal
      title="ເພີ່ມຫົວໜ່ວຍໃໝ່"
      :visible="createModalVisible"
      :confirm-loading="loading"
      @update:visible="createModalVisible = $event"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
    >
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem label="ຊື່ຫົວໜ່ວຍ" name="name" required>
          <UiInput v-model="formModel.name" placeholder="ກະລຸນາປ້ອນຊື່ຫົວໜ່ວຍ" />
        </UiFormItem>
      </UiForm>
    </UiModal>

    <!-- Edit Modal -->
    <UiModal
      title="ແກ້ໄຂຫົວໜ່ວຍ"
      :visible="editModalVisible"
      :confirm-loading="loading"
      @update:visible="editModalVisible = $event"
      @ok="handleEdit"
      @cancel="editModalVisible = false"
    >
      <UiForm ref="formRef" :model="formModel" :rules="rules">
        <UiFormItem label="ຊື່ຫົວໜ່ວຍ" name="name" required>
          <UiInput v-model="formModel.name" placeholder="ກະລຸນາປ້ອນຊື່ຫົວໜ່ວຍ" />
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
      <p>ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຫົວໜ່ວຍ "{{ selectedUnit?.name }}"?</p>
      <p class="text-red-500">ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.</p>
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
