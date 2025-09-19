<script setup lang="ts">
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { computed, ref, watch } from "vue";
import type { ButtonType } from "@/modules/shared/buttonType";
import { storeToRefs } from "pinia";
import { useToggleStore } from "../../../stores/storage.store";
import { useI18n } from "vue-i18n";
import { printContent } from "../../purchase-requests/helpers/printer";
import OtpModal from "./modals/OtpModal.vue";
import SuccessModal from "../../purchase-requests/modal/SuccessModal.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useApprovalStepStore } from "../../../stores/approval-step.store";
const approvalStepStore = useApprovalStepStore();
const { error } = useNotification();
const otpSending = ref(false);
const { t } = useI18n();
const props = defineProps<{
  dataHead: {
    rId: number;
    no?: string;
    isApproved?: boolean;
    status?: {id: number, name?: string}[];
    data?: {
      stepId?: number;
      remark?: string;
      type?: string;
      files?: {file_name: string}[],
      account_code?: string;
    },
    created_at?: string;
    is_otp?: boolean;
    approver_info?: {
      status?: {
        id: number,
        name: string,
        dpm?: {
          id: number,
          name?: string
        }[]}[]
    }[]
  };
}>();

// Modal states
const isOtpModalVisible = ref(false);
const isSuccessModalVisible = ref(false); // Add success modal state
const modalAction = ref(""); // 'approve' or 'reject'
const approval = ref(false);
const isRejectModalVisible = ref(false);
const otpLoading = ref(false);

const customButtons = computed(() => {
  const buttons = [
    {
      label: "print",
      icon: "ant-design:printer-outlined",
      class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
      type: "default" as ButtonType,
      onClick: handlePrint,
    },
  ];

  if (props?.dataHead.isApproved) {
    buttons.push(
      {
        label: t("purchase-rq.card_title.refused"),
        icon: "",
        class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
        type: "default" as ButtonType,
        onClick: async () => {
          modalAction.value = "reject";
          isRejectModalVisible.value = true;
        },
      },
      {
        label: t("purchase-rq.btn.approval"),
        icon: "",
        class: "bg-primary text-white flex items-center gap-2 hover:bg-blue-600",
        type: "primary" as ButtonType,
        onClick: async () => {
          modalAction.value = "approve";
          if (props.dataHead?.is_otp) {
      // 🔹 Call request OTP before showing modal
      await requestOtp();
    } else {
      // 🔹 Skip OTP, just open modal directly
      isOtpModalVisible.value = true;
    }
        },
      }
    );
  }

  return buttons;
});

const handlePrint = async () => {
  try {
    await printContent({
      title: "ໃບສະເໜີຈັດຊື້ ເລກທີ 0036/ພລ",
      contentSelector: ".body",
      hideElements: [".fixed", ".ant-drawer", ".ant-modal"],
      customStyles: `
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

// OTP Modal handlers
const handleOtpConfirm = async (otpValue: string) => {
  try {
    otpLoading.value = true;

    if (modalAction.value === "approve") {
      // Handle approval logic with OTP
      console.log("Approving with OTP:", otpValue);
      isOtpModalVisible.value = false;
      isSuccessModalVisible.value = true;
    }
  } catch (error) {
    console.error("OTP confirmation error:", error);
    // Handle error - maybe show error modal instead
  } finally {
    otpLoading.value = false;
  }
};

const handleOtpClose = () => {
  isOtpModalVisible.value = false;
  modalAction.value = "";
};

const handleOtpResend = async () => {
  try {
    if (!props.dataHead?.data?.stepId) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step ID");
    return;
  }
    await approvalStepStore.sendOtp(props.dataHead.data.stepId);
  } catch (error) {
    console.error("Resend OTP error:", error);
  }
};
const requestOtp = async () => {
  if (!props.dataHead?.data?.stepId) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step ID");
    return;
  }

  try {
    otpSending.value = true;
    const otpResponse = await approvalStepStore.sendOtp(props.dataHead.data.stepId);

    if (otpResponse) {
      // 🔹 Save response in store (already inside approvalStepStore.otpResponse)
      isOtpModalVisible.value = true;
    } else {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດສົ່ງລະຫັດ OTP ໄດ້");
    }
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  } finally {
    otpSending.value = false;
  }
};
// Success Modal handlers
const handleSuccessConfirm = () => {
  isSuccessModalVisible.value = false;
  modalAction.value = "";
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

watch(modalAction, (newVal) => {
  if (newVal === "") {
    approval.value = true;
  } else {
    approval.value = false;
  }
});


const documentStatus = computed(() => {
  // ✅ Find departments where status.id = 1
  const pendingDepartments =
    props.dataHead?.approver_info?.flatMap((d) =>
      d.status
        ?.filter((s) => s.id === 1) // only pending
        .flatMap((s) => s.dpm ?? []) ?? []
    ) ?? [];

  if (pendingDepartments.length > 0) {
    return `ລໍຖ້າ ${pendingDepartments.map((d) => d.name).join(", ")} ອະນຸມັດ`;
  }

  if (props.dataHead?.status?.some((s) => s.id === 3)) {
    return "ຖືກປະຕິເສດ";
  }

  return "ອະນຸມັດແລ້ວ";
});


const documentStatusClass = computed(() => {
  const status = documentStatus.value;

  if (status.includes("ລໍຖ້າ")) {
    return "text-orange-500 text-sm font-medium ml-2 ring-2 ring-orange-300 px-3 py-1 rounded-full";
  }
  if (status.includes("ປະຕິເສດ")) {
    return "text-red-500 text-sm font-medium ml-2 ring-2 ring-red-600 px-3 py-1 rounded-full";
  }
  return "text-green-600 text-sm font-medium ml-2 ring-1 ring-green-500 px-3 py-1 rounded-full";
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
        :header-title="t('menu-sidebar.receipt')"
        :breadcrumb-items="[
          t('menu-sidebar.receipt'),
          t('disbursement.field.detail'),
        ]"
        :document-prefix="t('menu-sidebar.receipt')"
        :document-number="`${t('purchase-rq.field.pr_number')} ${props.dataHead?.no} - ${t(
          'purchase-rq.date'
        )}`"
        :document-date="(props.dataHead?.created_at)"
        :action-buttons="customButtons"
        :document-status="documentStatus"
        :document-status-class="documentStatusClass"
      />
    </div>

    <!-- OTP Modal -->
    <OtpModal
      :visible="isOtpModalVisible"
      :title="t('purchase-rq.otp_verification')"
      :loading="otpLoading"
      :approval-step-id="1"
      :is_otp="props.dataHead?.is_otp"
      :r-id="props.dataHead?.rId"
      :data-head="props.dataHead?.data"
      @confirm="handleOtpConfirm"
      @close="handleOtpClose"
      @resend="handleOtpResend"
    />

    <!-- Success Modal -->
    <SuccessModal
      :visible="isSuccessModalVisible"
      :title="''"
      :message="t('purchase-rq.approval_success')"
      :description="t('purchase-rq.approval_success_description')"
      :button-text="t('purchase-rq.btn.confirm')"
      icon-name="mdi:check-decagram"
      icon-color="text-green-500"
      @confirm="handleSuccessConfirm"
      @cancel="handleSuccessCancel"
      @update:visible="(value) => isSuccessModalVisible = value"
    />

    <!-- Reject Modal (if you need one) -->
    <!-- Add your reject modal component here if needed -->
  </div>
</template>

<style scoped>
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

@media (max-width: 768px) {
  .total {
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
  }

  .info {
    flex-direction: column;
    text-align: center;
  }
}
</style>
