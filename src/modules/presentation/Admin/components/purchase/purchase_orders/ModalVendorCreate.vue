<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useVendorStore } from "../../../stores/vendors/vendor.store";
import { Upload, message } from "ant-design-vue";
import type { UploadFile } from "ant-design-vue";
import { uploadFile } from "@/modules/application/services/upload.service";
import { useVendorBankAccountStore } from "../../../stores/vendors/vendor-bank-accounts.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";

const vendorStore = useVendorStore();
const { error } = useNotification();
const visible = ref(false);
const selectedVendor = ref<string>("");
const fileList = ref<UploadFile[]>([]);
const previewUrl = ref<string>("");
const bankAccount = useVendorBankAccountStore();
const uploadedFileNames = ref<string[]>([]);
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
};
const close = () => {
  visible.value = false;
};

const isVat = ref(false);

const reset = () => {
  selectedVendor.value = "";
  fileList.value = [];
  previewUrl.value = "";
  uploadedFileNames.value = [];
  uploadLoading.value = false;
};

// ตัวเลือกของร้านค้า
const vendorOptions = computed(() => {
  return vendorStore.activeVendors.map((vendor) => ({
    label: vendor.getname(),
    value: vendor.getId(),
    contact: vendor.getcontact_info(),
  }));
});

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
onMounted(async () => {
  try {
    await bankAccount.fetchBankAccounts(17);
  } catch (err) {
    console.error("Error fetching bank accounts:", err);
    error("ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນທະນາຄານ");
  }
});

/****************Bank account ************************** */

// เลือกร้านค้า
const handleVendorChange = (value: string) => {
  selectedVendor.value = value;
};
const beforeUpload = async (file: File) => {
  if (!selectedVendor.value) {
    message.warning("ກະລຸນາເລືອກຮ້ານຄ້າກ່ອນ");

    return Upload.LIST_IGNORE;
  }
  if (!file.type.startsWith("image/")) {
    message.error("ກະລຸນາເລືອກໄຟລ໌ຮູບ (PNG/JPG/GIF/SVG)");

    return Upload.LIST_IGNORE;
  }
  // ไม่อัปโหลดผ่านกลไกของ Upload ให้เราจัดการเอง
  return false;
};

const handleChange = async (info: { file: UploadFile; fileList: UploadFile[] }) => {
  const latest = info.fileList.slice(-1);
  fileList.value = latest;
  uploadedFileNames.value = [];

  const first = latest[0];
  if (first?.originFileObj) {
    // สร้าง URL สำหรับแสดงรูปภาพทันที
    previewUrl.value = URL.createObjectURL(first.originFileObj);

    // อัพโหลดไป API
    try {
      uploadLoading.value = true;
      const fd = new FormData();
      fd.append("file", first.originFileObj as File);
      const { fileName } = await uploadFile(fd);
      uploadedFileNames.value = [fileName];
      message.success("ອັບໂຫລດສຳເລັດ");
    } catch (err) {
      console.error("upload api error", err);
      message.error("ອັບໂຫລດລົ້ມເຫລວ");
      // ล้างข้อมูลเมื่อเกิดข้อผิดพลาด
      fileList.value = [];
      previewUrl.value = "";
      uploadedFileNames.value = [];
    } finally {
      uploadLoading.value = false;
    }
  } else {
    previewUrl.value = "";
  }
};

// เพิ่ม cleanup เมื่อ component ถูกทำลาย
onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});

// ลบไฟล์ (และล้างชื่อไฟล์ที่อัปโหลดแล้ว)
const handleRemove = () => {
  fileList.value = [];
  previewUrl.value = "";
  uploadedFileNames.value = [];
};

const selectedType = ref<string>("");

// เพิ่มฟังก์ชัน setSelectedType
const setSelectedType = (type: string) => {
  selectedType.value = type;

  // หากมีร้านค้าที่ตรงกับประเภทนี้ ให้เลือกไว้ล่วงหน้า
  const matchingVendor = vendorStore.activeVendors.find((v) => v.getId() === type);
  if (matchingVendor) {
    selectedVendor.value = matchingVendor.getId();
  }
};

