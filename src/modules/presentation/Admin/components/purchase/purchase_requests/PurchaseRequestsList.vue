<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseRequestsStore } from "../../../stores/purchase_requests/purchase-requests.store";
import { columns } from "./column";
import { useI18n } from "vue-i18n";
import { formatDate } from "@/modules/shared/formatdate";
import { usePermissions } from "@/modules/shared/utils/usePermissions";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import Table from "@/common/shared/components/table/Table.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import DateTime from "@/common/shared/components/Datepicker/DateTime.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const filterType = ref<string | null>(null);
const router = useRouter();
const dates = reactive({
  startDate: null,
  endDate: null,
});
const { hasPermission } = usePermissions();
const { t } = useI18n();
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const purchaseRequestStore = usePurchaseRequestsStore();

// check permission to view this page
const canViewPurchaseRequests = hasPermission("read-purchase-request");

const tablePagination = computed(() => ({
  current: purchaseRequestStore.pagination.page,
  pageSize: purchaseRequestStore.pagination.limit,
  total: purchaseRequestStore.pagination.total,
  showSizeChanger: true,
}));

const statusCounts = computed(() => {
  return purchaseRequestStore.statusSummary.reduce((acc, current) => {
    const statusKey = current.status.toLowerCase();
    acc[statusKey] = current.amount;
    return acc;
  }, {} as Record<string, number>);
});
const statusCards = computed(() => {
  const counts = statusCounts.value; // { pending: 18, approved: 0, ... }

  return [
    {
      key: "pending",
      label: t("purchase-rq.status.pending"),
      count: counts.pending ?? 0,
      textColor: "text-yellow-600",
    },
    // {
    //   key: "approved",
    //   label: t("purchase-rq.status.approved"),
    //   count: counts.approved ?? 0,
    //   textColor: "text-green-600",
    // },
    // {
    //   key: "rejected",
    //   label: t("purchase-rq.status.rejected"),
    //   count: counts.rejected ?? 0,
    //   textColor: "text-red-600",
    // },
  ];
});

const handleDetailsDocument = (id: any) => {
  router.push({ name: "purchaseRequestsDetail", params: { id } });
};

const documentTypes = [
  { label: "ທັງໝົດ", value: "all" },
  { label: "ພະແນກ", value: "department" },
  { label: "ສາຂາ", value: "branch" },
];

const fetchData = async () => {
  loading.value = true;
  try {
    const apiParams: any = {
      page: currentPage.value,
      limit: pageSize.value,
    };
    await purchaseRequestStore.fetchAll(apiParams);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  console.log("Searching with:", {
    type: filterType.value,
    dateRange: dates,
  });
};

// Handle table change
const handleTableChange = (pagination: any) => {
  currentPage.value = pagination.current;
  pageSize.value = pagination.pageSize;
  fetchData();
};
onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <!-- Header with document count -->
  <div>
    <UiAvatar
      icon="solar:document-add-linear"
      color="#333446"
      class="flex justify-center items-center text-2xl"
    />
    <span class="text-sm">{{ t("purchase-rq.field.proposal") }}</span>
  </div>
  <br />

  <div class="flex items-center gap-6 mb-6">
    <div v-for="card in statusCards" :key="card.key" class="flex items-center gap-2">
      <h1 class="text-xl font-semibold" :class="card.textColor">
        {{ card.count }} {{ t("purchase-rq.field.proposal") }}
      </h1>
    </div>
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
        <DateTime v-model="dates.startDate" placeholder="ວັນທີ" />
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
      :data-source="purchaseRequestStore.requests"
      :pagination="tablePagination"
      @change="handleTableChange"
      :loading="loading"
    >
      <template #username="{ record }">
        <span class="text-gray-600">{{ record.getRequester()?.username }}</span>
      </template>
      <template #department="{ record }">
        <span class="text-gray-600">{{ record.getDepartment()?.name }}</span>
      </template>
      <template #requested_date="{ record }">
        <span class="text-gray-600">{{ formatDate(record.requested_date) }}</span>
      </template>
      <!-- Custom cell rendering for actions column -->
      <template #actions="{ record }">
        <UiButton
          v-if="canViewPurchaseRequests"
          type="link"
          icon="ant-design:eye-outlined"
          color-class="flex items-center text-red-500 hover:!text-red-900"
          @click="() => handleDetailsDocument(record.getId())"
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
