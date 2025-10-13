<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import type { ButtonType } from "@/modules/shared/buttonType";
import { storeToRefs } from "pinia";
import { columns } from "../column";
import { useToggleStore } from "../../../stores/storage.store";
import { printContent } from "../helpers/printer";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import { usePurchaseRequestsStore } from "../../../stores/purchase_requests/purchase-requests.store";
import { useRoute, useRouter } from "vue-router";
import { useDocumentStatusStore } from "../../../stores/document-status.store";
import { formatDate } from "@/modules/shared/formatdate";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useApprovalStepStore } from "../../../stores/approval-step.store";
import { Icon } from "@iconify/vue";
import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface";

import OtpModal from "../modal/OtpModal.vue";
import SuccessModal from "../modal/SuccessModal.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table from "@/common/shared/components/table/Table.vue";

const { t } = useI18n();
const purchaseRequestStore = usePurchaseRequestsStore();
const documentStatusStore = useDocumentStatusStore();
const requestDetail = ref<PurchaseRequestEntity | null>(null);
const { error } = useNotification();
const approvalStepStore = useApprovalStepStore();
const route = useRoute();
const router = useRouter();
const loading = ref(true);
const isApproveModalVisible = ref(false);

/*********************check show button to data ********************* */
const currentApprovalStep = computed(() => {
  return requestDetail.value
    ?.getUserApproval()
    ?.approval_step.find((step) => step.status_id === 1 && !step.approver);
});
const canApprove = computed(() => {
  return !!currentApprovalStep.value;
});
/****************************************** */

const requesterInfo = computed(() => requestDetail.value?.getRequester());
const departmentInfo = computed(() => requestDetail.value?.getDepartment());
const positionInfo = computed(() => requestDetail.value?.getPosition());
const items = computed(() => requestDetail.value?.getItems() ?? []);
const totalAmount = computed(() => requestDetail.value?.getTotal() ?? 0);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getStepTitle = (index: number, step: any) => {
  if (index === 0) {
    return t("purchase-rq.proposer");
  }
  return `${t("purchase-rq.approver")} ${index}`;
};

/****************************************** */
const approvedStatusId = computed(() => {
  return documentStatusStore.document_Status.find((s) => s.getName() === "APPROVED")?.getId();
});
const rejectedStatusId = computed(() => {
  return documentStatusStore.document_Status.find((s) => s.getName() === "REJECTED")?.getId();
});
/****************************************** */

// Modal states
const isOtpModalVisible = ref(false);
const isSuccessModalVisible = ref(false);
const confirmLoading = ref(false);
const modalAction = ref(""); // 'approve' or 'reject'
const approval = ref(false);
const isRejectModalVisible = ref(false);
const rejectReason = ref("");
const approvalStepId = ref<number | null>(null);
const requiresOtp = ref(false);
const approvalId = ref<number | null>(null);

const customButtons = computed(() => {
  if (!canApprove.value) {
    return [];
  }

  const currentStep = currentApprovalStep.value;
  if (!currentStep) return [];

  return [
    {
      label: t("purchase-rq.card_title.refused"),
      type: "default" as ButtonType,
      onClick: () => {
        modalAction.value = "reject";
        isRejectModalVisible.value = true;
      },
    },
    {
      label: t("purchase-rq.btn.approval"),
      type: "primary" as ButtonType,
      onClick: async () => {
        modalAction.value = "approve";
        await handleApprove();
        // Note: handleApprove doesn't return a value, so removed success check
        modalAction.value = "";
      },
    },
  ];
});
/**********Check logic OTP and No OTP TO PO********** */
const approvalSteps = computed(() => requestDetail.value?.getUserApproval()?.approval_step ?? []);
const isLastStep = computed(() => {
  const lastStep = [...approvalSteps.value].sort((a, b) => b.step_number - a.step_number)[0];
  return currentApprovalStep.value?.step_number === lastStep?.step_number;
});
const approvalStep = computed(() => {
  const steps = requestDetail.value?.getUserApproval()?.approval_step ?? [];
  return [...steps].sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0));
});

