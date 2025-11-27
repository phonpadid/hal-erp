<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { columns } from "../../views/approval-department/column/cloumn";
import { useI18n } from "vue-i18n";
import { usePurchaseOrderStore } from "@/modules/presentation/Admin/stores/purchase_requests/purchase-order";
import { formatDate } from "@/modules/shared/formatdate";
import { departmentStore } from "../../stores/departments/department.store";
import { usePermissions } from "@/modules/shared/utils/usePermissions";
import UiTag from "@/common/shared/components/tag/UiTag.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import Table from "@/common/shared/components/table/Table.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import DatePicker from "@/common/shared/components/Datepicker/DatePicker.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

/******************************************************** */
const { hasPermission } = usePermissions();
const { t } = useI18n();
const selectedDepartment = ref<string | null>(null);
const router = useRouter();
const purchaseOrderStore = usePurchaseOrderStore();
const departmentStoreInstance = departmentStore();
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const dates = reactive({
  startDate: null,
  endDate: null,
});
/************************Check Button Show******************************* */
const canViewDetails = computed(() => hasPermission('read-department-approver'));



const handleDetailsDocument = (record: any) => {
  // console.log("Viewing details for document:", record);
  router.push({ name: "approval_department_panak_detail", params: { id: record.id } });
};
const tablePagination = computed(() => ({
  current: purchaseOrderStore.pagination.page,
  pageSize: purchaseOrderStore.pagination.limit,
  total: purchaseOrderStore.pagination.total,
  showSizeChanger: true,
}));

// Computed properties for status counts
const pendingCount = computed(
  () => purchaseOrderStore.statusSummary.find((s) => s.status === "PENDING")?.amount || 0
);
const completedCount = computed(
  () => purchaseOrderStore.statusSummary.find((s) => s.status === "APPROVED")?.amount || 0
);
const rejectedCount = computed(
  () => purchaseOrderStore.statusSummary.find((s) => s.status === "REJECTED")?.amount || 0
);

// Convert departments to options format for select component
const departmentOptions = computed(() => {
  // Add "All" option at the beginning
  const allOption = { label: "ທັງໝົດ", value: "all" };

  // Map departments to the format expected by the select component
  const options = departmentStoreInstance.departments.map((department) => ({
    label: department.getName(),
    value: department.getId(),
  }));

  return [allOption, ...options];
});

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "ant-design:clock-circle-outlined";
    case "APPROVED":
      return "ant-design:check-circle-outlined";
    case "REJECTED":
      return "ant-design:close-circle-outlined";
    default:
      return "";
  }
};

const getStatusText = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "ກຳລັງດຳເນີນການ";
    case "APPROVED":
      return "ສຳເລັດ";
    case "REJECTED":
      return "ປະຕິເສດ";
    default:
      return status || "N/A";
  }
};

const getDocumentStatus = (record: any) => {
  return record.getUserApproval()?.document_status?.name || "N/A";
};

const handleSearch = async () => {
  currentPage.value = 1;
  await fetchData();
};

const handleTableChange = async (pagination: any) => {
  // Create a pagination params object
  currentPage.value = pagination.current;
  pageSize.value = pagination.pageSize;
  fetchData();
};

const fetchData = async () => {
  loading.value = true;
  try {
    const apiParams: any = {
      page: currentPage.value,
      limit: pageSize.value,
      column: "id",
      sort_order: "DESC",
    };

    // เพิ่ม department_id ถ้าเลือกแล้วและไม่ใช่ "all"
    if (selectedDepartment.value && selectedDepartment.value !== "all") {
      apiParams.department_id = selectedDepartment.value;
    }

    // เพิ่ม order_date ถ้ามีการเลือกวันที่ (ใช้แค่ startDate)
    if (dates.startDate) {
      const formattedDate = new Date(dates.startDate).toISOString().split('T')[0];
      apiParams.order_date = formattedDate;
    }

    await purchaseOrderStore.fetchAll(apiParams);
  } finally {
    loading.value = false;
  }
};

// Handle department selection change
const handleDepartmentChange = (value: string | null) => {
  selectedDepartment.value = value;
  // console.log("Selected department:", value);
};

