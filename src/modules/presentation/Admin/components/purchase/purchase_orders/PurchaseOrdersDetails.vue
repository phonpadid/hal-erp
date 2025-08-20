<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import ProgressStepsComponent, {
  type ActionButton,
} from "@/common/shared/components/header/ProgressStepsComponent.vue";
import { computed, reactive, ref, nextTick, onMounted, watch } from "vue";
import type { ButtonType } from "@/modules/shared/buttonType";
import { useRouter, useRoute } from "vue-router";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { Icon } from "@iconify/vue";
import { useVendorBankAccountStore } from "../../../stores/vendors/vendor-bank-accounts.store";
import { usePurchaseRequestsStore } from "../../../stores/purchase_requests/purchase-requests.store";
import { formatDate } from "@/modules/shared/formatdate";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { convertToLaoWords } from "@/modules/shared/utils/formatLao-and-en";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
// import { columns } from "../../../views/vendors/vendor/column";
import { useVendorStore } from "../../../stores/vendors/vendor.store";
// import { useI18n } from "vue-i18n";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
// import UiTable from "@/common/shared/components/table/UiTable.vue";
import PurchaseOrderShowDrawer from "./PurchaseOrderShowDrawer.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PurchaseOrderPending from "./PurchaseOrderPending.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import MultipleImageUpload from "@/common/shared/components/Upload/MultipleImageUpload.vue";
import ModalVendorCreate from "./ModalVendorCreate.vue";

/************************************* */
const { success, error } = useNotification();
const router = useRouter();
const route = useRoute();
const currentStep = ref(0);
const currentStatus = ref<"wait" | "process" | "finish" | "error">("process");
const confirmLoading = ref(false);
const visible = ref(false);
const otpValue = ref<string[]>(Array(6).fill(""));
const otpInputRefs = ref<any[]>([]);
const isOtpModalVisible = ref(false);
const isSignatureModalVisible = ref(false);
const signatureData = ref("");
const bankAccount = useVendorBankAccountStore();
const purchaseRequestStore = usePurchaseRequestsStore();
const vendorModalRef = ref<InstanceType<typeof ModalVendorCreate> | null>(null);
// const { t } = useI18n();
const loading = ref(true);
/*****************State Purchase Request********************* */

// const selectedRowKey = ref<string>("");
// const selectedRow = ref(null);

// const onSelectChange = (selectedKeysArr: string[], selectedRows: any[]) => {
//   selectedRowKey.value = selectedKeysArr[0]; // radio จะมีแค่รายการเดียวเสมอ
//   selectedRow.value = selectedRows[0]; // ข้อมูลแถวที่เลือก
//   console.log("selectedRowKey", selectedRowKey.value);
//   console.log("selectedRow", selectedRow.value);
// };
/*****************Show Ui Drawer********************* */

const requestDetail = ref<PurchaseRequestEntity | null>(null);

// ใน onMounted ปรับการโหลดข้อมูล
onMounted(async () => {
  const purchaseRequestId = route.params.id as string;

  if (!purchaseRequestId) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນທີ່ຈຳເປັນ");
    router.push({ name: "purchaseRequestsList" });
    return;
  }

  try {
    loading.value = true;
    const result = await purchaseRequestStore.fetchById(purchaseRequestId);
    if (result) {
      requestDetail.value = result as unknown as PurchaseRequestEntity;
    }
  } catch (err) {
    console.error("Error loading purchase request:", err);
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້");
  } finally {
    loading.value = false;
  }
});
/*****************Show Ui Drawer********************* */

const showDrawer = () => {
  visible.value = true;
};
const forms = reactive({
  invoiceType: "",
  descriptions: "",
});

const handleUploadClick = () => {
  if (vendorModal.value) {
    vendorModal.value.reset();
    if (forms.invoiceType) {
      vendorModal.value.setSelectedType(forms.invoiceType);
    }

    vendorModal.value.open();
  }
};
/********************************* */
interface VendorData {
  id: string;
  name: string;
  imageUrl: string;
  type: string;
}
const vendorStore = useVendorStore();

const vendorModal = ref<InstanceType<typeof ModalVendorCreate> | null>(null);

const selectedVendorData = ref<VendorData | null>(null);

const getVendorFromLocalStorage = (): VendorData | null => {
  try {
    const data = localStorage.getItem("selectedVendor");
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Error reading from localStorage:", err);
    return null;
  }
};