const documentStatus = computed(() => {
  const rejectedStep = requestDetail.value
    ?.getUserApproval()
    ?.approval_step?.find((step) => step.status_id === 3);

  if (rejectedStep) {
    return {
      status: `ຖືກປະຕິເສດ`,
      // ໂດຍ ${rejectedStep.approver?.username || ''} ${rejectedStep.position?.name || ''
      statusClass: "text-red-500 font-medium ml-2 bg-red-50 px-3 py-1 rounded-full",
    };
  }
  const pendingStep = requestDetail.value
    ?.getUserApproval()
    ?.approval_step?.find((step) => step.status_id === 1);

  if (!pendingStep) {
    return {
      status: "ອະນຸມັດສຳເລັດ",
      statusClass: "text-green-500 font-medium ml-2 bg-green-50 px-3 py-1 rounded-full",
    };
  }
  // const nextApprover = pendingStep.doc_approver?.[0]?.user?.username;
  const nextDepartment = pendingStep.doc_approver?.[0]?.department?.name;

  return {
    status: `ລໍຖ້າ ${nextDepartment || ""} ກວດສອບ`,
    // ${nextApprover || ''}
    statusClass: "text-orange-500 font-medium ml-2 bg-orange-50 px-3 py-1 rounded-full",
  };
});

const handlePrint = async () => {
  try {
    await printContent({
      title: "ໃບສະເໜີຈັດຊື້ ເລກທີ 0036/ພລ",
      contentSelector: ".body",
      hideElements: [".fixed", ".ant-drawer", ".ant-modal"],
      customStyles: `
        /* Add any custom Lao font or specific styling */
        body {
          font-family: 'Noto Sans Lao', sans-serif;
        }
        .signature img {
          max-width: 180px;
          max-height: 100px;
        }
      `,
    });
  } catch (error) {
    console.error("Print error:", error);
  }
};
const customButtonSuccess = [
  {
    label: "print",
    icon: "ant-design:printer-outlined",
    class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
    type: "default" as ButtonType,
    onClick: handlePrint,
  },
];

const handleApprove = async () => {
  isApproveModalVisible.value = false;

  const currentStep = currentApprovalStep.value;
  if (!currentStep?.id) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step ປັจຈຸບັນ");
    return;
  }

  const documentId = route.params.id as string;

  if (currentStep.is_otp === true) {
    try {
      const otpData = await approvalStepStore.sendOtp(currentStep.id);
      if (otpData) {
        isOtpModalVisible.value = true;
      }
    } catch (err) {
      console.error("Error in handleApprove (OTP case):", err);
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດສົ່ງ OTP ໄດ້");
    }
  } else {
    try {
      const payload: SubmitApprovalStepInterface = {
        type: "pr",
        statusId: Number(approvedStatusId.value),
        remark: "Approved",
        approvalStepId: Number(currentStep.id),
        is_otp: false,
      };
      const success = await approvalStepStore.submitApproval(documentId, payload);
      if (success) {
        await purchaseRequestStore.fetchById(documentId);

        if (currentStep.step_number === 1) {
          router.push({ name: "apv_purchase_request.index" });
        } else if (isLastStep.value) {
          router.push({
            name: "doc-type-select",
            query: { purchase_request_id: requestDetail.value?.getId() },
          });
        }
      }
    } catch (err) {
      error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    }
  }
};

