<script setup lang="ts">
import type { ButtonType } from "@/modules/shared/buttonType";
import { ref, computed } from "vue";
import { columns } from "../../../views/purchase_requests/column";
import { useI18n } from "vue-i18n";
import { purchaseRequestData } from "@/modules/shared/utils/purchaseRequestDetails";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table from "@/common/shared/components/table/Table.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { useAuthStore } from "../../../stores/authentication/auth.store";
/********************************************************* */
const { t } = useI18n();
const authStore = useAuthStore();
const isApproveModalVisible = ref(false);
const isRejectModalVisible = ref(false);
const rejectReason = ref("");
const confirmLoading = ref(false);

// Get user signature from localStorage
const userSignature = computed(() => {
  // Try to get signature from auth store user data first
  if (authStore.user?.getSignature()) {
    return authStore.user.getSignature();
  }

  // Fallback to localStorage directly
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.signature;
    }
  } catch (error) {
    console.error('Error parsing userData from localStorage:', error);
  }

  // Fallback to default signature image if no signature found
  return '/public/2.png';
});

// Handle signature image error
const handleSignatureError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Fallback to default signature image if user signature fails to load
  img.src = '/public/2.png';
};

// Custom buttons for header
const customButtons = [
  {
    label: "ປະຕິເສດ",
    type: "default" as ButtonType,
    onClick: () => {
      isRejectModalVisible.value = true;
    },
  },
  {
    label: "ອະນຸມັດ",
    type: "primary" as ButtonType,
    onClick: () => {
      isApproveModalVisible.value = true;
    },
  },
];
// Handle approve
const handleApprove = async () => {
  try {
    confirmLoading.value = true;
    // Your approve logic here
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    isApproveModalVisible.value = false;
  } finally {
    confirmLoading.value = false;
  }
};

// Handle reject
const handleReject = async () => {
  try {
    if (!rejectReason.value.trim()) {
      return;
    }
    confirmLoading.value = true;
    // Your reject logic here
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    isRejectModalVisible.value = false;
    rejectReason.value = "";
  } finally {
    confirmLoading.value = false;
  }
};

// Document details
const documentDetails = {
  requester: {
    name: "ທ່ານ ພົມມະກອນ ຄວາມຄູ",
    position: "ພະນັກງານພັດທະນາລະບົບ, ຝ່າຍໄອທີ",
    avatar: "/public/4.png",
  },
  requestDate: "30 ມີນາ 2025",
  purpose: "ຈັດຊື້ເພື່ອ ເພື່ອຍົກລະດັບ-ສ້າງໃຫ້ເປັນການແຂ່ງຂັນໃໝ່ 1 ຄັນ",
};

// Signatures
const signatures = computed(() => [
  {
    role: "ຜູ້ສະເໜີ",
    name: authStore.user?.getUsername() || "ຜູ້ສະເໜີ",
    position: authStore.user?.getDepartmentName() || "ພະນັກງານພັດທະນາລະບົບ",
    signature: userSignature.value,
  },
  {
    role: "ອະນຸມັດ",
    name: "ສຸກສະຫວັນ ພົນໂຍທາ",
    position: "ຫົວໜ້າພະແນກພັດທະນາລະບົບ",
    signature: "/public/3.png", // Keep this as default for approver
  },
]);
</script>

<template>
  <div class="mt-10">
    <!-- Header Component -->
    <header-component
      header-title="ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ"
      :breadcrumb-items="['ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ', 'ອານຸມັດ']"
      document-prefix="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ"
      document-number="0036/ພລ - ວັນທີ"
      :document-date="('2025-03-26')"
      :action-buttons="customButtons"
    />
    <UiModal
      title="ປະຕິເສດ"
      :visible="isApproveModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isApproveModalVisible = false"
      @ok="handleApprove"
    >
      <p>ທ່ານຕ້ອງການຢືນຢັນຄຳຂໍຈັດຊື້ ແທ້ ຫຼື ບໍ່?</p>
      <template #footer>
        <div class="flex">
          <UiButton @click="isApproveModalVisible = false" type="default" color-class="w-full"
            >ຍົກເລີກ</UiButton
          >
          <UiButton
            @click="handleReject"
            type="primary"
            :loading="confirmLoading"
            color-class="w-full"
            >ຢືນຢັນ</UiButton
          >
        </div>
      </template>
    </UiModal>

    <!-- Reject Modal -->
    <UiModal
      title="ປະຕິເສດ"
      :visible="isRejectModalVisible"
      :confirm-loading="confirmLoading"
      @update:visible="isRejectModalVisible = false"
      @ok="handleReject"
    >
      <div class="space-y-4">
        <p>ໃສ່ເຫດຜົນໃນການປະຕິເສດ</p>
        <div>
          <p class="mb-2 font-semibold">ເຫດຜົນ</p>
          <Textarea :modelValue="rejectReason" placeholder="ປ້ອນເຫດຜົນ" :rows="4" />
        </div>
      </div>
      <template #footer>
        <UiButton
          @click="handleReject"
          type="primary"
          :loading="confirmLoading"
          color-class="w-full"
          >ຢືນຢັນ</UiButton
        >
      </template>
    </UiModal>

    <!-- Main Content -->
    <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
      <!-- Requester Information -->
      <div class="flex items-start gap-4 mb-2">
        <img
          :src="documentDetails.requester.avatar"
          alt="Requester Avatar"
          class="w-14 h-14 rounded-full mb-2"
        />
        <div>
          <h3 class="text-lg font-semibold">{{ documentDetails.requester.name }}</h3>
          <p class="text-gray-600">{{ documentDetails.requester.position }}</p>
        </div>
      </div>
      <p class="text-gray-500">
        <span>ວັນທີ່ຕ້ອງການ: <br /></span> {{ documentDetails.requestDate }}
      </p>

      <!-- Purpose -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-2">ຈຸດປະສົງ ແລະ ອາຍເຫດ</h4>
        <p class="text-gray-600">{{ documentDetails.purpose }}</p>
      </div>

      <!-- Items Table -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-2">ລາຍການ</h4>
        <Table :columns="columns(t)" :dataSource="purchaseRequestData">
          <template #price="{ record }">
            <span class="text-gray-600">{{ record.unit }} {{ record.price.toLocaleString() }}</span>
          </template>
        </Table>
        <div>
          <p class="text-gray-500 mt-2 flex justify-end">
            {{ t("purchase_qequest.table.total") }}: <span class="font-semibold">25,936,000 ₭</span>
          </p>
        </div>
      </div>

      <!-- Attachments -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-2">ຮູບຕົວຢ່າງ</h4>
        <div class="border rounded-lg p-4">
          <img src="/public/1.png" alt="MacBook Air" class="max-w-md rounded-lg" />
        </div>
      </div>

      <!-- Signatures -->
      <div class="grid grid-cols-2 gap-6">
        <h4 class="text-base font-semibold mb-4 col-span-2">ລາຍເຊັ່ນ</h4>
        <div v-for="(sig, index) in signatures" :key="index" class="text-center">
          <p class="font-semibold mb-2">{{ sig.role }}</p>
          <img
            :src="sig.signature"
            :alt="`${sig.role} signature`"
            class="h-16 mx-auto mb-2"
            @error="handleSignatureError"
          />
          <p class="font-semibold">{{ sig.name }}</p>
          <p class="text-gray-600">{{ sig.position }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
