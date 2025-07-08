<script setup lang="ts">
import { ref, computed } from "vue";
import { columns } from "./column";
import { dataMenu } from "@/modules/shared/utils/data.department";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import type { Step1Data, Step2Data } from "./formstate";

const { t } = useI18n();

// Default/fallback values
const profileImage = ref("/public/Profile-PNG-File.png");
const userName = ref("ທ້າວສຸກີ້");
const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
const department = ref("ພະແນກການເງິນ");
const imageList = ["/public/1.png", "/public/1.png"];

interface Props {
  stepsData: {
    step1Data: Step1Data | null;
    step2Data: Step2Data | null;
  };
}

const props = defineProps<Props>();

// Get the actual data from steps
const step1Data = props.stepsData.step1Data;
const step2Data = props.stepsData.step2Data;

// Computed properties to use step data or fallback to defaults
const displayData = computed(() => {
  return {
    // Use step1Data if available, otherwise use defaults
    docType: step1Data?.document_type_id || 'ປະເພດເອກະສານ',

    // Use step2Data if available, otherwise use defaults
    requestDate: step2Data?.requested_date || '18 ກໍລະກົດ 2025',
    expiredDate: step2Data?.expired_date || '25 ກໍລະກົດ 2025',
    purpose: step2Data?.purpose || 'ມີການຈັດຊື້ ເນື່ອງຈາກວ່າປະຈຸບັນນີ້ມີພະນັກງານເຂົ້າມາເພີ່ມໃໝ່ 5 ຄົນ',
    items: step2Data?.addMore || dataMenu,
    images: imageList, // You might want to get this from addMore[].fileName
    signature: '/public/2.png',

    // User info (you might want to get this from a user store/context)
    userName: userName.value,
    userPosition: userPosition.value,
    department: department.value,
    profileImage: profileImage.value
  };
});

// Computed total from addMore items
const calculatedTotal = computed(() => {
  if (step2Data?.addMore && Array.isArray(step2Data.addMore)) {
    return step2Data.addMore.reduce((total, item) => total + (item.totalPrice || 0), 0);
  }
  return 49000000; // fallback total
});

// Get all images from addMore items
const allImages = computed(() => {
  if (step2Data?.addMore && Array.isArray(step2Data.addMore)) {
    const images: string[] = [];
    step2Data.addMore.forEach(item => {
      if (item.images && Array.isArray(item.images)) {
        images.push(...item.images);
      }
    });
    return images.length > 0 ? images : imageList;
  }
  return imageList;
});
</script>

<template>
  <div class="container mx-auto py-1 px-0">
    <div class="body">
      <div class="user-info shadow-sm py-2">
        <h2 class="text-md font-semibold px-6 mb-4">{{ t("purchase-rq.field.proposer") }}</h2>
        <div class="info flex items-center px-6 gap-4 mb-4">
          <a-image
            :src="displayData.profileImage"
            alt="avatar"
            class="w-20 h-20 rounded-full object-cover"
            :width="80"
            :height="80"
            :preview="false"
          />
          <div class="detail -space-y-2">
            <p class="font-medium">{{ displayData.userName }}</p>
            <p class="text-gray-600">{{ displayData.userPosition }}</p>
          </div>
        </div>

        <div class="want-date -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.date_rq") }}</h2>
          <p class="text-gray-600 text-sm">{{ displayData.requestDate }}</p>
        </div>

        <div class="purposes -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.purposes") }}</h2>
          <p class="text-gray-600 text-sm">{{ displayData.purpose }}</p>
        </div>

        <div class="table -space-y-0 mb-2 w-full px-6 shadow-sm rounded-md">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.title") }}</h2>
          <a-table
            :columns="columns(t)"
            :dataSource="displayData.items"
            :pagination="false"
            row-key="title"
          >
            <template #bodyCell="{ column, record, index}">
              <template v-if="column.key === 'id'">
                <span>{{ index + 1 }}</span>
              </template>
              <template v-if="column.key === 'price'">
                <span>₭ {{ formatPrice(record.price) }}</span>
              </template>
              <template v-if="column.key === 'totalPrice'">
                <span>₭ {{ formatPrice(record.totalPrice) }}</span>
              </template>
              <template v-if="column.key === 'content'">
                <span>{{ record.title }}1</span>
              </template>
              <template v-if="column.key === 'qty'">
                <span>{{ record.count }}</span>
              </template>
              <template v-if="column.key === 'remark'">
                <span>{{ record.remark || '-' }}</span>
              </template>
            </template>
          </a-table>
          <div class="total flex items-center md:justify-end justify-start md:px-6 px-1 pt-4 gap-4">
            <p class="font-medium text-slate-600">{{ t("purchase-rq.field.amount") }}:</p>
            <p class="font-semibold md:text-lg text-sm text-slate-700">
              {{ formatPrice(calculatedTotal) }} ₭
            </p>
          </div>
        </div>

        <!-- Image and signature -->
        <div class="image space-y-4 py-4 shadow-sm px-6 rounded-md">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.img_example") }}</h2>
          <div class="flex flex-wrap gap-6">
            <a-image
              v-for="(img, index) in allImages"
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
          <h2 class="text-md font-semibold">{{ t("purchase-rq.signature") }}</h2>
          <p class="text-slate-500 text-sm">{{t("purchase-rq.proposer")}}</p>

          <a-image
            :src="displayData.signature"
            alt="signature"
            :width="180"
            :height="100"
            :preview="false"
          />
          <div class="info text-sm text-slate-600 -space-y-2 mt-4">
            <p>{{ displayData.userName }}</p>
            <p>{{ displayData.department }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
