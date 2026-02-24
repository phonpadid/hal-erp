<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import ProgressStepsComponent, {
  type ActionButton,
} from "@/common/shared/components/header/ProgressStepsComponent.vue";
import { computed, reactive, ref, onMounted, watch, nextTick } from "vue";
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
import { columns } from "./column";
import { useVendorStore } from "../../../stores/vendors/vendor.store";
import { useI18n } from "vue-i18n";
import type { Key } from "ant-design-vue/lib/table/interface";
import { usePurchaseOrderStore } from "../../../stores/purchase_requests/purchase-order";
import { Modal } from "ant-design-vue";
import type { RowSelectionType } from "ant-design-vue/es/table/interface";
import type {
  FormStateInterface,
  PurchaseItem,
} from "@/modules/interfaces/purchase-requests/purchase-orders.interface";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import UiTable from "@/common/shared/components/table/UiTable.vue";
import DrawerPr from "../../drawer-pr-and-po/DrawerPr.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PurchaseOrderPending from "./PurchaseOrderPending.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import ModalVendorCreate from "./ModalVendorCreate.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import OtpModal from "../../purchase-requests/modal/OtpModal.vue";
import { useApprovalStepStore } from "../../../stores/approval-step.store";

/************************************* */
const { success, error } = useNotification();
const router = useRouter();
const route = useRoute();
const currentStep = ref(0);
const currentStatus = ref<"wait" | "process" | "finish" | "error">("process");
const confirmLoading = ref(false);
const visible = ref(false);
const bankAccount = useVendorBankAccountStore();
const purchaseRequestStore = usePurchaseRequestsStore();
const purchaseOrderStore = usePurchaseOrderStore();
const vendorModalRef = ref<InstanceType<typeof ModalVendorCreate> | null>(null);
const { t } = useI18n();
const loading = ref(true);
/*****************State Purchase Order********************* */
const itemVendors = ref<{
  [itemId: string]: {
    vendor_id: string | number;
    vendor_name: string;
    vendor_bank_account_id: string | number;
    bank_name: string;
    account_number: string;
    filename: string;
    file_url: string;
    reason: string;
    is_vat: boolean;
    selected: boolean;
  };
}>({});
// OTP Logic
const approvalStepStore = useApprovalStepStore();
const showOtpModal = ref(false);
const currentApprovalStepId = ref<number | null>(null);
const otpSending = ref(false);
const newlyCreatedDocumentId = ref<string | null>(null);
const selectedPrId = ref<number | null>(null);




const sendOtp = async () => {
  if (!currentApprovalStepId.value) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນ Approval Step ID");
    return false;
  }

  try {
    otpSending.value = true;
    const otpResponse = await approvalStepStore.sendOtp(currentApprovalStepId.value);
    if (otpResponse) {
      return true;
    } else {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດສົ່ງລະຫັດ OTP ໄດ້");
      return false;
    }
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
    return false;
  } finally {
    otpSending.value = false;
  }
};

const handleOtpConfirm = async (otpCode: string) => {
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
      type: "po" as const,
      statusId: 2,
      remark: "ຢືນຢັນສຳເລັດ",
      approvalStepId: currentApprovalStepId.value,
      otp: otpCode,
      is_otp: true,
      approval_id: approvalIdFromOtp,
    };

    const isSuccess = await approvalStepStore.submitApproval(newlyCreatedDocumentId.value, payload);

    if (isSuccess) {
      showOtpModal.value = false;
      currentStep.value = 2;
    } else {
      error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດຢືນຢັນ OTP ດັ່ງກ່າວ");
    }
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ", (err as Error).message);
  } finally {
    confirmLoading.value = false;
  }
};

// ✅ Handle OTP modal close
const handleOtpClose = () => {
  showOtpModal.value = false;
};



/**************************** */

