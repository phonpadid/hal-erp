<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useGlobalSearchStore } from "../../stores/global-search.store";
import { useRoute, useRouter } from "vue-router";
import { columns } from "../../views/approval-department/column/cloumn";
import { useI18n } from "vue-i18n";
import { usePurchaseOrderStore } from "@/modules/presentation/Admin/stores/purchase_requests/purchase-order";
import { formatDate } from "@/modules/shared/formatdate";
import { departmentStore } from "../../stores/departments/department.store";
import { usePermissions } from "@/modules/shared/utils/usePermissions";
import { formatPrice } from "@/modules/shared/utils/format-price";
import UiTag from "@/common/shared/components/tag/UiTag.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import Table from "@/common/shared/components/table/Table.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import DatePicker from "@/common/shared/components/Datepicker/DatePicker.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import QuickApprovalPreviewModal from "@/common/shared/components/Modal/QuickApprovalPreviewModal.vue";
import { Icon } from "@iconify/vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useApprovalStepStore } from "../../stores/approval-step.store";
import { useDocumentStatusStore } from "../../stores/document-status.store";
import { useAuthStore } from "../../stores/authentication/auth.store";
import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";

/******************************************************** */
const { hasPermission } = usePermissions();
const { t } = useI18n();
const { success, error: showError } = useNotification();
const router = useRouter();
const route = useRoute();
const purchaseOrderStore = usePurchaseOrderStore();
const departmentStoreInstance = departmentStore();
const globalSearchStore = useGlobalSearchStore();
const { trimmedKeyword: globalSearchKeyword, trigger: globalSearchTrigger } =
  storeToRefs(globalSearchStore);

// Read initial state from URL (page/limit/filters)
const queryPage = Number(route.query.page);
const queryLimit = Number(route.query.limit);
if (Number.isFinite(queryPage) && queryPage > 0) {
  purchaseOrderStore.pagination.page = queryPage;
}
if (Number.isFinite(queryLimit) && queryLimit > 0) {
  purchaseOrderStore.pagination.limit = queryLimit;
}
const selectedDepartment = ref<string | null>(
  typeof route.query.department_id === "string" ? route.query.department_id : null
);
const selectedType = ref(
  typeof route.query.type === "string" ? route.query.type : "all"
);
const STATUS_USER_NAMES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;
const selectedStatusUserId = ref<string>(
  typeof route.query.status_user_id === "string" ? route.query.status_user_id : ""
);
const loading = ref(false);

const dates = reactive<{ startDate: string | null; endDate: string | null }>({
  startDate: typeof route.query.order_date === "string" ? route.query.order_date : null,
  endDate: null,
});

const toIsoDate = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
};

const syncStateToUrl = () => {
  router.replace({
    query: {
      ...route.query,
      page: String(purchaseOrderStore.pagination.page),
      limit: String(purchaseOrderStore.pagination.limit),
      type: selectedType.value,
      department_id:
        selectedDepartment.value && selectedDepartment.value !== "all"
          ? selectedDepartment.value
          : undefined,
      order_date: toIsoDate(dates.startDate) ?? undefined,
      status_user_id: selectedStatusUserId.value || undefined,
    },
  });
};

// Export Excel state
const exportLoading = ref(false);

