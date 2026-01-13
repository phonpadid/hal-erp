<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { Icon } from "@iconify/vue";

const { t } = useI18n();
const { params } = useRoute();
const prId = params.id as string;

// State for purchase request data
const prData = ref<any>(null);

// Computed data
const dataInfo = computed(() => ({
  proposer: prData.value?.document?.requester || {
    username: "----",
  },
  purposes: prData.value?.remark || "----",
  department: prData.value?.document?.department || {
    name: "----",
  },
  items: prData.value?.purchase_request_item || [],
  total: prData.value?.total_amount || 0,
}));

// Position computed
const positionName = computed(() => {
  return prData.value?.document?.position?.[0]?.name || "----";
});

// Fetch PR data (placeholder - replace with actual store call)
onMounted(async () => {
  if (prId) {
    // TODO: Replace with actual store call
    // await prStore.fetchById(prId);
    console.log("Fetch purchase request:", prId);
  }
});

// Handle Approve
const handleApprove = () => {
  console.log("Approve clicked");
  // TODO: Implement approve logic with store
  const msg = "ອະນຸມັດສຳເລັດ";
  console.log(msg);
};

// Handle Reject
const handleReject = () => {
  console.log("Reject clicked");
  // TODO: Implement reject logic with store
  const msg = "ປະຕິເສດສຳເລັດ";
  console.log(msg);
};
</script>

<template>
  <div class="no-print">
    <div class="approval-container">
      <div class="user-info">
        <h4 class="font-bold text-2xl">{{t("menu-sidebar.apv_purchase_rq")}}</h4>
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
                  {{ positionName }}
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
                  {{ dataInfo.purposes }}
                </p>
              </div>
            </div>
          </div>

          <!-- Department Section -->
          <div class="info-card">
            <h2 class="card-title">
              {{ t("purchase-rq.field.department") }}
            </h2>
            <div class="department-content flex-layout">
              <div class="department-section">
                <p class="department-name">
                  {{ dataInfo.department.name }}
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
            <a-table
              :dataSource="dataInfo.items"
              :pagination="false"
              row-key="id"
              :scroll="{ x: 'max-content' }"
              size="small"
              class="responsive-table"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'id'">
                  <span class="cell-text">{{ index + 1 }}</span>
                </template>
                <template v-if="column.key === 'title'">
                  <span class="cell-text cell-title">
                    {{ record.title }}
                  </span>
                </template>
                <template v-if="column.key === 'quantity'">
                  <span class="cell-text">{{ record.quantity }}</span>
                </template>
                <template v-if="column.key === 'unit_price'">
                  <span class="cell-text">{{ record.unit_price }}</span>
                </template>
                <template v-if="column.key === 'total_price'">
                  <span class="cell-text">{{ record.total_price }}</span>
                </template>
                <template v-if="column.key === 'remark'">
                  <span class="cell-text">{{ record.remark || "----" }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="footer-actions">
          <button class="btn btn-reject" @click="handleReject">
            <Icon icon="mdi:close" class="btn-icon" />
            <span>{{ t("button.reject") }}</span>
          </button>
          <button class="btn btn-approve" @click="handleApprove">
            <span>{{ t("button.approve") }}</span>
            <Icon icon="mdi:check" class="btn-icon" />
          </button>
        </div>
      </div>
    </div>
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
  padding: 1rem;
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

.btn-approve:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.btn-approve:active {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
}

/* Reject Button */
.btn-reject {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.btn-reject:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.btn-reject:active {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
}

/* Full width on mobile */
@media (max-width: 639px) {
  .btn {
    width: 100%;
    padding: 0.75rem 1rem;
  }
}
</style>
