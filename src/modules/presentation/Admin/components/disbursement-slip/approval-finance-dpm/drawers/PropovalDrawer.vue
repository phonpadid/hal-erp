// In your Vue component - updated script setup section

<script setup lang="ts">
import { dataMenu } from "@/modules/shared/utils/data.department";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { columns } from "../../../purchase-requests/column";
import { ref } from "vue";

// Import the print helper

const { t } = useI18n();
const profileImage = ref("/public/Profile-PNG-File.png");
const userName = ref("ທ້າວສຸກີ້");
const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const department = ref("ພະແນກການເງິນ");
const imageList = ["/public/1.png", "/public/1.png"];

</script>

<template>
  <div class="container mx-auto py-0 px-0 -mt-2">
    <div class="user-info shadow-sm py-2">
        <h2 class="text-md font-semibold px-6 mb-4">{{ t("purchase-rq.field.proposer") }}</h2>
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
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.date_rq") }}</h2>
          <p class="text-gray-600 text-sm">18 ກໍລະກົດ 2025</p>
        </div>

        <div class="purposes -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.purposes") }}</h2>
          <p class="text-gray-600 text-sm">
            ມີການຈັດຊື້ ເນື່ອງຈາກວ່າປະຈຸບັນນີ້ມີພະນັກງານເຂົ້າມາເພີ່ມໃໝ່ 5 ຄົນ
          </p>
        </div>
        <div class="table -space-y-0 mb-2 w-full px-6 shadow-sm rounded-md">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.title") }}</h2>
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
            <p class="font-medium text-slate-600">{{ t("purchase-rq.field.amount") }}:</p>
            <p class="font-semibold md:text-lg text-sm text-slate-700">
              {{ formatPrice(49000000) }} ₭
            </p>
          </div>
        </div>
        <!-- image and signature  -->
        <div class="image space-y-4 py-4 shadow-sm px-6 rounded-md">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.img_example") }}</h2>
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
