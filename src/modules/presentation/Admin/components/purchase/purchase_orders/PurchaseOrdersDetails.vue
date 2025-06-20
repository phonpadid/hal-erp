<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import ProgressStepsComponent, {
  type ActionButton,
} from "@/common/shared/components/header/ProgressStepsComponent.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { computed, reactive, ref, nextTick } from "vue";
import type { ButtonType } from "@/modules/shared/buttonType";
import { useRouter } from "vue-router";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { Icon } from "@iconify/vue";
import PurchaseOrderShowDrawer from "./PurchaseOrderShowDrawer.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PurchaseOrderPending from "./PurchaseOrderPending.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UploadFiles from "@/common/shared/components/Upload/UploadFiles.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import dayjs from "dayjs";
import UiButton from "@/common/shared/components/button/UiButton.vue";

/************************************* */
const { success, error } = useNotification();
const router = useRouter();
const currentStep = ref(0);
const currentStatus = ref<"wait" | "process" | "finish" | "error">("process");
const uploadedFile = ref(null);
const confirmLoading = ref(false);
const visible = ref(false);
const otpValue = ref<string[]>(Array(6).fill(""));
const otpInputRefs = ref<any[]>([]);
const isOtpModalVisible = ref(false);
const isSignatureModalVisible = ref(false);
const signatureData = ref("");

/*****************Show Ui Drawer********************* */
const showDrawer = () => {
  visible.value = true;
};
/******************************************************* */
// Update handleConfirm function for first confirmation
const handleConfirm = async (allData: Record<number, any>) => {
  console.log("All steps data:", allData);
  if (currentStep.value === 0) {
    try {
      isOtpModalVisible.value = true;
    } catch (err) {
      console.error(err);
      error("ເກີດຂໍ້ຜິດພາດ");
    }
  }
};
/******************************************************************** */
const handleOtpInput = async (value: string, index: number) => {
  if (!/^\d*$/.test(value)) {
    return;
  }
  otpValue.value[index] = value;

  if (value && index < 5) {
    await nextTick();
    const nextInput = otpInputRefs.value[index + 1];
    if (nextInput) {
      const antInput = nextInput.$el?.querySelector("input") || nextInput.$el;
      if (antInput && typeof antInput.focus === "function") {
        antInput.focus();
      }
    }
  }
};
/************************************************************ */
const handleOtpKeydown = async (event: KeyboardEvent, index: number) => {
  if (event.key === "Backspace" && !otpValue.value[index] && index > 0) {
    event.preventDefault();
    await nextTick();
    const prevInput = otpInputRefs.value[index - 1];
    if (prevInput) {
      const antInput = prevInput.$el?.querySelector("input") || prevInput.$el;
      if (antInput && typeof antInput.focus === "function") {
        antInput.focus();

        otpValue.value[index - 1] = "";
      }
    }
  }
  if (!/\d|Backspace|Delete|Tab|Enter|ArrowLeft|ArrowRight/.test(event.key)) {
    event.preventDefault();
  }
};
/********************************************************** */
const handleOtpConfirm = async () => {
  try {
    confirmLoading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isOtpModalVisible.value = false;
    isSignatureModalVisible.value = true;
  } catch (err) {
    console.error(err);
    error("ການຢືນຢັນ OTP ລົ້ມເຫລວ");
  } finally {
    confirmLoading.value = false;
    otpValue.value = Array(6).fill("");
  }
};

// Handle signature confirmation
const handleSignatureConfirm = async () => {
  try {
    confirmLoading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isSignatureModalVisible.value = false;
    currentStep.value = 1;
    success("ການຢືນຢັນສຳເລັດ");
  } catch (err) {
    console.error(err);
    error("ການຢືນຢັນລາຍເຊັນລົ້ມເຫລວ");
  } finally {
    confirmLoading.value = false;
  }
};
/******************************************************* */
const setOtpInputRef = (el: any, index: number) => {
  if (el) {
    otpInputRefs.value[index] = el;
  }
};

const handleModalCancel = () => {
  isOtpModalVisible.value = false;
  isSignatureModalVisible.value = false;
  otpValue.value = Array(6).fill("");
  signatureData.value = "";
};

