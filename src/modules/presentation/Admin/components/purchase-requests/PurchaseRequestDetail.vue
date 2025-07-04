// In your Vue component - updated script setup section

<script setup lang="ts">
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { computed, ref } from "vue";
import { columns } from "./column";
import { dataMenu } from "@/modules/shared/utils/data.department";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import type { ButtonType } from "@/modules/shared/buttonType";
import { useToggleStore } from "../../stores/storage.store";
import { storeToRefs } from "pinia";
import { printContent} from "./helpers/printer";

// Import the print helper

const { t } = useI18n();
const profileImage = ref("/public/Profile-PNG-File.png");
const userName = ref("ທ້າວສຸກີ້");
const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const department = ref("ພະແນກການເງິນ");
const imageList = ["/public/1.png", "/public/1.png"];

// Print handler using the helper
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

const customButtons = [
  {
    label: "print",
    icon: "ant-design:printer-outlined",
    class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
    type: "default" as ButtonType,
    onClick: handlePrint, // Using the helper function
  },
];

const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);
const topbarStyle = computed(() => {
  return toggle.value
    ? "left-64 w-[calc(100%-16rem)]"
    : "left-0 w-full";
});

const handleToggle = () => {
  toggle.value = !toggle.value;
  localStorage.setItem("toggle", toggle.value.toString());
};
</script>

<template>
  <div class="container mx-auto py-1 px-0">
    <div
    class="fixed px-6 py-4 top-0 z-20 bg-white shadow-sm transition-all duration-150 mt-[4rem]"
    :class="topbarStyle"
  >
    <header-component
      @toggle="handleToggle"
      header-title="ໃບສະເໜີ"
      :breadcrumb-items="['ໃບສະເໜີ', 'ລາຍລະອຽດ']"
      document-prefix="ໃບສະເໜີຈັດຊື້"
      document-number="ເລກທີ 0036/ພລ - ວັນທີ"
      :document-date="new Date('2025-03-26')"
      :action-buttons="customButtons"
      document-status="ລໍຖ້າຫົວໜ້າພະແນກພັດທະນາທຸລະກິດກວດສອບ"
      document-status-class="text-orange-400 text-sm font-medium ml-2 ring-2 ring-orange-300 px-3 py-1 rounded-full"
    />
  </div>
    <div class="body mt-[10rem]">
      <div class="user-info shadow-sm py-2">
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
        <div class="want-date -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">ວັນທີ່ຕ້ອງການ</h2>
          <p class="text-gray-600 text-sm">18 ກໍລະກົດ 2025</p>
        </div>

        <div class="purposes -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">ຈຸດປະສົງ</h2>
          <p class="text-gray-600 text-sm">
            ມີການຈັດຊື້ ເນື່ອງຈາກວ່າປະຈຸບັນນີ້ມີພະນັກງານເຂົ້າມາເພີ່ມໃໝ່ 5 ຄົນ
          </p>
        </div>
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
          <div class="total flex items-center md:justify-end justify-start md:px-6 px-1 pt-4 gap-4">
            <p class="font-medium text-slate-600">ຍອດລວມ:</p>
            <p class="font-semibold md:text-lg text-sm text-slate-700">
              {{ formatPrice(49000000) }} ₭
            </p>
          </div>
        </div>
        <!-- image and signature  -->
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

        <div class="signature shadow-sm py-4 px-6 rounded-md mb-[10rem]">
          <h2 class="text-md font-semibold">ລາຍເຊັນ</h2>
          <p class="text-slate-500 text-sm">ຜູ້ສະເໜີ</p>

          <a-image
            src="/public/2.png"
            alt="example"
            :width="180"
            :height="100"
            :preview="false"
          />
          <div class="info text-sm text-slate-600 -space-y-2 mt-4">
            <p>{{ userName }}</p>
            <p>{{ department }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
