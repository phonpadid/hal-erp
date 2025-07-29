<!-- eslint-disable @typescript-eslint/no-explicit-any -->
// In your Vue component - updated script setup section

<script setup lang="ts">
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { computed, ref, onMounted } from "vue";
import { columns } from "./column";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import type { ButtonType } from "@/modules/shared/buttonType";
import { useToggleStore } from "../../stores/storage.store";
import { storeToRefs } from "pinia";
// import { printContent } from "./helpers/printer";
import { useRoute } from "vue-router";
import { usePurchaseRequestsStore } from "../../stores/purchase_requests/purchase-requests.store";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";

const { t } = useI18n();
const route = useRoute(); // << 3. Get route instance
const purchaseRequestStore = usePurchaseRequestsStore(); // << 4. Get store instance

// 5. สร้าง ref เพื่อเก็บข้อมูลที่ fetch มา
const requestDetail = ref<PurchaseRequestEntity | null>(null);
const loading = ref(true);

// 6. Fetch ข้อมูลเมื่อ component ถูกสร้าง
onMounted(async () => {
  const requestId = route.params.id as string;
  if (requestId) {
    loading.value = true;
    requestDetail.value = await purchaseRequestStore.fetchById(requestId);
    loading.value = false;
  }
});

const requesterInfo = computed(() => requestDetail.value?.getRequester());
const departmentInfo = computed(() => requestDetail.value?.getDepartment());
const positionInfo = computed(() => requestDetail.value?.getPosition());
const items = computed(() => requestDetail.value?.getItems() ?? []);

// const totalAmount = computed(() => requestDetail.value?.getTotal() ?? 0);

const imageList = computed(() => {
  return items.value.map((item) => (item as any).file_name_url).filter((url) => !!url);
});
// Print handler
const handlePrint = async () => {
  /* ... no changes needed ... */
};
const getCustomButtons = () => [
  {
    label: t("button.print"),
    icon: "ant-design:printer-outlined",
    class: "bg-white flex items-center gap-2 hover:bg-gray-100 mr-4",
    type: "default" as ButtonType,
    onClick: handlePrint,
  },
];

// Toggle sidebar logic
const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);
const topbarStyle = computed(() => {
  return toggle.value ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
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
        :header-title="t('purchase-rq.field.proposal')"
        :breadcrumb-items="[t('purchase-rq.field.proposal'), t('purchase-rq.description')]"
        :document-prefix="t('purchase-rq.field.proposal')"
        :document-number="`${t('purchase-rq.field.pr_number')} ${
          requestDetail?.getPrNumber() ?? ''
        }`"
        :document-date="new Date(requestDetail?.getRequestedDate() ?? Date.now())"
        :action-buttons="getCustomButtons()"
        :document-status="requestDetail?.getStatus()"
        document-status-class="text-orange-400 text-sm font-medium ml-2 ring-2 ring-orange-300 px-3 py-1 rounded-full"
      />
    </div>

    <div v-if="loading" class="mt-[10rem] text-center">Loading...</div>
    <div v-else-if="requestDetail" class="body mt-[10rem]">
      <div class="user-info shadow-sm py-2">
        <h2 class="text-md font-semibold px-6 mb-4">{{ t("purchase-rq.field.proposer") }}</h2>
        <div class="info flex items-center px-6 gap-4 mb-4">
          <a-image
            src="/public/Profile-PNG-File.png"
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
          <p class="text-gray-600 text-sm">{{ requestDetail.getExpiredDate() }}</p>
        </div>
        <div class="purposes -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.purposes") }}</h2>
          <p class="text-gray-600 text-sm">{{ requestDetail.getPurposes() }}</p>
        </div>

        <div class="table -space-y-0 mb-2 w-full px-6 shadow-sm rounded-md">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.title") }}</h2>
          <a-table :columns="columns(t)" :dataSource="items" :pagination="false" row-key="id">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'price'">
                <span>₭ {{ formatPrice(record.purchase_request_item.price) }}</span>
              </template>
              <template v-if="column.key === 'total_price'">
                <span>₭ {{ formatPrice(record.total) }}</span>
              </template>
            </template>
          </a-table>
          <div class="total flex items-center md:justify-end justify-start md:px-6 px-1 pt-4 gap-4">
            <p class="font-medium text-slate-600">{{ t("purchase-rq.field.amount") }}:</p>
            <p class="font-semibold md:text-lg text-sm text-slate-700">
              <!-- {{ formatPrice(totalAmount) }} ₭ -->
            </p>
          </div>
        </div>

        <div class="image space-y-4 py-4 shadow-sm px-6 rounded-md">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.img_example") }}</h2>
          <div class="flex flex-wrap gap-6">
            <a-image
              v-for="(imgUrl, index) in imageList"
              :key="index"
              :src="imgUrl"
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
          <p class="text-slate-500 text-sm">{{ t("purchase-rq.proposer") }}</p>
          <a-image
            :src="(requesterInfo as any)?.user_signature?.signature_url ?? '/public/2.png'"
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
    <div v-else class="mt-[10rem] text-center text-red-500">ไม่พบข้อมูล</div>
  </div>
</template>
