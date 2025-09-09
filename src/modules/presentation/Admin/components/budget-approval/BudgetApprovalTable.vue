<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { columnsApproval } from "../../views/budget/budget-approval/column/cloumn";
import { useI18n } from "vue-i18n";
import { usePurchaseOrderStore } from "../../stores/purchase_requests/purchase-order";
import { formatDate } from "@/modules/shared/formatdate";
import UiTag from "@/common/shared/components/tag/UiTag.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import Table from "@/common/shared/components/table/Table.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import DatePicker from "@/common/shared/components/Datepicker/DatePicker.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

/******************************************************** */
const { t } = useI18n();
const filterType = ref<string | null>(null);
const router = useRouter();
const store = usePurchaseOrderStore();
const dates = reactive({
  startDate: null,
  endDate: null,
});

// Computed properties for status counts
const pendingCount = computed(
  () => store.statusSummary.find((s) => s.status === "PENDING")?.amount || 0
);
const completedCount = computed(
  () => store.statusSummary.find((s) => s.status === "COMPLETED")?.amount || 0
);
const rejectedCount = computed(
  () => store.statusSummary.find((s) => s.status === "REJECTED")?.amount || 0
);
const getDocumentStatus = (record: any) => {
  return record.getUserApproval()?.document_status?.name || "N/A";
};

const handleDetailsDocument = (record: any) => {
  // console.log("Viewing details for document:", record);
  router.push({ name: "budget-approval-detail", params: { id: record.id } });
};

const documentTypes = [
  { label: "ທັງໝົດ", value: "all" },
  { label: "ພະແນກ", value: "department" },
  { label: "ສາຂາ", value: "branch" },
];

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "warning";
    case "COMPLETED":
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
    case "COMPLETED":
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
    case "COMPLETED":
      return "ສຳເລັດ";
    case "REJECTED":
      return "ປະຕິເສດ";
    default:
      return status || "N/A";
  }
};

const handleSearch = async () => {
  await store.fetchAll({
    page: 1,
    limit: 10,
  });
};

const handleTableChange = async (pagination: any) => {
  await store.fetchAll({
    page: pagination.current,
    limit: pagination.pageSize,
  });
};

onMounted(async () => {
  await store.fetchAll();
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
  <div class="flex items-center gap-4">
    <span>ໜ່ວຍງານ</span>
    <a-radio-group v-model:value="filterType" class="flex gap-4">
      <a-radio value="department">ພະແນກ</a-radio>
      <a-radio value="branch">ສາຂາ</a-radio>
    </a-radio-group>
    <span class="ml-4">ວັນທີສະເໜີ</span>
  </div>

  <div class="bg-white p-2 rounded-lg shadow-sm">
    <div class="flex items-center gap-4">
      <!-- Radio buttons -->
      <!-- Department/Branch Select -->
      <div class="w-64">
        <InputSelect v-model:value="filterType" :options="documentTypes" placeholder="ເລືອກພະແນກ" />
      </div>

      <!-- Date Range Picker -->
      <div class="flex-grow">
        <DatePicker
          v-model:modelValueStart="dates.startDate"
          v-model:modelValueEnd="dates.endDate"
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
      :columns="columnsApproval(t)"
      :loading="store.loading"
      :data-source="store.orders"
      :pagination="store.pagination"
      @change="handleTableChange"
    >
      <!-- Custom cell rendering for actions column -->
      <template #status="{ record }">
        <UiTag
          :color="getStatusColor(getDocumentStatus(record))"
          :icon="getStatusIcon(getDocumentStatus(record))"
          :text="getStatusText(getDocumentStatus(record))"
        />
      </template>
      <template #orderNumber="{ record }">
        <span class="font-semibold">{{ record.getPurchaseRequest()?.pr_number }}</span>
      </template>

      <template #vendorName="{ record }">
        <span>{{ record.getRequester()?.username }}</span>
      </template>

      <template #orderDate="{ record }">
        <span>{{ formatDate(record.getCreatedAt()) }}</span>
      </template>
      <template #action="{ record }">
        <UiButton
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
