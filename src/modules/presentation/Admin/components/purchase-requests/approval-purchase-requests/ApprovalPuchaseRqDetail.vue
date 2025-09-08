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
import { useRoute } from "vue-router";
import { useDocumentStatusStore } from "../../../stores/document-status.store";
import { formatDate } from "@/modules/shared/formatdate";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useApprovalStepStore } from "../../../stores/approval-step.store";
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
const profileImage = ref("/public/Profile-PNG-File.png");
const userName = ref("ທ້າວສຸກີ້");
const department = ref("ພະແນກການເງິນ");
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
// const imageList = computed(() => {
//   return items.value.map((item) => item.file_name_url).filter((url): url is string => !!url);
// });
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
        const success = await handleApprove();
        if (!success) {
          modalAction.value = "";
        }
      },
    },
  ];
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

// Handle OTP confirmation - show success modal after OTP
const handleOtpConfirm = async (otpCode: string) => {
  if (!otpCode) {
    error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາປ້ອນລະຫັດ OTP");
    return;
  }

  if (!approvalStepId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນຂັ້ນຕອນການອະນຸມັດ");
    return;
  }

  try {
    confirmLoading.value = true;
    const approvalId = approvalStepStore.otpResponse?.approval_id;

    if (!approvalId) {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນການອະນຸມັດ");
      return;
    }
    const documentId = route.params.id as string;
    const payload = {
      type: "pr" as const,
      statusId: Number(approvedStatusId.value),
      remark: "Approved",
      approvalStepId: Number(approvalStepId.value),
      approval_id: approvalId,
      otp: otpCode,
      is_otp: true,
    };
    const { approval_id } = payload;

    const success = await approvalStepStore.submitApproval(documentId, {
      ...payload,
      approval_id,
    });

    if (success) {
      isOtpModalVisible.value = false;
      setTimeout(() => {
        isSuccessModalVisible.value = true;
      }, 300);
    } else {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດຢືນຢັນ OTP ໄດ້");
    }
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  } finally {
    confirmLoading.value = false;
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

const handleApprove = async () => {
  const currentStep = currentApprovalStep.value;

  if (!approvedStatusId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນສະຖານະ 'Approved' ໃນລະບົບ");
    return false;
  }

  if (!currentStep) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step ທີ່ຕ້ອງອະນຸມັດ");
    return false;
  }

  try {
    approvalStepId.value = currentStep.id;
    requiresOtp.value = currentStep.is_otp === true;
    modalAction.value = "approve";

    if (requiresOtp.value && approvalStepId.value) {
      const otpData = await approvalStepStore.sendOtp(approvalStepId.value);
      if (!otpData) {
        return false;
      }
      approvalId.value = otpData.approval_id;
      isApproveModalVisible.value = false;
      isOtpModalVisible.value = true;
      return true;
    } else {
      const documentId = route.params.id as string;
      const payload = {
        type: "pr" as const,
        statusId: Number(approvedStatusId.value),
        remark: "Approved",
        approvalStepId: Number(approvalStepId.value),
        is_otp: false,
      };

      const success = await approvalStepStore.submitApproval(documentId, payload);
      if (success) {
        isApproveModalVisible.value = false;
        isSuccessModalVisible.value = true;
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error("Error in handleApprove:", err);
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    return false;
  }
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

      console.log("Sending payload:", payload);

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
        :document-date="'2025-03-26'"
        :action-buttons="approval ? customButtonSuccess : customButtons"
        document-status="ລໍຖ້າຫົວໜ້າພະແນກພັດທະນາທຸລະກິດກວດສອບ"
        document-status-class="text-orange-400 text-sm font-medium ml-2 ring-2 ring-orange-300 px-3 py-1 rounded-full"
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
            <a-image
              :src="profileImage"
              alt="avatar"
              class="w-20 h-20 rounded-full object-cover"
              :width="80"
              :height="80"
              :preview="false"
            />
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
            <template #total_price="{ record }">
              <span>₭ {{ formatPrice(record.getTotalPrice()) }}</span>
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
          <div class="total flex items-center md:justify-end justify-start md:px-6 px-1 pt-4 gap-4">
            <p class="font-medium text-slate-600">{{ t("purchase-rq.field.amount") }}:</p>
            <p class="font-semibold md:text-lg text-sm text-slate-700">
              {{ formatPrice(totalAmount) }}₭
            </p>
          </div>
        </div>

        <!-- Sample Images Section -->
        <!-- <div class="image space-y-4 py-4 shadow-sm px-6 rounded-md">
          <h2 class="text-md font-semibold">
            {{ t("purchase-rq.field.img_example") }}
          </h2>
          <div class="flex flex-wrap gap-6">
            <a-image
              v-for="(img, index) in imageList"
              :key="index"
              :src="img"
              alt="example"
              :width="280"
              :height="150"
              :preview="true"
              class="rounded-xl shadow-sm"
            />
          </div>
        </div> -->

        <!-- Signature Section -->
        <div
          class="signature flex items-center gap-[10rem] shadow-sm py-4 px-6 rounded-md mb-[10rem]"
        >
          <div class="signature1">
            <h2 class="text-md font-semibold">
              {{ t("purchase-rq.signature") }}
            </h2>
            <p class="text-slate-500 text-sm">
              {{ t("purchase-rq.proposer") }}
            </p>

            <a-image
              src="/public/2.png"
              alt="signature"
              :width="120"
              :height="80"
              :preview="false"
            />
            <div class="info text-sm text-slate-600 -space-y-2 mt-4">
              <p>{{ userName }}</p>
              <p>{{ department }}</p>
            </div>
          </div>
          <div v-if="approval" class="signature1">
            <p class="text-slate-500 text-sm mt-10">{{ t("purchase-rq.approver") }}</p>
            <a-image
              src="/public/2.png"
              alt="signature"
              :width="120"
              :height="80"
              :preview="false"
            />
            <div class="info text-sm text-slate-600 -space-y-2 mt-4">
              <p>ສຸພາພອນ ພະໄຊຍະວົງ</p>
              <p>ຫົວໜ້າພະແນກທຸລະກິດ</p>
            </div>
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
</style>
