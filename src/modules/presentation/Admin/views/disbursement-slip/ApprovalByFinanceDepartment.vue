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
const loading = ref<boolean>(false);
import { useReceiptStore } from "../../stores/receipt.store";
import {
  getDocumentStatus,
  getStatusColor,
  getStatusIcon,
  getStatusText,
} from "@/modules/shared/utils/format-status.util";
import UiTag from "@/common/shared/components/tag/UiTag.vue";
import type { Dayjs } from "dayjs";
import { departmentStore } from "../../stores/departments/department.store";
const { t } = useI18n();
const { push } = useRouter();
const dpmStore = departmentStore();
const rStore = useReceiptStore();
const dpmOption = computed(() => [
  { value: "all", label: "ທັງໝົດ" }, // This is the "All" option
  ...dpmStore.departments.map((item) => ({
    value: item.getId(),
    label: item.getName(),
  })),
]);
const filterDate = ref<Dayjs | undefined>(undefined);
const filterDepartment = ref<string | undefined>("all");
const statusCards = computed(() => {
  const map: Record<
    string,
    { label: string; icon: string; textColor: string }
  > = {
    PENDING: {
      label: t("purchase-rq.card_title.padding"),
      icon: "solar:document-text-bold",
      textColor: "text-yellow-600",
    },
    APPROVED: {
      label: t("purchase-rq.card_title.success"),
      icon: "solar:clipboard-check-bold",
      textColor: "text-green-600",
    },
    REJECTED: {
      label: t("purchase-rq.card_title.refused"),
      icon: "solar:clipboard-remove-bold",
      textColor: "text-red-600",
    },
  };

  // make lookup from API result
  const lookup: Record<string, number> = {};
  rStore.status?.forEach((item) => {
    lookup[item.status] = item.amount || 0;
  });

  // always return all statuses
  return Object.entries(map).map(([key, cfg]) => ({
    ...cfg,
    count: lookup[key] ?? 0, // default to 0 if missing
  }));
});

const details = (id: string) => {
  push({
    name: "approval-by-finance-department-detail.index",
    params: { id: id },
  });
};
const loadReceipt = async (): Promise<void> => {
  try {
    loading.value = true;
    await rStore.fetchAll({
      // ⬅ add await here
      page: rStore.pagination.page,
      limit: rStore.pagination.limit,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};
const searchByDate = async () => {
  loading.value = true;
  try {
    await rStore.fetchAll({
      page: 1,
      limit: rStore.pagination.limit,
      order_date: filterDate.value ? filterDate.value.toISOString().split("T")[0] : undefined,
    });
    rStore.setPagination({ ...rStore.pagination, page: 1 });
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async (pagination: TablePaginationType) => {
  rStore.setPagination({
    page: pagination.current || 1,
    limit: pagination.pageSize || 10,
    total: pagination.total ?? 0,
  });
  await loadReceipt();
};
// Function to fetch receipts with filters
const loadFilteredReceipts = async () => {
  loading.value = true;
  try {
    await rStore.fetchAll({
      page: 1,
      limit: rStore.pagination.limit,
      order_date: filterDate.value ? filterDate.value.format("YYYY-MM-DD") : undefined,
      department_id: filterDepartment.value !== "all" ? filterDepartment.value : undefined,
    });
    rStore.setPagination({ ...rStore.pagination, page: 1 });
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};
watch([filterDate, filterDepartment], () => {
  loadFilteredReceipts();
});
onMounted(async () => {
  await loadReceipt();
  await loadFilteredReceipts();
  await dpmStore.fetchDepartment({ page: 1, limit: 1000 });
});
</script>

<template>
  <div class="container mx-auto py-4">
    <!-- Header Cards -->
    <div class="bg-white rounded-md shadow-sm p-2 py-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="(card, index) in statusCards" :key="index">
          <UiAvatar
            size="large"
            :icon="card.icon"
            color="#333446"
            class="flex justify-center items-center text-3xl"
          />
          <div>
            <p class="text-gray-600 mt-2">{{ card.label }}</p>
            <p class="text-xl font-semibold" :class="card.textColor">
              {{ card.count }} {{ t("menu-sidebar.receipt") }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="search flex md:w-[56rem] flex-col md:flex-row justify-between gap-[14rem]"
      >
        <div class="input flex flex-col md:flex-row gap-4 flex-1">
          <div class="search-by-doc-type w-full">
            <label
              for=""
              class="block text-sm font-medium text-gray-700 mb-1"
              >{{ t("purchase-rq.field.doc_type") }}</label
            >
            <InputSelect
              :options="dpmOption"
              v-model="filterDepartment"
              placeholder="ເລືອກພະແນກ"
              class="w-full"
            />
          </div>
          <div class="search-by-status w-full">
            <label
              for=""
              class="block text-sm font-medium text-gray-700 mb-1"
              >{{ t("purchase-rq.field.rq_date") }}</label
            >
            <DatePicker
              v-model:value="filterDate"
              :placeholder="t('purchase-rq.phd.rq_date')"
              class="w-full"
            />
          </div>
          <div class="search-button flex items-end">
            <UiButton
              icon="ant-design:search-outlined"
              color-class="flex items-center justify-center gap-2"
              class="w-full md:w-auto px-6"
              @click="searchByDate"
            >
              <span>{{ t("purchase-rq.search") }}</span>
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="mt-4 bg-white rounded-md shadow-sm p-1">
      <Table
        :columns="columns(t)"
        :dataSource="rStore.receipts"
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
        <template #status="{ record }">
          <!-- {{ record.user_approval.document_status.name }} -->
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
