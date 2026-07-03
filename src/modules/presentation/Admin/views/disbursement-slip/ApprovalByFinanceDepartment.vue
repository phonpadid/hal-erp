<script setup lang="ts">
import Table, {
  type TablePaginationType,
} from "@/common/shared/components/table/Table.vue";
import { useI18n } from "vue-i18n";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
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
import dayjs, { type Dayjs } from "dayjs";
import { departmentStore } from "../../stores/departments/department.store";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useGlobalSearchStore } from "../../stores/global-search.store";
import { storeToRefs } from "pinia";
import QuickApprovalPreviewModal from "@/common/shared/components/Modal/QuickApprovalPreviewModal.vue";
import type { IApprovalReceiptDto } from "@/modules/application/dtos/receipt.dto";
import { useDocumentStatusStore } from "../../stores/document-status.store";
const { t } = useI18n();
const router = useRouter();
const { push } = router;
const route = useRoute();
const { success, error: showError } = useNotification();
const dpmStore = departmentStore();
const rStore = useReceiptStore();
const documentStatusStore = useDocumentStatusStore();
const globalSearchStore = useGlobalSearchStore();
const { trimmedKeyword: globalSearchKeyword, trigger: globalSearchTrigger } =
  storeToRefs(globalSearchStore);

// Read initial state from URL (page/limit/filters)
const queryPage = Number(route.query.page);
const queryLimit = Number(route.query.limit);
if (Number.isFinite(queryPage) && queryPage > 0) {
  rStore.pagination.page = queryPage;
}
if (Number.isFinite(queryLimit) && queryLimit > 0) {
  rStore.pagination.limit = queryLimit;
}
const filterDepartment = ref<string | undefined>(
  typeof route.query.department_id === "string" ? route.query.department_id : "all"
);
const filterType = ref<string>(
  typeof route.query.type === "string" ? route.query.type : "all"
);
const filterDate = ref<Dayjs | undefined>(
  typeof route.query.order_date === "string" && route.query.order_date
    ? dayjs(route.query.order_date)
    : undefined
);
const STATUS_USER_NAMES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;
const filterStatusUserId = ref<string>(
  typeof route.query.status_user_id === "string" ? route.query.status_user_id : ""
);
const isPaginationChanging = ref<boolean>(false);

const syncStateToUrl = () => {
  router.replace({
    query: {
      ...route.query,
      page: String(rStore.pagination.page),
      limit: String(rStore.pagination.limit),
      type: filterType.value,
      department_id:
        filterDepartment.value && filterDepartment.value !== "all"
          ? filterDepartment.value
          : undefined,
      order_date: filterDate.value ? filterDate.value.format("YYYY-MM-DD") : undefined,
      status_user_id: filterStatusUserId.value || "all",
    },
  });
};

const dpmOption = computed(() => [
  { value: "all", label: "ທັງໝົດ" }, // This is the "All" option
  ...dpmStore.departments.map((item) => ({
    value: item.getId(),
    label: item.getName(),
  })),
]);

// Filter type options
const filterTypeOptions = computed(() => [
  { value: "all", label: t("purchase-rq.filter_type.all") },
  { value: "only_user", label: t("purchase-rq.filter_type.only_user") },
]);

// Status user filter options sourced from document-status API, filtered to the
// fixed set PENDING/APPROVED/REJECTED/CANCELLED. Values are the real IDs.
const statusUserOptions = computed(() =>
  documentStatusStore.document_Status
    .filter((s) =>
      (STATUS_USER_NAMES as readonly string[]).includes(s.getName())
    )
    .map((s) => ({
      value: String(s.getId()),
      label: t(`purchase-rq.status_user.${s.getName()}`),
    }))
);

const pendingStatusId = computed(() => {
  const item = documentStatusStore.document_Status.find(
    (s) => s.getName() === "PENDING"
  );
  return item ? String(item.getId()) : "";
});

const ensureValidStatusUserId = () => {
  // "all" sentinel = user explicitly cleared the filter; keep it empty.
  if (filterStatusUserId.value === "all") {
    filterStatusUserId.value = "";
    return;
  }
  const validIds = statusUserOptions.value.map((opt) => opt.value);
  if (!filterStatusUserId.value || !validIds.includes(filterStatusUserId.value)) {
    filterStatusUserId.value = pendingStatusId.value;
  }
};

