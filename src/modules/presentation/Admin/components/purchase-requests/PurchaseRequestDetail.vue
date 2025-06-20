<script setup lang="ts">
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { ref } from "vue";
import { columns } from "./column";
import { dataMenu } from "@/modules/shared/utils/data.department";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
const { t } = useI18n();
const profileImage = ref("/public/Profile-PNG-File.png");
const userName = ref("ທ້າວສຸກີ້");
const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const department = ref("ພະແນກການເງິນ");
const imageList = ["/public/1.png", "/public/1.png"];
</script>

<template>
  <div class="container mx-auto py-1 px-0">
    <header-component
      class="fixed z-20 py-6 px-6 shadow-sm bg-white rounded-sm"
      header-title="ໃບສະເໜີ"
      :breadcrumb-items="['ໃບສະເໜີ', 'ລາຍລະອຽດ']"
      document-prefix="ໃບສະເໜີຈັດຊື້"
      document-number="ເລກທີ 0036/ພລ - ວັນທີ"
      :document-date="new Date('2025-03-26')"
    />
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