const isAllItemsHaveVendor = computed(() => {
  return purchaseItems.value.every((item) => {
    return item.id != null && itemVendors.value[item.id];
  });
});
const isSubmitting = ref(false);
const createPurchaseOrderPayload = () => {
  // console.log("=== DEBUG PAYLOAD ===");
  // console.log("Route query:", route.query);
  // console.log("document_type_id from query:", route.query.document_type_id);

  if (!requestDetail.value) {
    throw new Error("ບໍ່ພົບຂໍ້ມູນການຮ້ອງຂໍ");
  }

  const docTypeIdFromQuery = route.query.document_type_id;
  let finalDocTypeId = 0;

  if (docTypeIdFromQuery) {
    finalDocTypeId = Number(docTypeIdFromQuery);
  }

  if (isNaN(finalDocTypeId) || finalDocTypeId === 0) {
    finalDocTypeId = 19;
  }

  // console.log("Final document_type_id:", finalDocTypeId);

  const items = purchaseItems.value.map((item) => {
    const vendorData = itemVendors.value[item.id?.toString() ?? ""];

    if (!vendorData) {
      throw new Error(`ກະລຸນາເລືອກຮ້ານຄ້າສຳລັບລາຍການ ${item.title}`);
    }

    return {
      purchase_request_item_id: Number(item.id),
      price: Number(item.price),
      is_vat: vendorData.is_vat,
      selected_vendor: [
        {
          vendor_id: Number(vendorData.vendor_id),
          vendor_bank_account_id: Number(vendorData.vendor_bank_account_id),
          filename: vendorData.filename,
          reason: vendorData.reason || "",
          selected: true,
        },
      ],
    };
  });

  const payload = {
    purchase_request_id: Number(requestDetail.value.getId()),
    document: {
      description: form.value.descriptions || "",
      documentTypeId: finalDocTypeId,
    },
    items,
  };

  // console.log("=== FINAL PAYLOAD ===");
  // console.log("Full payload:", JSON.stringify(payload, null, 2));
  // console.log("Document object:", payload.document);
  // console.log("DocumentTypeId:", payload.document.documentTypeId);

  return payload;
};
const handleVendorModalSubmitted = (payload: {
  vendorId: string;
  fileNames: string[];
  fileUrl?: string;
  bankId?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  reason?: string;
  is_vat?: boolean;
}) => {
  const selectedVendor = vendorStore.activeVendors.find((v) => v.getId() === payload.vendorId);
  if (!selectedVendor) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນຮ້ານຄ້າທີ່ເລືອກ");
    return;
  }
  selectedRowKeys.value.forEach((itemId) => {
    itemVendors.value[itemId.toString()] = {
      vendor_id: payload.vendorId,
      vendor_name: selectedVendor.getname(),
      vendor_bank_account_id: payload.bankId || "",
      bank_name: payload.bankName || "",
      account_number: payload.accountNumber || "",
      filename: payload.fileNames[0] || "",
      file_url: payload.fileUrl || "",
      reason: payload.reason || "",
      is_vat: payload.is_vat || false,
      selected: true,
    };
  });
  selectedRowKeys.value = [];
  selectedRows.value = [];
  success(`ເລືອກຮ້ານຄ້າ ${selectedVendor.getname()} ສຳເລັດແລ້ວ`);
};

const vendorReasonModalVisible = ref(false);
const currentReasonData = ref<{
  item_id: string | number;
  vendor_id: string | number;
  vendor_name: string;
  vendor_bank_account_id: string | number;
  reason: string;
  is_vat: boolean;
}>({
  item_id: "",
  vendor_id: "",
  vendor_name: "",
  vendor_bank_account_id: "",
  reason: "",
  is_vat: false,
});

const openVendorReasonModal = (itemId: string | number, vendorId: string | number) => {
  const vendor = vendorStore.activeVendors.find((v) => v.getId() === vendorId);
  if (!vendor) return;
  const existingData = itemVendors.value[itemId.toString()];
  currentReasonData.value = {
    item_id: itemId,
    vendor_id: vendorId,
    vendor_name: vendor.getname(),
    vendor_bank_account_id: existingData?.vendor_bank_account_id || "",
    reason: existingData?.reason || "",
    is_vat: existingData?.is_vat || false,
  };
  loadVendorBankAccounts(vendorId);
  vendorReasonModalVisible.value = true;
};

const vendorBankOptions = computed(() => {
  if (!currentReasonData.value.vendor_id) return [];
  return bankAccount.activeBankAccounts
    .filter((account) => account.getvendor_id() === currentReasonData.value.vendor_id)
    .map((account) => ({
      value: account.getId(),
      label: `${account.getBank()?.name || ""} - ${account.getAccountNumber()}`,
      bank_name: account.getBank()?.name || "",
      account_number: account.getAccountNumber(),
    }));
});

