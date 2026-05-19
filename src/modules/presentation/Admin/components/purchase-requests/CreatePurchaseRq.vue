<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import {  reactive, ref, nextTick, watch } from "vue";
import DocTypeSelect, { type FormState } from "./DocTypeSelect.vue";
import PuchaseRqLayout from "./PuchaseRqLayout.vue";
import PurchaseForm from "./PurchaseForm.vue";
import ConfirmModal from "./modal/OtpModal.vue";
import type { Step1Data, Step2Data } from "./formstate";
import { useRouter } from "vue-router";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { useApprovalStepStore } from "../../stores/approval-step.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
// import { useDocumentStatusStore } from "../../stores/document-status.store";
const { t } = useI18n();
const { push } = useRouter();
const currentStep = ref(0);
const showModal = ref(false);
const showOtpModal = ref(false);
const pendingStepData = ref<Step2Data | null>(null);

// ✅ ใช้ ref สำหรับ OTP state
const currentIsOtp = ref<boolean>(false);
const currentOtpStepId = ref<number | null>(null);

// 🔍 Debug: เฝ้าดูการเปลี่ยนแปลง
watch(() => currentIsOtp.value, (newVal, oldVal) => {
  console.log('🔍 currentIsOtp.value changed:', { oldVal, newVal });
});

watch(() => showOtpModal.value, (newVal) => {
  console.log('🔍 showOtpModal.value changed to:', newVal, 'currentIsOtp.value =', currentIsOtp.value);
});
// Add ref for PurchaseForm component
interface PurchaseFormRef {
  validateForm: () => Promise<boolean>;
  getFormData: () => Step2Data;
  // handleSave: () => Promise<boolean>;
  handleSave: () => Promise<any | null>;
}

const purchaseFormRef = ref<PurchaseFormRef | null>(null);

type StepsData = {
  0: Step1Data | null;
  1: Step2Data | null;
  2: null;
  // 3: null;
};

const stepsData = reactive<StepsData>({
  0: null,
  1: null,
  2: null,
  // 3: null,
});

// Step 0: save and go to next directly
// Step 1: show confirm before going to next
const goToNextStep = (stepData?: Step1Data | Step2Data) => {
  if (stepData) {
    if (currentStep.value === 0) {
      stepsData[0] = stepData as Step1Data;
      currentStep.value++; // go to step 1
    } else if (currentStep.value === 1) {
      // save to pending, wait for confirmation
      pendingStepData.value = stepData as Step2Data;
      showModal.value = true;
    }
  }
};

/*************************OTP*********************** */
const approvalStepStore = useApprovalStepStore();
// const documentStatusStore = useDocumentStatusStore();
const { error } = useNotification();
const confirmLoading = ref(false);
const otpSending = ref(false);
const newlyCreatedDocumentId = ref<string | null>(null);
const currentApprovalStepId = ref<number | null>(null);

// const approvedStatusId = computed(() => {
//   return documentStatusStore.document_Status.find((s) => s.getName() === "APPROVED")?.getId();
// });

const sendOtp = async () => {
  if (!currentApprovalStepId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step ID");
    return false;
  }

  try {
    otpSending.value = true;
    const otpResponse = await approvalStepStore.sendOtp(currentApprovalStepId.value);
    if (!otpResponse) {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດສົ່ງລະຫັດ OTP ໄດ້");
      return false;
    }
    return true;
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    return false;
  } finally {
    otpSending.value = false;
  }
};

const handleOtpConfirm = async (otpCode: string) => {
  if (!otpCode) {
    error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາປ້ອນລະຫັດ OTP");
    return;
  }
  if (!newlyCreatedDocumentId.value || !currentApprovalStepId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນເອກະສານຫຼືຂະບວນການອະນຸມັດ");
    return;
  }

  const approvalIdFromOtp = approvalStepStore.otpResponse?.approval_id;

  if (!approvalIdFromOtp) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນການອະນຸມັດຫຼັງສົ່ງ OTP");
    return;
  }

  try {
    confirmLoading.value = true;
    const payload = {
      type: "pr" as const,
      // statusId: Number(approvedStatusId.value),
      statusId: 2,
      remark: "ຢືນຢັນສຳເລັດ",
      approvalStepId: currentApprovalStepId.value,
      otp: otpCode,
      is_otp: currentIsOtp.value, // ✅ ใช้ค่าจาก ref
      approval_id: approvalIdFromOtp,
    };

    const isSuccess = await approvalStepStore.submitApproval(newlyCreatedDocumentId.value, payload);

    if (isSuccess) {
      // console.log("✅ PR creation and first step approval completed successfully");
      showOtpModal.value = false;
      currentStep.value = 2;

      // ✅ ຫຼັງຈາກອະນຸມັດຂັ້ນຕອນທໍາອິດສຳເລັດ ໃຫ້ກັບໄປຫນ້າ PR list ໂດຍກົງ
      setTimeout(() => {
        // console.log("🔄 Redirecting to PR list after first step approval...");
        push({ name: "apv_purchase_request.index" });
      }, 1500);
    } else {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດຢືນຢັນ OTP ດັ່ງກ່າວ");
    }
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  } finally {
    confirmLoading.value = false;
  }
};

