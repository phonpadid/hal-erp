<script setup lang="ts">
import DocTypeSelect from "./DocTypeSelect.vue";
import PuchaseRqLayout from "./PuchaseRqLayout.vue";
import { ref, computed, watch } from "vue";
import PurchaseForm from "./PurchaseForm.vue";


type Step1Data = {
  document_type_id: string;
};

type Step2Data = {
  expiredDate: string;
  purposes: string;
  purchaseItem: Array<{
    title: string;
    fileName?: string[] | null;
    quantity: number;
    unitId: string;
    price: number;
    totalPrice: number;
    remark?: string;
  }>;
};
type StepsData = {
  0: Step1Data | null;
  1: Step2Data | null;
  2: null;
  3: null;
};
// Centralize step management here
const currentStep = ref(0);
const stepsData: StepsData = {
  0: null,
  1: null,
  2: null,
  3: null,
};


const selectedDocumentTypeId = computed(() => {
  return stepsData[0]?.document_type_id || null;
});


// Watch for changes in document_type_id
watch(selectedDocumentTypeId, (newId) => {
  if (newId) {
    console.log('Document type ID changed:', newId);
  }
});

// Handle step progression
const goToNextStep = (stepData?: Step1Data | Step2Data) => {
  if (stepData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stepsData[currentStep.value as keyof StepsData] = stepData as any;

    if (currentStep.value === 0 && 'document_type_id' in stepData) {
      console.log('Selected document_type_id:', stepData.document_type_id);
    }

    if (currentStep.value === 1 && 'purchaseItem' in stepData) {
      console.log('Purchase Items:', stepData.purchaseItem);
    }
  }

  if (currentStep.value < 2) {
    currentStep.value++;
  }
};


</script>

<template>
  <div>
    <PuchaseRqLayout
      v-model:current-step="currentStep"
      :steps-data="stepsData"
    />

    <div class="px-2 mt-[15rem]">
      <DocTypeSelect
        v-if="currentStep === 0"
        @next-step="goToNextStep"
      />

      <!-- Add your other step components here -->
      <div v-else-if="currentStep === 1" class="step-2-content">
       <PurchaseForm></PurchaseForm>
      </div>

      <div v-else-if="currentStep === 2" class="step-3-content">
        <h2 class="text-md font-semibold px-0 mb-4">Step 3 Content</h2>
        <p>This is step 3</p>
      </div>

      <div v-else-if="currentStep === 3" class="step-4-content">
        <h2 class="text-md font-semibold px-0 mb-4">Step 4 Content</h2>
        <p>This is the final step</p>
        <button @click="() => {}" class="btn btn-success">Complete</button>
      </div>
    </div>
  </div>
</template>
