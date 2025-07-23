<script setup lang="ts">
import { ref } from "vue";
import type { ButtonType } from "@/modules/shared/buttonType";
// import { useI18n } from "vue-i18n";

// Components
import Table from "@/common/shared/components/table/Table.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PurchaseOrderShowDrawer from "../purchase/purchase_orders/PurchaseOrderShowDrawer.vue";

/********************************************************* */
// const { t } = useI18n();

// State for Drawer
const visible = ref(false);
const showDrawer = () => {
  visible.value = true;
};

// Header button for the display page
const customButtons = [
  {
    label: "Print",
    icon: "ant-design:printer-outlined",
    class: "bg-white flex items-center gap-2 hover:bg-gray-100",
    type: "default" as ButtonType,
    onClick: () => {
      window.print();
    },
  },
];

// All data for the display page, structured for clarity
const documentData = {
  header: {
    number: "0044/ຈຊນ.ນວ/ບຫ",
    date: "26 ມີນາ 2025",
    status: "ອະນຸມັດແລ້ວແລະຜ່ານການເງິນກວດສອບ",
    statusClass: "text-yellow-800 bg-yellow-100 font-medium ml-2 px-3 py-1 rounded-full",
  },
  requester: {
    name: "ທ້າວ ປະທານສິນ ອິນທະສອນ",
    position: "ພະນັກງານການຕະຫຼາດ, ພະນັກງານ",
    avatar: "/public/4.png",
  },
  purpose:
    "ເພື່ອໃຫ້ໄດ້ອຸປະກອນທີ່ທັນສະໄໝແລະມີປະສິດທິພາບພຽງພໍໃນການໃຊ້ງານ ແລະ ເພື່ອອຳນວຍຄວາມສະດວກໃນການປະຕິບັດໜ້າທີ່ວຽກງານ",
  shopInfo: {
    name: "ຮ້ານ ຄອມຄອມ COMCOM",
    bankName: "BCEL One ທະນາຄານການຄ້າຕ່າງປະເທດລາວ",
    accountName: "KHAMTHANOM MALAYSIN MR",
    accountNumber: "0302000410086756",
    bankIcon: "/public/bclone.png",
  },
  items: [
    {
      key: "1",
      id: 1,
      description: "ຄອມພິວເຕີ MacBook Air M3 (16GB/512GB)",
      budgetCode: "1001 - ຄ່າຈັດຊື້ຄອມພິວເຕີ",
      total: 25936000,
    },
  ],
  grandTotal: 25939000,
  remark: "-", // Display dash if no remark
  signature: {
    signerName: "ທິບພະພອນ ສຸລະລາດ",
    signerPosition: "ພະນັກງານບັນຊີ",
    signatureImage: "/public/2.png", // Path to signature image
  },
};

// Table columns definition
const columns = [
  {
    title: "ລຳດັບ",
    dataIndex: "id",
    key: "id",
    width: 80,
    align: "center",
  },
  {
    title: "ເນື້ອໃນລາຍການ",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "ລະຫັດງົບປະມານ",
    dataIndex: "budgetCode",
    key: "budgetCode",
  },
  {
    title: "ຈຳນວນເງິນ",
    dataIndex: "total",
    key: "total",
    align: "right",
  },
];
</script>