const handleFileChange = (file: File) => {
  console.log("File changed:", file);
};
const customSteps = ref([
  {
    title: "ອານຸມັດຈັດຊື້",
    data: null,
  },
  {
    title: "ກວດສອບ",
    data: null,
    disabled: true,
  },
  {
    title: "ສຳເລັດ",
    data: null,
    disabled: true,
  },
]);

// Form validation example
const isFormValid = computed(() => {
  return true;
});

// Steps data
const stepsData = reactive<{ [key: number]: any }>({
  0: null,
  1: null,
  2: null,
});

const actionButtons = computed<ActionButton[]>(() => {
  if (currentStatus.value === "finish") {
    return [];
  }

  switch (currentStep.value) {
    case 0:
      return [
        {
          label: "ຢືນຢັນໃບອານຸມັດ",
          type: "primary" as ButtonType,
          onClick: () => handleConfirm(stepsData),
          show: true,
          disabled: !isFormValid.value,
          class: "button-hover",
        },
      ];
    case 1:
      return [
        {
          label: "ຢືນຢັນໃບອານຸມັດ",
          type: "primary" as ButtonType,
          onClick: handlePendingConfirm,
          show: true,
          loading: confirmLoading.value,
          disabled: !isFormValid.value,
          class: "button-hover",
        },
      ];
    case 2:
      return [];
    default:
      return [];
  }
});

// Event handlers
const handleStepChange = (step: number) => {
  if (currentStatus.value === "finish") {
    return;
  }
  currentStep.value = step;
};

const handleNext = (stepData?: any) => {
  if (stepData) {
    stepsData[currentStep.value] = stepData;
  }
  currentStep.value++;
};

const handlePrevious = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const handleButtonClick = (buttonData: any) => {
  console.log("Button clicked:", buttonData);
};

interface Product {
  key: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  remark: string;
}

const form = ref({
  documentId: "",
  date: null,
  name: "ຄອມພີວເຕີ MacBook Ar M3 (16GB/512GB)",
  quantity: "1 ເຄື່ອງ",
  summary: "30,000,000 ₭",
  sumTotal: "30,000,000 ₭",
  totalName: "ສາມສິບລ້ານກີບ",
  invoiceType: "COMCOM",
  descriptions:
    "ທາງຮ້ານສາມາດໃຫ້ຊຳລະເປັນເດືອນໄດ້ ມີການຮັບປະກັນຕາມປະເພດສິນຄ້າ, ຖ້າຫາກມີຂໍ້ບົກພ່ອງ ທາງຮ້ານຈະປ່ຽນໃໝ່ໃຫ້",
  products: [] as Product[],
  bank: "BCEL",
  accountNumber: "",
});

// User info
const userInfo = {
  name: "ນາງ ປາກາລີ ລາຊະບູລີ",
  department: "ພະແນກໄອທີ, ພະບໍລິມາດ",
};

const formattedDate = computed(() => {
  return dayjs().format("DD MM YYYY");
});

// Invoice previews
const invoicePreviews = [
  { type: "COMCOM", image: "/public/5.png" },
  { type: "LTH", image: "/public/6.png" },
  { type: "CLOUD", image: "/public/7.png" },
];
const handlePendingConfirm = async () => {
  try {
    confirmLoading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    currentStatus.value = "finish";

    currentStep.value = 2;

    customSteps.value[1].disabled = false;
    customSteps.value[2].disabled = false;

    success("ການຢືນຢັນສຳເລັດ");
  } catch (err) {
    console.error(err);
    error("ການຢືນຢັນລົ້ມເຫລວ");
  } finally {
    confirmLoading.value = false;
  }
};

const handlePendingCancel = () => {
  handlePrevious();
};
const handleListOrder = () => {
  router.push({ name: "purchaseOrdersList" });
};
</script>

