<script setup lang="ts">
import { ref } from "vue";
import DocTypeSelect, { type FormState } from "./DocTypeSelect.vue";
import PuchaseRqLayout from "./PuchaseRqLayout.vue";
import PurchaseForm from "./PurchaseForm.vue";
import ConfirmModal from "./modal/OtpModal.vue";
import type { Step1Data, Step2Data } from "./formstate";
import CheckPurchaseRq from "./CheckPurchaseRqDetail.vue";
import { useRouter } from "vue-router";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { Icon } from "@iconify/vue";
const { push } = useRouter();
const currentStep = ref(0);
const showModal = ref(false);
const pendingStepData = ref<Step2Data | null>(null);

type StepsData = {
  0: Step1Data | null;
  1: Step2Data | null;
  2: null;
  3: null;
};

const stepsData: StepsData = {
  0: null,
  1: null,
  2: null,
  3: null,
};

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

// Handle confirm from layout component (when clicking confirm button in step 1)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleLayoutConfirm = (allStepsData: Record<number, any>) => {
  console.log(allStepsData);

  showModal.value = true;
};

const confirmNextStep = () => {
  if (currentStep.value === 1) {
    // If we have pending data from the form, use it
    if (pendingStepData.value) {
      stepsData[1] = pendingStepData.value;
    }
    currentStep.value++; // go to step 2
    pendingStepData.value = null;
    showModal.value = false;
  }
};
const getStep0Data = () => stepsData[0] as FormState;
const handleDone = () => {
  push({ name: "purchase_request.index", params: {} });
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
        <PurchaseForm @next-step="goToNextStep" />
      </div>

      <!-- Step 2 -->
      <div v-else-if="currentStep === 2" class="step-3-content">
        <CheckPurchaseRq @next-step="goToNextStep" />
      </div>

      <!-- Step 3 -->
      <div v-else-if="currentStep === 3" class="step-4-content -space-y-4">
        <Icon
          icon="mdi:check-decagram"
          class="text-green-500 text-5xl mx-auto"
        />
        <div class="bg-white ">
          <div class="bg-white rounded-lg p-8 max-w-md mx-auto">
            <div class=" flex-col flex justify-center items-center text-center -space-y-1">
              <h3 class="text-gray-500 text-md">ໃບອານຸມັດຈັດຊື້</h3>
              <h3 class="text-gray-500 text-md">
                ສ້າງໃບສະເໜີຂອງທ່ານໄດ້ສົ່ງໄປຫາຫົວໜ້າພະແນກພັດທະນາທຸລະກິດ
              </h3>
              <div class=" text-center md:w-[8rem] w-full">
                <UiButton
                  color-class="bg-red-500 text-white hover:bg-red-600 hover:!text-white w-full mt-4"
                  @click="handleDone"
                >
                  ຕົກລົງ
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :visible="showModal"
      title="ລາຍເຊັນ"
      @confirm="confirmNextStep"
      @close="showModal = false"
    />
  </div>
</template>