<template>
  <div class="p-4">
    <header-component
      header-title="ໃບເບີກຈ່າຍ"
      :document-prefix="`ເລກທີ ${documentData.header.number} - ວັນທີ`"
      :document-number="documentData.header.date"
      :document-status="documentData.header.status"
      :document-status-class="documentData.header.statusClass"
      :show-breadcrumb="false"
      :show-document-date="false"
      :action-buttons="customButtons"
    />

    <div id="printable-content" class="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ຈາກຝ່າຍງານ</h3>
        <div class="flex items-center gap-3">
          <a-avatar size="large" :src="documentData.requester.avatar" />
          <div>
            <p class="font-medium">{{ documentData.requester.name }}</p>
            <p class="text-gray-500 text-sm">
              {{ documentData.requester.position }}
            </p>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ຈຸດປະສົງ</h3>
        <p class="text-gray-700 bg-gray-50 p-3 rounded-md">
          {{ documentData.purpose }}
        </p>
      </div>

      <div class="mb-6 border rounded-lg p-4">
        <h3 class="text-base font-semibold mb-4">ຂໍ້ມູນຮ້ານຄ້າ</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="flex">
            <span class="font-medium w-28">ຊື່ຮ້ານຄ້າ</span>
            <span class="text-gray-700">{{ documentData.shopInfo.name }}</span>
          </div>
          <div class="flex">
            <span class="font-medium w-28">ທະນາຄານ</span>
            <span class="text-gray-700 flex items-center gap-2">
              <img :src="documentData.shopInfo.bankIcon" class="w-6 h-6" alt="Bank Icon" />
              {{ documentData.shopInfo.bankName }}
            </span>
          </div>
          <div class="flex">
            <span class="font-medium w-28">ຊື່ບັນຊີ</span>
            <span class="text-gray-700">{{ documentData.shopInfo.accountName }}</span>
          </div>
          <div class="flex">
            <span class="font-medium w-28">ເລກບັນຊີ LAK</span>
            <span class="text-gray-700">{{ documentData.shopInfo.accountNumber }}</span>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ລາຍການ</h3>
        <Table :columns="columns" :dataSource="documentData.items">
          <template #total="{ record }">
            <span class="font-medium"> ₭ {{ record.total.toLocaleString() }} </span>
          </template>
        </Table>
        <div class="flex justify-end mt-4">
          <div class="w-1/3">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-700">ມູນຄ່າລວມທັງໝົດ:</span>
              <span class="font-bold text-lg text-red-600">
                {{ documentData.grandTotal.toLocaleString() }} ₭
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ໝາຍເຫດ ( Remark )</h3>
        <p class="text-gray-700">{{ documentData.remark }}</p>
      </div>

      <div class="mb-6 pt-4 border-t">
        <h3 class="text-base font-semibold mb-4">ລາຍເຊັນ</h3>
        <div class="flex flex-col items-start">
          <img :src="documentData.signature.signatureImage" alt="Signature" class="h-16 mb-2" />
          <p class="font-semibold">
            {{ documentData.signature.signerName }}
          </p>
          <p class="text-gray-600 text-sm">
            {{ documentData.signature.signerPosition }}
          </p>
        </div>
      </div>

      <div>
        <span>ເອກະສານທີຕິດຂັດ</span>
        <div class="flex items-center gap-2 mt-2">
          <HeaderComponent
            header-title="ໃບສະເໜີຂໍ້ຈັດຊື້ - ເລກທີ 0036/ຈຊ/ຮລຕ/ນຄຫຼ"
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
          <HeaderComponent
            header-title="ໃບອະນຸມັດຈັດຊື້ - ເລກທີ 0036/ຈຊ/ຮລຕ/ນຄຫຼ"
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

  <UiDrawer v-model:open="visible" title="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ" placement="right" :width="1050">
    <PurchaseOrderShowDrawer />
  </UiDrawer>
</template>

<style>
@media print {
  /* ซ่อนทุกอย่างใน body ก่อน */
  body * {
    visibility: hidden;
  }

  /* ยกเว้นส่วนที่ต้องการพิมพ์ ให้แสดงผล */
  #printable-content,
  #printable-content * {
    visibility: visible;
  }

  /* จัดตำแหน่งเนื้อหาที่พิมพ์ให้อยู่มุมซ้ายบนและเต็มหน้า */
  #printable-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 15px;
    box-shadow: none;
    border: none;
  }

  /* อาจจะต้องซ่อน Drawer เพิ่มเติม เพื่อความแน่นอน */
  .ant-drawer-mask,
  .ant-drawer-content-wrapper {
    display: none !important;
  }
}
</style>