const handleOtpConfirm = async (otpCode: string) => {
  if (!otpCode) {
    error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາປ້ອນລະຫັດ OTP");
    return;
  }

  const currentStep = currentApprovalStep.value;
  if (!currentStep?.id) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step");
    return;
  }

  const approvalIdFromOtp = approvalStepStore.otpResponse?.approval_id;
  if (!approvalIdFromOtp) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນອ້างອີງ OTP");
    return;
  }

  try {
    const documentId = route.params.id as string;
    const payload: SubmitApprovalStepInterface = {
      type: "pr",
      statusId: Number(approvedStatusId.value),
      remark: "Approved",
      approvalStepId: Number(currentStep.id),
      approval_id: approvalIdFromOtp,
      is_otp: true,
      otp: otpCode,
    };

    const success = await approvalStepStore.submitApproval(documentId, payload);
    if (success) {
      isOtpModalVisible.value = false;

      if (currentStep.step_number === 1) {
        router.push({ name: "apv_purchase_request.index" });
      } else if (isLastStep.value) {
        router.push({
          name: "doc-type-select",
          query: { purchase_request_id: requestDetail.value?.getId() },
        });
      }
    }
  } catch (err) {
    console.error("Error in handleOtpConfirm:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    isOtpModalVisible.value = false;
  }
};

