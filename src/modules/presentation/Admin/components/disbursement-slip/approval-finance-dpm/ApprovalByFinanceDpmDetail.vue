<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import ApvLayout from "./ApvLayout.vue";
import { columns } from "./column";
import { dataMenu } from "@/modules/shared/utils/data.department";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { Icon } from "@iconify/vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PropovalDrawer from "./drawers/PropovalDrawer.vue";
import ApprovalDrawer from "./drawers/ApprovalDrawer.vue";
const openPropoval = ref(false);
const openAppropoval = ref(false);
const { t } = useI18n();
const profileImage = ref("/public/Profile-PNG-File.png");
const userName = ref("ທ້າວສຸກີ້");
const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const department = ref("ພະແນກການເງິນ");
const showPropoval = () => {
  openPropoval.value = true;
};
const showApproval = () => {
  openAppropoval.value = true;
};
</script>
<template>
  <ApvLayout></ApvLayout>
  <div class="mt-[10rem] mb-[5rem]">
    <div class="user-info">
      <h2 class="text-md font-semibold px-2 mb-4">
        {{ t("purchase-rq.field.proposer") }}
      </h2>
      <div class="info flex items-center px-2 gap-4 mb-4">
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
      <!-- Purpose Section -->
      <div class="purposes -space-y-0 px-2 mb-4">
        <h2 class="text-md font-semibold">
          {{ t("purchase-rq.field.purposes") }}
        </h2>
        <p class="text-gray-600 text-sm">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          Necessitatibus quibusdam ad, nihil velit ex totam temporibus? Magni
          deleniti quidem voluptatum, placeat veniam rem ab,
        </p>
      </div>
      <!-- restaurant info Section -->
      <div class="purposes space-y-2 px-2 mb-4">
        <h2 class="text-md font-semibold">
          {{ t("purchase-rq.field.purposes") }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-1 gap-2 text-sm">
          <div class="flex items-center gap-2">
            <label class="w-40 text-gray-700">ຊື່ບໍລິສັດ:</label>
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

      <div class="table -space-y-0 mb-2 w-full px-2 shadow-sm rounded-md">
        <h2 class="text-md font-semibold">
          {{ t("purchase-rq.field.title") }}
        </h2>
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
        <div
          class="total flex items-center md:justify-end justify-start md:px-2 px-1 pt-4 gap-4"
        >
          <p class="font-medium text-slate-600">
            {{ t("purchase-rq.field.amount") }}:
          </p>
          <p class="font-semibold md:text-lg text-sm text-slate-700">
            {{ formatPrice(49000000) }} ₭
          </p>
        </div>
        <div class="remark text-sm w-full">
          <div class="flex items-center gap-2 mb-4">
            <label class="w-20 font-medium">ໝາຍເຫດ:</label>
            <span class="text-gray-700 text-[12px]">-</span>
          </div>
        </div>
      </div>
      <!-- Signature Section -->
      <div
        class="signature flex items-center gap-[2rem] shadow-sm py-4 px-2 rounded-md"
      >
        <div class="signature1">
          <h2 class="text-md font-semibold">
            {{ t("purchase-rq.signature") }}
          </h2>
          <p class="text-slate-500 text-sm">
            {{ t("purchase-rq.proposer") }}
          </p>

          <a-image
            src="/public/2.png"
            alt="signature"
            :width="120"
            :height="80"
            :preview="false"
          />
          <div class="info text-sm text-slate-600 -space-y-2 mt-4">
            <p>{{ userName }}</p>
            <p>{{ department }}</p>
          </div>
        </div>
        <div class="signature1">
          <p class="text-slate-500 text-sm mt-10">
            {{ t("purchase-rq.approver") }}
          </p>
          <a-image
            src="/public/2.png"
            alt="signature"
            :width="120"
            :height="80"
            :preview="false"
          />
          <div class="info text-sm text-slate-600 -space-y-2 mt-4">
            <p>ສຸພາພອນ ພະໄຊຍະວົງ</p>
            <p>ຫົວໜ້າພະແນກທຸລະກິດ</p>
          </div>
        </div>
      </div>

      <div class="mt-4 shadow-sm p-4 px-2 bg-white rounded-md">
        <h2 class="text-md font-semibold mb-3">ເອກະສານທີ່ຕິດຂັດ</h2>
        <div class="flex flex-wrap gap-4">
          <div
            @click="showPropoval"
            class="text-sky-500 hover:text-sky-600 p-2 bg-slate-50 flex items-center gap-2 cursor-pointer rounded-full"
          >
            <Icon icon="material-symbols:docs-outline" />
            <span class="text-sm"
              >ໃບສະເໜີຂໍຈັດຊື້ - ເລກທີ 0049/ຈຊ/ຮລຕ/ນຄຫລ</span
            >
            <Icon icon="mdi:arrow-top-right" />
          </div>
          <div
          @click="showApproval"
            class="text-sky-500 hover:text-sky-600 p-2 bg-slate-50 flex items-center gap-2 cursor-pointer rounded-full"
          >
            <Icon icon="material-symbols:docs-outline" />
            <span class="text-sm"
              >ໃບອະນຸມັດຈັດຊື້ - ເລກທີ 0049/ຈຊ/ຮລຕ/ນຄຫລ</span
            >
            <Icon icon="mdi:arrow-top-right" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <UiDrawer
    v-model:open="openPropoval"
    title="ໃບສະເໜີຂໍຈັດຊື້ - ເລກທີ 0044/ຈຊນ.ນວ/ບຫ - ວັນທີ 26 ມີນາ 2025"
    placement="right"
    :width="1185"
  >
    <PropovalDrawer />
  </UiDrawer>
  <UiDrawer
    v-model:open="openAppropoval"
    title="ໃບອະນຸມັດຈັດຊື້ - ເລກທີ 0044/ຈຊນ.ນວ/ບຫ - ວັນທີ 26 ມີນາ 2025"
    placement="right"
    :width="1185"
  >
    <ApprovalDrawer />
  </UiDrawer>
</template>
<style scoped>
.user-info {
  background: white;
  border-radius: 0.5rem;
}
</style>
