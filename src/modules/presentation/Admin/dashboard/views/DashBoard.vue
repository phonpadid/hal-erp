<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { reactive, ref } from "vue";
import type { ButtonType } from "@/modules/shared/buttonType";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import ProgressStepsComponent from "@/common/shared/components/header/ProgressStepsComponent.vue";
import MultipleImageUpload from "@/common/shared/components/Upload/MultipleImageUpload.vue";
import type { UploadFile } from "ant-design-vue";

const standardFiles = ref<UploadFile[]>([]);
const largeFiles = ref<UploadFile[]>([]);
const smallFiles = ref<UploadFile[]>([]);
const tallFiles = ref<UploadFile[]>([]);
const wideFiles = ref<UploadFile[]>([]);
const customButtons = [
  {
    label: "ປະຕິເສດ",
    type: "default" as ButtonType,
    onClick: () => {
      // Your custom cancel logic
    },
  },
  {
    label: "ອະນຸມັດ",
    type: "primary" as ButtonType,
    onClick: () => {
      // Your custom submit logic
    },
  },
];
/********************************************************** */

const currentStep = ref(0);
const currentStatus = ref<"wait" | "process" | "finish" | "error">("process");

const stepsData = reactive<Record<number, any>>({
  0: null,
  1: null,
  2: null,
  3: null,
});

const handleStepChange = (step: number) => {
  currentStep.value = step;
};

const handleNext = (stepData: any) => {
  stepsData[currentStep.value] = stepData;
};

const handlePrevious = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const handleConfirm = (allData: Record<number, any>) => {
  console.log("All steps data:", allData);
};

const handleCancel = () => {
  console.log("Operation cancelled");
  // Reset the steps if needed
  currentStep.value = 0;
  currentStatus.value = "process";
  for (const key in stepsData) {
    stepsData[key] = null;
  }
};
</script>
<template>
  <div class="mt-12">{{ $t("deshboard.dashboard") }}</div>

  <header-component
    header-title="ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ"
    :breadcrumb-items="['ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ', 'ອານຸມັດ']"
    document-prefix="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ"
    document-number="0036/ພລ - ວັນທີ"
    :document-date="new Date('2025-03-26')"
    :action-buttons="customButtons"
  />
  <br />
  <progress-steps-component
    step-type="FOUR_STEPS"
    v-model:current-step="currentStep"
    :current-status="currentStatus"
    :steps-data="stepsData"
    @step-change="handleStepChange"
    @next="handleNext"
    @previous="handlePrevious"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
  <div class="upload-examples">
    <h2>Upload Area</h2>

    <!-- ขนาดมาตรฐาน -->
    <div class="example-section">
      <h3>ຂະໜາດມາດຕະຖານ</h3>
      <MultipleImageUpload
        v-model="standardFiles"
        :max-count="4"
        upload-text="อัปโหลดเอกสาร"
        upload-hint="ลากวางไฟล์มาวางที่นี่"
      />
    </div>

    <!-- ขนาดใหญ่ -->
    <div class="example-section">
      <h3>ໃຫຍ່</h3>
      <MultipleImageUpload
        v-model="largeFiles"
        :max-count="8"
        upload-text="อัปโหลดไฟล์ขนาดใหญ่"
        upload-hint="รองรับไฟล์หลายรูปแบบ"
        upload-width="100%"
        upload-height="auto"
        upload-button-width="400px"
        upload-button-height="300px"
        icon-size="72px"
        text-size="20px"
        hint-size="16px"
      />
    </div>

    <!-- ขนาดเล็ก -->
    <div class="example-section">
      <h3>ນ້ອຍ</h3>
      <MultipleImageUpload
        v-model="smallFiles"
        :max-count="3"
        upload-text="อัปโหลด"
        upload-hint="เลือกไฟล์"
        upload-width="300px"
        upload-height="auto"
        upload-button-width="150px"
        upload-button-height="100px"
        icon-size="24px"
        text-size="12px"
        hint-size="10px"
      />
    </div>

    <!-- ขนาดแนวตั้ง -->
    <div class="example-section">
      <h3>ຂະໜາດແນວຕັ້ງ</h3>
      <MultipleImageUpload
        v-model="tallFiles"
        :max-count="6"
        upload-text="อัปโหลดเอกสาร"
        upload-hint="ลากวางไฟล์หรือคลิกเพื่อเลือก"
        upload-width="100%"
        upload-height="auto"
        upload-button-width="300px"
        upload-button-height="400px"
        icon-size="64px"
        text-size="18px"
        hint-size="14px"
        thumbnailFit="fill"
      />
    </div>

    <!-- ขนาดแนวนอน -->
    <div class="example-section">
      <h3>ແນວນອນ</h3>
      <MultipleImageUpload
        v-model="wideFiles"
        :max-count="4"
        upload-text="อัปโหลดรูปภาพ"
        upload-hint="รองรับ JPG, PNG, GIF"
        upload-width="100%"
        upload-height="auto"
        upload-button-width="500px"
        upload-button-height="200px"
        icon-size="56px"
        text-size="16px"
        hint-size="12px"
      />
    </div>
  </div>
</template>

<style scoped>
.upload-examples {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background-color: #fafafa;
}

.example-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #1890ff;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 8px;
}
</style>
