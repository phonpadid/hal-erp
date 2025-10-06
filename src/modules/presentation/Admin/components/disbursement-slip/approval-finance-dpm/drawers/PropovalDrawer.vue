// In your Vue component - updated script setup section

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { columns } from "../../../purchase-requests/column";
import { computed, onMounted, ref } from "vue";
import { usePurchaseRequestsStore } from "../../../../stores/purchase_requests/purchase-requests.store";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import { Icon } from "@iconify/vue";
import Table from "@/common/shared/components/table/Table.vue";

// Import the print helper

const { t } = useI18n();
const purchaseRequestStore = usePurchaseRequestsStore();
const loading = ref(true);
const props = defineProps<{
  id: number | null;
}>();
const requestDetail = ref<PurchaseRequestEntity | null>(null);
onMounted(async () => {
  if (props.id) {
    loading.value = true;
    requestDetail.value = await purchaseRequestStore.fetchById(props.id.toString());
    loading.value = false;
  }
});
const requesterInfo = computed(() => requestDetail.value?.getRequester());
const approvalSignature = computed(() => requestDetail.value?.getUserApproval()?.approval_step);
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
        <div
          class="flex items-center justify-center **w-16 h-16** rounded-full **bg-blue-100** **text-4xl**"
        >
          <Icon icon="mdi:user" class="text-6xl" />
        </div>
        <div class="detail -space-y-2">
          <p class="font-medium">{{ requesterInfo?.username }}</p>
          <p class="text-gray-600">{{ positionInfo?.name }} - {{ departmentInfo?.name }}</p>
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
        <Table :columns="columns(t)" :dataSource="items" :pagination="false" row-key="id">
          <template #index="{ index }">
            <span>{{ index + 1 }}</span>
          </template>
          <template #total_price="{ record }">
            <span>₭ {{ formatPrice(record.getPrice()) }}</span>
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
            {{ formatPrice(totalAmount) }} ₭
          </p>
        </div>
      </div>
      <div class="signature py-4 px-6 rounded-md mb-[2rem] flex flex-col items-start">
        <!-- Title -->
        <h2 class="text-md font-semibold">{{ t("purchase-rq.signature") }}</h2>

        <!-- Signature Image -->
        <div
        class="signature flex flex-wrap items-center justif-start gap-[3rem] shadow-sm px-0 rounded-md pb-4"
      >
        <div
          v-for="(step, index) in [
            ...(approvalSignature || []),
          ].sort((a, b) => a.step_number - b.step_number)"
          :key="index"
          class="signature-approver text-center"
        >
          <p class="text-slate-500 text-sm font-bold">
            {{ t("purchase-rq.approver") }} {{ step.step_number + 1 }}
          </p>

          <a-image
            v-if="step.approver?.user_signature?.signature_url"
            :src="step.approver?.user_signature?.signature_url"
            alt="signature"
            :width="120"
            :height="60"
            :preview="false"
          />
          <div
            v-else
            class="w-[120px] h-[80px] border border-slate-100 flex items-center justify-center text-xs text-slate-400"
          >
            <!-- No Signature -->
          </div>

          <div class="info text-sm text-slate-600 -space-y-2 mt-4">
            <p>{{ step.approver?.username || "-" }}</p>
            <p>{{ step.position?.name || "-" }}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>
