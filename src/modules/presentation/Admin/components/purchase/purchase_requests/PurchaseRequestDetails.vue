<script setup lang="ts">
import type { ButtonType } from "@/modules/shared/buttonType";
import { computed, onMounted, ref } from "vue";
import { columns } from "../../../views/purchase_requests/column";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { usePurchaseRequestsStore } from "../../../stores/purchase_requests/purchase-requests.store";
import { useToggleStore } from "../../../stores/storage.store";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import { useRoute } from "vue-router";
import { formatDate } from "@/modules/shared/formatdate";
import { formatPrice } from "@/modules/shared/utils/format-price";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import Table from "@/common/shared/components/table/Table.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
/********************************************************* */

const { t } = useI18n();
const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);
const isApproveModalVisible = ref(false);
const isRejectModalVisible = ref(false);
const rejectReason = ref("");
const confirmLoading = ref(false);
const loading = ref(true);
const route = useRoute();
const purchaseRequestStore = usePurchaseRequestsStore();
const requestDetail = ref<PurchaseRequestEntity | null>(null);
const requesterInfo = computed(() => requestDetail.value?.getRequester());
const departmentInfo = computed(() => requestDetail.value?.getDepartment());
const positionInfo = computed(() => requestDetail.value?.getPosition());
const items = computed(() => requestDetail.value?.getItems() ?? []);
const totalAmount = computed(() => requestDetail.value?.getTotal() ?? 0);
const imageList = computed(() => {
  return items.value.map((item) => item.file_name_url).filter((url): url is string => !!url);
});

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
  return toggle.value ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
});
// Handle approve
const handleApprove = async () => {
  try {
    confirmLoading.value = true;

    await new Promise((resolve) => setTimeout(resolve, 1000));
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
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

onMounted(async () => {
  const requestId = route.params.id as string;
  if (requestId) {
    loading.value = true;
    requestDetail.value = await purchaseRequestStore.fetchById(requestId);
    loading.value = false;
  }
});
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
    <div v-if="loading" class="mt-[10rem] text-center">Loading...</div>
    <div v-else-if="requestDetail" class="bg-white rounded-lg shadow-sm p-6 mt-40">
      <!-- Requester Information -->
      <div class="flex items-start gap-4 mb-2">
        <img
          :src="documentDetails.requester.avatar"
          alt="Requester Avatar"
          class="w-14 h-14 rounded-full mb-2"
        />
        <div>
          <h3 class="text-lg font-semibold">{{ requesterInfo?.username }}</h3>
          <p class="text-gray-600">{{ positionInfo?.name }} - {{ departmentInfo?.name }}</p>
        </div>
      </div>
      <p class="text-gray-500">
        <span>{{ t("purchase-rq.field.date_rq") }}<br /></span>
        {{ formatDate(requestDetail.getExpiredDate()) }}
      </p>

      <!-- Purpose -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-2">{{ t("purchase-rq.proposer_list") }}</h4>
        <p class="text-gray-600">{{ requestDetail.getPurposes() }}</p>
      </div>

      <!-- Items Table -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-2">ລາຍການ</h4>
        <Table :columns="columns(t)" :dataSource="items" row-key="id">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'id'">
              <span>{{ index + 1 }}</span>
            </template>
            <template v-if="column.key === 'total_price'">
              <span>₭ {{ formatPrice(record.getTotalPrice()) }}</span>
            </template>
          </template>
        </Table>
        <div>
          <p class="text-gray-500 mt-2 flex justify-end">
            {{ t("purchase_qequest.table.total") }}:
            <span class="font-semibold">{{ formatPrice(totalAmount) }}₭</span>
          </p>
        </div>
      </div>

      <!-- Attachments -->
      <div class="image space-y-4 py-4 shadow-sm px-6 rounded-md">
        <h2 class="text-md font-semibold">{{ t("purchase-rq.field.img_example") }}</h2>
        <div class="flex flex-wrap gap-6">
          <a-image
            v-for="(imgUrl, index) in imageList"
            :key="index"
            :src="imgUrl"
            alt="example"
            :width="280"
            :height="150"
            :preview="true"
            class="rounded-xl shadow-sm"
          />
        </div>
      </div>

      <!-- Signatures -->
      <div class="signature shadow-sm py-4 px-6 rounded-md mb-[10rem]">
        <h2 class="text-md font-semibold">{{ t("purchase-rq.signature") }}</h2>
        <div class="grid grid-cols-2 gap-6">
          <!-- Proposer Signature -->
          <div>
            <p class="text-slate-500 text-sm">{{ t("purchase-rq.proposer") }}</p>
            <a-image
              :src="(requesterInfo as any)?.user_signature?.signature_url ?? '/public/2.png'"
              alt="signature"
              :width="180"
              :height="100"
              :preview="false"
            />
            <div class="info text-sm text-slate-600 -space-y-2 mt-4">
              <p>{{ requesterInfo?.username }}</p>
              <p>{{ departmentInfo?.name }}</p>
            </div>
          </div>
          <div>
            <p class="text-slate-500 text-sm">{{ t("purchase-rq.approver") }}</p>
            <a-image
              :src="(requesterInfo as any)?.user_signature?.signature_url ?? '/public/2.png'"
              alt="signature"
              :width="180"
              :height="100"
              :preview="false"
            />
            <div class="info text-sm text-slate-600 -space-y-2 mt-4">
              <p>{{ requesterInfo?.username }}</p>
              <p>{{ departmentInfo?.name }}</p>
            </div>
          </div>

          <!-- Approver Signature -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
