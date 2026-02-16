<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { columns } from "./column";
import { Icon } from "@iconify/vue";
import ApvLayout from "./ApvLayout.vue";
import { useReceiptStore } from "@/modules/presentation/Admin/stores/receipt.store";
import { uploadFile } from "@/modules/application/services/upload.service";
import { message } from "ant-design-vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import {
  getUserApv,
  getUserRole,
  UserRoleEnum,
} from "@/modules/shared/utils/get-user.login";

const { t } = useI18n();
const { params } = useRoute();
const receiptId = params.id as string;
const rStore = useReceiptStore();
const user = computed(() => getUserApv());
const userRole = ref<string[]>(getUserRole() ?? []);

// Upload state
const uploadLoading = ref<boolean>(false);
const createModalVisible = ref(false);
const formModel = ref({
  account_code: "",
});
const formState = ref({
  files: [] as { file_name: string }[],
});
const uploadedImages = ref<string[]>([]);
const uploadCompleted = ref(false);

// Role check
const isRole = computed(() =>
  userRole.value.some(
    (role) =>
      role.includes(UserRoleEnum.ACCOUNT_ADMIN) ||
      role.includes(UserRoleEnum.ACCOUNT_USER)
  )
);

// Computed properties based on receipt store data
const dataInfo = computed(() => ({
  proposer: rStore.currentReceipts?.document?.requester || {
    username: "Jonh",
  },
  purposes: rStore.currentReceipts?.remark || "ຈັດຊື້ຄອມ",
  company: rStore.currentReceipts?.document?.company || {
    name: "Haltech",
    address: "ນະຄອນຫຼວງວຽງຈັນ, ໄຊເສດຖາ, ຈອມມະນີ",
  },
  items: rStore.currentReceipts?.receipt_item || [],
  account_code: rStore.currentReceipts?.account_code || "",
}));

// Attachments
const attachments = computed(
  () => rStore.currentReceipts?.document_attachment ?? []
);

// Position computed
const positionName = computed(() => {
  return rStore.currentReceipts?.document?.position?.[0]?.name || "Development";
});

// Budget account computed
const budgetAcc = computed(
  () =>
    rStore.currentReceipts?.receipt_item[0]?.purchase_order_item
      ?.budget_item?.budget_account
);

// Approval step checks
const check = computed(() =>
  rStore.currentReceipts?.user_approval?.approval_step?.some(
    (step) => step.requires_file_upload
  )
);

const userNextApprove = computed(() =>
  rStore.currentReceipts?.user_approval?.approval_step?.map((step) => ({
    status: [
      {
        id: step.status_id,
        name: step.document_status.name,
        ...(step.doc_approver &&
          step.doc_approver.length > 0 && {
          dpm: step.doc_approver.map((approver) => ({
            id: approver.department?.id || 0,
            name: approver.department?.name,
          })),
          user: step.doc_approver.map((userData) => ({
            id: userData.user?.id,
            username: userData.user?.username,
          })),
        }),
      },
    ],
  }))
);

const checkUpload = computed(() => {
  return (
    userNextApprove.value?.flatMap(
      (d) =>
        d.status
          ?.filter((s) => s.id === 1)
          .flatMap((s) => s.user ?? []) ?? []
    ) ?? []
  );
});

const isAwaitingUser = computed(() =>
  checkUpload.value.some((u) => u.id === user.value.id)
);

const isUserPendingApprover = computed(() => {
  const userId = user.value?.id;
  if (!userId) return false;
  const steps = rStore.currentReceipts?.user_approval?.approval_step || [];
  return steps.some(
    (step) =>
      step.status_id === 1 &&
      step.doc_approver?.some((doc) => doc.user?.id === userId)
  );
});

// Image upload handler
const handleImageUpload = async (files: File[]) => {
  if (!files.length) return;

  uploadLoading.value = true;
  try {
    for (const file of files) {
      const blobUrl = URL.createObjectURL(file);
      uploadedImages.value.push(blobUrl);

      const uploadData = new FormData();
      uploadData.append("image", file);

      const response = await uploadFile(uploadData);
      const file_name = response.fileName;

      if (file_name) {
        formState.value.files.push({ file_name });
        message.success(`ອັບໂຫລດ ${file.name} ສຳເລັດ`);
      } else {
        throw new Error("Filename not found in API response.");
      }
    }
    createModalVisible.value = false;
    uploadCompleted.value = true;
  } catch (error) {
    console.log("File upload failed:", error);
    message.error("ອັບໂຫລດຮູບພາບບໍ່ສຳເລັດ");

    if (uploadedImages.value.length > 0) {
      const lastBlobUrl = uploadedImages.value.pop();
      URL.revokeObjectURL(lastBlobUrl as string);
    }
  } finally {
    uploadLoading.value = false;
  }
};