// ใน ModalVendorCreate.vue
// ฟังก์ชัน handleOk ที่จะส่งข้อมูลกลับไปยังไฟล์หลัก
const handleOk = () => {
  if (!selectedVendor.value) {
    message.warning("ກະລຸນາເລືອກຮ້ານຄ້າ");
    return;
  }
  if (uploadedFileNames.value.length === 0) {
    message.warning("ກະລຸນາເລືອກຮູບແລະອັບໂຫລດໃຫ້ສຳເລັດ");
    return;
  }
  if (!form.value.bank) {
    message.warning("ກະລຸນາເລືອກບັນຊີທະນາຄານ");
    return;
  }
  if (uploadLoading.value) return;

  // ตรวจสอบ localStorage ก่อนส่งข้อมูล
  const itemId = localStorage.getItem('currentSelectedItemId');
  console.log("ใน handleOk - itemId จาก localStorage:", itemId);

  // ส่งข้อมูลกลับไปยังไฟล์หลัก
  emit("submitted", {
    vendorId: selectedVendor.value,
    fileNames: uploadedFileNames.value,
    fileUrl: previewUrl.value,
    bankId: form.value.bank,
    bankName: form.value.bankName,
    accountName: form.value.accountName,
    accountNumber: form.value.accountNumber,
    reason: form.value.descriptions || "",
    is_vat: isVat.value
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
    @cancel="close"
  >
    <div class="space-y-4">
      <UiFormItem label="ເລືອກຮ້ານຄ້າ" required>
        <InputSelect
          v-model="selectedVendor"
          :options="vendorOptions"
          placeholder="ເລືອກຮ້ານຄ້າ"
          @change="handleVendorChange"
        >
          <template #option="{ option }">
            <div class="flex flex-col">
              <span>{{ option.label }}</span>
              <span class="text-gray-500 text-sm">{{ option.contact }}</span>
            </div>
          </template>
        </InputSelect>
      </UiFormItem>

      <UiFormItem label="ທະນາຄານ" required>
        <InputSelect
          v-model:modelValue="form.bank"
          :options="bankOptions"
          placeholder="ເລືອກທະນາຄານ"
          @update:modelValue="handleBankChange"
        >
        </InputSelect>
      </UiFormItem>

      <UiFormItem label="ເລືອກພາສີ">
        <a-checkbox v-model:checked="isVat"> ລວມພາສີມູນຄ່າເພີ່ມ (VAT) </a-checkbox>
      </UiFormItem>

      <div class="text-gray-600">ອັບໂຫລດໃບສະເໜີເພື່ອປັບຮູບແບບຕາມເລືອກຮ້ານ</div>
      <Upload.Dragger
        v-model:file-list="fileList"
        :before-upload="beforeUpload"
        :show-upload-list="false"
        accept="image/*"
        :multiple="false"
        :max-count="1"
        class="upload-dragger"
        @change="handleChange"
      >
        <div class="uploader-body">
          <div v-if="previewUrl" class="preview-wrapper">
            <img :src="previewUrl" class="preview-image" alt="quotation preview" />
            <button type="button" class="remove-btn" @click.stop="handleRemove" aria-label="remove">
              <span class="icon">🗑️</span>
            </button>

            <div v-if="uploadLoading" class="overlay">
              <a-spin size="large" />
              <div class="overlay-text">ກຳລັງອັບໂຫລດ...</div>
            </div>
          </div>
          <div v-else class="placeholder">
            <div class="icon">☁️</div>
            <div class="title">Click to upload or drag and drop</div>
            <div class="hint">SVG, PNG, JPG or GIF</div>
          </div>
        </div>
      </Upload.Dragger>

      <!-- ปุ่มยืนยันเต็มความกว้าง -->
      <div class="mt-4">
        <UiButton
          type="primary"
          color-class="bg-red-500 text-white hover:bg-red-600 hover:!text-white w-full"
          :disabled="!selectedVendor || uploadedFileNames.length === 0 || uploadLoading"
          @click="handleOk"
        >
          ຢືນຢັນ
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.upload-dragger {
  border: 2px dashed #e5e7eb !important;
  border-radius: 12px;
  background: #fff;
  min-height: 260px;
  padding: 24px;
}
.uploader-body {
  position: relative;
  min-height: 220px;
}
.placeholder {
  display: grid;
  place-items: center;
  gap: 6px;
  color: #6b7280;
}
.placeholder .icon {
  font-size: 40px;
  opacity: 0.6;
}
.placeholder .title {
  color: #374151;
}
.placeholder .hint {
  font-size: 12px;
  color: #9ca3af;
}

.preview-wrapper {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 220px;
}
.preview-image {
  max-width: 360px;
  width: 100%;
  max-height: 380px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #fff;
  border: 1px solid #fca5a5;
  color: #ef4444;
  border-radius: 9999px;
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;
}
.remove-btn:hover {
  background: #fee2e2;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.65);
  display: grid;
  place-items: center;
  gap: 8px;
  border-radius: 8px;
}
.overlay-text {
  color: #374151;
  font-size: 12px;
}
</style>
