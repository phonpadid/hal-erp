<script setup lang="ts">
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { computed, ref, watch } from "vue";
import type { ButtonType } from "@/modules/shared/buttonType";
import { storeToRefs } from "pinia";
import { useToggleStore } from "../../../stores/storage.store";
import { useI18n } from "vue-i18n";
import { printContent } from "../../purchase-requests/helpers/printer";
import { getStatusText } from "@/modules/shared/utils/format-status.util";
import OtpModal from "./modals/OtpModal.vue";

const { t } = useI18n();

const props = defineProps<{
  dataHead: {
    no?: string;
    status?: string;
    created_at?: string;
    is_otp?: boolean;
  };
}>();

// Modal states
const isOtpModalVisible = ref(false);
const modalAction = ref(""); // 'approve' or 'reject'
const approval = ref(false);
const isRejectModalVisible = ref(false);
const otpLoading = ref(false);

const customButtons = computed(() => {
  return [
    {
      label: "print",
      icon: "ant-design:printer-outlined",
      class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
      type: "default" as ButtonType,
      onClick: handlePrint,
    },
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
      onClick: () => {
        modalAction.value = "approve";
        isOtpModalVisible.value = true;
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

// OTP Modal handlers
const handleOtpConfirm = async (otpValue: string) => {
  try {
    otpLoading.value = true;

    if (modalAction.value === "approve") {
      // Handle approval logic with OTP
      console.log("Approving with OTP:", otpValue);
      isOtpModalVisible.value = false;
      // Add success notification here
    }
  } catch (error) {
    console.error("OTP confirmation error:", error);
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
    // Add your resend OTP logic here
    console.log("Resending OTP...");

    // await otpService.resend(approvalStepId);

    // Add success notification here
  } catch (error) {
    console.error("Resend OTP error:", error);
    // Add error notification here
  }
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
        :document-status="getStatusText(props.dataHead?.status ?? '')"
        document-status-class="text-orange-400 text-sm font-medium ml-2 ring-2 ring-orange-300 px-3 py-1 rounded-full"
      />
    </div>

    <!-- OTP Modal -->
    <OtpModal
      :visible="isOtpModalVisible"
      :title="t('purchase-rq.otp_verification')"
      :loading="otpLoading"
      :approval-step-id="1"
      :is_otp="props.dataHead?.is_otp"
      @confirm="handleOtpConfirm"
      @close="handleOtpClose"
      @resend="handleOtpResend"
    />

    <!-- Reject Modal (if you need one) -->
    <!-- Add your reject modal component here if needed -->
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
