// In your Vue component - updated script setup section

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { ref } from "vue";
import { columnsTitle, columnTitle, data, dataItem } from "./column";

// Import the print helper

const { t } = useI18n();
const profileImage = ref("/public/Profile-PNG-File.png");
const userName = ref("ທ້າວສຸກີ້");
const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const department = ref("ພະແນກການເງິນ");

</script>

<template>
  <div class="container mx-auto py-0 px-0 -mt-2">
    <div class="user-info shadow-sm py-2">
        <h2 class="text-md font-semibold px-6 mb-4">ຂໍ້ມູນສ້າງໃບອະນຸມັດຈັດຊື້</h2>
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
        <div class="title md:w-[40rem] -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">ສະເໜີ</h2>
          <a-table
          :columns="columnsTitle(t)"
          :dataSource="data"
          :pagination="false"
          ></a-table>
        </div>

        <div class="purposes -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.purposes") }}</h2>
          <p class="text-gray-600 text-sm pl-4">
            ມີການຈັດຊື້ ເນື່ອງຈາກວ່າປະຈຸບັນນີ້ມີພະນັກງານເຂົ້າມາເພີ່ມໃໝ່ 5 ຄົນ
          </p>
        </div>
        <div class="table -space-y-0 mb-2 w-full px-6 shadow-sm rounded-md">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.title") }}</h2>
          <a-table
            :columns="columnTitle(t)"
            :dataSource="dataItem"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'price_per_unit'">
                <span>₭ {{ formatPrice(record.price_per_unit) }}</span>
              </template>
              <template v-if="column.key === 'amount'">
                <span>₭ {{ formatPrice(record.amount) }}</span>
              </template>
            </template>
          </a-table>
          <div class="total flex items-center md:justify-end justify-start md:px-6 px-1 pt-4 gap-4">
            <p class="font-medium text-slate-600">ມູນຄ່າລວມທັງໝົດ:</p>
            <p class="font-semibold md:text-lg text-sm text-slate-700">
              {{ formatPrice(5000000) }} ₭
            </p>
          </div>
          <div class="total flex items-center md:justify-end justify-start md:px-6 px-1 gap-4">
            <p class="font-medium text-slate-600 -mt-3 ">ມູນຄ່າລວມທັງໝົດກີບ:</p>
            <p class="font-semibold md:text-lg text-sm -mt-3 text-slate-700">
              {{ formatPrice(5000000) }} ₭
            </p>
          </div>
        </div>
        <!-- image and signature  -->
        <div class="image space-y-4 py-4 shadow-sm px-6 rounded-md">
          <h2 class="text-md font-semibold">ວິເຄາະການຈັດຊື້</h2>
          <div class="grid grid-cols-1 md:grid-cols-1 gap-2 text-sm">
          <div class="flex items-center gap-2">
            <label class="w-40 text-gray-700">ຮ້ານທີ່ເລືອກ:</label>
            <span class="text-gray-700">ຮ້ານ ຄອມຄອມ (COMCOM)</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="w-40 text-gray-700">ທະນາຄານ:</label>
            <span class="text-gray-700"
              >Bcel One ທະນາຄານການຄ້າຕ່າງປະເທດລາວ</span
            >
          </div>
          <div class="flex items-center gap-2">
            <label class="w-40 text-gray-700">ຊື່ບັນຊີ:</label>
            <span class="text-gray-700">KISIMSOUPHA MR</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="w-40 text-gray-700">ເລກບັນຊີ (LAK):</label>
            <span class="text-gray-700">11100 11100 2111</span>
          </div>
        </div>
        </div>

        <div class="signature py-4 px-6 rounded-md mb-[2rem]">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.signature") }}</h2>
          <p class="text-slate-500 text-sm">{{t("purchase-rq.proposer")}}</p>

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
</template>
<style scoped>
::v-deep(.title .ant-table-thead > tr > th) {
  background-color: white; /* bg-blue-400 */
  color: #1f2937;            /* text-gray-800 */
  box-shadow: none !important;
  border: none;
  padding-bottom: 1px !important;
}

::v-deep(.title .ant-table) {
  border: none !important;
}

::v-deep(.title .ant-table table) {
  border: none !important;
}

::v-deep(.title .ant-table td),
::v-deep(.title .ant-table th) {
  border: none !important;
}
::v-deep(.ant-table-tbody > tr > td) {
 padding-bottom: 1px;
}

</style>