const loadVendorBankAccounts = async (vendorId: string | number) => {
  try {
    await bankAccount.fetchBankAccounts(Number(vendorId));
  } catch (err) {
    console.error("Error loading vendor bank accounts:", err);
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫລດຂໍ້ມູນບັນຊີທະນາຄານໄດ້");
  }
};
const closeVendorReasonModal = () => {
  vendorReasonModalVisible.value = false;
};

const saveVendorReason = () => {
  if (!currentReasonData.value.vendor_bank_account_id) {
    error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາເລືອກບັນຊີທະນາຄານ");
    return;
  }
  const itemId = currentReasonData.value.item_id.toString();
  const selectedBank = bankAccount.activeBankAccounts.find(
    (account) => account.getId() === currentReasonData.value.vendor_bank_account_id
  );

  if (!selectedBank) {
    error("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນບັນຊີທະນາຄານທີ່ເລືອກ");
    return;
  }
  const updatedItemVendor = {
    ...itemVendors.value[itemId],
    vendor_bank_account_id: currentReasonData.value.vendor_bank_account_id,
    bank_name: selectedBank.getBank()?.name || "",
    account_number: selectedBank.getAccountNumber(),
    reason: currentReasonData.value.reason,
    is_vat: currentReasonData.value.is_vat,
    selected: true,
  };
  itemVendors.value[itemId] = updatedItemVendor;
  closeVendorReasonModal();
  success("ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ");
};

const editVendorForItem = (itemId: string | number) => {
  const itemData = itemVendors.value[itemId.toString()];
  if (!itemData) return;
  openVendorReasonModal(itemId, itemData.vendor_id);
};
const removeVendorForItem = (itemId: string | number) => {
  Modal.confirm({
    title: "ຢືນຢັນການລຶບ",
    content: "ທ່ານແນ່ໃຈບໍວ່າຕ້ອງການລຶບຮ້ານຄ້ານີ້ອອກຈາກລາຍການ?",
    okText: "ຢືນຢັນ",
    okType: "danger",
    cancelText: "ຍົກເລີກ",
    onOk() {
      delete itemVendors.value[itemId.toString()];
      success("ລຶບຮ້ານຄ້າອອກຈາກລາຍການສຳເລັດແລ້ວ");
    },
  });
};
/**********************logic Tabel Select *************************** */
const selectedRowKeys = ref<Key[]>([]);
const selectedRows = ref<any[]>([]);
const selectionType = ref<RowSelectionType>("checkbox");
const rowSelectionConfig = computed(() => ({
  type: selectionType.value,
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keysArr: Key[], rows: any[]) => {
    selectedRowKeys.value = keysArr;
    selectedRows.value = rows;
    if (keysArr.length === 1) {
      localStorage.setItem("currentSelectedItemId", keysArr[0].toString());
    } else {
      localStorage.removeItem("currentSelectedItemId");
    }
  },
}));

const purchaseItems = ref<PurchaseItem[]>([]);

const imageModalVisible = ref(false);
const selectedImage = ref("");

const showImageModal = (imageUrl: string) => {
  if (imageUrl) {
    selectedImage.value = imageUrl;
    imageModalVisible.value = true;
  }
};

/******************selection vendor********************* */
/*****************Show Ui Drawer********************* */
const requestDetail = ref<PurchaseRequestEntity | null>(null);
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
/********************************* */
interface VendorData {
  id: string;
  name: string;
  imageUrl: string;
  type: string;
}

// Get vendor data from purchase request items
const purchaseRequestData = computed(() => {
  if (!requestDetail.value) return undefined;

  try {
    const items = requestDetail.value.getItems();

    // Extract vendor data from items (now available from API)
    const purchaseRequestItems = items.map(item => {
      // Get vendor data that was added in the API repository
      const itemData = (item as any);

      if (itemData.vendor) {
        return {
          quota_company: {
            vendor: itemData.vendor
          }
        };
      }

      return undefined;
    }).filter(item => item !== undefined) as Array<{
      quota_company?: {
        vendor?: {
          id: number;
          name: string;
          contact_info: string;
          created_at: string;
          updated_at: string;
        };
      };
    }>;

    return {
      purchase_request_item: purchaseRequestItems
    };
  } catch (err) {
    console.error("Error extracting vendor data:", err);
    return undefined;
  }
});

