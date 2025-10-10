<script setup lang="ts">
import Table, {
  type TablePaginationType,
} from "@/common/shared/components/table/Table.vue";
import { useI18n } from "vue-i18n";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { columns } from "./column";
import { DatePicker } from "ant-design-vue";
import type { Dayjs } from "dayjs";
import { departmentStore } from "../../stores/departments/department.store";
import { useReportPrStore } from "../../stores/reports/report-pr.store";
import {
  getDocumentStatus,
  getStatusColor,
  getStatusIcon,
  getStatusText,
} from "@/modules/shared/utils/format-status.util";
import UiTag from "@/common/shared/components/tag/UiTag.vue";
import { formatPrice } from "@/modules/shared/utils/format-price";

const { t } = useI18n();
const { push } = useRouter();
const dpmStore = departmentStore();
const rStore = useReportPrStore();

const loading = ref<boolean>(false);

// 🔹 Dropdown options
const dpmOption = computed(() => [
  { value: "all", label: "ທັງໝົດ" },
  ...dpmStore.departments.map((item) => ({
    value: item.getId(),
    label: item.getName(),
  })),
]);

const statusOption = [
  { value: "all", label: "ທັງໝົດ" },
  { value: 1, label: "ລໍຖ້າ" },
  { value: 2, label: "ສຳເລັດ" },
  { value: 3, label: "ປະຕິເສດ" },
];

// 🔹 Filters
const filterDepartment = ref<string>("all");
const filterStatus = ref<string>("all");
const filterDateRange = ref<[Dayjs, Dayjs] | undefined>();

// 🔹 Status Cards (same as before)
const statusCards = computed(() => {
  const map = {
    PENDING: {
      label: t("purchase-rq.card_title.padding"),
      icon: "solar:document-text-bold",
      textColor: "text-yellow-700",
      bgGradient:
        "bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400",
    },
    APPROVED: {
      label: t("purchase-rq.card_title.success"),
      icon: "solar:clipboard-check-bold",
      textColor: "text-green-700",
      bgGradient: "bg-gradient-to-br from-green-200 via-green-300 to-green-400",
    },
    REJECTED: {
      label: t("purchase-rq.card_title.refused"),
      icon: "solar:clipboard-remove-bold",
      textColor: "text-red-700",
      bgGradient: "bg-gradient-to-br from-red-200 via-red-300 to-red-400",
    },
  };

  const lookup: Record<string, number> = {};
  const moneyLookup: Record<string, number> = {};

  rStore.status?.forEach((item) => (lookup[item.status] = item.amount || 0));
  rStore.report_money?.forEach(
    (item) => (moneyLookup[item.status] = item.total || 0)
  );

  const cards = Object.entries(map).map(([key, cfg]) => ({
    ...cfg,
    count: lookup[key] ?? 0,
    total: moneyLookup[key] ?? 0,
  }));

  const totalCount = cards.reduce((sum, c) => sum + c.count, 0);
  const totalMoney = cards.reduce((sum, c) => sum + c.total, 0);

  return [
    {
      label: "ທັງໝົດ",
      icon: "solar:wallet-bold",
      textColor: "text-blue-700",
      bgGradient: "bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400",
      count: totalCount,
      total: totalMoney,
    },
    ...cards,
  ];
});
// 🔹 Load data with filters applied
const loadFilteredReceipts = async () => {
  loading.value = true;
  try {
    const params = {
      page: rStore.pagination.page,
      limit: rStore.pagination.limit,
      department_id:
        filterDepartment.value !== "all" ? filterDepartment.value : "",
      status_id: filterStatus.value !== "all" ? filterStatus.value : "",
      requested_date_start: filterDateRange.value
        ? filterDateRange.value[0].format("YYYY-MM-DD")
        : "",
      requested_date_end: filterDateRange.value
        ? filterDateRange.value[1].format("YYYY-MM-DD")
        : "",
    };
    await rStore.reportPr(params);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 🔹 Table pagination change
const handleTableChange = async (pagination: TablePaginationType) => {
  rStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total ?? 0,
  });
  await loadFilteredReceipts();
};

// 🔹 Detail navigation
const details = (id: string) => {
  push({ name: "purchase_request_detail", params: { id } });
};