// Delete uploaded image
const deleteImage = (index: number) => {
  uploadedImages.value.splice(index, 1);
  formState.value.files.splice(index, 1);

  if (uploadedImages.value.length === 0) {
    uploadCompleted.value = false;
    if (attachments.value.length === 0) {
      createModalVisible.value = true;
    }
  }
};

// Lifecycle
onMounted(async () => {
  if (receiptId) {
    await rStore.fetchById(receiptId);
  }
  // Cleanup blob URLs on unmount
  uploadedImages.value.forEach((url) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
});

// Handle Approve
const handleApprove = () => {
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
    <ApvLayout />
    <div class="approval-container">
      <div class="user-info">
        <!-- Info Sections - Auto Responsive Grid -->
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

              <div class="account-number">
                <h3 class="field-label">
                  {{ t("receipt.title.account_number") }}
                </h3>
                <UiInput
                  v-if="isUserPendingApprover && isRole && !dataInfo.account_code"
                  v-model="formModel.account_code"
                  placeholder="ປ້ອນລະຫັດບັນຊີ"
                  size="middle"
                  class="account-input"
                />
                <span
                  v-if="dataInfo.account_code"
                  class="field-value"
                >
                  {{ dataInfo.account_code }}
                </span>
              </div>
            </div>
          </div>

          <!-- Company Section -->
          <div class="info-card">
            <h2 class="card-title">
              {{ t("receipt.from_company") }}
            </h2>
            <div class="company-content flex-layout">
              <div class="company-section">
                <p class="company-name">
                  {{ dataInfo.company.name }}
                </p>

                <div class="company-address">
                  <h3 class="field-label">
                    {{ t("receipt.address") }}
                  </h3>
                  <p class="field-text">
                    {{ dataInfo.company.address }}
                  </p>
                </div>
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
              :columns="columns(t)"
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
                    {{ record.purchase_order_item?.purchase_request_item?.title }}
                  </span>
                </template>
                <template v-if="column.key === 'budget_code'">
                  <span class="cell-text cell-budget">
                    {{ budgetAcc?.code }} - {{ budgetAcc?.name }}
                  </span>
                </template>
                <template v-if="column.key === 'quantity'">
                  <span class="cell-text">{{ record.quantity || 1 }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </div>

        <!-- Upload Section -->
        <div
          v-if="check && isAwaitingUser && !attachments.length && !uploadedImages.length"
          class="upload-section"
        >
          <h2 class="upload-title">ອັບໂຫລດສະລິບໂອນເງິນ</h2>

          <!-- Upload trigger -->
          <div
            class="upload-trigger"
            @click="createModalVisible = true"
          >
            <Icon icon="mdi:upload" class="upload-icon" />
            <p class="upload-text">Click to upload</p>
            <p class="upload-hint">SVG, PNG, JPG (MAX. 5MB)</p>
          </div>
        </div>

        <!-- Show old attachments -->
        <div
          v-if="attachments.length && !uploadedImages.length"
          class="attachments-section"
        >
          <h2 class="upload-title">ຫຼັກຖານການໂອນເງິນ</h2>

          <div class="attachments-grid">
            <div
              v-for="(doc, index) in attachments"
              :key="'old-' + index"
              class="attachment-item"
            >
              <a-image
                class="attachment-image"
                :src="doc?.file_name_url"
                alt="attachment"
              />
            </div>

            <!-- Upload button if user can upload -->
            <div
              v-if="check && isAwaitingUser"
              class="upload-trigger-small"
              @click="createModalVisible = true"
            >
              <Icon icon="mdi:upload" class="upload-icon" />
              <p class="upload-text">Add more</p>
            </div>
          </div>
        </div>

        <!-- Show uploaded images -->
        <div v-if="uploadedImages.length" class="attachments-section">
          <h2 class="upload-title">ຫຼັກຖານການໂອນເງິນ</h2>

          <div class="attachments-grid">
            <!-- Old attachments -->
            <div
              v-for="(doc, index) in attachments"
              :key="'old-' + index"
              class="attachment-item attachment-item-old"
            >
              <a-image
                class="attachment-image"
                :src="doc?.file_name_url"
                alt="attachment"
              />
            </div>

            <!-- New uploaded images -->
            <div
              v-for="(img, index) in uploadedImages"
              :key="'new-' + index"
              class="attachment-item attachment-item-new"
            >
              <a-image
                :src="img"
                alt="uploaded"
                class="attachment-image"
              />
              <button
                @click="deleteImage(index)"
                class="delete-btn"
              >
                ×
              </button>
            </div>

            <!-- Add more button -->
            <div
              class="upload-trigger-small"
              @click="createModalVisible = true"
            >
              <Icon icon="material-symbols:image-arrow-up-outline-rounded" class="upload-icon" />
            </div>
          </div>
        </div>

        <!-- Upload Modal -->
        <a-modal
          v-model:open="createModalVisible"
          title="ອັບໂຫລດສະລິບໂອນເງິນ"
          :footer="null"
          width="90%"
          :style="{ maxWidth: '600px' }"
        >
          <a-upload
            :file-list="[]"
            :before-upload="(file: File) => {
              handleImageUpload([file]);
              return false;
            }"
            :show-upload-list="false"
            accept="image/*"
            multiple
          >
            <a-button :loading="uploadLoading" class="w-full">
              <Icon icon="mdi:upload" class="mr-2" />
              ເລືອກໄຟລ໌ຮູບພາບ
            </a-button>
          </a-upload>
        </a-modal>

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

/* ===== Purpose & Company Content ===== */
.purpose-content,
.company-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .purpose-content,
  .company-content {
    gap: 1rem;
  }
}

.purpose-text,
.company-name {
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

@media (min-width: 768px) {
  .purpose-text,
  .company-name {
    font-size: 0.875rem;
  }
}

@media (min-width: 1024px) {
  .purpose-text,
  .company-name {
    font-size: 1rem;
  }
}

/* ===== Field Labels ===== */
.field-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

@media (min-width: 768px) {
  .field-label {
    font-size: 0.875rem;
  }
}

.field-value {
  font-size: 0.875rem;
  color: #0f172a;
  font-weight: 500;
}

@media (min-width: 768px) {
  .field-value {
    font-size: 1rem;
  }
}

.field-value-empty {
  font-size: 0.75rem;
  color: #94a3b8;
}

@media (min-width: 768px) {
  .field-value-empty {
    font-size: 0.875rem;
  }
}

.field-text {
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.5;
  word-wrap: break-word;
}

@media (min-width: 768px) {
  .field-text {
    font-size: 0.875rem;
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

.cell-budget {
  display: block;
  min-width: 120px;
  word-wrap: break-word;
  overflow-wrap: break-word;
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

  .upload-section,
  .attachments-section {
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

/* ===== Upload Section ===== */
.upload-section {
  margin-top: 1.5rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  .upload-section {
    margin-top: 2rem;
    padding: 1.25rem;
  }
}

.upload-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .upload-title {
    font-size: 1rem;
  }
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 190px;
  height: 120px;
  border: 2px dashed #d1d5db;
  background: rgba(243, 244, 246, 0.6);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-trigger:hover {
  border-color: #ef4444;
  background: rgba(243, 244, 246, 0.8);
}

.upload-icon {
  font-size: 1.5rem;
  color: #9ca3af;
  margin-bottom: 0.25rem;
}

.upload-text {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
}

.upload-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

/* ===== Attachments Section ===== */
.attachments-section {
  margin-top: 1.5rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  .attachments-section {
    margin-top: 2rem;
    padding: 1.25rem;
  }
}

.attachments-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

@media (min-width: 768px) {
  .attachments-grid {
    gap: 1.25rem;
  }
}

.attachment-item {
  position: relative;
  width: 90px;
  height: 130px;
  flex-shrink: 0;
}

.attachment-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.375rem;
}

.attachment-item-old {
  border: 2px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
}

.attachment-item-new {
  border: 2px solid #3b82f6;
  border-radius: 0.375rem;
  overflow: hidden;
}

.delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.upload-trigger-small {
  width: 90px;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
  background: rgba(243, 244, 246, 0.6);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.upload-trigger-small:hover {
  border-color: #ef4444;
  background: rgba(243, 244, 246, 0.8);
}

.upload-trigger-small .upload-icon {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.upload-trigger-small .upload-text {
  font-size: 0.75rem;
}

/* ===== Account Input ===== */
.account-input {
  width: 100%;
}

@media (min-width: 640px) {
  .account-input {
    max-width: 15rem;
  }
}
</style>
