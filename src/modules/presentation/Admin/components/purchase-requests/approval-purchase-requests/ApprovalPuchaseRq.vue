<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePurchaseRequestsStore } from "../../../stores/purchase_requests/purchase-requests.store";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDocumentTypeStore } from "../../../stores/document-type.store";
import { columns } from "../../../views/purchase-requests/column";
import Table from "@/common/shared/components/table/Table.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import UiTag from "@/common/shared/components/tag/UiTag.vue";
import { useDocumentStatusStore } from "../../../stores/document-status.store";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import QuickApprovalPreviewModal from "@/common/shared/components/Modal/QuickApprovalPreviewModal.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { DatePicker as AntDatePicker } from "ant-design-vue";
import { useGlobalSearchStore } from "../../../stores/global-search.store";
import { storeToRefs } from "pinia";
import { useApprovalStepStore } from "../../../stores/approval-step.store";
import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface";

/**********************************************************/
const { t } = useI18n();
const router = useRouter();
const { push } = router;
const route = useRoute();
const { success, error: showError } = useNotification();
const purchaseRequestStore = usePurchaseRequestsStore();
const docTypeStore = useDocumentTypeStore();
const globalSearchStore = useGlobalSearchStore();
const { trimmedKeyword: globalSearchKeyword, trigger: globalSearchTrigger } =
  storeToRefs(globalSearchStore);
const loading = ref(false);
const documentStatusStore = useDocumentStatusStore();

// Read initial state from URL (page/limit/filters)
const queryPage = Number(route.query.page);
const queryLimit = Number(route.query.limit);
if (Number.isFinite(queryPage) && queryPage > 0) {
  purchaseRequestStore.pagination.page = queryPage;
}
if (Number.isFinite(queryLimit) && queryLimit > 0) {
  purchaseRequestStore.pagination.limit = queryLimit;
}
const selectedDocType = ref(
  typeof route.query.document_type_id === "string" ? route.query.document_type_id : "all"
);
const STATUS_USER_NAMES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;
const selectedStatusUserId = ref<string>(
  typeof route.query.status_user_id === "string" ? route.query.status_user_id : ""
);
const selectedType = ref(
  typeof route.query.type === "string" ? route.query.type : "all"
);

const syncStateToUrl = () => {
  router.replace({
    query: {
      ...route.query,
      page: String(purchaseRequestStore.pagination.page),
      limit: String(purchaseRequestStore.pagination.limit),
      type: selectedType.value,
      document_type_id: selectedDocType.value !== "all" ? selectedDocType.value : undefined,
      status_user_id: selectedStatusUserId.value || "all",
    },
  });
};

// Delete modal state
const deleteModalVisible = ref(false);
const deleteLoading = ref(false);
const selectedDeleteId = ref<string | null>(null);

// Quick preview modal state
const approvalStepStore = useApprovalStepStore();
const previewVisible = ref(false);
const previewLoading = ref(false);
const previewSubmitting = ref(false);
const previewId = ref<string | null>(null);
const previewDocNumber = ref("");
const previewPurpose = ref("");
const previewTotal = ref(0);
const previewCanApprove = ref(false);
const previewCurrentStep = ref<{ id: number; is_otp: boolean } | null>(null);

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
  const userApproval = detail.getUserApproval?.();
  const steps = userApproval?.approval_step;
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

// Export Excel state
const exportStartDate = ref<string | undefined>(undefined);
const exportEndDate = ref<string | undefined>(undefined);
const exportLoading = ref(false);