const handleResendOtp = async () => {
  if (!approvalStepId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນຂັ້ນຕອນການອະນຸມັດ");
    return;
  }
  try {
    const otpData = await approvalStepStore.sendOtp(approvalStepId.value);
    if (otpData) {
      approvalId.value = otpData.approval_id;
    }
  } catch (err) {
    console.error("Error resending OTP:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  }
};

const handleOtpClose = () => {
  isOtpModalVisible.value = false;
  modalAction.value = "";
};

// Handle final success confirmation
const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາລະບຸເຫດຜົນໃນການປະຕິເສດ");
    return;
  }

  if (!rejectedStatusId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນສະຖານະ 'Rejected' ໃນລະບົບ");
    return;
  }

  if (!requestDetail.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    return;
  }

  try {
    const userApproval = requestDetail.value.getUserApproval();
    if (!userApproval?.approval_step?.[0]) {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step");
      return;
    }

    const currentStep = userApproval.approval_step[0];
    approvalStepId.value = currentStep.id;
    requiresOtp.value = currentStep.is_otp === true;

    if (!requiresOtp.value) {
      const documentId = route.params.id as string;
      const payload = {
        type: "pr" as const,
        statusId: Number(rejectedStatusId.value),
        remark: rejectReason.value,
        approvalStepId: Number(approvalStepId.value),
      };

      // console.log("Sending payload:", payload);

      const success = await approvalStepStore.submitApproval(documentId, payload);
      if (success) {
        isRejectModalVisible.value = false;
        rejectReason.value = "";
        isSuccessModalVisible.value = true;
      }
      return;
    }
    // ถ้าต้องใช้ OTP แสดง OTP Modal
    isRejectModalVisible.value = false;
    isOtpModalVisible.value = true;
  } catch (err) {
    console.error("Error in handleReject:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  }
};

const handleSuccessConfirm = async () => {
  confirmLoading.value = true;
  try {
    // ปิด Success Modal
    isSuccessModalVisible.value = false;
    modalAction.value = "";
    approval.value = true;
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  } finally {
    confirmLoading.value = false;
  }
};

const handleSuccessCancel = () => {
  isSuccessModalVisible.value = false;
  modalAction.value = "";
};

const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);
const topbarStyle = computed(() => {
  return toggle.value ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
});

const handleToggle = () => {
  toggle.value = !toggle.value;
  localStorage.setItem("toggle", toggle.value.toString());
};

// Dynamic success modal content based on action
const successModalProps = computed(() => {
  if (modalAction.value === "") {
    return {
      message: t("modal.success.title"),
      description: t("modal.success.description"),
      iconName: "mdi:check-decagram",
      iconColor: "text-green-500",
      buttonText: t("purchase-rq.btn.confirm"),
    };
  } else {
    return {
      message: t("modal.refused.title"),
      description: t("modal.refused.description"),
      iconName: "mdi:close-circle",
      iconColor: "text-red-500",
      buttonText: t("purchase-rq.btn.confirm"),
    };
  }
});

watch(modalAction, (newVal) => {
  if (newVal === "") {
    approval.value = true;
  } else {
    approval.value = false; // optional if you need to reset
  }
});

onMounted(async () => {
  const requestId = route.params.id as string;
  if (requestId) {
    loading.value = true;
    try {
      const [data] = await Promise.all([
        purchaseRequestStore.fetchById(requestId),
        documentStatusStore.fetctDocumentStatus({ page: 1, limit: 100 }),
      ]);

      requestDetail.value = data;
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      loading.value = false;
    }
  }
});
</script>

<template>
  <div class="container mx-auto py-1 px-0">
    <!-- Header Component -->
    <div
      class="fixed px-6 py-4 top-0 z-20 bg-white shadow-sm transition-all duration-150 mt-[4rem]"
      :class="topbarStyle"
    >
      <header-component
        @toggle="handleToggle"
        :header-title="t('purchase-rq.approval_proposal')"
        :breadcrumb-items="[t('purchase-rq.approval_proposal'), t('purchase-rq.btn.approval')]"
        :document-prefix="t('purchase-rq.field.proposal')"
        :document-number="`${t('purchase-rq.field.pr_number')} 0036/ພລ - ${t('purchase-rq.date')}`"
        :document-date="formatDate(requestDetail?.getRequestedDate() ?? new Date())"
        :action-buttons="approval ? customButtonSuccess : customButtons"
        :document-status="documentStatus.status"
        :document-status-class="documentStatus.statusClass"
      />
    </div>

    <!-- Main Content -->
    <div v-if="loading" class="mt-[10rem] text-center">Loading...</div>

    <div class="body mt-[10rem]" v-else-if="requestDetail">
      <div class="user-info shadow-sm py-2">
        <!-- User Information Section -->
        <h2 class="text-md font-semibold px-6 mb-4">
          {{ t("purchase-rq.field.proposer") }}
        </h2>
        <div class="info flex items-center justify-between px-6 gap-4 mb-4">
          <div class="flex items-center gap-4">
            <div
              class="flex items-center justify-center **w-16 h-16** rounded-full **bg-blue-100** **text-4xl**"
            >
              <Icon icon="mdi:user" class="text-6xl" />
            </div>
            <div class="detail -space-y-2">
              <p class="font-medium">{{ requesterInfo?.username }}</p>
              <p class="text-gray-600">{{ positionInfo?.name }} - {{ departmentInfo?.name }}</p>
            </div>
          </div>
          <div class="want-date -space-y-0 px-6 mb-4">
            <h2 class="text-md font-semibold">
              {{ t("purchase-rq.field.date_rq") }}
            </h2>
            <p class="text-gray-600 text-sm">{{ formatDate(requestDetail.getExpiredDate()) }}</p>
          </div>
        </div>

        <!-- Required Date Section -->

        <!-- Purpose Section -->
        <div class="purposes -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">
            {{ t("purchase-rq.field.purposes") }}
          </h2>
          <p class="text-gray-600 text-sm">
            {{ requestDetail.getPurposes() }}
          </p>
        </div>

        <!-- Items Table Section -->
        <div class="table -space-y-0 mb-2 w-full px-6 shadow-sm rounded-md">
          <h2 class="text-md font-semibold">
            {{ t("purchase-rq.field.title") }}
          </h2>
          <Table :columns="columns(t)" :dataSource="items" :pagination="false" row-key="id">
            <template #index="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
            <template #price="{ record }">
              <span>₭ {{ formatPrice(record.getPrice()) }}</span>
            </template>

            <template #image="{ record }">
              <a-image
                v-if="record.file_name_url"
                :src="record.file_name_url"
                alt="example"
                :width="50"
                :height="50"
                :preview="true"
                class="rounded-lg shadow-sm"
              />
              <span v-else class="text-gray-400 italic">No Image</span>
            </template>
          </Table>
          <div class="total flex items-center justify-end px-6">
            <span class="font-medium text-slate-600"
              >{{ t("purchase-rq.field.total_price") }}:</span
            >
            <span class="font-semibold md:text-lg text-sm text-slate-700">
              {{ formatPrice(requestDetail?.getTotal()) }}₭
            </span>
          </div>
          <div class="total flex items-center md:justify-end justify-start md:px-6 px-1 gap-4">
            <span class="font-medium text-slate-600">{{ t("purchase-rq.field.amounts") }}:</span>
            <span class="font-semibold md:text-lg text-sm text-slate-700">
              {{ formatPrice(totalAmount) }}₭
            </span>
          </div>
        </div>
        <!-- Signature Section -->
        <div class="shadow-sm rounded-md">
          <h2 class="text-md font-semibold">
            {{ t("purchase-rq.signature") }}
          </h2>

          <div class="flex flex-wrap gap-4">
            <!-- Approval Steps -->
            <template v-for="(step, index) in approvalStep" :key="step.id">
              <div>
                <!-- Step Title -->
                <p class="text-slate-500 text-sm mb-2">
                  {{ getStepTitle(index, step) }}
                </p>

                <!-- Signature Display -->
                <div class="signature-box w-[80px] h-[80px] border rounded-md overflow-hidden">
                  <template v-if="step.status_id === 2 && step.approver?.user_signature">
                    <!-- Approved signature -->
                    <a-image
                      :src="step.approver.user_signature.signature_url"
                      alt="signature"
                      :width="80"
                      :height="80"
                      :preview="false"
                      class="block"
                    />
                  </template>
                  <template v-else-if="step.status_id === 1">
                    <!-- Pending signature -->
                    <div class="h-full flex items-center justify-center bg-gray-50">
                      <span class="text-gray-400 text-center">{{ t("purchase-rq.pending") }}</span>
                    </div>
                  </template>
                </div>

                <!-- Approver Info -->
                <div class="info text-sm text-slate-600 -space-y-1">
                  <template v-if="step.approver">
                    <p class="font-medium">{{ step.approver.username }}</p>
                    <p class="text-xs">{{ step.position?.name || "-" }}</p>
                    <p class="text-xs" v-if="step.approved_at">
                      {{ formatDate(step.approved_at) }}
                    </p>
                  </template>
                  <template v-else-if="step.doc_approver?.[0]?.user">
                    <p class="font-medium">{{ step.doc_approver[0].user.username }}</p>
                    <p class="text-xs">{{ t("purchase-rq.pending") }}</p>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- OTP Modal -->
    <OtpModal
      :visible="isOtpModalVisible"
      :title="t('purchase-rq.otp_verification')"
      :approval-step-id="approvalStepId"
      :loading="confirmLoading"
      @confirm="handleOtpConfirm"
      @close="handleOtpClose"
      @resend="handleResendOtp"
    />

    <!-- Success Modal -->
    <SuccessModal
      v-model:visible="isSuccessModalVisible"
      :message="successModalProps.message"
      :description="successModalProps.description"
      :icon-name="successModalProps.iconName"
      :icon-color="successModalProps.iconColor"
      :button-text="successModalProps.buttonText"
      :loading="confirmLoading"
      @confirm="handleSuccessConfirm"
      @cancel="handleSuccessCancel"
    />

    <!-- Reject Modal -->
    <UiModal
      :title="t('purchase-rq.card_title.refused')"
      :visible="isRejectModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isRejectModalVisible = false"
      @ok="handleReject"
    >
      <div class="space-y-4">
        <p>{{ t("modal.description") }}</p>
        <div>
          <p class="mb-2 font-semibold">{{ t("modal.reason") }}</p>
          <Textarea :modelValue="rejectReason" :placeholder="t('modal.enter_reason')" :rows="4" />
        </div>
      </div>
      <template #footer>
        <UiButton
          @click="handleReject"
          type="primary"
          :loading="confirmLoading"
          color-class="w-full"
          >{{ t("purchase-rq.btn.confirm") }}</UiButton
        >
      </template>
    </UiModal>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here if needed */
.user-info {
  background: white;
  border-radius: 0.5rem;
}

.table {
  background: white;
}

.image {
  background: white;
}

.signature {
  background: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .total {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .info {
    flex-direction: column;
    text-align: center;
  }
}

.signature-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
}
</style>