const handleLayoutConfirm = async () => {
  if (currentStep.value === 1 && purchaseFormRef.value) {
    try {
      const newDocumentData = await purchaseFormRef.value.handleSave();

      if (newDocumentData) {
        const docId = newDocumentData.id;
        const stepId = newDocumentData.user_approval?.approval_step?.[0]?.id;
        const isOtp = newDocumentData.user_approval?.approval_step?.[0]?.is_otp ?? true;

        // 🔍 Debug: แสดงค่า is_otp ที่ได้จาก backend
        console.log('🔍 Debug PR Creation:', {
          docId,
          stepId,
          isOtp,
          approvalStep: newDocumentData.user_approval?.approval_step?.[0]
        });

        if (docId && stepId) {
          stepsData[1] = pendingStepData.value;
          pendingStepData.value = null;

          newlyCreatedDocumentId.value = docId;
          currentApprovalStepId.value = stepId;

          // ✅ ตั้งค่า is_otp จาก backend ก่อนเปิด modal
          console.log('🔍 STEP 1: Setting currentIsOtp.value =', isOtp, 'from backend');
          currentIsOtp.value = isOtp;
          currentOtpStepId.value = stepId;
          console.log('🔍 STEP 2: After setting, currentIsOtp.value =', currentIsOtp.value);

          console.log('📊 Before sendOtp:', {
            currentIsOtp: currentIsOtp.value,
            currentOtpStepId: currentOtpStepId.value,
            currentApprovalStepId: currentApprovalStepId.value
          });

          // ✅ รอให้ Vue update ค่าก่อน
          await nextTick();

          console.log('📊 After nextTick:', {
            currentIsOtp: currentIsOtp.value,
            currentOtpStepId: currentOtpStepId.value,
            currentApprovalStepId: currentApprovalStepId.value
          });

          // ✅ ส่ง OTP (ไม่ได้เปิด modal ในนี้แล้ว)
          const otpSent = await sendOtp();

          // ✅ ถ้าส่ง OTP สำเร็จ รอให้ Vue update แล้วค่อยเปิด modal
          if (otpSent) {
            await nextTick();
            console.log('✅ OTP sent successfully, opening modal with is_otp:', currentIsOtp.value);
            console.log('🔍 STEP 3: About to open modal, currentIsOtp.value =', currentIsOtp.value);
            showOtpModal.value = true;
            console.log('🔍 STEP 4: Modal opened, currentIsOtp.value =', currentIsOtp.value);
          }
        } else {
          error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ໄດ້ຮັບຂໍ້ມູນ ID ທີ່ຈໍາເປັນຈາກ API response");
        }
      }
    } catch (err) {
      error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    }
  }
};

const getStep0Data = () => stepsData[0] as FormState;

const handleDone = () => {
  push({ name: "apv_purchase_request.index", params: {} });
};

// ✅ เพิ่ม function ปิด modal
const handleOtpClose = () => {
  showOtpModal.value = false;
  console.log('🔍 Modal closed, reset currentIsOtp to false');
  currentIsOtp.value = false;
  currentOtpStepId.value = null;
};
</script>

<template>
  <div>
    <PuchaseRqLayout
      v-model:current-step="currentStep"
      :steps-data="stepsData"
      @confirm-step="handleLayoutConfirm"
    />

    <div class="px-2 mt-[15rem]">
      <!-- Step 0 -->
      <DocTypeSelect
        v-if="currentStep === 0"
        :initial-data="getStep0Data()"
        @next-step="goToNextStep"
      />

      <!-- Step 1 -->
      <div v-else-if="currentStep === 1" class="step-2-content">
        <PurchaseForm
          ref="purchaseFormRef"
          @next-step="goToNextStep"
          :document-type-id="stepsData[0]?.document_type_id ?? ''"
        />
      </div>

      <!-- Step 2 -->
      <!-- <div v-else-if="currentStep === 2" class="step-3-content">
        <CheckPurchaseRq :steps-data="getAllStepsData()" @next-step="goToNextStep" />
      </div> -->

      <!-- Step 3 -->
      <div v-else-if="currentStep === 2" class="step-4-content">
        <Icon icon="mdi:check-decagram" class="text-green-500 text-5xl mx-auto" />
        <div class="w-full flex-col flex justify-center items-center text-center -space-y-1">
          <h3 class="text-gray-500 text-md">{{ t("purchase-rq.proposal") }}</h3>
          <h3 class="text-gray-500 text-md">
            {{ t("purchase-rq.sended") }}
          </h3>
          <div class="text-center md:w-[8rem] w-full">
            <UiButton
              color-class="bg-red-500 text-white hover:bg-red-600 hover:!text-white w-full mt-4"
              @click="handleDone"
            >
              {{ t("button.ok") }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>
    <!-- OTP Modal (ສຳລັບປ້ອນ OTP) -->
    <!-- Debug: currentIsOtp.value = {{ currentIsOtp }} -->
    <ConfirmModal
      v-if="showOtpModal"
      :visible="true"
      :title="t('purchase-rq.otp-verification')"
      :approval-step-id="currentApprovalStepId"
      :is-otp="currentIsOtp"
      :loading="confirmLoading"
      :key="`otp-modal-${currentOtpStepId}-${currentIsOtp}`"
      @confirm="handleOtpConfirm"
      @close="handleOtpClose"
    />
  </div>
</template>
