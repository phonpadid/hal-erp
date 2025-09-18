/* eslint-disable @typescript-eslint/no-unused-vars */
// stores/approval-step.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import { useRouter } from "vue-router";
import { SubmitApprovalStepUseCase } from "@/modules/application/useCases/approval-step/submit-approval-step.use-case";
import { SendOtpUseCase } from "@/modules/application/useCases/approval-step/submit-approval-step.use-case";
import { ApiApprovalStepRepository } from "@/modules/infrastructure/api-approval-step.repository";
import type {
  SubmitApprovalStepInterface,
  SubmitApprovalStepDepartment,
} from "@/modules/interfaces/approval-step.interface";
import { useNotification } from "@/modules/shared/utils/useNotification";

interface PurchaseOrderItem {
  id: number;
  budget_item_id: number;
}

export interface ApprovalPayload {
  type: "po";
  statusId: number;
  remark: string;
  approvalStepId: number;
  is_otp: boolean;
  approval_id?: number;
  otp?: string;
  purchase_order_items: PurchaseOrderItem[];
  account_code?: string;
  files: Array<{ file_name: string }>;
}
const createUseCases = () => {
  const repository = new ApiApprovalStepRepository();
  return {
    submitUseCase: new SubmitApprovalStepUseCase(repository),
    sendOtpUseCase: new SendOtpUseCase(repository),
  };
};

export const useApprovalStepStore = defineStore("approval-step", () => {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useNotification();
  const { submitUseCase, sendOtpUseCase } = createUseCases();

  const loading: Ref<boolean> = ref(false);
  const sendingOtp: Ref<boolean> = ref(false);
  const error: Ref<Error | null> = ref(null);
  const otpResponse = ref<{
    id: number;
    approval_id: number;
    expires_in: string;
    max_attempts: number;
    status: string;
    approver: {
      id: number;
      name: string;
      email: string;
      tel: string;
    };
  } | null>(null);

  const currentApprovalStep: Ref<{
    id: number;
    isOtp: boolean;
    approvalId?: number;
  } | null> = ref(null);

  const submitApproval = async (documentId: string, payload: SubmitApprovalStepInterface) => {
    loading.value = true;
    error.value = null;
    try {
      const requiresOtp = payload.is_otp === true && !payload.otp;

      if (requiresOtp) {
        currentApprovalStep.value = {
          id: payload.approvalStepId,
          isOtp: true,
          approvalId: Number(payload.approval_id),
        };
        const otpData = await sendOtp(payload.approvalStepId);
        if (otpData) {
          otpResponse.value = otpData;
        }

        loading.value = false;
        return true;
      }

      const success = await submitUseCase.execute(documentId, payload);

      if (success) {
        showSuccess("ສຳເລັດ", "ອະນຸມັດສຳເລັດ");
      }
      // router.push({ name: "purchaseRequestsList" });
      return success;
    } catch (err: unknown) {
      error.value = err as Error;
      showError("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const submitPurchaseDetails = async (
    documentId: string,
    payload: SubmitApprovalStepInterface
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const requiresOtp = payload.is_otp === true && !payload.otp;

      if (requiresOtp) {
        currentApprovalStep.value = {
          id: payload.approvalStepId,
          isOtp: true,
          approvalId: Number(payload.approval_id),
        };
        const otpData = await sendOtp(payload.approvalStepId);
        if (otpData) {
          otpResponse.value = otpData;
        }

        loading.value = false;
        return true;
      }

      const success = await submitUseCase.execute(documentId, payload);

      if (success) {
        showSuccess("ສຳເລັດ", "ອະນຸມັດສຳເລັດ");
        router.push({ name: "purchaseRequestsList" });
      }
      return success;
    } catch (err: unknown) {
      error.value = err as Error;
      showError("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const submitApprovalDepartMent = async (
    documentId: string,
    payload: SubmitApprovalStepDepartment
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const requiresOtp = payload.is_otp === true && !payload.otp;

      if (requiresOtp) {
        currentApprovalStep.value = {
          id: payload.approvalStepId,
          isOtp: true,
          approvalId: Number(payload.approval_id),
        };
        const otpData = await sendOtp(payload.approvalStepId);
        if (otpData) {
          otpResponse.value = otpData;
        }

        loading.value = false;
        return true;
      }

      const success = await submitUseCase.execute(documentId, payload);

      if (success) {
        showSuccess("ສຳເລັດ", "ອະນຸມັດສຳເລັດ");
        // router.push({ name: "approval_department_panak" });
      }
      return success;
    } catch (err: unknown) {
      error.value = err as Error;
      showError("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const submitApprovalWithOtp = async (
    documentId: string,
    payload: SubmitApprovalStepInterface & { otp: string }
  ) => {
    loading.value = true;
    error.value = null;
    console.log("Submitting approval with OTP...");

    try {
      // ตั้งค่า is_otp เป็น true เสมอเมื่อส่ง OTP
      payload.is_otp = true;
      if (otpResponse.value?.approval_id) {
        payload.approval_id = otpResponse.value.approval_id;
      }

      const success = await submitUseCase.execute(documentId, payload);

      if (success) {
        showSuccess("ສຳເລັດ", "ອະນຸມັດສຳເລັດ");
        router.push({ name: "purchaseRequestsList" });
      }
      return success;
    } catch (err: unknown) {
      error.value = err as Error;
      showError("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
      return false;
    } finally {
      loading.value = false;
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendOtp = async (approvalStepId: number, purchaseOrderItemsPayload?: { id: number; budget_item_id: any; }[]) => {
    if (!approvalStepId) {
      showError("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນຂັ້ນຕອນການອະນຸມັດ");
      return null;
    }


    sendingOtp.value = true;
    error.value = null;
    // console.log("Sending OTP request for step ID:", approvalStepId);

    try {
      const response = await sendOtpUseCase.execute(approvalStepId);

      if (response) {
        otpResponse.value = response;

        showSuccess("ສຳເລັດ", "ສົ່ງ OTP ສຳເລັດ");

      }

      return response;
    } catch (err: unknown) {
      error.value = err as Error;
      showError("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
      return null;
    } finally {
      sendingOtp.value = false;
    }
  };

  const submitPurchaseOrderApproval = async (
    documentId: string,
    purchaseOrderItems: PurchaseOrderItem[],
    approvalStepId: number,
    statusId: number,
    otpCode?: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const payload = {
        type: "po" as const,
        statusId: statusId,
        remark: "ຢືນຢັນສຳເລັດ",
        approvalStepId: approvalStepId,
        is_otp: !!otpCode,
        otp: otpCode || undefined,
        approval_id: otpResponse.value?.approval_id,
        purchase_order_items: purchaseOrderItems,
        files: [],
      };

      // console.log("Submitting PO approval with payload:", payload);

      const success = await submitUseCase.execute(documentId, payload);

      if (success) {
        showSuccess("ສຳເລັດ", "ອະນຸມັດສຳເລັດ");
        router.push({ name: "purchaseOrdersList" });
      }
      return success;
    } catch (err: unknown) {
      error.value = err as Error;
      showError("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    sendingOtp,
    error,
    currentApprovalStep,
    otpResponse,
    submitApproval,
    submitApprovalWithOtp,
    submitPurchaseOrderApproval,
    sendOtp,
    submitApprovalDepartMent,
    submitPurchaseDetails,
  };
});