const openVendorModal = () => {
  if (selectedRowKeys.value.length === 0) {
    error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາເລືອກລາຍການກ່ອນເພີ່ມຮ້ານຄ້າ");
    return;
  }

  if (vendorModalRef.value) {
    vendorModalRef.value.reset();

    if (form.value.invoiceType) {
      vendorModalRef.value.setSelectedType(form.value.invoiceType);
    }

    // Pass purchase request data to modal
    vendorModalRef.value.open();
  }
};
const vendorStore = useVendorStore();
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
// /******************************************************* */
const handleConfirm = async () => {
  try {
    if (!isAllItemsHaveVendor.value) {
      error("ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາເລືອກຮ້ານຄ້າໃຫ້ຄົບທຸກລາຍການ");
      return;
    }

    isSubmitting.value = true;
    const payload = createPurchaseOrderPayload();
    const result = await purchaseOrderStore.create(payload);

    // ตรวจสอบว่า result เป็น Entity ที่ถูกต้องและมี ID
    if (result && result.getId()) {
       const docId = result.getId().toString();
       const userApproval = result.getUserApproval();
       const step = userApproval?.approval_step?.[0];

       if (docId && step) {
          newlyCreatedDocumentId.value = docId;
          currentApprovalStepId.value = step.id;

          // ✅ เสมอแสดง OTP modal เพื่อกรอก OTP ก่อน
          console.log('🔍 [PO Create] Showing OTP modal for step:', step.id);
          const otpSent = await sendOtp();
          if (otpSent) {
            await nextTick();
            showOtpModal.value = true;
          }
       } else {
          success("ສ້າງໃບສັ່ງຊື້ສຳເລັດແລ້ວ");
          currentStatus.value = "finish";
          currentStep.value = 2;
          customSteps.value[1].disabled = false;
          customSteps.value[2].disabled = false;
          stepsData[2] = { order: result };
       }
    } else {
      throw new Error("ບໍ່ສາມາດສ້າງໃບສັ່ງຊື້ໄດ້ ແລະບໍ່ມີ ID ເອກະສານ");
    }
  } catch (err: any) {
    console.error("Error creating purchase order:", err);
    error("ເກີດຂໍ້ຜິດພາດ", err.message || "ບໍ່ສາມາດສ້າງໃບສັ່ງຊື້ໄດ້");
  } finally {
    if (!showOtpModal.value) {
        isSubmitting.value = false;
    }
  }
};
/******************************************************* */

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
          onClick: () => handleConfirm(),
          // onClick: () => handleConfirm(stepsData),
          show: true,
          disabled: !isFormValid.value || !isAllItemsHaveVendor.value,
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

const form = ref<FormStateInterface>({
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
  vendorId: "",
});

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
  router.push({ name: "apv_purchase_request.index" });
};
const totalAmount = computed(() => {
  return requestDetail.value?.getItems().reduce((sum, item) => sum + item.getTotalPrice(), 0) || 0;
});

watch(
  totalAmount,
  (newValue) => {
    form.value.totalName = convertToLaoWords(newValue);
  },
  { immediate: true }
);

watch(
  requestDetail,
  (newValue) => {
    if (newValue) {
      purchaseItems.value = newValue.getItems().map((item) => ({
        id: item.getId(),
        title: item.getTitle(),
        quantity: item.getQuantity(),
        unit: item.getUnit(),
        price: item.getPrice(),
        total_price: item.getTotalPrice(),
        remark: item.getRemark(),
        file_name_url: item.getFileNameUrl(),
      }));
      // console.log("purchaseItems after watch update:", purchaseItems.value);
    } else {
      purchaseItems.value = [];
    }
  },
  { immediate: true }
);

