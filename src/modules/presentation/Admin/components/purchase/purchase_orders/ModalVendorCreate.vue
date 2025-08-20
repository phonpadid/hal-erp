<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useVendorStore } from "../../../stores/vendors/vendor.store";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { Upload, message } from "ant-design-vue";
import type { UploadFile } from "ant-design-vue";
import { uploadFile } from "@/modules/application/services/upload.service";

// store ร้านค้า
const vendorStore = useVendorStore();

// state โมดัล
const visible = ref(false);

// ฟอร์ม
const selectedVendor = ref<string>("");
const fileList = ref<UploadFile[]>([]);

// พรีวิว
const previewUrl = ref<string>("");
// ชื่อไฟล์จากเซิร์ฟเวอร์
const uploadedFileNames = ref<string[]>([]);
// สถานะอัปโหลด (โชว์สปิน/ปิดปุ่มยืนยันขณะอัปโหลด)
const uploadLoading = ref(false);

// emit กลับไป parent เมื่อกดยืนยัน (ส่ง vendorId + fileNames ที่อัปโหลดแล้ว)
const emit = defineEmits<{
  (e: "submitted", payload: { vendorId: string; fileNames: string[]; fileUrl?: string }): void;
}>();

// เปิด/ปิด/รีเซ็ต โมดัล
const open = () => {
  visible.value = true;
};
const close = () => {
  visible.value = false;
};
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

// เลือกร้านค้า
const handleVendorChange = (value: string) => {
  selectedVendor.value = value;
};
// const getBase64 = (file: File) =>
//   new Promise<string>((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result as string);
//     reader.onerror = reject;
//   });
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
  const matchingVendor = vendorStore.activeVendors.find(v => v.getId() === type);
  if (matchingVendor) {
    selectedVendor.value = matchingVendor.getId();
  }
};

// ยืนยัน: ส่ง vendorId + fileNames กลับไปให้ parent
const handleOk = () => {
  if (!selectedVendor.value) {
    message.warning("ກະລຸນາເລືອກຮ້ານຄ້າ");
    return;
  }
  if (uploadedFileNames.value.length === 0) {
    message.warning("ກະລຸນາເລືອກຮູບແລະອັບໂຫລດໃຫ້ສຳເລັດ");
    return;
  }
  if (uploadLoading.value) return;

  emit("submitted", {
    vendorId: selectedVendor.value,
    fileNames: uploadedFileNames.value,
    fileUrl: previewUrl.value,
  });

  close();
};

defineExpose({ open, close, reset , setSelectedType });

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
      <!-- ถึงร้านค้า -->
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

      <div class="text-gray-600">ອັບໂຫລດໃບສະເໜີເພື່ອປັບຮູບແບບຕາມເລືອກຮ້ານ</div>

      <!-- พื้นที่อัปโหลดแบบเส้นประ + แสดงพรีวิวใหญ่กลางกรอบ -->
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
