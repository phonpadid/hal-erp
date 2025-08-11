import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import { useRouter } from "vue-router";
import { SubmitApprovalStepUseCase } from "@/modules/application/useCases/approval-step/submit-approval-step.use-case";
import { ApiApprovalStepRepository } from "@/modules/infrastructure/api-approval-step.repository";
import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface";
import { useNotification } from "@/modules/shared/utils/useNotification";

const createUseCase = () => {
  const repository = new ApiApprovalStepRepository();
  return new SubmitApprovalStepUseCase(repository);
};

export const useApprovalStepStore = defineStore("approval-step", () => {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useNotification();
  const useCase = createUseCase();

  const loading: Ref<boolean> = ref(false);
  const error: Ref<Error | null> = ref(null);

  const submitApproval = async (documentId: string, payload: SubmitApprovalStepInterface) => {
    loading.value = true;
    error.value = null;

    try {
      const success = await useCase.execute(documentId, payload);

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

  return {
    // State
    loading,
    error,
    // Actions
    submitApproval,
  };
});