<template>
  <div class="container mx-auto p-6">
    <!-- Header Section -->
    <header-component
      header-title="ອານຸມັດຈັດຊື້"
      :breadcrumb-items="['ອານຸມັດຈັດຊື້ > ເພີ່ມຂໍ້ມູນ']"
      :show-document-date="false"
      :show-document-number="false"
      :show-document-prefix="false"
    />

    <!-- Progress Steps -->
    <progress-steps-component
      step-type="THREE_STEPS"
      v-model:current-step="currentStep"
      :current-status="currentStatus"
      :steps-data="stepsData"
      :custom-steps="customSteps"
      :custom-buttons="actionButtons"
      :show-user="true"
      document-prefix="ສ້າງໃບອານຸມັດຊື້ - ຈັດຈ້າງ"
      @step-change="handleStepChange"
      @next="handleNext"
      @previous="handlePrevious"
      @confirm="handleConfirm"
      @button-click="handleButtonClick"
    />

    <!-- Ui Darwer -->
    <UiDrawer
      v-model:open="visible"
      title="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ - ເລກທີ 0044/ຈຊນ.ນວ/ບຫ - ວັນທີ 26 ມີນາ 2025"
      placement="right"
      :width="1050"
    >
      <PurchaseOrderShowDrawer />
    </UiDrawer>

    <!-- OTP Modal -->
    <UiModal
      title="ລາຍເຊັນ"
      :visible="isOtpModalVisible"
      :confirm-loading="confirmLoading"
      ok-text="ຢືນຢັນ"
      cancel-text="ຍົກເລີກ"
      @update:visible="isOtpModalVisible = $event"
      @ok="handleOtpConfirm"
      @cancel="handleModalCancel"
    >
      <div class="p-4">
        <div class="text-center mb-6">
          <p class="text-lg mb-2">{{ userInfo.name }}</p>
          <p class="text-gray-500">{{ userInfo.department }}</p>
        </div>

        <div class="mb-6">
          <p class="text-center text-gray-600 mb-2">ກວດສອບ OTP</p>
          <p class="text-center text-sm text-gray-500 mb-4">
            ສົ່ງລະຫັດ OTP ໄປທີ່ເບີໂທ +856 20 XXXX XXXX
          </p>

          <!-- แก้ไข: OTP Input -->
          <div class="flex justify-center gap-2">
            <template v-for="i in 6" :key="i">
              <UiInput
                :ref="(el: any) => setOtpInputRef(el, i - 1)"
                v-model="otpValue[i - 1]"
                class="w-12 h-12 text-center text-xl"
                :maxlength="1"
                type="text"
                @input="(value: string) => handleOtpInput(value, i - 1)"
                @keydown="(event: KeyboardEvent) => handleOtpKeydown(event, i - 1)"
              />
            </template>
          </div>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-500">
            ບໍ່ໄດ້ຮັບລະຫັດ?
            <a-button type="link" class="p-0">ສົ່ງອີກຄັ້ງ</a-button>
          </p>
        </div>
      </div>
    </UiModal>
    <!-- Signature Modal -->
    <UiModal
      title="ລາຍເຊັນ"
      :visible="isSignatureModalVisible"
      :confirm-loading="confirmLoading"
      ok-text="ຢືນຢັນ"
      cancel-text="ຍົກເລີກ"
      @update:visible="isSignatureModalVisible = $event"
      @ok="handleSignatureConfirm"
      @cancel="handleModalCancel"
    >
      <div class="p-4">
        <div class="text-center mb-6">
          <p class="text-lg mb-2">{{ userInfo.name }}</p>
          <p class="text-gray-500">{{ userInfo.department }}</p>
        </div>

        <div class="mb-6">
          <p class="text-center mb-4">ລາຍເຊັນເພື່ອຢືນຢັນການຊຳລະ</p>

          <!-- Signature Pad -->
          <div class="flex justify-center w-full">
            <img src="/public/2.png" class="w-52" />
          </div>
        </div>
      </div>
    </UiModal>

    <!-- Main Form Content -->
    <div v-if="currentStep === 0">
      <div class="bg-white rounded-lg shadow-sm mt-6 p-6">
        <!-- User Info Section -->
        <span>ຂໍ້ມູນສ້າງໃບອານຸມັດຈັດຊື້ - ຈັດຈ້າງ</span>
        <div class="flex items-start gap-4 mb-6">
          <UiAvatar
            icon="solar:user-bold"
            :size="'large'"
            class="flex justify-center items-center"
          />

          <div>
            <h2 class="text-sm">{{ userInfo.name }}</h2>
            <p class="text-gray-600 text-sm">{{ userInfo.department }}</p>
          </div>
          <div>
            <h2 class="text-sm">ວັນທີສະເໜີ</h2>
            <p class="text-gray-500 text-sm">{{ formattedDate }}</p>
          </div>
        </div>
        <div>
          <span>ສະເໜີ</span>
          <div class="flex items-start gap-4 mb-2">
            <div>
              <h2 class="text-sm">ຂໍ້ສະເໜີເບີກງົບປະມານ</h2>
              <p class="text-gray-600 text-sm">ຈັດຊື້ຄອມ</p>
            </div>
            <div>
              <h2 class="text-sm">ຈຳນວນ</h2>
              <p class="text-gray-500 text-sm">1</p>
            </div>
            <div>
              <h2 class="text-sm">ພະແນກ</h2>
              <p class="text-gray-500 text-sm">ພັດທະນາທຸລະກິດ</p>
            </div>
            <div>
              <h2 class="text-sm">ໜ່ວຍງານ</h2>
              <p class="text-gray-500 text-sm">ພະນັກງານ</p>
            </div>
          </div>
        </div>
        <div>
          <span>ຈຸດປະສົ່ງ</span>
          <div class="flex items-start gap-4 mb-6">
            <UiInput v-model="form.bank" placeholder="ປ້ອນລະຫັດເອກະສານ" class="w-full" />
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-6">
          <!-- Invoice Type Selection -->
          <div class="border rounded-lg p-4 space-y-4">
            <h3 class="font-medium mb-4">ໃບສະເໜີລາຄາ</h3>
            <a-radio-group v-model:value="form.invoiceType" class="grid grid-cols-3 gap-4">
              <a-radio value="COMCOM">ຮ້ານ ຄອມຄອມ COMCOM</a-radio>
              <a-radio value="LTH">ຮ້ານ LTH</a-radio>
              <a-radio value="CLOUD">ຮ້ານ Cloud Store</a-radio>
            </a-radio-group>

            <!-- Invoice Preview -->
            <div class="grid grid-cols-3 gap-4 mt-4">
              <div
                v-for="(preview, index) in invoicePreviews"
                :key="index"
                class="border rounded-lg p-2 cursor-pointer hover:border-blue-500"
                :class="{ 'border-blue-500': form.invoiceType === preview.type }"
                @click="form.invoiceType = preview.type"
              >
                <img :src="preview.image" :alt="preview.type" class="w-full h-auto" />
              </div>
              <UploadFiles
                v-model:file-list="uploadedFile"
                accept="image/jpeg,image/png"
                :max-size="5"
                placeholder="ຄລິກເພື່ອອັບໂຫຼດໃບບິນ"
                @change="handleFileChange"
              />
            </div>
            <div>
              <br />
              <span>ເຫດຜົນທີເລືອກ</span>
              <div class="flex items-start gap-4 mb-6">
                <Textarea v-model="form.descriptions" placeholder="ປ້ອນເຫດຜົນ" class="w-full" />
              </div>
            </div>
          </div>
          <!-- Product Details -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium mb-4">ລາຍລະອຽດຮ້ານຄ້າ</h3>
            <div class="flex items-center gap-4 mb-4">
              <UiAvatar
                icon="solar:shop-2-bold"
                :size="'large'"
                class="flex justify-center items-center"
              />
              <span>ຮ້ານ ຄອມຄອມ COMCOM</span>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <UiFormItem label="ສິນຄ້າ" required>
                <UiInput v-model="form.name" placeholder="ປ້ອນຊື່ສິນຄ້າ" />
              </UiFormItem>
              <UiFormItem label="ຈຳນວນ" required>
                <UiInput v-model="form.quantity" placeholder="ປ້ອນຈຳນວນ" />
              </UiFormItem>
              <UiFormItem label="ລາຄາ/ຫົວໜ່ວຍ" required>
                <UiInput v-model="form.summary" placeholder="ຫົວໜ່ວຍ" />
              </UiFormItem>
              <UiFormItem label="ລາຄາລວມ" required>
                <UiInput v-model="form.sumTotal" placeholder="ປ້ອນຊື່ສິນຄ້າ" />
              </UiFormItem>
              <UiFormItem label="ຈຳນວນເງີນ(ຕົວໜັງສື)" required>
                <UiInput v-model="form.totalName" placeholder="ປ້ອນຊື່ສິນຄ້າ" />
              </UiFormItem>
            </div>
            <div class="grid grid-cols-2 gap-4 mt-4"></div>
            <div class="flex justify-end">
              <span>ມູນລາຄາລວມທັງໝົດ {{ form.sumTotal }}</span>
            </div>
            <div class="flex justify-end">
              <span>ມູນລາຄາລວມທັງໝົດກີບ {{ form.sumTotal }}</span>
            </div>
          </div>
        </div>
        <!-- Payment Details -->
        <div class="border rounded-lg p-4">
          <h3 class="font-medium mb-4">ຂໍ້ມູນບັນຊີຮ້ານ</h3>
          <div class="grid grid-cols-2 gap-6">
            <UiFormItem label="ຊື່ບັນທຶກ" required>
              <InputSelect
                v-model="form.bank"
                :options="[
                  { label: 'BCEL', value: 'BCEL' },
                  { label: 'ທະນາຄານລາວ', value: 'ທະນາຄານລາວ' },
                  { label: 'ທະນາຄານອື່ນ', value: 'ທະນາຄານອື່ນ' },
                ]"
                placeholder="ເລືອກຊື່ບັນທຶກ"
              />
            </UiFormItem>
            <UiFormItem label="ຊື່ບັນຊີ (Account Name)" required>
              <UiInput v-model="form.accountNumber" placeholder="ຊື່ບັນຊີ" />
            </UiFormItem>
            <UiFormItem label="ເລກບັນຊີ" required>
              <UiInput v-model="form.accountNumber" placeholder="xxxx xxxx xxxx xxxx" />
            </UiFormItem>
          </div>
          <span>ເອກະສານທີຕິດຂັດ</span>
          <HeaderComponent
            header-title="ໃບສະເໜີຈັດຊື້ - ເລກທີ 0036/ຈຊ/ຮລຕ/ນຄຫຼ"
            header-title-color="blue-600"
            prefix-icon="mdi:file-document-outline"
            suffix-icon="mdi:arrow-top-right"
            prefix-icon-class="text-blue-500"
            suffix-icon-class="text-blue-500"
            :suffix-icon-clickable="true"
            :show-document-date="false"
            :show-document-number="false"
            :show-document-prefix="false"
            :show-breadcrumb="false"
            class="cursor-pointer"
            @click="showDrawer"
          />
        </div>
      </div>
    </div>
    <div v-else-if="currentStep === 1">
      <PurchaseOrderPending
        :form-data="form"
        :user-info="userInfo"
        @confirm="handlePendingConfirm"
        @cancel="handlePendingCancel"
      />
    </div>
    <div v-else-if="currentStep === 2">
      <Icon icon="mdi:check-decagram" class="text-green-500 text-6xl mx-auto mt-4" />
      <div class="bg-white rounded-lg shadow-sm">
        <div class="bg-white rounded-lg p-8 max-w-md mx-auto">
          <div class="text-center space-y-4">
            <h3 class="text-gray-500 text-xl">ໃບອານຸມັດຈັດຊື້ - ຈັດຈ້າງ</h3>
            <h3 class="text-gray-500 text-lg mb-6">ສ້າງໃບອານຸມັດສຳເລັດແລ້ວ</h3>
            <div class="w-full">
              <UiButton
                color-class="bg-red-500 text-white hover:bg-red-600 hover:!text-white w-full"
                @click="handleListOrder"
              >
                ຕົກລົງ
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ant-upload-select {
  width: 100% !important;
}

.invoice-preview {
  transition: all 0.3s ease;
}

.invoice-preview:hover {
  transform: translateY(-2px);
}
</style>
