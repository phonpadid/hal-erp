// In your Vue component - updated script setup section

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { columns } from "../../../purchase-requests/column";
import { computed, onMounted, ref } from "vue";
import { usePurchaseRequestsStore } from "../../../../stores/purchase_requests/purchase-requests.store";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";

// Import the print helper

const { t } = useI18n();
const profileImage = ref("/public/Profile-PNG-File.png");
const purchaseRequestStore = usePurchaseRequestsStore();
const loading = ref(true);
const props = defineProps<{
  id: number | null;
}>();
const requestDetail = ref<PurchaseRequestEntity | null>(null);
onMounted(async () => {
  if (props.id) {
    loading.value = true;
    requestDetail.value = await purchaseRequestStore.fetchById(
      props.id.toString()
    );
    loading.value = false;
  }
});
const requesterInfo = computed(() => requestDetail.value?.getRequester());
const departmentInfo = computed(() => requestDetail.value?.getDepartment());
const positionInfo = computed(() => requestDetail.value?.getPosition());
const items = computed(() => requestDetail.value?.getItems() ?? []);

const totalAmount = computed(() => requestDetail.value?.getTotal() ?? 0);
</script>

<template>
  <div class="container mx-auto py-0 px-0 -mt-2">
    <div v-if="loading" class="mt-[10rem] text-center">Loading...</div>
    <div v-else-if="requestDetail" class="user-info shadow-sm py-2">
      <h2 class="text-md font-semibold px-6 mb-4">
        {{ t("purchase-rq.field.proposer") }}
      </h2>
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
          <p class="font-medium">{{ requesterInfo?.username }}</p>
          <p class="text-gray-600">
            {{ positionInfo?.name }} - {{ departmentInfo?.name }}
          </p>
        </div>
      </div>
      <div class="want-date -space-y-0 px-6 mb-4">
        <h2 class="text-md font-semibold">
          {{ t("purchase-rq.field.date_rq") }}
        </h2>
        <p class="text-gray-600 text-sm">
          {{ requestDetail?.getExpiredDate() }}
        </p>
      </div>

      <div class="purposes -space-y-0 px-6 mb-4">
        <h2 class="text-md font-semibold">
          {{ t("purchase-rq.field.purposes") }}
        </h2>
        <p class="text-gray-600 text-sm">
          {{ requestDetail.getPurposes() }}
        </p>
      </div>
      <div class="table -space-y-0 mb-2 w-full px-6 shadow-sm rounded-md">
        <h2 class="text-md font-semibold">
          {{ t("purchase-rq.field.title") }}
        </h2>
        <a-table
          :columns="columns(t)"
          :dataSource="items"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'id'">
              <span>{{ index + 1 }}</span>
            </template>
            <template v-if="column.key === 'total_price'">
              <span>₭ {{ formatPrice(record.price) }}</span>
            </template>
            <template v-if="column.key === 'image'">
              <span v-if="!record.file_name_url">ບໍ່ມີ</span>
              <a-image
                v-else
                :src="record.file_name_url"
                alt="ຮູບພາບ"
                style="max-width: 50px; max-height: 50px; border-radius: 6px"
                :preview="true"
              />
            </template>
          </template>
        </a-table>
        <div
          class="total flex items-center md:justify-end justify-start md:px-6 px-1 pt-4 gap-4"
        >
          <p class="font-medium text-slate-600">
            {{ t("purchase-rq.field.amount") }}:
          </p>
          <p class="font-semibold md:text-lg text-sm text-slate-700">
            {{ formatPrice(totalAmount) }} ₭
          </p>
        </div>
      </div>
      <div
        class="signature py-4 px-6 rounded-md mb-[2rem] flex flex-col items-start"
      >
        <!-- Title -->
        <h2 class="text-md font-semibold">{{ t("purchase-rq.signature") }}</h2>
        <p class="text-slate-500 text-sm ml-8">
          {{ t("purchase-rq.proposer") }}
        </p>

        <!-- Signature Image -->
        <div class=" flex items-center justify-center">
          <a-image
            v-if="requesterInfo?.user_signature?.signature_url"
            :src="requesterInfo.user_signature.signature_url"
            alt="signature"
            :width="120"
            :height="60"
            :preview="false"
          />
          <div
            v-else
            class="w-[120px] h-[80px] border border-gray-200 flex items-center justify-center text-xs text-slate-400"
          >
            {{ t("purchase-rq.no_signature") }}
          </div>
        </div>

        <!-- Info Footer -->
        <div
          class="info text-sm text-slate-600 flex flex-col items-center -space-y-1"
        >
          <p>{{ requesterInfo?.username || "-" }}</p>
          <p class="ml-4">{{ departmentInfo?.name || "-" }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
