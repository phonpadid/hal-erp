<script setup lang="ts">
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { computed, ref, watch } from "vue";
import type { ButtonType } from "@/modules/shared/buttonType";
import { storeToRefs } from "pinia";
import { useToggleStore } from "../../../stores/storage.store";
import { useI18n } from "vue-i18n";
import OtpModal from "./modals/OtpModal.vue";
import SuccessModal from "../../purchase-requests/modal/SuccessModal.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useReceiptStore } from "../../../stores/receipt.store";
import { useApprovalStepStore } from "../../../stores/approval-step.store";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import { rejectRule } from "./modals/rejected.schema";
import { useRouter } from "vue-router";
const approvalStepStore = useApprovalStepStore();
const receiptStore = useReceiptStore();
const { error } = useNotification();
const otpSending = ref(false);
const confirmLoading = ref(false);
const exportLoading = ref(false);
const formModel = ref({
  remark: "",
});
const { t } = useI18n();
const props = defineProps<{
  dataHead: {
    role?: boolean;
    exist_access?: boolean;
    rId: number;
    no?: string;
    isApproved?: boolean;
    status?: { id: number; name?: string }[];
    data?: {
      stepId?: number;
      remark?: string;
      type?: string;
      files?: { file_name: string }[];
      account_code?: string;
      uploadCompleted?: boolean;
      formState?: { files: { file_name: string }[]};
      uploadedImages?: string[]
    };
    created_at?: string;
    is_otp?: boolean;
    is_upload?: boolean;
    approver_info?: {
      status?: {
        id: number;
        name: string;
        dpm?: {
          id: number;
          name?: string;
        }[];
      }[];
    }[];
  };
  onPrint?: () => void;
  onApprovalSuccess?: () => void;
}>();

// Modal states
const isOtpModalVisible = ref(false);
const isSuccessModalVisible = ref(false); // Add success modal state
const modalAction = ref(""); // 'approve' or 'reject'
const approval = ref(false);
const isRejectModalVisible = ref(false);
const otpLoading = ref(false);
const router = useRouter();
const goBack = () => {
  router.back();
};

const customButtons = computed(() => {
  const buttons = [
    // {
    //   label: exportLoading.value ? "ກຳລັງດາວໂຫຼດ..." : "ໄຟລ໌ Excel",
    //   icon: exportLoading.value ? "ant-design:loading-outlined" : "ant-design:file-excel-outlined",
    //   class: `bg-green-700 text-white hover:text-red-50 flex items-center gap-1 hover:bg-green-800 mr-4 ${exportLoading.value ? 'opacity-75 cursor-not-allowed' : ''}`,
    //   type: "" as ButtonType,
    //   onClick: handleExportExcel,
    //   disabled: exportLoading.value,
    //   loading: exportLoading.value
    // },
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
        class:
          "bg-primary text-white flex items-center gap-2 hover:bg-blue-600",
        type: "primary" as ButtonType,
        onClick: async () => {
          modalAction.value = "approve";
          if(props.dataHead?.role){
            if (props.dataHead?.data?.account_code === undefined || props.dataHead?.data?.account_code === "" && !props.dataHead?.exist_access) {
              error("ຜິດພາດ", "ກະລຸນາປ້ອນລະຫັດບັນຊີ");
              return;
            }
          }
          if(props.dataHead?.is_upload){
            if(!props.dataHead?.data?.files || props.dataHead?.data?.files.length === 0){
              error("ຜິດພາດ", "ກະລຸນາອັບໂຫລດເອກະສານ");
              return;
            }
          }
          if (props.dataHead?.is_otp) {
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

const handleExportExcel = async () => {

  try {
    exportLoading.value = true;
    if (!props.dataHead?.rId) {
      error("ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Receipt ID");
      return;
    }
    // console.log('tou:', props.dataHead.rId);
    await receiptStore.exportExcel(String(props.dataHead.rId));
  } catch (erro) {
    console.error("Export Excel error:", erro);
    error("ຜິດພາດ", "ບໍ່ສາມາດສົ່ງອອກໄຟລ໌ Excel ໄດ້");
  } finally {
    exportLoading.value = false;
  }
};

const handlePrint = async () => {
  try {
    // If a custom print handler is provided, use it
    if (props.onPrint) {
      props.onPrint();
      return;
    }
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
    const otpResponse = await approvalStepStore.sendOtp(
      props.dataHead.data.stepId
    );

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
  // Call the reset callback after successful approval
  if (props.onApprovalSuccess) {
    props.onApprovalSuccess();
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
    props.dataHead?.approver_info?.flatMap(
      (d) =>
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
const formRef = ref();
const handleReject = async (): Promise<void> => {
  await formRef.value.submitForm();
  props.dataHead.data!.remark = formModel.value.remark;
  if (modalAction.value === "reject") {
    if (props.dataHead?.is_otp) {
            await requestOtp();
            isRejectModalVisible.value = false;
          } else {
            // 🔹 Skip OTP, just open modal directly
            isOtpModalVisible.value = true;
            isRejectModalVisible.value = false;
          }
    // try {
    //   confirmLoading.value = true;
    //   if (!props.dataHead?.rId) {
    //     error("Error", "Missing Request ID");
    //     return;
    //   }
    //   const stepId = props.dataHead.data?.stepId;
    //   if (!stepId) {
    //     throw new Error("Step ID is missing");
    //   }
    //   await rStore.approvalReceipt(stepId, {
    //     type: "r",
    //     statusId: 3,
    //     is_otp: false,
    //     remark: formModel.value.remark,
    //   });
    //   await rStore.fetchById(String(props.dataHead.rId));
    //   isRejectModalVisible.value = false;
    //   isSuccessModalVisible.value = true; // Show success modal on reject as well
    // } catch (err) {
    //   error("Error", (err as Error).message);
    // } finally {
    //   confirmLoading.value = false;
    // }
  }
};
</script>

<template>
  <div class="container mx-auto py-1 px-0">
    <!-- Header Component -->
    <div
      class="fixed px-6 py-4 top-0 z-20 bg-white shadow-sm transition-all duration-150 mt-[4rem]"
      :class="topbarStyle"
    >
    <UiButton icon="mdi:arrow-left" size="small" class="flex items-center gap-2 text-white bg-blue-600 hover:!bg-blue-900 hover:!text-white" @click="goBack">ກັບຄືນ</UiButton>
      <header-component
        :header-title="t('menu-sidebar.receipt')"
        :breadcrumb-items="[
          t('menu-sidebar.receipt'),
          t('disbursement.field.detail'),
        ]"
        :document-prefix="t('menu-sidebar.receipt')"
        :document-number="`${t('purchase-rq.field.pr_number')} ${
          props.dataHead?.no
        } - ${t('purchase-rq.date')}`"
        :document-date="props.dataHead?.created_at"
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
      :is_reject="modalAction === 'reject'"
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
      :message="t('receipt.title.approved')"
      :description="t('receipt.title.description')"
      :button-text="t('success')"
      icon-name="mdi:check-decagram"
      icon-color="text-green-500"
      @confirm="handleSuccessConfirm"
      @cancel="handleSuccessCancel"
      @update:visible="(value) => (isSuccessModalVisible = value)"
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
          <UiForm ref="formRef" :model="formModel" :rules="rejectRule(t)">
            <UiFormItem :label="t('modal.reason')" name="remark" required>
              <Textarea
                v-model:model-value="formModel.remark"
                :placeholder="t('modal.enter_reason')"
                :rows="4"
                required
              />
            </UiFormItem>
          </UiForm>
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
