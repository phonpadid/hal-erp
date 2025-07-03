<script setup lang="ts">
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { computed, ref, watch } from "vue";
import { dataMenu } from "@/modules/shared/utils/data.department";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import type { ButtonType } from "@/modules/shared/buttonType";
import { storeToRefs } from "pinia";
import { columns } from "../column";
import { useToggleStore } from "../../../stores/storage.store";
import OtpModal from "../modal/OtpModal.vue";
import SuccessModal from "../modal/SuccessModal.vue";
import { printContent } from "../helpers/printer";

const { t } = useI18n();
const profileImage = ref("/public/Profile-PNG-File.png");
const userName = ref("ທ້າວສຸກີ້");
const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const department = ref("ພະແນກການເງິນ");
const imageList = ["/public/1.png", "/public/1.png"];

// Modal states
const isOtpModalVisible = ref(false);
const isSuccessModalVisible = ref(false);
const confirmLoading = ref(false);
const modalAction = ref(""); // 'approve' or 'reject'
const approval = ref(false);
const customButtons = [
  {
    label: "ປະຕິເສດ",
    type: "default" as ButtonType,
    onClick: () => {
      modalAction.value = "reject";
      isOtpModalVisible.value = true;
    },
  },
  {
    label: "ອະນຸມັດ",
    type: "primary" as ButtonType,
    onClick: () => {
      modalAction.value = "approve";
      isOtpModalVisible.value = true;
    },
  },
];
const handlePrint = async () => {
  try {
    await printContent({
      title: 'ໃບສະເໜີຈັດຊື້ ເລກທີ 0036/ພລ',
      contentSelector: '.body',
      hideElements: ['.fixed', '.ant-drawer', '.ant-modal'],
      customStyles: `
        /* Add any custom Lao font or specific styling */
        body {
          font-family: 'Noto Sans Lao', sans-serif;
        }
        .signature img {
          max-width: 180px;
          max-height: 100px;
        }
      `
    });
  } catch (error) {
    console.error('Print error:', error);
  }
};
const customButtonSuccess = [
{
    label: "print",
    icon: "ant-design:printer-outlined",
    class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
    type: "default" as ButtonType,
    onClick: handlePrint, // Using the helper function
  },
];

// Handle OTP confirmation - show success modal after OTP
const handleOtpConfirm = () => {
  console.log(`Action: ${modalAction.value}`);
  isOtpModalVisible.value = false;

  // Show success modal after OTP verification
  setTimeout(() => {
    isSuccessModalVisible.value = true;
  }, 300);
};

const handleOtpClose = () => {
  isOtpModalVisible.value = false;
  modalAction.value = "";
};

// Handle final success confirmation
const handleSuccessConfirm = async () => {
  confirmLoading.value = true;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (modalAction.value === "approve") {
      console.log("Document approved successfully");
      // Add your approval API call here
      // await approveDocument(documentId);
    } else {
      console.log("Document rejected successfully");
      // Add your rejection API call here
      // await rejectDocument(documentId);
    }

    isSuccessModalVisible.value = false;
    modalAction.value = "";
  } catch (error) {
    console.error("Error processing action:", error);
    // Handle error (show error message, etc.)
  } finally {
    confirmLoading.value = false;
  }
};

const handleSuccessCancel = () => {
  isSuccessModalVisible.value = false;
  modalAction.value = "";
};

const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);
const topbarStyle = computed(() => {
  return toggle.value ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
});

const handleToggle = () => {
  toggle.value = !toggle.value;
  localStorage.setItem("toggle", toggle.value.toString());
};

// Dynamic success modal content based on action
const successModalProps = computed(() => {
  if (modalAction.value === "") {
    return {
      message: "ອະນຸມັດສຳເລັດ",
      description:
        "ອະນຸມັດຄຳຂໍຈັດຊື້ຂອງທ່ານສຳເລັດ ຂໍ້ມູນຈະຖືກສົ່ງໄປຫາພະແນກການເງິນເພື່ອອະນຸມັດຂໍ້ມູນ",
      iconName: "mdi:check-decagram",
      iconColor: "text-green-500",
      buttonText: "ຢືນຢັນ",
    };
  } else {
    return {
      message: "ປະຕິເສດສຳເລັດ",
      description:
        "ປະຕິເສດຄຳຂໍຈັດຊື້ຂອງທ່ານສຳເລັດ ຂໍ້ມູນຈະຖືກສົ່ງກັບຄືນໄປຫາຜູ້ສະເໜີ",
      iconName: "mdi:close-circle",
      iconColor: "text-red-500",
      buttonText: "ຢືນຢັນ",
    };
  }
});
watch(modalAction, (newVal) => {
  if (newVal === "") {
    approval.value = true;
  } else {
    approval.value = false; // optional if you need to reset
  }
});
</script>

