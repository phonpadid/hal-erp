<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { Icon } from "@iconify/vue";
import { usePurchaseRequestsStore } from "@/modules/presentation/Admin/stores/purchase_requests/purchase-requests.store";
import { useApprovalStepStore } from "@/modules/presentation/Admin/stores/approval-step.store";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import Table from "@/common/shared/components/table/Table.vue";
import { prColumns } from "./pr-column";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { useNotification } from "@/modules/shared/utils/useNotification";
import SignatureConfirmModal from "./modal/SignatureConfirmModal.vue";
import type { IStep, JwtPayload, UserData } from "./interfaces/payload.interface";
import api from "@/common/config/axios/axios";
// import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface"
const { success: showSuccess } = useNotification();
const { error: showError } = useNotification();
const { t } = useI18n();
const { params } = useRoute();
const token = params.token as string;

// Decode JWT token
const decodeJwt = (jwtToken: string): JwtPayload | null => {
  try {
    const base64Url = jwtToken.split('.')[1];
    if (!base64Url) {
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const decodedToken = ref<JwtPayload | null>(null);

// Stores
const prStore = usePurchaseRequestsStore();
const approvalStepStore = useApprovalStepStore();

// State for purchase request data
const prData = ref<PurchaseRequestEntity | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

// Modal state
const showSignatureModal = ref(false);
const isRejectAction = ref(false);

// User data state

const userData = ref<UserData | null>(null);

// Fetch user by token
const fetchUserByToken = async () => {
  if (!token) return;

  try {
    const response = await api.get(`/users/by-token/${token}`);
    if (response.data && response.data.data) {
      userData.value = response.data.data;
    }
  } catch (err) {
    console.error("Error fetching user by token:", err);
  }
};

// Get current pending approval step
const currentApprovalStep = computed(() => {
  const userApproval = prData.value?.getUserApproval();

  if (!userApproval) return null;
  const pendingStep = userApproval.approval_step?.find(
    (step: IStep) => step.status_id === 1
  );
  return pendingStep || null;
});
const currentRejectStep = computed(() => {
  const userApproval = prData.value?.getUserApproval();
  if (!userApproval) return null;
  const rejectStep = userApproval.approval_step?.find(
    (step: IStep) => step.status_id === 3
  );
  return rejectStep || null;
});

// Check if current user can take action on this approval step
const canTakeAction = computed(() => {
  if (!currentApprovalStep.value || !decodedToken.value) {
    return false;
  }
  const isMatchingStep = String(currentApprovalStep.value.id) === String(decodedToken.value.step_id);
  const isMatchingUser = Number(currentApprovalStep.value.status_id) === 1;
  return isMatchingStep && isMatchingUser;
});
// Computed data
const dataInfo = computed(() => ({
  proposer: prData.value?.getRequester() || {
    username: "----",
  },
  purposes: prData.value?.getPurposes() || "----",
  department: prData.value?.getDepartment() || {
    name: "----",
  },
  items: prData.value?.getItems() || [],
  total: prData.value?.getTotal() || 0,
}));
const companyInfo = computed(() => prData.value?.getCompany());
// Position computed
const positionName = computed(() => {
  return prData.value?.getPosition()?.name || "----";
});
// Fetch PR data
onMounted(async () => {
  if (token) {
    // Decode JWT token
    decodedToken.value = decodeJwt(token);
    if (!decodedToken.value) {
      error.value = "Invalid token";
      return;
    }

    loading.value = true;
    try {
      // Fetch user data by token
      await fetchUserByToken();

      const data = await prStore.fetchByToken(token);
      if (data) {
        prData.value = data;
      } else {
        error.value = "Failed to load purchase request data";
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error fetching purchase request:", err);
    } finally {
      loading.value = false;
    }
  }
});

// Handle Approve - Show signature modal
const handleApprove = () => {
  if (!currentApprovalStep.value) {
    showError("ບໍ່ສາມາດອະນຸມັດ", "ບໍ່ພົບຂັ້ນຕອນການອະນຸມັດ");
    return;
  }
  isRejectAction.value = false;
  showSignatureModal.value = true;
};

// Handle Reject - Show signature modal
const handleReject = () => {
  if (!currentApprovalStep.value) {
    showError("ບໍ່ສາມາດປະຕິເສດ", "ບໍ່ພົບຂັ້ນຕອນການອະນຸມັດ");
    return;
  }
  isRejectAction.value = true;
  showSignatureModal.value = true;
};

// Confirm signature and submit approval/reject
const handleConfirmSignature = async (remark?: string) => {
  if (!currentApprovalStep.value || !prData.value) {
    return;
  }

  try {
    showSignatureModal.value = false;

    // Prepare payload - remark is required for reject, optional for approve
    const payload = {
      type: "pr",
      statusId: isRejectAction.value ? 3 : 2, // 3 = REJECTED, 2 = APPROVED
      remark: isRejectAction.value ? (remark || "ປະຕິເສດ") : "ຢືນຢັນສຳເລັດ",
      is_otp: false,
    };

    // Call API to approve/reject by token
    const response = await api.post(`/approve-by-token/${token}`, payload);

    if (response) {
      showSuccess("ສຳເລັດ", isRejectAction.value ? "ປະຕິເສດສຳເລັດ" : "ອະນຸມັດສຳເລັດ");

      // Refresh data to get updated status
      const updatedData = await prStore.fetchByToken(token);
      if (updatedData) {
        prData.value = updatedData;
      }
    }
  } catch (err) {
    console.error("Error submitting approval:", err);
    showError("ເກີດຂໍ້ຜິດພາດ", err instanceof Error ? err.message : "ບໍ່ສາມາດດຳເນີນການອະນຸມັດ");
  }
};

// Close modal
const handleCloseModal = () => {
  showSignatureModal.value = false;
};
</script>

<template>
  <div class="no-print">
    <!-- Loading State -->
    <div v-if="loading" class="approval-container">
      <div class="user-info">
        <p class="text-center">Loading...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="approval-container">
      <div class="user-info">
        <p class="text-center text-error">{{ error }}</p>
      </div>
    </div>

    <!-- Data State -->
    <div v-else class="approval-container">
      <div class="user-info">
        <div class="flex items-center gap-4">
          <h4 class="font-bold md:text-2xl text-lg">{{t("menu-sidebar.apv_purchase_rq")}}</h4>
          <div v-if="currentApprovalStep" class="status-badge status-pending">
            <Icon icon="mdi:clock-outline" class="status-icon" />
            <span>Pending</span>
          </div>
          <div v-else-if="currentRejectStep" class="status-badge status-rejected">
            <Icon icon="mdi:close-circle-outline" class="status-icon" />
            <span>Rejected</span>
          </div>
          <div v-else class="status-badge status-approved">
            <Icon icon="mdi:check-circle-outline" class="status-icon" />
            <span>Approved</span>
          </div>
        </div>
        <!-- Info Sections - Flex Layout -->
        <div class="info-grid">
          <!-- Proposer Section -->
          <div class="info-card">
            <h2 class="card-title">
              {{ t("purchase-rq.field.proposer") }}
            </h2>
            <div class="proposer-info">
              <div class="avatar-circle">
                <Icon icon="mdi:user" class="avatar-icon" />
              </div>
              <div class="proposer-details">
                <p class="proposer-name">
                  {{ dataInfo.proposer.username }}
                </p>
                <p class="proposer-position">
                  {{ positionName }}, {{ dataInfo?.department.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Purpose Section -->
          <div class="info-card">
            <h2 class="card-title">
              {{ t("purchase-rq.field.purposes") }}
            </h2>
            <div class="purpose-content flex-layout">
              <div class="purpose-section">
                <p class="purpose-text">
                  {{ dataInfo?.purposes }}
                </p>
              </div>
            </div>
          </div>

          <!-- Department Section -->
          <div class="info-card">
            <h2 class="card-title">
              Company
            </h2>
            <div class="department-content flex-layout">
              <div class="department-section -space-y-2">
                <p class="department-name">
                  {{ companyInfo?.name }}
                </p>
                <p class="department-name">
                  {{ companyInfo?.address }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="table-section">
          <h2 class="table-title">
            {{ t("purchase-rq.field.title") }}
          </h2>
          <div class="table-wrapper">
            <Table
              :dataSource="dataInfo.items"
              :pagination="false"
              :columns="prColumns(t)"
              :rowKey="(record: any) => record.getId()"
              :scroll="{ x: 'max-content' }"
              size="small"
              class="responsive-table"
            >
            <template #id="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
            <template #total_price="{ record }">
              <span>{{ formatPrice(record?.getTotalPrice()) }}</span>
            </template>
            </Table>
          </div>
        </div>

        <!-- Footer Actions -->
        <div v-if="canTakeAction" class="footer-actions">
          <button class="btn btn-reject" :disabled="!canTakeAction" @click="handleReject">
            <Icon icon="mdi:close" class="btn-icon" />
            <span>{{ t("button.reject") }}</span>
          </button>
          <button class="btn btn-approve" :disabled="!canTakeAction" @click="handleApprove">
            <span>{{ t("button.approve") }}</span>
            <Icon icon="mdi:check" class="btn-icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- Signature Confirm Modal -->
    <SignatureConfirmModal
      :visible="showSignatureModal"
      :title="isRejectAction ? t('purchase-rq.card_title.refused') : t('purchase-rq.confirm_signature')"
      :isReject="isRejectAction"
      :loading="approvalStepStore.loading"
      :signatureUrl="userData?.user_signature?.signature_url"
      @confirm="handleConfirmSignature"
      @close="handleCloseModal"
    />
  </div>
</template>

<style scoped>
/* ===== Base Container ===== */
.approval-container {
  margin-top: 0;
  margin-bottom: 5rem;
  padding: 0.5rem;
}

@media (min-width: 640px) {
  .approval-container {
    padding: 1rem;
  }
}

@media (min-width: 1024px) {
  .approval-container {
    padding: 0;
  }
}

/* ===== User Info Card ===== */
.user-info {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .user-info {
    padding: 1.5rem;
    border-radius: 1rem;
  }
}

@media (min-width: 1024px) {
  .user-info {
    padding: 2rem;
  }
}

/* ===== Responsive Info Grid ===== */
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .info-grid {
    gap: 1.25rem;
    margin-bottom: 2rem;
  }
}

@media (min-width: 768px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

@media (min-width: 1280px) {
  .info-grid {
    gap: 2.5rem;
  }
}

/* ===== Info Cards ===== */
.info-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 0.75rem;
  padding: 0.4rem 0.8rem;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

@media (min-width: 768px) {
  .info-card {
    padding: 1.25rem;
    border-radius: 1rem;
  }
}

@media (min-width: 1024px) {
  .info-card {
    padding: 1.5rem;
  }
}

/* ===== Card Titles ===== */
.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

@media (min-width: 768px) {
  .card-title {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
}

@media (min-width: 1024px) {
  .card-title {
    font-size: 1.125rem;
  }
}

/* ===== Proposer Info ===== */
.proposer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .proposer-info {
    gap: 1rem;
  }
}

@media (min-width: 1024px) {
  .proposer-info {
    gap: 1.25rem;
  }
}

.avatar-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .avatar-circle {
    width: 3rem;
    height: 3rem;
  }
}

@media (min-width: 1024px) {
  .avatar-circle {
    width: 3.5rem;
    height: 3.5rem;
  }
}

.avatar-icon {
  font-size: 1.25rem;
  color: #3b82f6;
}

@media (min-width: 768px) {
  .avatar-icon {
    font-size: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .avatar-icon {
    font-size: 1.75rem;
  }
}

.proposer-details {
  flex: 1;
  min-width: 0;
}

.proposer-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .proposer-name {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .proposer-name {
    font-size: 1.125rem;
  }
}

.proposer-position {
  font-size: 0.75rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 0.125rem;
}

@media (min-width: 768px) {
  .proposer-position {
    font-size: 0.875rem;
  }
}

@media (min-width: 1024px) {
  .proposer-position {
    font-size: 1rem;
  }
}

/* ===== Purpose & Department Content ===== */
.purpose-content,
.department-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .purpose-content,
  .department-content {
    gap: 1rem;
  }
}

.purpose-section,
.department-section {
  flex: 1;
  min-width: 0;
}

.purpose-text,
.department-name {
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

@media (min-width: 768px) {
  .purpose-text,
  .department-name {
    font-size: 0.875rem;
  }
}

@media (min-width: 1024px) {
  .purpose-text,
  .department-name {
    font-size: 1rem;
  }
}

/* ===== Table Section ===== */
.table-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .table-section {
    margin-top: 2rem;
    padding: 1.25rem;
    border-radius: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .table-section {
    margin-top: 2.5rem;
    padding: 1.5rem;
  }
}

.table-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .table-title {
    font-size: 1rem;
    margin-bottom: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .table-title {
    font-size: 1.125rem;
  }
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ===== Responsive Table Styles ===== */
@media (max-width: 767px) {
  :deep(.responsive-table) {
    font-size: 0.6875rem;
  }

  :deep(.responsive-table .ant-table-thead > tr > th) {
    padding: 0.5rem 0.375rem !important;
    font-size: 0.6875rem;
    background: #f1f5f9;
  }

  :deep(.responsive-table .ant-table-tbody > tr > td) {
    padding: 0.5rem 0.375rem !important;
    font-size: 0.6875rem;
  }

  .cell-text {
    font-size: 0.6875rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  :deep(.responsive-table) {
    font-size: 0.75rem;
  }

  :deep(.responsive-table .ant-table-thead > tr > th) {
    padding: 0.625rem 0.5rem !important;
    font-size: 0.75rem;
  }

  :deep(.responsive-table .ant-table-tbody > tr > td) {
    padding: 0.625rem 0.5rem !important;
    font-size: 0.75rem;
  }

  .cell-text {
    font-size: 0.75rem;
  }
}

@media (min-width: 1024px) {
  :deep(.responsive-table) {
    font-size: 0.875rem;
  }

  :deep(.responsive-table .ant-table-thead > tr > th) {
    padding: 0.75rem 0.625rem !important;
    font-size: 0.875rem;
  }

  :deep(.responsive-table .ant-table-tbody > tr > td) {
    padding: 0.75rem 0.625rem !important;
    font-size: 0.875rem;
  }

  .cell-text {
    font-size: 0.875rem;
  }
}

@media (min-width: 1280px) {
  :deep(.responsive-table) {
    font-size: 0.9375rem;
  }

  :deep(.responsive-table .ant-table-thead > tr > th) {
    padding: 0.875rem 0.75rem !important;
    font-size: 0.9375rem;
  }

  :deep(.responsive-table .ant-table-tbody > tr > td) {
    padding: 0.875rem 0.75rem !important;
    font-size: 0.9375rem;
  }

  .cell-text {
    font-size: 0.9375rem;
  }
}

/* Cell specific styles */
.cell-title {
  display: block;
  min-width: 150px;
  max-width: 250px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* ===== Print Styles ===== */
@media print {
  .no-print {
    display: none !important;
  }

  .user-info {
    page-break-inside: avoid;
    box-shadow: none;
  }

  .info-card {
    break-inside: avoid;
    box-shadow: none;
  }

  .table-section {
    break-inside: avoid;
  }

  .footer-actions {
    display: none !important;
  }
}

/* ===== Accessibility ===== */
@media (prefers-reduced-motion: reduce) {
  .info-card {
    transition: none;
  }

  .info-card:hover {
    transform: none;
  }

  .btn {
    transition: none;
  }

  .btn:hover {
    transform: none;
  }
}

/* ===== Footer Actions ===== */
.footer-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  justify-content: flex-end;
}

@media (max-width: 639px) {
  .footer-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
}

@media (min-width: 768px) {
  .footer-actions {
    margin-top: 2.5rem;
    padding-top: 2rem;
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .footer-actions {
    margin-top: 3rem;
    gap: 2rem;
  }
}

/* ===== Button Styles ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 2.75rem;
}

@media (min-width: 768px) {
  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
    min-height: 3rem;
  }
}

@media (min-width: 1024px) {
  .btn {
    padding: 0.875rem 2rem;
    font-size: 1rem;
    min-height: 3.25rem;
  }
}

.btn:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: 1.25rem;
}

@media (min-width: 768px) {
  .btn-icon {
    font-size: 1.5rem;
  }
}

/* Approve Button */
.btn-approve {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.btn-approve:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.btn-approve:active:not(:disabled) {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
}

/* Reject Button */
.btn-reject {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.btn-reject:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.btn-reject:active:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
}

/* Disabled Button State */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Full width on mobile */
@media (max-width: 639px) {
  .btn {
    width: 100%;
    padding: 0.75rem 1rem;
  }
}

/* ===== Status Badge Styles ===== */
.status-badge {
  margin-top: -10px;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.2rem 0.4rem;
  border-radius: 9999px;
  font-size: 0.56rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

@media (min-width: 768px) {
  .status-badge {
    padding: 0.1rem 0.4rem;
    font-size: 0.70rem;
  }
}

.status-icon {
  font-size: 1rem;
}

@media (min-width: 768px) {
  .status-icon {
    font-size: 1.125rem;
  }
}

/* Pending Status */
.status-pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #fbbf24;
}

.status-pending:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
}

/* Approved Status */
.status-approved {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #34d399;
}

.status-approved:hover {
  background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
}

/* Rejected Status */
.status-rejected {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #f87171;
}

.status-rejected:hover {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
}
</style>
