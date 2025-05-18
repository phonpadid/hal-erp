<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Unit Management</h1>
        <p class="text-gray-600">Manage your measurement units for products and items</p>
      </div>

      <UiButton
        type="primary"
        icon="ant-design:plus-outlined"
        @click="handleCreate"
        color-class="flex items-center"
      >
        New Unit
      </UiButton>
    </div>

    <!-- Search and Filter -->
    <div class="mb-4 flex space-x-4">
      <a-input-search
        v-model:value="searchQuery"
        placeholder="Search units by name..."
        enter-button
        @search="handleSearch"
        class="w-64"
      />

      <a-select v-model:value="filterDeleted" style="width: 160px" @change="handleFilterChange">
        <a-select-option :value="false">Active</a-select-option>
        <a-select-option :value="true">Include Deleted</a-select-option>
      </a-select>
    </div>

    <!-- Units Table -->
    <UiTable
      :columns="columns"
      :data-source="units"
      :pagination="tablePagination"
      :loading="loading"
      @change="handleTableChange"
    >
      <!-- Name Column -->
      <template #name="{ record }">
        {{ record.getName() }}
      </template>

      <!-- Created Date Column -->
      <template #createdAt="{ record }">
        {{ formatDate(record.getCreatedAt()) }}
      </template>

      <!-- Updated Date Column -->
      <template #updatedAt="{ record }">
        {{ formatDate(record.getUpdatedAt()) }}
      </template>

      <!-- Status Column -->
      <template #status="{ record }">
        <a-tag :color="record.isDeleted() ? 'red' : 'green'">
          {{ record.isDeleted() ? "Deleted" : "Active" }}
        </a-tag>
      </template>

      <!-- Action Column -->
      <template #action="{ record }">
        <div class="flex space-x-2">
          <template v-if="!record.isDeleted()">
            <a-button type="primary" size="small" @click="handleEdit(record)"> Edit </a-button>
            <a-button type="danger" size="small" @click="showDeleteConfirm(record)">
              Delete
            </a-button>
          </template>
          <template v-else>
            <a-button type="default" size="small" @click="handleRestore(record.getId())">
              Restore
            </a-button>
          </template>
        </div>
      </template>
    </UiTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUnits } from "../../composables/useUnit";
import { message, Modal } from "ant-design-vue";
import UiTable from "@/common/presentation/components/table/Table.vue";
import UiButton from "@/common/presentation/components/button/UiButton.vue";
import type { Unit } from "@/modules/domain/entities/Unit";
import type { TablePaginationType } from "@/common/presentation/components/table/Table.vue";

const router = useRouter();
const {
  units,
  loading,
  error,
  pagination,
  fetchUnits,
  deleteUnit,
  restoreUnit,
  searchUnitsByName,
} = useUnits();

// Table columns definition
const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: true,
  },
  {
    title: "Created Date",
    dataIndex: "createdAt",
    key: "createdAt",
    sorter: true,
  },
  {
    title: "Updated Date",
    dataIndex: "updatedAt",
    key: "updatedAt",
    sorter: true,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Actions",
    key: "action",
    width: 200,
  },
];

// Filter and search state
const searchQuery = ref("");
const filterDeleted = ref(false);

// Table pagination
const tablePagination = computed(() => ({
  current: pagination.value.page,
  pageSize: pagination.value.limit,
  total: pagination.value.total,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50", "100"],
}));

// Load units on component mounted
onMounted(() => {
  fetchUnits({ page: 1, limit: 10 });
});

// Format date for display
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Table event handlers
const handleTableChange = (
  pagination: TablePaginationType,
  filters: Record<string, string[]>,
  sorter: any
) => {
  const page = pagination.current || 1;
  const limit = pagination.pageSize || 10;

  const params = { page, limit };

  // Handle sorting if needed
  if (sorter && sorter.field) {
    const sortOrder = sorter.order === "ascend" ? "asc" : "desc";
    console.log(`Sort by ${sorter.field} ${sortOrder}`);
    // Here you could add sorting parameters to your API call
  }

  if (searchQuery.value) {
    searchUnitsByName(searchQuery.value, params);
  } else {
    fetchUnits(params, filterDeleted.value);
  }
};

// Search handler
const handleSearch = (value: string) => {
  searchQuery.value = value;

  if (value) {
    searchUnitsByName(value, { page: 1, limit: tablePagination.value.pageSize || 10 });
  } else {
    fetchUnits({ page: 1, limit: tablePagination.value.pageSize || 10 }, filterDeleted.value);
  }
};

// Filter handler
const handleFilterChange = (value: boolean) => {
  filterDeleted.value = value;
  fetchUnits({ page: 1, limit: tablePagination.value.pageSize || 10 }, value);
};

// Navigation handlers
const handleCreate = () => {
  router.push({ name: "UnitCreate" });
};

const handleEdit = (unit: Unit) => {
  router.push({ name: "UnitEdit", params: { id: unit.getId() } });
};

// Delete handlers
const showDeleteConfirm = (unit: Unit) => {
  Modal.confirm({
    title: "Are you sure you want to delete this unit?",
    content: `Unit: ${unit.getName()}`,
    okText: "Yes, delete it",
    okType: "danger",
    cancelText: "Cancel",
    onOk: () => handleDelete(unit.getId()),
  });
};

const handleDelete = async (id: string) => {
  try {
    await deleteUnit(id);
    message.success("Unit deleted successfully");
    // Refresh the list
    fetchUnits(
      {
        page: tablePagination.value.current || 1,
        limit: tablePagination.value.pageSize || 10,
      },
      filterDeleted.value
    );
  } catch (err) {
    message.error("Failed to delete unit");
    console.error("Delete error:", err);
  }
};

// Restore handler
const handleRestore = async (id: string) => {
  try {
    await restoreUnit(id);
    message.success("Unit restored successfully");
    // Refresh the list
    fetchUnits(
      {
        page: tablePagination.value.current || 1,
        limit: tablePagination.value.pageSize || 10,
      },
      filterDeleted.value
    );
  } catch (err) {
    message.error("Failed to restore unit");
    console.error("Restore error:", err);
  }
};

// Check for API errors and display messages
if (error.value) {
  message.error(`An error occurred: ${error.value.message}`);
}
</script>
