<script setup lang="ts">
import { ref, computed } from "vue";
import { columns } from "./column";
import { dataMenu } from "@/modules/shared/utils/data.department";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import type { Step1Data, Step2Data } from "./formstate";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import { formatDate } from "@/modules/shared/formatdate";
import Table from "@/common/shared/components/table/Table.vue";

const { t } = useI18n();
const requestDetail = ref<PurchaseRequestEntity | null>(null);
const requesterInfo = computed(() => requestDetail.value?.getRequester());
const departmentInfo = computed(() => requestDetail.value?.getDepartment());
const positionInfo = computed(() => requestDetail.value?.getPosition());
const items = computed(() => requestDetail.value?.getItems() ?? []);
const totalAmount = computed(() => requestDetail.value?.getTotal() ?? 0);
const loading = ref(true);

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
    docType: step1Data?.document_type_id || "ປະເພດເອກະສານ",
    requestDate: step2Data?.requested_date || "18 ກໍລະກົດ 2025",
    expiredDate: step2Data?.expired_date || "25 ກໍລະກົດ 2025",
    purpose:
      step2Data?.purpose || "ມີການຈັດຊື້ ເນື່ອງຈາກວ່າປະຈຸບັນນີ້ມີພະນັກງານເຂົ້າມາເພີ່ມໃໝ່ 5 ຄົນ",
    items: step2Data?.addMore || dataMenu,
    images: imageList, // You might want to get this from addMore[].fileName
    signature: "/public/2.png",
    userName: userName.value,
    userPosition: userPosition.value,
    department: department.value,
    profileImage: profileImage.value,
  };
});
</script>

<template>
  <div v-if="loading" class="mt-[10rem] text-center">Loading...</div>
  <div class="container mx-auto py-1 px-0" v-else-if="requestDetail">
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
            <p class="font-medium">{{ requesterInfo?.username }}</p>
            <p class="text-gray-600">{{ positionInfo?.name }} - {{ departmentInfo?.name }}</p>
          </div>
        </div>

        <div class="want-date -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.date_rq") }}</h2>
          <p class="text-gray-600 text-sm">{{ formatDate(requestDetail.getExpiredDate()) }}</p>
        </div>

        <div class="purposes -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.purposes") }}</h2>
          <p class="text-gray-600 text-sm">{{ requestDetail.getPurposes() }}</p>
        </div>

        <div class="table -space-y-0 mb-2 w-full px-6 shadow-sm rounded-md">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.title") }}</h2>
          <Table :columns="columns(t)" :dataSource="items" :pagination="false" row-key="id">
            <template #index="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
            <template #total_price="{ record }">
              <span>₭ {{ formatPrice(record.getTotalPrice()) }}</span>
            </template>
            <template #image="{ record }">
              <a-image
                v-if="record.file_name_url"
                :src="record.file_name_url"
                alt="example"
                :width="50"
                :height="50"
                :preview="true"
                class="rounded-lg shadow-sm"
              />
              <span v-else class="text-gray-400 italic">No Image</span>
            </template>
          </Table>
          <div class="total flex items-center md:justify-end justify-start md:px-6 px-1 pt-4 gap-4">
            <p class="font-medium text-slate-600">{{ t("purchase-rq.field.amount") }}:</p>
            <p class="font-semibold md:text-lg text-sm text-slate-700">
              {{ formatPrice(totalAmount) }}₭
            </p>
          </div>
        </div>
        <div class="signature shadow-sm py-4 px-6 rounded-md mb-[10rem]">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.signature") }}</h2>
          <p class="text-slate-500 text-sm">{{ t("purchase-rq.proposer") }}</p>

          <a-image
            :src="displayData.signature"
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
      </div>
    </div>
  </div>
</template>