const handleVendorModalSubmitted = (payload: {
  vendorId: string;
  fileNames: string[];
  fileUrl?: string;
}) => {
  const { vendorId, fileUrl = "" } = payload;
  const vendor = vendorStore.activeVendors.find((v) => v.getId() === vendorId);

  if (vendor) {
    selectedVendorData.value = {
      id: vendorId,
      name: vendor.getname(),
      imageUrl: fileUrl,
      type: form.value.invoiceType,
    };
  }
};

onMounted(() => {
  const savedVendor = getVendorFromLocalStorage();
  if (savedVendor) {
    selectedVendorData.value = {
      ...savedVendor,
    };
    form.value.invoiceType = savedVendor.type;
  }
});

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
const handleOtpInput = (value: string, index: number) => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (numericValue) {
    otpValue.value[index] = numericValue[0];
    if (index < 5) {
      nextTick(() => {
        const nextInput = otpInputRefs.value[index + 1];
        if (nextInput) {
          const inputElement = nextInput.$el.querySelector("input") || nextInput.$el;
          inputElement?.focus();
        }
      });
    }
  } else {
    otpValue.value[index] = "";
  }
};
/************************************************************ */
const handleOtpKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === "Backspace" && !otpValue.value[index]) {
    event.preventDefault();
    if (index > 0) {
      nextTick(() => {
        const prevInput = otpInputRefs.value[index - 1];
        if (prevInput) {
          const inputElement = prevInput.$el.querySelector("input") || prevInput.$el;
          inputElement?.focus();
          otpValue.value[index - 1] = "";
        }
      });
    }
  }
  // อนุญาตเฉพาะปุ่มที่ต้องการ
  if (
    !/^\d$/.test(event.key) &&
    !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(event.key)
  ) {
    event.preventDefault();
  }
};

/********************************************************** */
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData("text").replace(/[^0-9]/g, "");
  if (pastedData) {
    const digits = pastedData.split("").slice(0, 6);
    digits.forEach((digit, index) => {
      if (index < 6) {
        otpValue.value[index] = digit;
      }
    });
    const nextIndex = Math.min(digits.length, 5);
    nextTick(() => {
      const nextInput = otpInputRefs.value[nextIndex];
      if (nextInput) {
        const inputElement = nextInput.$el.querySelector("input") || nextInput.$el;
        inputElement?.focus();
      }
    });
  }
};
/***********************************************************/
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

export interface Product {
  key: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  remark: string;
}

export interface FormState {
  documentId: string;
  date: Date | null;
  name: string;
  quantity: string;
  summary: string;
  sumTotal: string;
  totalName: string;
  price: string;
  total_price: string;
  invoiceType: string;
  descriptions: string;
  purposes: string;
  title: string;
  products: Product[];
  bank: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  currencyCode: string;
  vendorImage: string;
  vendorType: string;
}
const form = ref<FormState>({
  documentId: "",
  date: null,
  name: "",
  summary: "",
  sumTotal: "",
  totalName: "",
  invoiceType: "",
  descriptions: "",
  quantity: "",
  total_price: "",
  price: "",
  purposes: "",
  title: "",
  products: [],
  bank: "",
  accountName: "",
  accountNumber: "",
  bankName: "",
  currencyCode: "",
  vendorImage: "",
  vendorType: "",
});
interface BankOption {
  value: string;
  label: string;
  accountName: string;
  accountNumber: string;
  logoUrl?: string;
  bankName?: string;
  currencyCode?: string;
}
const bankOptions = computed<BankOption[]>(() => {
  return bankAccount.activeBankAccounts.map((account) => ({
    value: account.getId(),
    label: account.getBank()?.name || "",
    accountName: account.getAccountName(),
    accountNumber: account.getAccountNumber(),
    logoUrl: account.getBank()?.logoUrl,
    bankName: account.getBank()?.name,
    currencyCode: account.getCurrency()?.code,
  }));
});

// เพิ่ม method สำหรับจัดการการเปลี่ยนแปลงธนาคาร
const handleBankChange = (value: string) => {
  const selectedBank = bankAccount.activeBankAccounts.find((account) => account.getId() === value);

  if (selectedBank) {
    form.value.accountName = selectedBank.getAccountName();
    form.value.accountNumber = selectedBank.getAccountNumber();
    form.value.bankName = selectedBank.getBank()?.name || "";
    form.value.currencyCode = selectedBank.getCurrency()?.code || "";
  } else {
    form.value.accountName = "";
    form.value.accountNumber = "";
    form.value.bankName = "";
    form.value.currencyCode = "";
  }
};