const handleStatusUserChange = (value: unknown) => {
  filterStatusUserId.value = typeof value === "string" ? value : "";
};

// Export Excel state
const exportStartDate = ref<string | undefined>(undefined);
const exportEndDate = ref<string | undefined>(undefined);
const exportLoading = ref(false);

const handleExportExcel = async () => {
  try {
    exportLoading.value = true;
    const startDate = exportStartDate.value || undefined;
    const endDate = exportEndDate.value || undefined;
    const ok = await rStore.exportExcelAll(startDate, endDate);
    if (ok) {
      success(t("purchase-rq.success.title"), t("purchase-rq.export.success"));
    } else {
      showError(t("purchase-rq.export.failed"), rStore.error?.message || "");
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    showError(t("purchase-rq.export.failed"), errorMessage);
  } finally {
    exportLoading.value = false;
  }
};
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

// Quick preview modal state
const previewVisible = ref(false);
const previewLoading = ref(false);
const previewSubmitting = ref(false);
const previewId = ref<string | null>(null);
const previewDocNumber = ref("");
const previewPurpose = ref("");
const previewTotal = ref(0);
const previewCanApprove = ref(false);
const previewCurrentStep = ref<{ id: number; is_otp: boolean } | null>(null);
const previewAccountCodeSet = ref(false);

const computeCurrentApprovalStep = (receipt: any) => {
  if (!receipt) return null;
  const userDataStr = localStorage.getItem("userData");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
  if (!userData?.username) return null;
  const steps = receipt.user_approval?.approval_step;
  if (!Array.isArray(steps)) return null;
  const pendingStep = steps.find((s: any) => s.status_id === 1);
  if (!pendingStep?.doc_approver?.length) return null;
  // Backend-provided next-approver username is authoritative; it handles
  // approvers whose doc_approver.department is null (e.g. president-level).
  const userLastApproval = receipt?.user_last_approval ?? null;
  if (userLastApproval) {
    return userLastApproval === userData.username ? pendingStep : null;
  }
  const isAuthorized = pendingStep.doc_approver.some((approver: any) => {
    const userMatches = approver.user?.username === userData.username;
    const departmentMatches =
      !approver.department || approver.department?.name === userData?.department_name;
    return userMatches && departmentMatches;
  });
  return isAuthorized ? pendingStep : null;
};

const hasPendingStep = (receipt: any) => {
  const steps = receipt?.user_approval?.approval_step;
  if (!Array.isArray(steps)) return false;
  return steps.some((s: any) => s.status_id === 1);
};

const navigateToDetailPage = (id: string, action?: "approve" | "reject") => {
  push({
    name: "approval-by-finance-department-detail.index",
    params: { id },
    query: action ? { action } : undefined,
  });
};

const details = async (id: string) => {
  previewId.value = id;
  previewDocNumber.value = "";
  previewPurpose.value = "";
  previewTotal.value = 0;
  previewCanApprove.value = false;
  previewCurrentStep.value = null;
  previewAccountCodeSet.value = false;
  previewLoading.value = true;
  previewVisible.value = true;
  try {
    await rStore.fetchById(id);
    const r = rStore.currentReceipts;
    if (!r) {
      previewVisible.value = false;
      showError("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ");
      return;
    }
    if (!hasPendingStep(r)) {
      previewVisible.value = false;
      navigateToDetailPage(id);
      return;
    }
    const currentStep = computeCurrentApprovalStep(r);
    // Steps that require file upload need the full detail-page flow (upload UI).
    if (currentStep && currentStep.requires_file_upload === true) {
      previewVisible.value = false;
      navigateToDetailPage(id);
      return;
    }
    previewDocNumber.value = r.receipt_number || "";
    previewPurpose.value = r.remark || r.document?.description || "";
    previewTotal.value = r.total ?? 0;
    previewCurrentStep.value = currentStep
      ? { id: Number(currentStep.id), is_otp: currentStep.is_otp === true }
      : null;
    previewCanApprove.value = !!currentStep;
    previewAccountCodeSet.value = !!r.account_code;
  } catch (err) {
    previewVisible.value = false;
    const errorMessage = err instanceof Error ? err.message : String(err);
    showError("ເກີດຂໍ້ຜິດພາດ", errorMessage);
  } finally {
    previewLoading.value = false;
  }
};

const goToDetail = (action?: "approve" | "reject") => {
  if (!previewId.value) return;
  const id = previewId.value;
  previewVisible.value = false;
  navigateToDetailPage(id, action);
};

const submitDecision = async (action: "approve" | "reject", remark: string) => {
  if (!previewId.value || !previewCurrentStep.value) return;
  const step = previewCurrentStep.value;
  // OTP-required steps still need the full detail-page flow (signature/OTP UI).
  if (step.is_otp) {
    const id = previewId.value;
    previewVisible.value = false;
    navigateToDetailPage(id, action);
    return;
  }
  previewSubmitting.value = true;
  try {
    const payload: IApprovalReceiptDto = {
      type: "r",
      statusId: action === "approve" ? 2 : 3,
      remark,
      is_otp: false,
      files: [],
    };
    if (previewAccountCodeSet.value && rStore.currentReceipts?.account_code) {
      payload.account_code = rStore.currentReceipts.account_code;
    }
    await rStore.approvalReceipt(step.id, payload);
    success("ສຳເລັດ", action === "approve" ? "ອະນຸມັດສຳເລັດ" : "ປະຕິເສດສຳເລັດ");
    previewVisible.value = false;
    // Reload the current page (do NOT reset to page 1) so the user stays on the
    // page they approved from. If approving emptied the last page, step back one.
    if (rStore.receipts.length <= 1 && rStore.pagination.page > 1) {
      rStore.pagination.page -= 1;
    }
    await loadFilteredReceipts();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    showError("ເກີດຂໍ້ຜິດພາດ", errorMessage);
  } finally {
    previewSubmitting.value = false;
  }
};

const handleApproveFromModal = () => submitDecision("approve", "ຢືນຢັນສຳເລັດ");
const handleRejectFromModal = (reason: string) =>
  submitDecision("reject", reason || "Rejected");
const buildFilterParams = (page: number, limit: number) => ({
  page,
  limit,
  order_date: filterDate.value ? filterDate.value.format("YYYY-MM-DD") : undefined,
  department_id: filterDepartment.value !== "all" ? filterDepartment.value : undefined,
  type: filterType.value,
  status_user_id: filterStatusUserId.value || undefined,
  search: globalSearchKeyword.value || undefined,
});

const loadFilteredReceipts = async (resetPage = false) => {
  if (resetPage) {
    rStore.pagination.page = 1;
  }
  loading.value = true;
  try {
    await rStore.fetchAll(
      buildFilterParams(rStore.pagination.page, rStore.pagination.limit)
    );
    syncStateToUrl();
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const searchByDate = async () => {
  await loadFilteredReceipts(true);
};

const handleTableChange = async (pagination: TablePaginationType) => {
  isPaginationChanging.value = true;
  rStore.pagination.page = pagination.current ?? 1;
  rStore.pagination.limit = pagination.pageSize ?? 10;
  try {
    await loadFilteredReceipts();
  } finally {
    isPaginationChanging.value = false;
  }
};

watch(
  [filterDate, filterDepartment, filterType, filterStatusUserId, globalSearchTrigger],
  () => {
    if (!isPaginationChanging.value) {
      loadFilteredReceipts(true);
    }
  }
);

// React to browser back/forward
watch(
  () => [route.query.page, route.query.limit] as const,
  ([qPage, qLimit]) => {
    const p = Number(qPage);
    const l = Number(qLimit);
    let dirty = false;
    if (Number.isFinite(p) && p > 0 && p !== rStore.pagination.page) {
      rStore.pagination.page = p;
      dirty = true;
    }
    if (Number.isFinite(l) && l > 0 && l !== rStore.pagination.limit) {
      rStore.pagination.limit = l;
      dirty = true;
    }
    if (dirty) loadFilteredReceipts();
  }
);

onMounted(async () => {
  // Load document statuses first so we can resolve the PENDING id before
  // the initial receipts fetch.
  if (documentStatusStore.document_Status.length === 0) {
    await documentStatusStore.fetctDocumentStatus({ page: 1, limit: 1000 });
  }
  // Suppress the filter watcher while we resolve the default status id, so
  // we don't kick off a second fetch.
  isPaginationChanging.value = true;
  ensureValidStatusUserId();
  await nextTick();
  isPaginationChanging.value = false;

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
          <div class="search-by-type w-full">
            <label
              for=""
              class="block text-sm font-medium text-gray-700 mb-1"
              >{{ t("purchase-rq.field.filter_type") }}</label
            >
            <InputSelect
              :options="filterTypeOptions"
              v-model="filterType"
              placeholder="ປະເພດການກັ່ນຕອງ"
              class="w-full"
            />
          </div>
          <div class="search-by-doc-type w-full">
            <label
              for=""
              class="block text-sm font-medium text-gray-700 mb-1"
              >{{ t("departments.dpm_user.field.department") }}</label
            >
            <InputSelect
              :options="dpmOption"
              v-model="filterDepartment"
              placeholder="ເລືອກພະແນກ"
              class="w-full"
            />
          </div>
          <div class="search-by-status-user w-full">
            <label
              for=""
              class="block text-sm font-medium text-gray-700 mb-1"
              >{{ t("purchase-rq.field.status") }}</label
            >
            <InputSelect
              :options="statusUserOptions"
              v-model="filterStatusUserId"
              :placeholder="t('purchase-rq.status_user.PENDING')"
              :loading="documentStatusStore.loading"
              class="w-full"
              @change="handleStatusUserChange"
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

      <!-- Export Excel section -->
      <div class="mt-4 flex flex-col md:flex-row gap-4 items-end">
        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("purchase-rq.export.start_date") }}
          </label>
          <DatePicker
            v-model:value="exportStartDate"
            :placeholder="t('purchase-rq.export.start_date')"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>
        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("purchase-rq.export.end_date") }}
          </label>
          <DatePicker
            v-model:value="exportEndDate"
            :placeholder="t('purchase-rq.export.end_date')"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>
        <UiButton
          type="primary"
          icon="ant-design:file-excel-outlined"
          :loading="exportLoading"
          color-class="flex items-center justify-center gap-2 !bg-green-600 !border-green-600 hover:!bg-green-700"
          class="w-full md:w-auto px-6"
          @click="handleExportExcel"
        >
          <span>{{ t("purchase-rq.btn.export_excel") }}</span>
        </UiButton>
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
          showSizeChanger: true,
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
        <template #current_approver="{ record }">
          <span :class="record.user_last_approval === null ? 'text-green-600 font-semibold' : 'text-blue-600'">
            {{ record.user_last_approval === null ? 'APPROVED' : record.user_last_approval }}
          </span>
        </template>
        <template #total="{ record }">
          <span class="font-semibold text-red-600">
            {{ formatPrice(record.total ) }} ₭
          </span>
        </template>
        <template #receipt_number="{ record }">
          <span class="font-semibold text-blue-600">
            {{(record.receipt_number ) }}
          </span>
        </template>
        <template #payment_status="{ record }">
          <UiTag
            v-if="(record.document_attachment?.length ?? 0) > 0"
            color="green"
            class="rounded-full"
          >
            ໂອນຈ່າຍສຳເລັດ
          </UiTag>
          <UiTag v-else color="orange" class="rounded-full">
            ຍັງບໍ່ໄດ້ຈ່າຍ
          </UiTag>
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

    <!-- Quick Preview Modal -->
    <QuickApprovalPreviewModal
      v-model:visible="previewVisible"
      :loading="previewLoading"
      :submitting="previewSubmitting"
      :doc-number="previewDocNumber"
      doc-number-label="ເລກທີໃບຮັບເງິນ"
      :purpose="previewPurpose"
      :total="previewTotal"
      :can-approve="previewCanApprove"
      @approve="handleApproveFromModal"
      @reject="handleRejectFromModal"
      @details="goToDetail()"
    />
  </div>
</template>