onMounted(async () => {
  const purchaseRequestId = route.params.id;
  const documentTypeId = route.query.document_type_id;
  // console.log("Route params:", route.params);
  // console.log("Route query:", route.query);
  // console.log("purchaseRequestId:", purchaseRequestId);
  // console.log("documentTypeId:", documentTypeId);
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

const onPriceChange = (record: PurchaseItem, newPrice: number) => {
  const item = purchaseItems.value.find((i) => i.id === record.id);
  if (item) {
    item.price = newPrice;
    item.total_price = newPrice * item.quantity;
  }
};

// ✅ Check if file is PDF or Image
const isPdfFile = (filename: string) => {
  return filename.toLowerCase().endsWith('.pdf');
};

const isImageFile = (filename: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

// ✅ Handle file click - open in new tab
const handleFileClick = (fileUrl: string, filename: string) => {
  window.open(fileUrl, '_blank');
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
      <DrawerPr :id="selectedPrId" />
    </UiDrawer>
    <!--  -->
    <ModalVendorCreate ref="vendorModalRef" @submitted="handleVendorModalSubmitted" :purchaseRequestData="purchaseRequestData" />
    <!-- OTP Modal (ສຳລັບປ້ອນ OTP) - ເສມອງສະເໜີ OTP ເສມອງ -->
    <OtpModal
      v-if="showOtpModal"
      :visible="true"
      :title="t('purchase-rq.otp-verification')"
      :approval-step-id="currentApprovalStepId"
      :is-otp="true"
      :loading="confirmLoading"
      @confirm="handleOtpConfirm"
      @close="handleOtpClose"
    />

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
                    .reduce((sum, quantity) => sum + quantity, 0)
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
            <div class="flex items-center justify-between">
              <h3 class="font-medium">ໃບສະເໜີລາຄາ</h3>
              <UiButton
                color-class="flex items-center bg-red-500 hover:!text-white hover:!bg-red-800 text-white"
                @click="openVendorModal"
                :disabled="selectedRowKeys.length === 0"
              >
                <Icon icon="mdi:plus" class="mr-1" /> ເພີ່ມຂໍ້ມູນ
              </UiButton>
            </div>

            <UiTable
              :columns="columns(t)"
              :dataSource="purchaseItems"
              :row-selection="rowSelectionConfig"
              :row-key="'id'"
              :pagination="false"
            >
              <template #bodyCell="{ column, record }">
                <!-- แสดงรูปภาพจากใบเสนอราคา -->
                <template v-if="column.dataIndex === 'file_name_url' && record.file_name_url">
                  <div class="image-thumbnail-container">
                    <a-image
                      :src="record.file_name_url"
                      :preview="false"
                      class="image-thumbnail cursor-pointer"
                      @click="showImageModal(record.file_name_url)"
                      alt="ເອກະສານ PR"
                      style="
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border-radius: 50%;
                      "
                    />
                  </div>
                </template>
                <template v-if="column.dataIndex === 'price'">
                  <a-input-number
                    :value="record.price"
                    @change="onPriceChange(record, $event)"
                    :min="0"
                    :step="1"
                  />
                </template>

                <template v-else-if="column.dataIndex === 'vendor'">
                  <div v-if="itemVendors[record.id]" class="flex items-center gap-2">
                    <!-- ✅ File Preview: Image or PDF -->
                    <div
                      v-if="itemVendors[record.id].file_url"
                      class="cursor-pointer file-preview-wrapper"
                      @click="handleFileClick(itemVendors[record.id].file_url, itemVendors[record.id].filename)"
                    >
                      <!-- Image thumbnail -->
                      <a-image
                        v-if="isImageFile(itemVendors[record.id].filename || itemVendors[record.id].file_url)"
                        :src="itemVendors[record.id].file_url"
                        :preview="false"
                        class="image-thumbnail"
                        style="
                          width: 50px;
                          height: 50px;
                          object-fit: cover;
                          border-radius: 8px;
                          border: 1px solid #e5e7eb;
                        "
                      />
                      <!-- PDF icon -->
                      <div
                        v-else-if="isPdfFile(itemVendors[record.id].filename || itemVendors[record.id].file_url)"
                        class="pdf-thumbnail"
                        style="
                          width: 50px;
                          height: 50px;
                          border-radius: 8px;
                          border: 1px solid #e5e7eb;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                        "
                      >
                        <Icon icon="mdi:file-pdf-box" class="text-red-500 text-2xl" />
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-medium">{{ itemVendors[record.id].vendor_name }}</span>
                      <span class="text-xs text-gray-500">{{
                        itemVendors[record.id].bank_name
                      }}</span>
                      <span class="text-xs text-gray-500">{{
                        itemVendors[record.id].account_number
                      }}</span>
                    </div>
                  </div>
                  <span v-else class="text-gray-400">ກະລຸນາເລືອກຮ້ານຄ້າ</span>
                </template>

                <template v-else-if="column.dataIndex === 'action'">
                  <div v-if="itemVendors[record.id]" class="flex space-x-2">
                    <UiButton
                      type="default"
                      size="small"
                      @click="editVendorForItem(record.id)"
                      color-class="flex items-center hover:bg-blue-50"
                    >
                      <Icon icon="mdi:pencil" class="mr-1" />
                      ແກ້ໄຂ
                    </UiButton>
                    <UiButton
                      type="default"
                      size="small"
                      @click="removeVendorForItem(record.id)"
                      color-class="flex items-center bg-red-500 text-white hover:bg-red-600"
                    >
                      <Icon icon="mdi:trash" class="mr-1" />
                      ລຶບ
                    </UiButton>
                  </div>
                </template>
              </template>
            </UiTable>
            <div v-if="selectedRowKeys.length > 0" class="mt-2 text-sm text-gray-600">
              ເລືອກ {{ selectedRowKeys.length }} ລາຍການ
            </div>
          </div>

          <!-- Modal photho -->
          <a-modal v-model:visible="imageModalVisible" :footer="null" :width="800">
            <img :src="selectedImage" style="width: 100%" alt="Preview" />
          </a-modal>
          <!-- Modal vendors -->
          <UiModal
            v-model:visible="vendorReasonModalVisible"
            title="ຂໍ້ມູນເພີ່ມເຕີມ"
            :footer="null"
            @cancel="closeVendorReasonModal"
          >
            <div class="space-y-4">
              <!-- แสดงชื่อร้านค้าที่เลือก -->
              <div v-if="currentReasonData.vendor_name" class="mb-4">
                <h3 class="text-lg font-medium">ຮ້ານຄ້າ: {{ currentReasonData.vendor_name }}</h3>
              </div>

              <!-- bank_account -->
              <UiFormItem label="ບັນຊີທະນາຄານ">
                <InputSelect
                  v-model="currentReasonData.vendor_bank_account_id"
                  :options="vendorBankOptions"
                  placeholder="ເລືອກບັນຊີທະນາຄານ"
                  class="w-full"
                >
                  <template #option="{ option }">
                    <div class="flex flex-col">
                      <span>{{ option.bank_name }}</span>
                      <span class="text-gray-500 text-xs">{{ option.account_number }}</span>
                    </div>
                  </template>
                </InputSelect>
              </UiFormItem>

              <!-- reason -->
              <UiFormItem label="ເຫດຜົນໃນການເລືອກ">
                <Textarea
                  v-model="currentReasonData.reason"
                  placeholder="ກະລຸນາລະບຸເຫດຜົນໃນການເລືອກຮ້ານຄ້ານີ້"
                  :rows="3"
                  class="w-full"
                />
              </UiFormItem>

              <!--  VAT -->
              <UiFormItem>
                <a-checkbox v-model:checked="currentReasonData.is_vat">
                  ລວມພາສີມູນຄ່າເພີ່ມ (VAT)
                </a-checkbox>
              </UiFormItem>

              <!-- save -->
              <div class="flex justify-end gap-2">
                <UiButton @click="closeVendorReasonModal"> ຍົກເລີກ </UiButton>
                <UiButton
                  type="primary"
                  @click="saveVendorReason"
                  :disabled="!currentReasonData.vendor_bank_account_id"
                >
                  ບັນທຶກ
                </UiButton>
              </div>
            </div>
          </UiModal>
        </div>
        <!-- Payment Details -->
        <div >
         

          <!-- <div class="mt-6">
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
          </div> -->
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

/* Image thumbnail - วงกลม */
.image-thumbnail {
  cursor: pointer;
}

.image-thumbnail:hover {
  transform: scale(1.1);
}

/* File preview wrapper */
.file-preview-wrapper {
  transition: all 0.2s ease;
}

.file-preview-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.file-preview-wrapper:hover .image-thumbnail,
.file-preview-wrapper:hover .pdf-thumbnail {
  border-color: #f59e0b;
}

/* PDF thumbnail */
.pdf-thumbnail {
  transition: all 0.2s ease;
}

.pdf-thumbnail:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
}
</style>