onMounted(async () => {
  try {
    await bankAccount.fetchBankAccounts(17);
  } catch (err) {
    console.error("Error fetching bank accounts:", err);
    error("ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນທະນາຄານ");
  }
});

watch(
  () => form.value.bank,
  (newValue) => {
    if (newValue) {
      handleBankChange(newValue);
    }
  }
);

// User info
const userInfo = {
  name: "ນາງ ປາກາລີ ລາຊະບູລີ",
  department: "ພະແນກໄອທີ, ພະບໍລິມາດ",
};

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
const totalAmount = computed(() => {
  return requestDetail.value?.getItems().reduce((sum, item) => sum + item.getTotalPrice(), 0) || 0;
});
const totalInLaoWords = computed(() => {
  return convertToLaoWords(totalAmount.value);
});

watch(
  totalAmount,
  (newValue) => {
    form.value.totalName = convertToLaoWords(newValue);
  },
  { immediate: true }
);

onMounted(async () => {
  const purchaseRequestId = route.params.id;
  const documentTypeId = route.query.document_type_id;

  if (!purchaseRequestId || !documentTypeId) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນທີ່ຈຳເປັນ");
    router.push({ name: "doc-type-select" });
    return;
  }

  try {
    loading.value = true;
    const id = Array.isArray(purchaseRequestId) ? purchaseRequestId[0] : purchaseRequestId;
    const result = await purchaseRequestStore.fetchById(id);

    if (result) {
      requestDetail.value = result;
      form.value.purposes = result.getPurposes();
      const items = result.getItems();
      form.value.title = items.map((item) => item.getTitle()).join(", ");
      form.value.quantity = items
        .map((item) => `${item.getQuantity()} ${(item.getUnit() as any)?.name || ""}`)
        .join(", ");
      form.value.price = items.map((item) => formatPrice(item.getPrice())).join(", ");
      form.value.total_price = items.map((item) => formatPrice(item.getTotalPrice())).join(", ");

      form.value.total_price = result
        .getItems()
        .map((item) => formatPrice(item.getTotalPrice()))
        .join(", ");
    }
  } catch (err) {
    console.error("Error loading purchase request:", err);
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້");
  } finally {
    loading.value = false;
  }
});
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
    <!--  -->
    <ModalVendorCreate ref="vendorModalRef" @submitted="handleVendorModalSubmitted" />
    <!--  -->
    <!-- OTP Modal -->
    <UiModal
      title="ລາຍເຊັນ"
      title-icon="material-symbols-light:signature"
      :visible="isOtpModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isOtpModalVisible = $event"
      @ok="handleOtpConfirm"
      @cancel="handleModalCancel"
    >
      <div class="p-4">
        <div>
          <p>{{ userInfo.name }} {{ userInfo.department }}</p>
        </div>
        <div>
          <p class="text-gray-950 text-xl">ກວດສອບຂໍ້ຄວາມ</p>
          <p class="text-sm text-gray-500 mb-4">
            ລະຫັດຢືນຢັນ 6 ຕົວ ໄດ້ສົ່ງໄປທີ່ເບີໂທລະສັບ +856 20 5555 5555
          </p>
          <!-- OTP Input -->
          <div class="flex justify-center gap-2">
            <template v-for="i in 6" :key="i">
              <UiInput
                :ref="(el) => setOtpInputRef(el, i - 1)"
                v-model="otpValue[i - 1]"
                class="w-12 h-12 text-center text-xl"
                :maxlength="1"
                type="text"
                pattern="[0-9]*"
                inputmode="numeric"
                @input="(value) => handleOtpInput(value, i - 1)"
                @keydown="(event) => handleOtpKeydown(event, i - 1)"
                @paste="handlePaste"
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
      <template #footer>
        <div class="flex">
          <UiButton
            @click="handleOtpConfirm"
            type="primary"
            :loading="confirmLoading"
            color-class="w-full"
            >ຢືນຢັນ</UiButton
          >
        </div>
      </template>
    </UiModal>
    <!-- Signature Modal -->
    <UiModal
      title="ລາຍເຊັນ"
      title-icon="material-symbols-light:signature"
      :visible="isSignatureModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isSignatureModalVisible = $event"
      @ok="handleSignatureConfirm"
      @cancel="handleModalCancel"
    >
      <div>
        <div>
          <p>{{ userInfo.name }} {{ userInfo.department }}</p>
        </div>

        <div>
          <p class="text-xl font-bold">ລາຍເຊັນ</p>
          <p>ລາຍເຊັນຂອງທ່ານຈະຖືກນຳໃຊ້ໃນການຢືນຢັນເອກະສານ</p>

          <!-- Signature Pad -->
          <div class="flex justify-center w-full">
            <img src="/public/2.png" class="w-52" />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex">
          <UiButton
            @click="handleSignatureConfirm"
            type="primary"
            :loading="confirmLoading"
            color-class="w-full"
            >ຢືນຢັນ</UiButton
          >
        </div>
      </template>
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
            <h2 class="text-sm">{{ requestDetail?.getRequester()?.username }}</h2>
            <p class="text-gray-600 text-sm">{{ requestDetail?.getDepartment()?.name }}</p>
          </div>
          <div>
            <h2 class="text-sm">ວັນທີສະເໜີ</h2>
            <p class="text-gray-500 text-sm">{{ formatDate(requestDetail?.getExpiredDate()) }}</p>
          </div>
        </div>
        <div>
          <span>ສະເໜີ</span>
          <div class="flex items-start gap-4 mb-2">
            <div>
              <h2 class="text-sm">ຂໍ້ສະເໜີເບີກງົບປະມານ</h2>
              <p class="text-gray-600 text-sm">{{ requestDetail?.getPurposes() }}</p>
            </div>
            <div>
              <h2 class="text-sm">ຈຳນວນ</h2>
              <p class="text-gray-500 text-sm">
                {{
                  requestDetail
                    ?.getItems()
                    ?.map((item) => item.getQuantity())
                    .join(", ")
                }}
              </p>
            </div>
            <div>
              <h2 class="text-sm">ພະແນກ</h2>
              <p class="text-gray-500 text-sm">{{ requestDetail?.getDepartment()?.name }}</p>
            </div>
            <div>
              <h2 class="text-sm">ໜ່ວຍງານ</h2>
              <p class="text-gray-500 text-sm">{{ requestDetail?.getPosition()?.name }}</p>
            </div>
          </div>
        </div>
        <div>
          <span>ຈຸດປະສົ່ງ</span>
          <div class="flex items-start gap-4 mb-6">
            <UiInput
              v-model="form.purposes"
              placeholder="ປ້ອນລະຫັດເອກະສານ"
              class="w-full"
              :default-value="requestDetail?.getPurposes()"
            />
            <!-- {{ requestDetail?.getDocumentDescription() }} -->
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-6">
          <!-- Invoice Type Selection -->

          <div class="border rounded-lg p-4 space-y-4">
            <h3 class="font-medium mb-4">ໃບສະເໜີລາຄາ</h3>
            <!-- <UiTable
              :columns="columns(t)"
              :dataSource="vendorStore.vendors"
              :row-selection="{
                type: 'radio',
                selectedRowKeys: [selectedRowKey],

              }"
            /> -->
            <!-- ปุ่มอัพโหลด -->
            <div @click="handleUploadClick" class="mt-4">
              <MultipleImageUpload
                class="pointer-events-none select-none"
                :max-count="1"
                upload-text="ອັບໂຫລດເອກະສານ"
                upload-hint="ລາກວາງຟາຍຫຼືຄິກເພື່ອເລືອກ"
                :upload-width="'100%'"
                :upload-height="'auto'"
                :upload-button-width="'300px'"
                :upload-button-height="'400px'"
                :icon-size="'64px'"
                :text-size="'18px'"
                :hint-size="'14px'"
                thumbnailFit="fill"
              />
            </div>

            <!-- เหตุผลที่เลือก -->
            <div class="mt-4">
              <span>ເຫດຜົນທີເລືອກ</span>
              <div class="flex items-start gap-4 mb-6">
                <Textarea v-model="form.descriptions" placeholder="ປ້ອນເຫດຜົນ" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Product Details -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium mb-4">ລາຍລະອຽດຮ້ານຄ້າ</h3>

            <!-- ส่วนหัวข้อร้าน -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <UiAvatar
                icon="solar:shop-2-bold"
                :size="'large'"
                class="flex justify-center items-center"
              />
              <span class="text-sm sm:text-base">ຮ້ານ ຄອມຄອມ COMCOM</span>
            </div>

            <!-- ส่วนฟอร์มข้อมูล -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <UiFormItem label="ສິນຄ້າ" required>
                <UiInput v-model="form.title" placeholder="ປ້ອນຊື່ສິນຄ້າ" :disabled="true" />
              </UiFormItem>

              <UiFormItem label="ຈຳນວນ" required>
                <UiInput v-model="form.quantity" placeholder="ປ້ອນຈຳນວນ" :disabled="true" />
              </UiFormItem>

              <UiFormItem label="ລາຄາ/ຫົວໜ່ວຍ" required>
                <UiInput v-model="form.price" placeholder="ຫົວໜ່ວຍ" :disabled="true" />
              </UiFormItem>

              <UiFormItem label="ລາຄາລວມ" required>
                <UiInput v-model="form.total_price" placeholder="ປ້ອນຊື່ສິນຄ້າ" :disabled="true" />
              </UiFormItem>

              <UiFormItem label="ຈຳນວນເງີນ(ຕົວໜັງສື)" required class="sm:col-span-2 lg:col-span-1">
                <UiInput
                  v-model="form.totalName"
                  placeholder="ປ້ອນຊື່ສິນຄ້າ"
                  :value="totalInLaoWords"
                  :disabled="true"
                />
              </UiFormItem>
            </div>

            <!-- ส่วนว่าง -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"></div>

            <!-- ส่วนราคารวม -->
            <div class="flex flex-col items-end mt-6 text-sm sm:text-base">
              <span>
                ມູນລາຄາລວມທັງໝົດ
                {{
                  formatPrice(
                    requestDetail?.getItems().reduce((sum, item) => sum + item.getTotalPrice(), 0)
                  )
                }}
                ₭
              </span>
              <span class="mt-1">
                ມູນລາຄາລວມທັງໝົດກີບ
                {{
                  formatPrice(
                    requestDetail?.getItems().reduce((sum, item) => sum + item.getTotalPrice(), 0)
                  )
                }}
                ₭
              </span>
            </div>
          </div>
        </div>
        <!-- Payment Details -->
        <div class="border rounded-lg p-4">
          <h3 class="font-medium mb-4">ຂໍ້ມູນບັນຊີຮ້ານ</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <!-- ธนาคาร -->
            <UiFormItem label="ທະນາຄານ" required>
              <InputSelect
                v-model:modelValue="form.bank"
                :options="bankOptions"
                placeholder="ເລືອກທະນາຄານ"
                @update:modelValue="handleBankChange"
              >
                <template #option="{ option }">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="option.logoUrl"
                      :src="option.logoUrl"
                      class="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                      :alt="option.bankName"
                    />
                    <span class="text-sm sm:text-base">{{ option.label }}</span>
                  </div>
                </template>
              </InputSelect>
            </UiFormItem>

            <!-- ชื่อบัญชี -->
            <UiFormItem label="ຊື່ບັນຊີ (Account Name)" required>
              <UiInput v-model="form.accountName" placeholder="ຊື່ບັນຊີ" :disabled="true" />
            </UiFormItem>

            <!-- เลขบัญชี -->
            <UiFormItem label="ເລກບັນຊີ" required class="sm:col-span-2 md:col-span-1">
              <div class="relative">
                <UiInput
                  v-model="form.accountNumber"
                  placeholder="xxxx xxxx xxxx xxxx"
                  :disabled="true"
                />
                <span
                  v-if="form.currencyCode"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base"
                >
                  {{ form.currencyCode }}
                </span>
              </div>
            </UiFormItem>
          </div>

          <div class="mt-6">
            <span class="block mb-2 text-sm sm:text-base">ເອກະສານທີຕິດຂັດ</span>
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
              class="cursor-pointer w-full overflow-hidden"
              @click="showDrawer"
            />
          </div>
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

.ui-input {
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
  caret-color: #1890ff;
}

.ui-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* ซ่อน spinner ของ input type number */
.ui-input::-webkit-outer-spin-button,
.ui-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* .ui-input[type="number"] {
  -moz-appearance: textfield;
} */
</style>