// 🔹 Init
onMounted(async () => {
  await dpmStore.fetchDepartment({ page: 1, limit: 1000 });
  await loadFilteredReceipts();
  await rStore.reportMoney();
});
const clearFilters = async () => {
  filterDepartment.value = "all";
  filterStatus.value = "all";
  filterDateRange.value = undefined;
  await loadFilteredReceipts();
};
watch([filterDepartment, filterStatus, filterDateRange], async () => {
  await loadFilteredReceipts();
});
</script>

<template>
  <div class="container mx-auto py-4">
    <!-- Header Cards -->
    <div class="bg-white rounded-md shadow-sm p-2 py-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          v-for="(card, index) in statusCards"
          :key="index"
          class="relative overflow-hidden p-4 rounded-md ring-1 ring-gray-100/90 transition hover:scale-[1.01]"
        >
        <!-- :class="card.bgGradient" -->
          <div
            class="absolute inset-0 opacity-10 blur-0"
            :class="card.bgGradient"
          >
          <img src="/public/watermark.jpeg" alt="" srcset="">
          </div>
          <div class="relative z-10">
            <div class="flex items-center gap-2">
              <UiAvatar
                size="default"
                :icon="card.icon"
                class="text-3xl flex items-center"
                :class="card.textColor"
              />
              <span class="font-medium text-gray-700">{{ card.label }}</span>
            </div>

            <div class="mt-2">
              <p class="text-xl font-semibold" :class="card.textColor">
                {{ card.count }} {{ t("purchase-rq.field.proposal") }}
              </p>
              <p
                class="-mt-4 text-md font-medium -mb-2"
                :class="card.textColor"
              >
                ₭ {{ formatPrice(card.total) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="search mt-4 flex flex-col md:flex-row gap-4 md:gap-6">
        <div class="flex flex-col md:flex-row gap-4 flex-1">
          <!-- Department -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("departments.dpm_user.field.department") }}
            </label>
            <InputSelect
              :options="dpmOption"
              v-model="filterDepartment"
              placeholder="ເລືອກພະແນກ"
              class="w-full"
            />
          </div>

          <!-- Status -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("purchase-rq.field.status") }}
            </label>
            <InputSelect
              :options="statusOption"
              v-model="filterStatus"
              placeholder="ເລືອກສະຖານະ"
              class="w-full"
            />
          </div>

          <!-- Date Range -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("purchase-rq.field.rq_date") }}
            </label>
            <DatePicker.RangePicker
              v-model:value="filterDateRange"
              :placeholder="[
                'DD/MM/YYYY',
                'DD/MM/YYYY',

              ]"
              class="w-full"
            />
          </div>

          <!-- Search Button -->
          <div class="flex items-end gap-2">
            <UiButton
              icon="ant-design:search-outlined"
              color-class="flex items-center justify-center gap-2"
              class="w-full md:w-auto px-6"
              @click="loadFilteredReceipts"
            >
              <span>{{ t("purchase-rq.search") }}</span>
            </UiButton>
            <UiButton
              icon="ant-design:close-circle-outlined"
              color-class="flex items-center justify-center gap-2"
              class="w-full md:w-auto px-6 bg-gray-100 text-gray-700 hover:bg-gray-200"
              @click="clearFilters"
            >
              <span>Clear</span>
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="mt-4 bg-white rounded-md shadow-sm p-1">
      <Table
        :columns="columns(t)"
        :dataSource="rStore.report_pr"
        :pagination="{
          current: rStore.pagination.page,
          pageSize: rStore.pagination.limit,
          total: rStore.pagination.total,
        }"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
      >
        <template #id="{ index }">
          {{ index + 1 }}
        </template>

        <template #total="{ record }">
          ₭ {{ formatPrice(record.total) }}
        </template>

        <template #status="{ record }">
          <UiTag
            class="inline-flex justify-start items-center w-auto rounded-full"
            :color="getStatusColor(getDocumentStatus(record))"
            :icon="getStatusIcon(getDocumentStatus(record))"
            :text="getStatusText(getDocumentStatus(record))"
          />
        </template>

        <template #actions="{ record }">
          <div class="flex items-center justify-center gap-2">
            <UiButton
              type="link"
              icon="ant-design:eye-outlined"
              color-class="flex items-center text-red-500 hover:!text-red-800"
              @click="details(record.id)"
            >
              {{ t("purchase-rq.description") }}
            </UiButton>
          </div>
        </template>
      </Table>
    </div>
  </div>
</template>

