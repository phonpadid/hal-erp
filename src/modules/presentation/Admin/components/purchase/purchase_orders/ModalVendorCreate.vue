<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useVendorStore } from "../../../stores/vendors/vendor.store";
import { message } from "ant-design-vue";
import { useVendorBankAccountStore } from "../../../stores/vendors/vendor-bank-accounts.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import PdfUploader from "@/common/shared/components/Input/PdfUploader.vue";
import { Icon } from "@iconify/vue";

// Props for purchase request data
const props = defineProps<{
  purchaseRequestData?: {
    purchase_request_item: Array<{
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
  };
}>();

const vendorStore = useVendorStore();
const { error } = useNotification();
const visible = ref(false);
const selectedVendor = ref<string>("");
const bankAccount = useVendorBankAccountStore();
const uploadedFileNames = ref<string[]>([]);
const pdfFileName = ref<string>("");
const pdfFileUrl = ref<string>("");
const uploadLoading = ref(false);

const emit = defineEmits<{
  (
    e: "submitted",
    payload: {
      vendorId: string;
      fileNames: string[];
      fileUrl?: string;
      bankId?: string;
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      reason?: string;
      is_vat?: boolean;
    }
  ): void;
}>();

// เปิด/ปิด/รีเซ็ต โมดัล
const open = () => {
  visible.value = true;
  // Auto-select vendor from purchase request data
  autoSelectVendor();
};
const close = () => {
  visible.value = false;
};

const isVat = ref(false);

const reset = () => {
  selectedVendor.value = "";
  uploadedFileNames.value = [];
  pdfFileName.value = "";
  pdfFileUrl.value = "";
  uploadLoading.value = false;
  form.value.bank = "";
  form.value.bankName = "";
  form.value.accountName = "";
  form.value.accountNumber = "";
  form.value.currencyCode = "";
};

// const vendorOptions = computed(() => {
//   return vendorStore.activeVendors.map((vendor) => ({
//     label: vendor.getname(),
//     value: vendor.getId(),
//     contact: vendor.getcontact_info(),
//   }));
// });

// โหลดร้านค้า
onMounted(async () => {
  try {
    await vendorStore.fetchVendors();
  } catch (err) {
    console.error("fetch vendors error", err);
  }
});

/****************Bank account ************************** */
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
  bank: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  currencyCode: string;
  vendorImage: string;
  vendorType: string;
  vendorId: string;
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
  bank: "",
  accountName: "",
  accountNumber: "",
  bankName: "",
  currencyCode: "",
  vendorImage: "",
  vendorType: "",
  vendorId: "",
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
/****************Bank account ************************** */
const handleVendorChange = async (value: string) => {
  selectedVendor.value = value;
  form.value.bank = "";
  if (value) {
    try {
      await bankAccount.fetchBankAccounts(Number(value));
    } catch (err) {
      console.error("Error fetching bank accounts for vendor:", err);
      error("เกิดข้อผิดพลาดในการโหลดข้อมูลบัญชีธนาคารของผู้ขาย");
    }
  } else {
    bankAccount.bankAccounts = [];
  }
};

// PDF Upload handlers
const handlePdfUpload = (payload: { fileName: string; fileUrl: string }) => {
  uploadedFileNames.value = [payload.fileName];
  pdfFileName.value = payload.fileName;
  pdfFileUrl.value = payload.fileUrl;
  uploadLoading.value = false;
};

const handlePdfRemove = () => {
  uploadedFileNames.value = [];
  pdfFileName.value = "";
  pdfFileUrl.value = "";
};

const selectedType = ref<string>("");
// Auto-select vendor from purchase request data
const autoSelectVendor = async () => {
  if (props.purchaseRequestData?.purchase_request_item) {
    // Find the first item that has vendor data
    const firstItemWithVendor = props.purchaseRequestData.purchase_request_item.find(
      (item) => item.quota_company?.vendor
    );

    if (firstItemWithVendor?.quota_company?.vendor) {
      const vendor = firstItemWithVendor.quota_company.vendor;

      // Select the vendor by ID
      selectedVendor.value = vendor.id.toString();

      // Load bank accounts for this vendor
      await handleVendorChange(vendor.id.toString());
    }
  }
};

const setSelectedType = (type: string) => {
  selectedType.value = type;
  const matchingVendor = vendorStore.activeVendors.find((v) => v.getId() === type);
  if (matchingVendor) {
    selectedVendor.value = matchingVendor.getId();
  }
};

const handleOk = () => {
  if (!selectedVendor.value) {
    message.warning("ກະລຸນາເລືອກຮ້ານຄ້າ");
    return;
  }
  if (uploadedFileNames.value.length === 0) {
    message.warning("ກະລຸນາເລືອກໄຟລ໌ PDF ແລະອັບໂຫລດໃຫ້ສຳເລັດ");
    return;
  }
  if (!form.value.bank) {
    message.warning("ກະລຸນາເລືອກບັນຊີທະນາຄານ");
    return;
  }
  if (uploadLoading.value) return;

  emit("submitted", {
    vendorId: selectedVendor.value,
    fileNames: uploadedFileNames.value,
    fileUrl: pdfFileUrl.value,
    bankId: form.value.bank,
    bankName: form.value.bankName,
    accountName: form.value.accountName,
    accountNumber: form.value.accountNumber,
    reason: form.value.descriptions || "",
    is_vat: isVat.value,
  });

  close();
};
defineExpose({ open, close, reset, setSelectedType });
</script>

<template>
  <UiModal
    v-model:visible="visible"
    title="ໃບສະເໜີລາຄາ"
    title-icon="material-symbols-light:receipt-long"
    :footer="null"
    :width="800"
    :max-width="'92vw'"
    :centered="true"
    class="vendor-modal"
    @cancel="close"
  >
    <div class="modal-content">
      <div class="space-y-3">
        <!-- Vendor Section -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md p-3 border border-blue-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
              <Icon icon="mdi:store" class="text-white text-sm" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-800">ຂໍ້ມູນຮ້ານຄ້າ</h3>
              <p class="text-xs text-gray-600">ຮ້ານຄ້າຈາກໃບສະເໜີລາຄາ</p>
            </div>
          </div>

          <div v-if="selectedVendor" class="bg-white rounded-md p-2 shadow-sm border border-blue-50">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-md flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:storefront" class="text-blue-600 text-sm" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-800 text-xs truncate">
                  {{ vendorStore.activeVendors.find(v => v.getId() === selectedVendor)?.getname() }}
                </h4>
                <div class="flex items-center gap-1 mt-0.5">
                  <Icon icon="mdi:phone" class="text-gray-400 text-xs flex-shrink-0" />
                  <span class="text-gray-500 text-xs truncate">
                    {{ vendorStore.activeVendors.find(v => v.getId() === selectedVendor)?.getcontact_info() }}
                  </span>
                </div>
              </div>
              <div class="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium flex-shrink-0">
                ຮ້ານຄ້າ
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bank Selection Section -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-md p-3 border border-green-100 mt-1">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
            <Icon icon="mdi:bank" class="text-white text-sm" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-800">ຂໍ້ມູນທະນາຄານ</h3>
            <p class="text-xs text-gray-600">ເລືອກບັນຊີທະນາຄານຂອງຮ້ານຄ້າ</p>
          </div>
        </div>

        <UiFormItem label="ເລືອກບັນຊີທະນາຄານ" required class="mb-0">
          <InputSelect
            v-model:modelValue="form.bank"
            :options="bankOptions"
            placeholder="ເລືອກທະນາຄານທີ່ຕ້ອງການໂອນເງິນ"
            @update:modelValue="handleBankChange"
            class="shadow-sm text-xs"
          >
            <template #option="{ option }">
              <div class="flex flex-col py-0.5">
                <div class="flex items-center gap-1">
                  <Icon icon="mdi:bank" class="text-gray-400 text-xs" />
                  <span class="font-medium text-xs">{{ option.label }}</span>
                </div>
                <span class="text-gray-500 text-[10px] ml-5">{{ option.account_number }}</span>
              </div>
            </template>
          </InputSelect>
        </UiFormItem>
      </div>

      <!-- Additional Information Section -->
      <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-md p-3 border border-amber-100 mt-1">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center">
            <Icon icon="mdi:information" class="text-white text-sm" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-800">ຂໍ້ມູນເພີ່ມເຕີມ</h3>
            <p class="text-xs text-gray-600">ລາຍລະອຽດອື່ນໆ ສຳລັບການສັ່ງຊື້</p>
          </div>
        </div>

        <!-- VAT Checkbox -->
        <div class="bg-white rounded-md p-2 shadow-sm border border-amber-50 mb-2">
          <div class="flex items-center gap-2">
            <a-checkbox v-model:checked="isVat" class="scale-100">
              <span class="font-medium text-gray-700 text-xs">ລວມພາສີມູນຄ່າເພີ່ມ (VAT)</span>
            </a-checkbox>
            <div class="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">
              10%
            </div>
          </div>
        </div>

        <!-- Reason Textarea -->
        <div class="bg-white rounded-md p-2 shadow-sm border border-amber-50">
          <UiFormItem label="ເຫດຜົນ" class="mb-0">
            <Textarea
              v-model="form.descriptions"
              placeholder="ກະລຸນາລະບຸເຫດຜົນທີ່ເລືອກ..."
              class="w-full border-amber-100 text-xs"
              :rows="2"
              :show-count="true"
              :maxlength="300"
            />
          </UiFormItem>
        </div>
      </div>

      <!-- File Upload Section -->
      <div class="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-md p-3 border border-amber-100 mt-1">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center">
            <Icon icon="mdi:file-pdf-box" class="text-white text-sm" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-800">ອັບໂຫລດໃບສະເໜີລາຄາ (PDF)</h3>
            <p class="text-xs text-gray-600">ແນບລະບຸໃບສະເໜີລາຄາຈາກຮ້ານຄ້າ</p>
          </div>
        </div>

        <PdfUploader
          :disabled="!selectedVendor"
          @uploaded="handlePdfUpload"
          @remove="handlePdfRemove"
        />
      </div>

      <!-- Submit Buttons -->
      <div class="flex gap-2 mt-3">
        <UiButton
          type="default"
          color-class="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 flex items-center justify-center"
          class="flex-1 h-9 text-xs font-medium"
          @click="close"
        >
          <Icon icon="mdi:close" class="mr-1 text-xs" />
          ຍົກເລີກ
        </UiButton>
        <UiButton
          type="primary"
          color-class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          class="flex-1 h-9 text-xs font-medium"
          :disabled="!selectedVendor || uploadedFileNames.length === 0 || uploadLoading"
          @click="handleOk"
        >
          <Icon icon="mdi:check-circle" class="mr-1 text-xs" />
          <span v-if="uploadLoading" class="text-xs">ກຳລັງບັນທຶກ...</span>
          <span v-else class="text-xs font-semibold">ຢືນຢັນ</span>
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
/* Modal custom styles */
.vendor-modal :deep(.ant-modal) {
  max-width: 95vw;
}

.vendor-modal :deep(.ant-modal-body) {
  padding: 0;
  max-height: 85vh;
  overflow-y: auto;
}

.vendor-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
}

.vendor-modal :deep(.ant-modal-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 32px;
  border-bottom: none;
}

.vendor-modal :deep(.ant-modal-title) {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.vendor-modal :deep(.ant-modal-close) {
  color: white;
  opacity: 0.8;
  top: 24px;
  right: 24px;
}

.vendor-modal :deep(.ant-modal-close:hover) {
  opacity: 1;
}

/* Content area */
.modal-content {
  padding: 10px;
  min-height: 300px;
}

/* Scrollbar styling */
.vendor-modal :deep(.ant-modal-body)::-webkit-scrollbar {
  width: 8px;
}

.vendor-modal :deep(.ant-modal-body)::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.vendor-modal :deep(.ant-modal-body)::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.vendor-modal :deep(.ant-modal-body)::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-content {
    padding: 20px;
  }

  .vendor-modal :deep(.ant-modal-header) {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 16px;
  }

  .space-y-4 > * + * {
    margin-top: 0.75rem;
  }
}
</style>
