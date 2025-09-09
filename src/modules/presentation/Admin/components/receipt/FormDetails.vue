<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { ButtonType } from "@/modules/shared/buttonType";
import { onMounted, ref } from "vue";
import { columnsDetailsDirector } from "../../views/director/column/columnDetails";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import Table from "@/common/shared/components/table/Table.vue";

import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PurchaseOrderShowDrawer from "../purchase/purchase_orders/PurchaseOrderShowDrawer.vue";
import SelectDocumentTypeModal from "./modal/SelectDocumentTypeModal.vue";
import { usePurchaseOrderStore } from "../../stores/purchase_requests/purchase-order";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import { useNotification } from "@/modules/shared/utils/useNotification";
const purchaseOrderStore = usePurchaseOrderStore();
const orderDetails = ref<PurchaseOrderEntity | null>(null);
  const { error } = useNotification();
/********************************************************* */
const { t } = useI18n();
// const router = useRouter();
const { params } = useRoute();
const purchaseOrderId = params.id?.toString();
const isRejectModalVisible = ref(false);
const visible = ref(false);
const showDrawer = () => {
  visible.value = true;
};
const open = ref<boolean>(false);
const selectedData = ref<string | null>(null);
const onChooseDocumentType = () => {
  selectedData.value = purchaseOrderId
  open.value = true;
};
// Custom buttons for header
const customButtons = [
  {
    label: "print",
    icon: "ant-design:printer-outlined",
    class: "bg-white flex items-center gap-2 hover:bg-gray-100",
    type: "default" as ButtonType,
    onClick: () => {
      isRejectModalVisible.value = true;
    },
  },

  {
    label: "ສ້າງໃບເບີກຈ່າຍ",
    type: "primary" as ButtonType,
    onClick: () => {
      onChooseDocumentType();
    },
  },
];
// Document details
const documentDetails = {
  requester: {
    name: "ທ່ານ ພົມມະກອນ ຄວາມຄູ",
    position: "ພະນັກງານພັດທະນາລະບົບ, ຝ່າຍໄອທີ",
    avatar: "/public/4.png",
  },
  requestDate: "30 ມີນາ 2025",
  purpose:
    "ເພື່ອໃຫ້ແທດເໝາະ ໃຫ້ຮອງຮັບກັບການປະຕິບັດວຽກງານ ແລະ ເພື່ອອຳນວຍຄວາມສະດວກໃນການປະຕິບັດໜ້າທີ່ວຽກງານ",
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
    role: "ຜູ້ອະນຸມັດ",
    name: "ໜອມ ຄວາມຄູ",
    position: "ຫົວໜ້າພະແນກບໍລິຫານ",
    signature: "/public/2.png",
  },
  {
    role: "ງົບປະມານ",
    name: "ທິບນະກອນ ລິວັນໄຊ",
    position: "ພະນັກງານງົບປະມານ",
    signature: "/public/2.png",
  },
];
const fetchOrderDetails = async () => {
  try {
    const result = await purchaseOrderStore.fetchById(Number(purchaseOrderId));
    if (result) {
      orderDetails.value = result;

      // if (result.getItems && result.getItems()) {
      //   orderItems.value = result.getItems();
      // }
    } else {
      error("ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    }
  } catch (err: any) {
    error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ", err);
  }
};

onMounted(async () => {
  await fetchOrderDetails();
})
</script>

<template>
  <div class="mt-10">
    <!-- Header Component -->
    <div>
      <!-- Header component -->
      <header-component
        header-title="ອະນຸມັດຈັດຊື້"
        :breadcrumb-items="['ອະນຸມັດໃບສະເໜີ > ອະນຸມັດ']"
        document-prefix="ໃບອະນຸມັດຈັດຊື້ - ຈັດຈ້າງ"
        document-number="0036/ພລ - ວັນທີ"
        :document-date="'2025-03-26'"
        :action-buttons="customButtons"
        document-status="ລໍຖ້າໃບເບີກຈ່າຍ"
        document-status-class="text-orange-500 font-medium ml-2 bg-orange-50 px-3 py-1 rounded-full"
      />
      <!-- Main Content -->
      <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h2>ຂໍ້ມູນສ້າງໃບອານຸມັດຈັດຊື້ - ຈັດຈ້າງ</h2>
        <!-- Requester Information -->
        <div class="flex items-start gap-4 mb-2">
          <img
            :src="documentDetails.requester.avatar"
            alt="Requester Avatar"
            class="w-14 h-14 rounded-full mb-2"
          />
          <div>
            <h4>{{ documentDetails.requester.name }}</h4>
            <p class="text-gray-600">
              {{ documentDetails.requester.position }}
            </p>
          </div>
        </div>
        <!-- ຂໍ້ມຸນຜູ້ສະເໜີ -->
        <div>
          <h4>ສະເໜີ</h4>
          <div class="grid grid-cols-4">
            <div class="grid grid-rows-2">
              <h5>ຂໍ້ສະເໜີເບີກງົບປະມານ</h5>
              <span class="text-sm">ຈັດຊື້ຄອມພີວເຕີ</span>
            </div>
            <div class="grid grid-rows-2">
              <h5>ຈຳນວນ</h5>
              <span class="text-sm">1</span>
            </div>
            <div class="grid grid-rows-2">
              <h5>ພະແນກ</h5>
              <span class="text-sm">ພັດທະນາທຸລະກິດ</span>
            </div>
            <div class="grid grid-rows-2">
              <h5>ໜ່ວຍງານ</h5>
              <span class="text-sm">ພະນັກງານ</span>
            </div>
          </div>
        </div>

        <!-- Purpose -->
        <div class="mb-6">
          <h4 class="text-base font-semibold mb-2">ຈຸດປະສົງ ແລະ ລາຍການ</h4>
          <p class="text-gray-600">{{ documentDetails.purpose }}</p>
        </div>

        <!-- Items Table -->
         {{ orderDetails?.getPurchaseOrderItem() }}
        <div class="mb-6">
          <h4 class="text-base font-semibold mb-2">ລາຍການ</h4>
          <Table
            :columns="columnsDetailsDirector(t)"
            :dataSource="orderDetails?.getPurchaseOrderItem() ?? []"
          >
            <template #price="{ record }">
              <span class="text-gray-600"
                >{{ record.unit }} {{ record.price.toLocaleString() }}</span
              >
            </template>
            <template #total="{ record }">
              <span class="text-gray-600"
                >{{ record.unit }} {{ record.price.toLocaleString() }}</span
              >
            </template>
          </Table>
          <div>
            <p class="text-gray-500 mt-2 flex justify-end">
              {{ t("director.table.sum") }}:
              <span class="font-semibold">25,936,000 ₭</span>
            </p>
            <p class="text-gray-500 mt-2 flex justify-end">
              {{ t("director.table.kip") }}:
              <span class="font-semibold">25,936,000 ₭</span>
            </p>
          </div>
        </div>

        <!-- ວິເຄາະການຈັດຊື້ -->
        <div>
          <h4>ວິເຄາະການຈັດຊື້</h4>
          <div class="text-gray-600 gap-4 grid grid-cols-6">
            <span>ຮ້ານທີເລືອກ</span>
            <span>ຄອມຄອມ COMCOM</span>
          </div>
          <div class="mt-4 space-y-2">
            <span class="font-medium">ເຫດຜົນທີເລືອກ:</span>
            <div class="ml-4 flex flex-col space-y-2 text-gray-600">
              <div class="flex items-start gap-2">
                <span class="text-sm">•</span>
                <span class="text-sm"
                  >ທາງຮ້ານແມ່ນໄດ້ສະເໜີລາຄາທີ່ຖືກທີ່ສຸດໃນສິນຄ້າຍີ່ຫໍ້ດຽວກັນ</span
                >
              </div>
              <div class="flex items-start gap-2">
                <span class="text-sm">•</span>
                <span class="text-sm"
                  >ທາງຮ້ານແມ່ນໄດ້ສະເໜີລາຄາທີ່ຖືກທີ່ສຸດໃນສິນຄ້າຍີ່ຫໍ້ດຽວກັນ</span
                >
              </div>
              <div class="flex items-start gap-2">
                <span class="text-sm">•</span>
                <span class="text-sm"
                  >ທາງຮ້ານແມ່ນໄດ້ສະເໜີລາຄາທີ່ຖືກທີ່ສຸດໃນສິນຄ້າຍີ່ຫໍ້ດຽວກັນ</span
                >
              </div>
              <div class="flex items-start gap-2">
                <span class="text-sm">•</span>
                <span class="text-sm"
                  >ທາງຮ້ານແມ່ນໄດ້ສະເໜີລາຄາທີ່ຖືກທີ່ສຸດໃນສິນຄ້າຍີ່ຫໍ້ດຽວກັນ</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <div class="mb-6">
          <h4 class="text-base font-semibold mb-2">ໃບສະເໜີລາຄາ</h4>
          <div class="border rounded-lg p-4">
            <img
              src="/public/5.png"
              alt="MacBook Air"
              class="max-w-md rounded-lg"
            />
          </div>
        </div>
        <!-- ຂໍ້ມູນບັນຊີທະນາຄານ -->
        <div class="mb-6">
          <h4 class="text-base font-semibold mb-4">ຂໍ້ມູນບັນຊີຮ້ານ</h4>
          <div class="grid grid-cols-2 mb-2">
            <span class="font-medium">ທະນາຄານ:</span>
            <span class="text-gray-600 flex items-center gap-2">
              <img src="/public/bclone.png" class="w-8 h-8" alt="" />
              <span>BCEL One ທະນາຄານການຄ້າຕ່າງປະເທດລາວ</span>
            </span>
          </div>
          <div class="grid grid-cols-2 mb-2">
            <span class="font-medium">ຊືບັນຊີ:</span>
            <span class="text-gray-600">KHAMTHANOM MALAYSIN MR</span>
          </div>
          <div class="grid grid-cols-2">
            <span class="font-medium">ເລກບັນຊີ LAK:</span>
            <span class="text-gray-600">0302000410086756</span>
          </div>
        </div>
        <!-- Signatures -->
        <h4 class="text-base font-semibold mb-4 col-span-2">ລາຍເຊັ່ນ</h4>
        <div class="grid grid-cols-3 gap-2">
          <div v-for="(sig, index) in signatures" :key="index">
            <p class="font-semibold mb-2">{{ sig.role }}</p>
            <img
              :src="sig.signature"
              :alt="`${sig.role} signature`"
              class="h-16 mb-2"
            />
            <p class="font-semibold">{{ sig.name }}</p>
            <p class="text-gray-600">{{ sig.position }}</p>
          </div>
        </div>
        <div class="text-gray-600">
          <h4>ລະຫັດງົບປະມານ</h4>
          <span class="text-sm"
            >ພະແນກທຸລະກິດ / 1006 - ຄ່າຊື້ເຄື່ອງອີເລັກໂຕນິກ</span
          >
        </div>
        <div class="mt-4">
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
  </div>

  <UiDrawer
    v-model:open="visible"
    title="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ - ເລກທີ 0044/ຈຊນ.ນວ/ບຫ - ວັນທີ 26 ມີນາ 2025"
    placement="right"
    :width="1050"
  >
    <PurchaseOrderShowDrawer />
  </UiDrawer>
  <SelectDocumentTypeModal
      v-model:visible="open"
      :isEdit="true"
      :itemid="String(selectedData)"
    />
</template>

<style scoped></style>