// Fetch all departments (no pagination)
const fetchAllDepartments = async () => {
  try {
    // Set a very large limit to get all departments
    await departmentStoreInstance.fetchDepartment({ page: 1, limit: 1000 });
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
};

// Fetch initial data
onMounted(async () => {
  // Fetch ALL departments data
  await fetchAllDepartments();

   await purchaseOrderStore.fetchAll({ 
    page: currentPage.value, 
    limit: pageSize.value 
  });
});
</script>

<template>
  <!-- Header with document count -->
  <div class="grid grid-cols-3">
    <div>
      <UiAvatar
        icon="solar:document-text-bold"
        color="#333446"
        class="flex justify-center items-center text-2xl"
      />
      <span class="text-sm">ກຳລັງດຳເນີນການ</span>
    </div>
    <div>
      <UiAvatar
        icon="solar:clipboard-check-bold"
        color="#333446"
        class="flex justify-center items-center text-2xl"
      />
      <span class="text-sm">ສຳເລັດ</span>
    </div>
    <div>
      <UiAvatar
        icon="solar:clipboard-remove-bold"
        color="#333446"
        class="flex justify-center items-center text-2xl"
      />
      <span class="text-sm">ປະຕິເສດ</span>
    </div>
  </div>
  <div></div>
  <div class="grid grid-cols-3 mt-2">
    <h1 class="text-xl font-semibold text-yellow-600">{{ pendingCount }} ໃບສະເໜີ</h1>
    <h1 class="text-xl font-semibold text-green-600">{{ completedCount }} ໃບສະເໜີ</h1>
    <h1 class="text-xl font-semibold text-red-600">{{ rejectedCount }} ໃບສະເໜີ</h1>
  </div>

  <!-- Filters section -->
  <div class="bg-white p-2 rounded-lg shadow-sm">
    <div class="flex items-center gap-4">
      <!-- Department Select using data from departmentStore -->
      <div class="w-64">
        <InputSelect
          v-model:modelValue="selectedDepartment"
          :options="departmentOptions"
          placeholder="ເລືອກພະແນກ"
          @change="handleDepartmentChange"
          :loading="departmentStoreInstance.loading"
        />
      </div>

      <!-- Date Range Picker -->
      <div class="flex-grow">
        <DatePicker
          v-model:modelValueStart="dates.startDate"
          :cols="8"
        />
      </div>

      <!-- Search Button -->
      <UiButton
        type="primary"
        icon="ant-design:search-outlined"
        @click="handleSearch"
        color-class="flex items-center "
      >
        ຄົ້ນຫາ
      </UiButton>
    </div>
  </div>

  <!-- Table section -->
  <div class="bg-white rounded-lg shadow-sm">
    <Table
      :columns="columns(t)"
      :loading="purchaseOrderStore.loading"
      :data-source="purchaseOrderStore.orders"
      :pagination="tablePagination"
      @change="handleTableChange"
      row-key="id"
    >
      <!-- Custom cell rendering for actions column -->
      <template #status="{ record }">
        <UiTag
          :color="getStatusColor(getDocumentStatus(record))"
          :icon="getStatusIcon(getDocumentStatus(record))"
          :text="getStatusText(getDocumentStatus(record))"
        />
      </template>
      <template #po_number="{ record }">
        <span class="font-semibold">{{ record.getPurchaseRequest()?.pr_number }}</span>
      </template>

      <template #requester="{ record }">
        <span>{{ record.getRequester()?.username }}</span>
      </template>

      <template #created_at="{ record }">
        <span>{{ formatDate(record.getCreatedAt()) }}</span>
      </template>
      <template #action="{ record }">
        <UiButton
          v-if="canViewDetails"
          type="link"
          icon="ant-design:eye-outlined"
          color-class="flex items-center text-red-500 hover:!text-red-900"
          @click="() => handleDetailsDocument(record)"
        >
          ລາຍລະອຽດ
        </UiButton>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.custom-radio-group {
  display: flex;
  gap: 1rem;
}
</style>