const handleExportExcel = async () => {
  try {
    exportLoading.value = true;
    const startDate = exportStartDate.value || undefined;
    const endDate = exportEndDate.value || undefined;
    const ok = await purchaseRequestStore.exportExcel(startDate, endDate);
    if (ok) {
      success(t("purchase-rq.success.title"), t("purchase-rq.export.success"));
    } else {
      showError(t("purchase-rq.export.failed"), purchaseRequestStore.error || "");
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    showError(t("purchase-rq.export.failed"), errorMessage);
  } finally {
    exportLoading.value = false;
  }
};

/********************************************************* */
const docItem = computed(() => [
  { value: "all", label: "ທັງໝົດ" },
  ...docTypeStore.documentTypes.map((item) => ({
    value: item.getId(),
    label: item.getname(),
  })),
]);

const statusUserItem = computed(() =>
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

const filterTypeItem = computed(() => [
  { value: "all", label: t("purchase-rq.filter_type.all") },
  { value: "only_user", label: t("purchase-rq.filter_type.only_user") },
]);
const handleSearch = () => {
  fetchData({ resetPage: true });
};

const ensureValidStatusUserId = () => {
  // "all" sentinel = user explicitly cleared the filter; keep it empty.
  if (selectedStatusUserId.value === "all") {
    selectedStatusUserId.value = "";
    return;
  }
  const validIds = statusUserItem.value.map((opt) => opt.value);
  if (!selectedStatusUserId.value || !validIds.includes(selectedStatusUserId.value)) {
    selectedStatusUserId.value = pendingStatusId.value;
  }
};

const handleStatusUserChange = (value: unknown) => {
  selectedStatusUserId.value = typeof value === "string" ? value : "";
  fetchData({ resetPage: true });
};

const tablePagination = computed(() => ({
  current: purchaseRequestStore.pagination.page,
  pageSize: purchaseRequestStore.pagination.limit,
  total: purchaseRequestStore.pagination.total,
  showSizeChanger: true,
}));

const fetchData = async ({ resetPage = false }: { resetPage?: boolean } = {}) => {
  if (resetPage) {
    purchaseRequestStore.pagination.page = 1;
  }
  loading.value = true;
  try {
    const apiParams: any = {
      page: purchaseRequestStore.pagination.page,
      limit: purchaseRequestStore.pagination.limit,
      column: "id",
    };
    if (selectedDocType.value && selectedDocType.value !== "all") {
      apiParams.document_type_id = selectedDocType.value;
    }
    if (selectedStatusUserId.value) {
      apiParams.status_user_id = selectedStatusUserId.value;
    }
    if (selectedType.value) {
      apiParams.type = selectedType.value;
    }
    if (globalSearchKeyword.value) {
      apiParams.search = globalSearchKeyword.value;
    }
    await purchaseRequestStore.fetchAll(apiParams);
    syncStateToUrl();
  } finally {
    loading.value = false;
  }
};

watch(globalSearchTrigger, () => {
  fetchData({ resetPage: true });
});

const statusCounts = computed(() => {
  return purchaseRequestStore.statusSummary.reduce((acc, current) => {
    const statusKey = current.status.toLowerCase();
    acc[statusKey] = current.amount;
    return acc;
  }, {} as Record<string, number>);
});

const statusCards = computed(() => {
  return [
    {
      label: t("purchase-rq.card_title.padding"),
      count: statusCounts.value.pending ?? 0,
      icon: "solar:document-text-bold",
      textColor: "text-yellow-600",
    },
    {
      label: t("purchase-rq.card_title.success"),
      count: statusCounts.value.approved ?? 0,
      icon: "solar:clipboard-check-bold",
      textColor: "text-green-600",
    },
    {
      label: t("purchase-rq.card_title.refused"),
      count: statusCounts.value.rejected ?? 0,
      icon: "solar:clipboard-remove-bold",
      textColor: "text-red-600",
    },
  ];
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "yellow";
    case "APPROVED":
      return "green";
    case "REJECTED":
      return "red";
    default:
      return "gray";
  }
};

const canDelete = (status: string) => {
  return status === "PENDING";
};

const navigateToDetailPage = (id: string, action?: "approve" | "reject") => {
  push({
    name: "apv_purchase_request_detail",
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
  previewLoading.value = true;
  previewVisible.value = true;
  try {
    const detail = await purchaseRequestStore.fetchById(id);
    if (!detail) {
      previewVisible.value = false;
      showError(t("purchase-rq.error.title"), "ບໍ່ພົບຂໍ້ມູນ");
      return;
    }
    // Completed/rejected documents: skip preview and go straight to detail page.
    if (!hasPendingStep(detail)) {
      previewVisible.value = false;
      navigateToDetailPage(id);
      return;
    }
    const currentStep = computeCurrentApprovalStep(detail);
    previewDocNumber.value = detail.getPrNumber() || "";
    previewPurpose.value = detail.getPurposes() || "";
    previewTotal.value = detail.getTotal() || 0;
    previewCurrentStep.value = currentStep
      ? { id: Number(currentStep.id), is_otp: currentStep.is_otp === true }
      : null;
    previewCanApprove.value = !!currentStep;
  } catch (err) {
    previewVisible.value = false;
    const errorMessage = err instanceof Error ? err.message : String(err);
    showError(t("purchase-rq.error.title"), errorMessage);
  } finally {
    previewLoading.value = false;
  }
};

const goToDetail = () => {
  if (!previewId.value) return;
  const id = previewId.value;
  previewVisible.value = false;
  navigateToDetailPage(id);
};

const submitDecision = async (
  action: "approve" | "reject",
  remark: string
) => {
  if (!previewId.value || !previewCurrentStep.value) return;
  const statusId =
    action === "approve" ? approvedStatusId.value : rejectedStatusId.value;
  if (!statusId) {
    showError(t("purchase-rq.error.title"), "ບໍ່ພົບສະຖານະ");
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
    const payload: SubmitApprovalStepInterface = {
      type: "pr",
      statusId: Number(statusId),
      remark,
      approvalStepId: Number(step.id),
      is_otp: false,
    };
    const ok = await approvalStepStore.submitApproval(previewId.value, payload);
    if (ok) {
      previewVisible.value = false;
      await fetchData({ resetPage: true });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    showError(t("purchase-rq.error.title"), errorMessage);
  } finally {
    previewSubmitting.value = false;
  }
};

const handleApproveFromModal = () => {
  submitDecision("approve", "Approved");
};

const handleRejectFromModal = (reason: string) => {
  submitDecision("reject", reason || "Rejected");
};

const showDeleteModal = (id: string) => {
  // Find the record to check its status
  const record = purchaseRequestStore.requests.find(req => req.getId() === id);
  if (!canDelete(record?.getStatus() || "")) {
    showError(t("purchase-rq.error.deleteFailed"), t("purchase-rq.error.cannotDeleteApproved"));
    return;
  }

  selectedDeleteId.value = id;
  deleteModalVisible.value = true;
};

const handleDeleteConfirm = async () => {
  if (!selectedDeleteId.value) return;

  try {
    deleteLoading.value = true;
    const successDelete = await purchaseRequestStore.remove(selectedDeleteId.value);

    if (successDelete) {
      success(
        t("purchase-rq.success.title"),
        t("purchase-rq.success.deleted")
      );
      deleteModalVisible.value = false;
      await fetchData({ resetPage: true });
    } else {
      showError(t("purchase-rq.error.deleteFailed"), "Failed to delete purchase request");
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    showError(t("purchase-rq.error.deleteFailed"), errorMessage);
  } finally {
    deleteLoading.value = false;
  }
};

const handleTableChange = (pagination: any) => {
  purchaseRequestStore.pagination.page = pagination.current ?? 1;
  purchaseRequestStore.pagination.limit = pagination.pageSize ?? 10;
  fetchData();
};

// React to browser back/forward (URL query changes from outside)
watch(
  () => [route.query.page, route.query.limit] as const,
  ([qPage, qLimit]) => {
    const p = Number(qPage);
    const l = Number(qLimit);
    let dirty = false;
    if (Number.isFinite(p) && p > 0 && p !== purchaseRequestStore.pagination.page) {
      purchaseRequestStore.pagination.page = p;
      dirty = true;
    }
    if (Number.isFinite(l) && l > 0 && l !== purchaseRequestStore.pagination.limit) {
      purchaseRequestStore.pagination.limit = l;
      dirty = true;
    }
    if (dirty) fetchData();
  }
);

onMounted(async () => {
  await docTypeStore.fetchdocumentType({ page: 1, limit: 1000 });
  await documentStatusStore.fetctDocumentStatus({ page: 1, limit: 1000 });
  // Resolve PENDING id (or validate URL value) only after statuses are loaded.
  ensureValidStatusUserId();
  await fetchData();
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
              {{ card.count }} {{ t("purchase-rq.field.proposal") }}
            </p>
          </div>
        </div>
      </div>

      <div class="search flex flex-col md:flex-row justify-between gap-[14rem] mt-4">
        <div class="input flex flex-col md:flex-row gap-4 flex-1">
          <div class="search-by-type w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("purchase-rq.field.filter_type") }}
            </label>
            <InputSelect
              v-model="selectedType"
              :options="filterTypeItem"
              :placeholder="t('purchase-rq.all')"
              class="w-full"
              @change="handleSearch"
            />
          </div>
          <div class="search-by-doc-type w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("purchase-rq.field.doc_type") }}
            </label>
            <InputSelect
              v-model="selectedDocType"
              :options="docItem"
              :placeholder="t('purchase-rq.all')"
              class="w-full"
              @change="handleSearch"
            />
          </div>
          <div class="search-by-status w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("purchase-rq.field.status") }}
            </label>
            <InputSelect
              v-model="selectedStatusUserId"
              :options="statusUserItem"
              :placeholder="t('purchase-rq.status_user.PENDING')"
              class="w-full"
              @change="handleStatusUserChange"
            />
          </div>
          <div class="search-button flex items-end">
            <UiButton
              :loading="loading"
              icon="ant-design:search-outlined"
              color-class="flex items-center justify-center gap-2"
              class="w-full md:w-auto px-6"
              @click="handleSearch"
            >
              <span>{{ t("purchase-rq.search") }}</span>
            </UiButton>
          </div>
        </div>
        <div class="add flex items-end">
          <UiButton
            type="primary"
            @click="push({ name: 'create_purchase_request' })"
            class="w-full md:w-auto"
          >
            {{ t("purchase-rq.created") }}
          </UiButton>
        </div>
      </div>

      <!-- Export Excel section -->
      <div class="mt-4 flex flex-col md:flex-row gap-4 items-end">
        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("purchase-rq.export.start_date") }}
          </label>
          <AntDatePicker
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
          <AntDatePicker
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
        :dataSource="purchaseRequestStore.requests"
        :pagination="tablePagination"
        :loading="loading"
        @change="handleTableChange"
        row-key="id"
      >
        <template #status="{ record }">
          <UiTag :color="getStatusColor(record.getStatus())" class="rounded-full">
            {{ record.getStatus() }}
          </UiTag>
        </template>
        <template #username="{ record }">
          <span class="text-gray-600">{{ record.getRequester()?.username }}</span>
        </template>
        <template #position="{ record }">
          <span class="text-gray-600">{{ record.getPosition()?.name ?? "ບໍ່ມີພົບຂໍ້ມູນ" }}</span>
        </template>
        <template #department="{ record }">
          <span class="text-gray-600">{{ record.getDepartment()?.name }}</span>
        </template>
        <template #document_type="{ record }">
          <span class="text-gray-600">{{ record.getDocumentType()?.name }}</span>
        </template>
        <template #po_status="{ record }">
          <UiTag
            v-if="record.getIsCreatedPo()"
            color="green"
            class="rounded-full"
          >
            ສ້າງໃບສັ່ງຊື້ສຳເລັດ
          </UiTag>
          <UiTag v-else color="orange" class="rounded-full">
            ກະລຸນາສ້າງໃບຈັດຊື້
          </UiTag>
        </template>
        <template #actions="{ record }">
          <div class="flex items-center justify-start gap-2">
            <UiButton
              type="link"
              icon="ant-design:eye-outlined"
              color-class="flex items-center text-blue-500 hover:!text-blue-800"
              @click="details(record.getId())"
            >
              {{ t("purchase-rq.description") }}
            </UiButton>
            <UiButton
              v-if="canDelete(record.getStatus())"
              type="link"
              icon="material-symbols-light:delete-outline"
              color-class="flex items-center text-red-500 hover:!text-red-800"
              @click="showDeleteModal(record.getId())"
            >
              {{ t("purchase-rq.btn.dl_title") }}
            </UiButton>
          </div>
        </template>
      </Table>
    </div>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :title="t('purchase-rq.alert.confirm')"
      :visible="deleteModalVisible"
      :confirm-loading="deleteLoading"
      title-icon="material-symbols-light:warning-outline"
      icon-color="#ff4d4f"
      @update:visible="deleteModalVisible = $event"
      @ok="handleDeleteConfirm"
      @cancel="deleteModalVisible = false"
      ok-text="ຢືນຢັນ"
      ok-type="primary"
      :danger="true"
    >
      <p>{{ t("purchase-rq.alert.message") }}</p>
    </UiModal>

    <!-- Quick Preview Modal -->
    <QuickApprovalPreviewModal
      v-model:visible="previewVisible"
      :loading="previewLoading"
      :submitting="previewSubmitting"
      :doc-number="previewDocNumber"
      doc-number-label="ເລກທີ PR"
      :purpose="previewPurpose"
      :total="previewTotal"
      :can-approve="previewCanApprove"
      @approve="handleApproveFromModal"
      @reject="handleRejectFromModal"
      @details="goToDetail()"
    />
  </div>
</template>