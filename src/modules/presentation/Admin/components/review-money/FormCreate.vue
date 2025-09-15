<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { ButtonType } from "@/modules/shared/buttonType";
// import { useI18n } from "vue-i18n";
const selectType = ref<string>(''); // Single selection - empty string initially
// Components
import Table from "@/common/shared/components/table/Table.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PurchaseOrderShowDrawer from "../purchase/purchase_orders/PurchaseOrderShowDrawer.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import Radio from "@/common/shared/components/Input/Radio.vue";

/********************************************************* */
// const { t } = useI18n();
const router = useRouter();

// State for Drawer
const visible = ref(false);
const showDrawer = () => {
  visible.value = true;
};

// --- Reactive State for Form Inputs ---
const purpose = ref(
  "ເພື່ອໃຫ້ແທດເໝາະ ໃຫ້ຮອງຮັບກັບການປະຕິບັດວຽກງານ ແລະ ເພື່ອອຳນວຍຄວາມສະດວກໃນການປະຕິບັດໜ້າທີ່ວຽກງານ"
);
const remark = ref("");

// Header buttons based on the image
const customButtons = [
  {
    label: "ສ້າງໃບເບີກຈ່າຍ ແລະ ເຊັນອະນຸມັດ",
    type: "primary" as ButtonType,
    danger: true, // Making the button red as in the image
    onClick: () => {
      // Logic to create and sign
      // console.log("Purpose:", purpose.value);
      // console.log("Remark:", remark.value);
      // console.log("Selected payment types:", selectType.value);
      router.push({ name: "review-money-success" });
    },
  },
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

// Static data from the image
const requesterInfo = {
  name: "ນາງ ປະກາຍແສງ ດາລາວົງ",
  position: "ພະແນກບໍລິຫານ, ພະນັກງານ",
};

const shopInfo = {
  name: "ຮ້ານ ຄອມຄອມ COMCOM",
  bankName: "BCEL One ທະນາຄານການຄ້າຕ່າງປະເທດລາວ",
  accountName: "KHAMTHANOM MALAYSIN MR",
  accountNumber: "0302000410086756",
  bankIcon: "/public/bclone.png", // Assuming this path is correct
};

// Table data and columns based on the image
const items = ref([
  {
    key: "1",
    id: 1,
    description: "ຄອມພິວເຕີ MacBook Air M3 (16GB/512GB)",
    budgetCode: "1001 - ຄ່າຈັດຊື້ຄອມພິວເຕີ",
    total: 22980000,
  },
]);

const grandTotal = ref(25939000); // Grand total from image
const typeOption = [
  { label: "ເງິນສົດ (Cash)", value: "cash" },
  { label: "ໂອນເງິນ (Transfer)", value: "transfer" },
  { label: "ເຊັກ (Cheque)", value: "cheque" },
];
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
    title: "ລາຄາລວມ",
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
      :breadcrumb-items="['ອະນຸມັດໃບສະເໜີ', 'ສ້າງໃບເບີກຈ່າຍ']"
      :show-document-date="false"
      :show-document-number="false"
      document-prefix="ສ້າງໃບເບີກຈ່າຍ"
      :action-buttons="customButtons"
    />

    <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ຈາກໜ່ວຍງານ</h3>
        <div class="flex items-center gap-3">
          <a-avatar size="large" :src="'/public/4.png'" />
          <div>
            <p class="font-medium">{{ requesterInfo.name }}</p>
            <p class="text-gray-500 text-sm">{{ requesterInfo.position }}</p>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ຈຸດປະສົງ</h3>
        <UiInput
          v-model="purpose"
          placeholder="ເພື່ອໃຫ້ໄດ້ອຸປະກອນທີ່ທັນສະໄໝ ແລະ ມີປະສິດທິພາບ..."
          className="bg-gray-50"
        />
      </div>

      <div class="mb-6 border rounded-lg p-4">
        <h3 class="text-base font-semibold mb-4">ຂໍ້ມູນຮ້ານຄ້າ</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="flex">
            <span class="font-medium w-28">ຊື່ຮ້ານຄ້າ</span>
            <span class="text-gray-700">{{ shopInfo.name }}</span>
          </div>
          <div class="flex">
            <span class="font-medium w-28">ທະນາຄານ</span>
            <span class="text-gray-700 flex items-center gap-2">
              <img :src="shopInfo.bankIcon" class="w-6 h-6" alt="Bank Icon" />
              {{ shopInfo.bankName }}
            </span>
          </div>
          <div class="flex">
            <span class="font-medium w-28">ຊື່ບັນຊີ</span>
            <span class="text-gray-700">{{ shopInfo.accountName }}</span>
          </div>
          <div class="flex">
            <span class="font-medium w-28">ເລກບັນຊີ LAK</span>
            <span class="text-gray-700">{{ shopInfo.accountNumber }}</span>
          </div>
        </div>
      </div>

      <!-- FIXED CHECKBOX SECTION - SINGLE SELECTION -->
      <div class="select-type mb-6">
        <h3 class="text-base font-semibold mb-4">ປະເພດການຈ່າຍເງິນ</h3>
        <div class="space-y-2">
          <Radio
            v-model="selectType"
            :options="typeOption"
          />
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ລາຍການ</h3>
        <Table :columns="columns" :dataSource="items">
          <template #total="{ record }">
            <span class="font-medium"> {{ record.total.toLocaleString() }} ₭ </span>
          </template>
        </Table>
        <div class="flex justify-end mt-4">
          <div class="w-1/3">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-700">ມູນຄ່າລວມທັງໝົດ:</span>
              <span class="font-bold text-lg text-red-600">
                {{ grandTotal.toLocaleString() }} ₭
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ໝາຍເຫດ</h3>
        <UiInput
          v-model="remark"
          placeholder="ລະບຸຂໍ້ມູນເພີ່ມເຕີມ (ຖ້າມີ)"
          className="bg-gray-50"
        />
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

  <UiDrawer
    v-model:open="visible"
    title="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ - ເລກທີ 0044/ຈຊນ.ນວ/ບຫ - ວັນທີ 26 ມີນາ 2025"
    placement="right"
    :width="1050"
  >
    <PurchaseOrderShowDrawer />
  </UiDrawer>
</template>

<style scoped>
.select-type .space-y-2 > * + * {
  margin-top: 0.5rem;
}
</style>