<template>
  <div class="container mx-auto py-1 px-0">
    <!-- Header Component -->
    <div
      class="fixed px-6 py-4 top-0 z-20 bg-white shadow-sm transition-all duration-150 mt-[4rem]"
      :class="topbarStyle"
    >
      <header-component v-if="!approval"
        @toggle="handleToggle"
        header-title="ອະນຸມັດໃບສະເໜີ"
        :breadcrumb-items="['ອະນຸມັດໃບສະເໜີ', 'ອະນຸມັດ']"
        document-prefix="ໃບສະເໜີຈັດຊື້"
        document-number="ເລກທີ 0036/ພລ - ວັນທີ"
        :document-date="new Date('2025-03-26')"
        :action-buttons="customButtons"
        document-status="ລໍຖ້າຫົວໜ້າພະແນກພັດທະນາທຸລະກິດກວດສອບ"
        document-status-class="text-orange-400 text-sm font-medium ml-2 ring-2 ring-orange-300 px-3 py-1 rounded-full"
      />
      <header-component v-else
        @toggle="handleToggle"
        header-title="ອະນຸມັດໃບສະເໜີ"
        :breadcrumb-items="['ອະນຸມັດໃບສະເໜີ', 'ອະນຸມັດ']"
        document-prefix="ໃບສະເໜີຈັດຊື້"
        document-number="ເລກທີ 0036/ພລ - ວັນທີ"
        :document-date="new Date('2025-03-26')"
        :action-buttons="customButtonSuccess"
        document-status="ລໍຖ້າຫົວໜ້າພະແນກພັດທະນາທຸລະກິດກວດສອບ"
        document-status-class="text-orange-400 text-sm font-medium ml-2 ring-2 ring-orange-300 px-3 py-1 rounded-full"
      />
    </div>

    <!-- Main Content -->
    <div class="body mt-[10rem]">
      <div class="user-info shadow-sm py-2">
        <!-- User Information Section -->
        <h2 class="text-md font-semibold px-6 mb-4">ຂໍ້ມູນຜູ້ສະເໜີ</h2>
        <div class="info flex items-center px-6 gap-4 mb-4">
          <a-image
            :src="profileImage"
            alt="avatar"
            class="w-20 h-20 rounded-full object-cover"
            :width="80"
            :height="80"
            :preview="false"
          />
          <div class="detail -space-y-2">
            <p class="font-medium">{{ userName }}</p>
            <p class="text-gray-600">{{ userPosition }}</p>
          </div>
        </div>

        <!-- Required Date Section -->
        <div class="want-date -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">ວັນທີ່ຕ້ອງການ</h2>
          <p class="text-gray-600 text-sm">18 ກໍລະກົດ 2025</p>
        </div>

        <!-- Purpose Section -->
        <div class="purposes -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">ຈຸດປະສົງ</h2>
          <p class="text-gray-600 text-sm">
            ມີການຈັດຊື້ ເນື່ອງຈາກວ່າປະຈຸບັນນີ້ມີພະນັກງານເຂົ້າມາເພີ່ມໃໝ່ 5 ຄົນ
          </p>
        </div>

        <!-- Items Table Section -->
        <div class="table -space-y-0 mb-2 w-full px-6 shadow-sm rounded-md">
          <h2 class="text-md font-semibold">ລາຍການ</h2>
          <a-table
            :columns="columns(t)"
            :dataSource="dataMenu"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'price'">
                <span>₭ {{ formatPrice(record.price) }}</span>
              </template>
            </template>
          </a-table>
          <div
            class="total flex items-center md:justify-end justify-start md:px-6 px-1 pt-4 gap-4"
          >
            <p class="font-medium text-slate-600">ຍອດລວມ:</p>
            <p class="font-semibold md:text-lg text-sm text-slate-700">
              {{ formatPrice(49000000) }} ₭
            </p>
          </div>
        </div>

        <!-- Sample Images Section -->
        <div class="image space-y-4 py-4 shadow-sm px-6 rounded-md">
          <h2 class="text-md font-semibold">ຮູບຕົວຢ່າງ</h2>
          <div class="flex flex-wrap gap-6">
            <a-image
              v-for="(img, index) in imageList"
              :key="index"
              :src="img"
              alt="example"
              :width="280"
              :height="150"
              :preview="true"
              class="rounded-xl shadow-sm"
            />
          </div>
        </div>

        <!-- Signature Section -->
        <div class="signature flex items-center gap-[10rem] shadow-sm py-4 px-6 rounded-md mb-[10rem]">
          <div class="signature1">
            <h2 class="text-md font-semibold">ລາຍເຊັນ</h2>
            <p class="text-slate-500 text-sm">ຜູ້ສະເໜີ</p>

            <a-image
              src="/public/2.png"
              alt="signature"
              :width="120"
              :height="80"
              :preview="false"
            />
            <div class="info text-sm text-slate-600 -space-y-2 mt-4">
              <p>{{ userName }}</p>
              <p>{{ department }}</p>
            </div>
          </div>
          <div v-if="approval" class="signature1">
            <p class="text-slate-500 text-sm mt-10">ຜູ້ອະນຸມັດ</p>
            <a-image
              src="/public/2.png"
              alt="signature"
              :width="120"
              :height="80"
              :preview="false"
            />
            <div class="info text-sm text-slate-600 -space-y-2 mt-4">
              <p>ສຸພາພອນ ພະໄຊຍະວົງ</p>
              <p>ຫົວໜ້າພະແນກທຸລະກິດ</p>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- OTP Modal -->
    <OtpModal
      :visible="isOtpModalVisible"
      title="ຢືນຢັນລາຍເຊັນ"
      @confirm="handleOtpConfirm"
      @close="handleOtpClose"
    />

    <!-- Success Modal -->
    <SuccessModal
      v-model:visible="isSuccessModalVisible"
      :message="successModalProps.message"
      :description="successModalProps.description"
      :icon-name="successModalProps.iconName"
      :icon-color="successModalProps.iconColor"
      :button-text="successModalProps.buttonText"
      :loading="confirmLoading"
      @confirm="handleSuccessConfirm"
      @cancel="handleSuccessCancel"
    />
  </div>
</template>

<style scoped>
/* Add any component-specific styles here if needed */
.user-info {
  background: white;
  border-radius: 0.5rem;
}

.table {
  background: white;
}

.image {
  background: white;
}

.signature {
  background: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .total {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .info {
    flex-direction: column;
    text-align: center;
  }
}
</style>
