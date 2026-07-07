<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import Table from "@/common/shared/components/table/Table.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import type { TablePaginationType } from "@/common/shared/components/table/Table.vue";
import { usePermissions } from "@/common/shared/store/usePermissions";
import { useExpressDisbursementRequestStore } from "@/modules/presentation/Admin/stores/express-disbursement-request/express-disbursement-request.store";
import { getColumns } from "./column";

const { t } = useI18n();
const router = useRouter();
const { hasPermission } = usePermissions();
const store = useExpressDisbursementRequestStore();

// TODO(express): re-enable permission gating once the backend defines the
// create/view/update-express-disbursement-request permissions. Temporarily
// forced to `true` for UI testing. Restore to:
//   ref(hasPermission("create-express-disbursement-request")) etc.
const canCreate = ref(true);
const canView = ref(true);
const canUpdate = ref(true);
void hasPermission;

const selectedStatusId = ref<string | number | undefined>(undefined);

const TERMINAL = ["APPROVED", "REJECTED", "CANCELED"];
const isTerminal = (status: string) => TERMINAL.includes((status || "").toUpperCase());

const dataSource = computed(() =>
  store.requests.map((r, idx) => ({
    key: r.getId() ?? String(idx),
    id: r.getId(),
    no: (store.pagination.page - 1) * store.pagination.limit + idx + 1,
    edr_number: r.getEdrNumber() ?? "-",
    purpose: r.getPurpose(),
    total: r.getTotal()?.toLocaleString?.() ?? r.getTotal(),
    status: r.getStatus(),
    createdAt: r.getCreatedAt(),
    _terminal: isTerminal(r.getStatus()),
  }))
);

const tablePagination = computed<TablePaginationType>(() => ({
  current: store.pagination.page,
  pageSize: store.pagination.limit,
  total: store.pagination.total,
}));

const summary = computed(() => {
  const find = (name: string) =>
    store.statusSummary.find(
      (s: any) => (s?.name || s?.status || "").toUpperCase() === name
    )?.count ?? 0;
  return {
    pending: find("PENDING"),
    approved: find("APPROVED"),
    rejected: find("REJECTED"),
  };
});

const loadData = async () => {
  await store.fetchAll({
    page: store.pagination.page,
    limit: store.pagination.limit,
    status_id: selectedStatusId.value,
  });
};

const handleSearch = async () => {
  store.pagination.page = 1;
  await loadData();
};

const handleTableChange = async (pagination: TablePaginationType) => {
  store.pagination.page = pagination.current || 1;
  store.pagination.limit = pagination.pageSize || 10;
  await loadData();
};

const goCreate = () => router.push({ name: "express_disbursement_request.create" });
const goDetail = (id: string) =>
  router.push({ name: "express_disbursement_request.detail", params: { id } });
const goEdit = (id: string) =>
  router.push({ name: "express_disbursement_request.edit", params: { id } });

onMounted(loadData);
onUnmounted(() => store.resetState());
</script>

<template>
  <div class="edr-list-container p-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
      <h1 class="text-2xl font-semibold">{{ t("expressDisbursementRequest.title") }}</h1>
      <div class="flex items-center justify-end flex-col sm:flex-row gap-2 w-full sm:w-fit">
        <a-select
          v-model:value="selectedStatusId"
          :placeholder="t('expressDisbursementRequest.filter.status')"
          allow-clear
          style="min-width: 180px"
          @change="handleSearch"
        >
          <a-select-option :value="1">{{ t("expressDisbursementRequest.status.pending") }}</a-select-option>
          <a-select-option :value="2">{{ t("expressDisbursementRequest.status.approved") }}</a-select-option>
          <a-select-option :value="3">{{ t("expressDisbursementRequest.status.rejected") }}</a-select-option>
        </a-select>
        <UiButton
          v-if="canCreate"
          type="primary"
          icon="ant-design:plus-outlined"
          colorClass="text-white flex items-center"
          @click="goCreate"
        >
          {{ t("expressDisbursementRequest.add") }}
        </UiButton>
      </div>
    </div>

    <!-- Status summary cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <div class="rounded-lg border p-4 bg-yellow-50">
        <div class="text-sm text-gray-500">{{ t("expressDisbursementRequest.status.pending") }}</div>
        <div class="text-2xl font-semibold text-yellow-600">{{ summary.pending }}</div>
      </div>
      <div class="rounded-lg border p-4 bg-green-50">
        <div class="text-sm text-gray-500">{{ t("expressDisbursementRequest.status.approved") }}</div>
        <div class="text-2xl font-semibold text-green-600">{{ summary.approved }}</div>
      </div>
      <div class="rounded-lg border p-4 bg-red-50">
        <div class="text-sm text-gray-500">{{ t("expressDisbursementRequest.status.rejected") }}</div>
        <div class="text-2xl font-semibold text-red-600">{{ summary.rejected }}</div>
      </div>
    </div>

    <Table
      :columns="getColumns(t)"
      :dataSource="dataSource"
      :pagination="tablePagination"
      :loading="store.loading"
      row-key="key"
      @change="handleTableChange"
    >
      <template #actions="{ record }">
        <div class="flex items-center justify-center gap-2">
          <UiButton
            v-if="canView"
            type=""
            icon="ant-design:eye-outlined"
            shape="circle"
            size="small"
            colorClass="flex items-center justify-center text-blue-500"
            @click="goDetail(record.id)"
          />
          <UiButton
            v-if="canUpdate"
            type=""
            icon="ant-design:edit-outlined"
            shape="circle"
            size="small"
            colorClass="flex items-center justify-center text-orange-400"
            :disabled="record._terminal"
            @click="!record._terminal && goEdit(record.id)"
          />
        </div>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.edr-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
