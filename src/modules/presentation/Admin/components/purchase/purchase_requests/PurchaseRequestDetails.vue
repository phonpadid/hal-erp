<script setup lang="ts">
import type { ButtonType } from "@/modules/shared/buttonType";
import { computed, ref } from "vue";
import { columns } from "../../../views/purchase_requests/column";
import { useI18n } from "vue-i18n";
import { purchaseRequestData } from "@/modules/shared/utils/purchaseRequestDetails";
import { useToggleStore } from "../../../stores/storage.store";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table from "@/common/shared/components/table/Table.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { storeToRefs } from "pinia";
/********************************************************* */
const { t } = useI18n();
const isApproveModalVisible = ref(false);
const isRejectModalVisible = ref(false);
const rejectReason = ref("");
const confirmLoading = ref(false);
const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);

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

const topbarStyle = computed(() => {
  return toggle.value
    ? "left-64 w-[calc(100%-16rem)]" // 16rem = 256px = sidebar width
    : "left-0 w-full";
});
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
const signatures = [
  {
    role: "ຜູ້ສະເໜີ",
    name: "ພົມມະກອນ ຄວາມຄູ",
    position: "ພະນັກງານພັດທະນາລະບົບ",
    signature: "/public/2.png",
  },
  {
    role: "ອະນຸມັດ",
    name: "ສຸກສະຫວັນ ພົນໂຍທາ",
    position: "ຫົວໜ້າພະແນກພັດທະນາລະບົບ",
    signature: "/public/3.png",
  },
];
</script>

<template>
  <div class="mt-10">
    <!-- Header Component -->
    <div
      class="fixed px-6 py-4 top-0 z-40 h-auto bg-white shadow-sm transition-all duration-150 mt-[4rem]"
      :class="topbarStyle"
    >
      <header-component
        header-title="ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ"
        :breadcrumb-items="['ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ', 'ອານຸມັດ']"
        document-prefix="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ"
        document-number="0036/ພລ - ວັນທີ"
        :document-date="new Date('2025-03-26')"
        :action-buttons="customButtons"
      />
    </div>

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
    <div class="bg-white rounded-lg shadow-sm p-6 mt-40">
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
            {{ t("purchase_qequest.table.total") }}:
            <span class="font-semibold">25,936,000 ₭</span>
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
          <img :src="sig.signature" :alt="`${sig.role} signature`" class="h-16 mx-auto mb-2" />
          <p class="font-semibold">{{ sig.name }}</p>
          <p class="text-gray-600">{{ sig.position }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