const handleExportExcel = async () => {
  try {
    exportLoading.value = true;
    const startDate = toIsoDate(dates.startDate);
    const endDate = toIsoDate(dates.endDate);
    const ok = await purchaseOrderStore.exportExcel(startDate, endDate);
    if (ok) {
      success(t("purchase-rq.success.title"), t("purchase-rq.export.success"));
    } else {
      showError(t("purchase-rq.export.failed"), purchaseOrderStore.error || "");
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    showError(t("purchase-rq.export.failed"), errorMessage);
  } finally {
    exportLoading.value = false;
  }
};
/************************Check Button Show******************************* */
const canViewDetails = computed(() => hasPermission('read-department-approver'));



// Quick preview modal state
const approvalStepStore = useApprovalStepStore();
const documentStatusStore = useDocumentStatusStore();
const authStore = useAuthStore();
const { userRoles } = storeToRefs(authStore);

// Budget-managing approvers must select budget_item_id per item via the detail UI
// before approving. Skip the preview modal for them.
const canManageBudget = computed(
  () => userRoles.value.includes("budget-admin") || userRoles.value.includes("budget-user")
);
const previewVisible = ref(false);
const previewLoading = ref(false);
const previewSubmitting = ref(false);
const previewId = ref<string | null>(null);
const previewDocNumber = ref("");
const previewPurpose = ref("");
const previewTotal = ref(0);
const previewCanApprove = ref(false);
const previewCurrentStep = ref<{ id: number; is_otp: boolean } | null>(null);
const previewDetail = ref<PurchaseOrderEntity | null>(null);

const approvedStatusId = computed(
  () => documentStatusStore.document_Status.find((s) => s.getName() === "APPROVED")?.getId()
);
const rejectedStatusId = computed(
  () => documentStatusStore.document_Status.find((s) => s.getName() === "REJECTED")?.getId()
);

const computeCurrentApprovalStep = (detail: any) => {
  if (!detail) return null;
  const userDataStr = localStorage.getItem("userData");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
  if (!userData?.username) return null;
  const steps = detail.getUserApproval?.()?.approval_step;
  if (!Array.isArray(steps)) return null;
  const pendingStep = steps.find((s: any) => s.status_id === 1);
  if (!pendingStep?.doc_approver?.length) return null;
  // Backend-provided next-approver username is authoritative; it handles
  // approvers whose doc_approver.department is null (e.g. president-level).
  const userLastApproval = detail.getUserLastApproval?.() ?? null;
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

const hasPendingStep = (detail: any) => {
  const steps = detail?.getUserApproval?.()?.approval_step;
  if (!Array.isArray(steps)) return false;
  return steps.some((s: any) => s.status_id === 1);
};

const navigateToDetailPage = (id: string, action?: "approve" | "reject") => {
  router.push({
    name: "approval_department_panak_detail",
    params: { id },
    query: action ? { action } : undefined,
  });
};

const handleDetailsDocument = async (record: any) => {
  const id = record?.id ?? record?.getId?.();
  if (!id) return;
  previewId.value = String(id);
  previewDocNumber.value = "";
  previewPurpose.value = "";
  previewTotal.value = 0;
  previewCanApprove.value = false;
  previewCurrentStep.value = null;
  previewDetail.value = null;
  previewLoading.value = true;
  previewVisible.value = true;
  try {
    const detail = await purchaseOrderStore.fetchById(Number(id));
    if (!detail) {
      previewVisible.value = false;
      showError("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ");
      return;
    }
    if (!hasPendingStep(detail)) {
      previewVisible.value = false;
      navigateToDetailPage(String(id));
      return;
    }
    const currentStep = computeCurrentApprovalStep(detail);
    // Budget department step requires selecting budget_item_id per item via the
    // detail page UI. Skip the preview modal entirely so the user lands there.
    if (currentStep && canManageBudget.value) {
      previewVisible.value = false;
      navigateToDetailPage(String(id));
      return;
    }
    previewDetail.value = detail;
    previewDocNumber.value = detail.getPoNumber() || "";
    previewPurpose.value = detail.getPurposes() || "";
    previewTotal.value = detail.getTotal() || 0;
    previewCurrentStep.value = currentStep
      ? { id: Number(currentStep.id), is_otp: currentStep.is_otp === true }
      : null;
    previewCanApprove.value = !!currentStep;
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
  if (!previewId.value || !previewCurrentStep.value || !previewDetail.value) return;
  const statusId = action === "approve" ? approvedStatusId.value : rejectedStatusId.value;
  if (!statusId) {
    showError("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບສະຖານະ");
    return;
  }
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
    const items = previewDetail.value.getPurchaseOrderItem() || [];
    const purchase_order_items = items.map((item) => ({
      id: Number(item.getId()),
      budget_item_id: Number(item.getBudgetItemId()),
    }));
    const payload: SubmitApprovalStepInterface = {
      type: "po",
      statusId: Number(statusId),
      remark,
      approvalStepId: Number(step.id),
      is_otp: false,
      purchase_order_items,
      files: [],
    };
    const ok = await approvalStepStore.submitApprovalDepartMent(previewId.value, payload);
    if (ok) {
      previewVisible.value = false;
      await fetchData({ resetPage: true });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    showError("ເກີດຂໍ້ຜິດພາດ", errorMessage);
  } finally {
    previewSubmitting.value = false;
  }
};

const handleApproveFromModal = () => submitDecision("approve", "ຢືນຢັນສຳເລັດ");
const handleRejectFromModal = (reason: string) => submitDecision("reject", reason || "Rejected");
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
  const validIds = statusUserOptions.value.map((opt) => opt.value);
  if (!selectedStatusUserId.value || !validIds.includes(selectedStatusUserId.value)) {
    selectedStatusUserId.value = pendingStatusId.value;
  }
};

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
  await fetchData({ resetPage: true });
};

const handleTableChange = async (pagination: any) => {
  purchaseOrderStore.pagination.page = pagination.current ?? 1;
  purchaseOrderStore.pagination.limit = pagination.pageSize ?? 10;
  await fetchData();
};

const fetchData = async ({ resetPage = false }: { resetPage?: boolean } = {}) => {
  if (resetPage) {
    purchaseOrderStore.pagination.page = 1;
  }
  loading.value = true;
  try {
    const apiParams: any = {
      page: purchaseOrderStore.pagination.page,
      limit: purchaseOrderStore.pagination.limit,
      column: "id",
      sort_order: "DESC",
    };
    if (selectedDepartment.value && selectedDepartment.value !== "all") {
      apiParams.department_id = selectedDepartment.value;
    }
    const startIso = toIsoDate(dates.startDate);
    if (startIso) {
      apiParams.order_date = startIso;
    }
    if (selectedType.value) {
      apiParams.type = selectedType.value;
    }
    if (selectedStatusUserId.value) {
      apiParams.status_user_id = selectedStatusUserId.value;
    }
    if (globalSearchKeyword.value) {
      apiParams.search = globalSearchKeyword.value;
    }
    await purchaseOrderStore.fetchAll(apiParams);
    syncStateToUrl();
  } finally {
    loading.value = false;
  }
};

watch(globalSearchTrigger, () => {
  fetchData({ resetPage: true });
});

// Handle department selection change → trigger search immediately
const handleDepartmentChange = (value: string | null) => {
  selectedDepartment.value = value;
  fetchData({ resetPage: true });
};

const handleStatusUserChange = (value: unknown) => {
  selectedStatusUserId.value = typeof value === "string" ? value : "";
  ensureValidStatusUserId();
  fetchData({ resetPage: true });
};

// React to browser back/forward
watch(
  () => [route.query.page, route.query.limit] as const,
  ([qPage, qLimit]) => {
    const p = Number(qPage);
    const l = Number(qLimit);
    let dirty = false;
    if (Number.isFinite(p) && p > 0 && p !== purchaseOrderStore.pagination.page) {
      purchaseOrderStore.pagination.page = p;
      dirty = true;
    }
    if (Number.isFinite(l) && l > 0 && l !== purchaseOrderStore.pagination.limit) {
      purchaseOrderStore.pagination.limit = l;
      dirty = true;
    }
    if (dirty) fetchData();
  }
);

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

  // Load document statuses for approve/reject status id lookup
  if (documentStatusStore.document_Status.length === 0) {
    await documentStatusStore.fetctDocumentStatus({ page: 1, limit: 1000 });
  }

  // Resolve PENDING id (or validate URL value) only after statuses are loaded.
  ensureValidStatusUserId();

  // Fetch initial data with type=all
  await fetchData();
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
      <!-- Filter Type Select -->
      <div class="w-48">
        <InputSelect
          v-model:modelValue="selectedType"
          :options="filterTypeOptions"
          placeholder="ປະເພດການກັ່ນຕອງ"
          @change="handleSearch"
        />
      </div>

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

      <!-- Status user filter (PENDING/APPROVED/REJECTED/CANCELLED) -->
      <div class="w-48">
        <InputSelect
          v-model:modelValue="selectedStatusUserId"
          :options="statusUserOptions"
          :placeholder="t('purchase-rq.status_user.PENDING')"
          :loading="documentStatusStore.loading"
          @change="handleStatusUserChange"
        />
      </div>

      <!-- Shared Date Range Picker (ใช้ร่วมกันระหว่างการกรองและ Export Excel) -->
      <div class="flex-grow">
        <DatePicker
          v-model:modelValueStart="dates.startDate"
          v-model:modelValueEnd="dates.endDate"
          :cols="12"
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

      <!-- Export Excel Button (ใช้ช่วงวันที่จากตัวกรองด้านบน) -->
      <UiButton
        type="primary"
        icon="ant-design:file-excel-outlined"
        :loading="exportLoading"
        color-class="flex items-center gap-2 !bg-green-600 !border-green-600 hover:!bg-green-700"
        @click="handleExportExcel"
      >
        <span>{{ t("purchase-rq.btn.export_excel") }}</span>
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
        <span class="font-semibold text-blue-600">{{ record.po_number }}</span>
      </template>

      <template #requester="{ record }">
        <span>{{ record.getRequester()?.username }}</span>
      </template>
      <template #total="{ record }">
        <span class="text-red-600">{{formatPrice( record.getTotal()) }} ₭</span>
      </template>

      <template #created_at="{ record }">
        <span>{{ formatDate(record.getCreatedAt()) }}</span>
      </template>
      <template #current_approver="{ record }">
        <UiTag
          v-if="record.getUserLastApproval()"
          :text="record.getUserLastApproval()"
          color="blue"
        />
        <span v-else class="text-blue-400"><div class="flex items-center"><Icon icon="solar:clipboard-check-bold"/>ສຳເລັດ</div></span>
      </template>
      <template #rc_status="{ record }">
        <UiTag
          v-if="getDocumentStatus(record)?.toUpperCase() === 'REJECTED'"
          color="error"
          icon="ant-design:close-circle-outlined"
          text="ເອກະສານນີ້ຖືກປະຕິເສດແລ້ວ ບໍ່ສາມາດສ້າງໃບເບີກຈ່າຍໄດ້"
        />
        <UiTag
          v-else-if="record.getIsCreatedRc?.()"
          color="success"
          icon="ant-design:check-circle-outlined"
          text="ສ້າງໃບເບີກຈ່າຍສຳເລັດ"
        />
        <UiTag
          v-else
          color="warning"
          icon="ant-design:exclamation-circle-outlined"
          text="ກະລຸນາສ້າງໃບເບີກຈ່າຍ"
        />
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

  <!-- Quick Preview Modal -->
  <QuickApprovalPreviewModal
    v-model:visible="previewVisible"
    :loading="previewLoading"
    :submitting="previewSubmitting"
    :doc-number="previewDocNumber"
    doc-number-label="ເລກທີ PO"
    :purpose="previewPurpose"
    :total="previewTotal"
    :can-approve="previewCanApprove"
    @approve="handleApproveFromModal"
    @reject="handleRejectFromModal"
    @details="goToDetail()"
  />
</template>

<style scoped>
.custom-radio-group {
  display: flex;
  gap: 1rem;
}
</style>
