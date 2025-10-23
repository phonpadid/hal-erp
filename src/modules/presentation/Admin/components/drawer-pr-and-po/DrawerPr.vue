// In your Vue component - updated script setup section

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { columns } from "../purchase-requests/column";
import { computed, onMounted, ref } from "vue";
import { usePurchaseRequestsStore } from "../../stores/purchase_requests/purchase-requests.store";
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
const departmentInfo = computed(() => requestDetail.value?.getDepartment());
const positionInfo = computed(() => requestDetail.value?.getPosition());
const items = computed(() => requestDetail.value?.getItems() ?? []);
const approvalSteps = computed(() => {
  const steps = requestDetail.value?.getUserApproval()?.approval_step ?? [];
  return [...steps].sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0));
});
const totalAmount = computed(() => requestDetail.value?.getTotal() ?? 0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStepTitle = (index: number, step: any) => {
  if (index === 0) {
    return t("purchase-rq.proposer");
  }
  return `${t("purchase-rq.approver")} ${index}`;
};
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
        <div class="want-date -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">
            {{ t("purchase-rq.field.date_rq") }}
          </h2>
          <p class="text-gray-600 text-sm">
            {{ requestDetail?.getExpiredDate() }}
          </p>
        </div>
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
          <template #price="{ record }">
            <span>₭ {{ formatPrice(record.getPrice()) }}</span>
          </template>
           <template #total="{ record }">
              <span>₭ {{ formatPrice(record.total || record.price * record.quantity) }}</span>
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
        <p class="text-slate-500 text-sm ml-8">
          {{ t("purchase-rq.proposer") }}
        </p>

        <!-- Signature Image -->
        <div class="flex flex-wrap gap-4">
          <!-- Approval Steps -->
          <template v-for="(step, index) in approvalSteps" :key="step.id">
            <div>
              <!-- Step Title -->
              <p class="text-slate-500 text-sm mb-2 text-center">
                {{ getStepTitle(index, step) }}
              </p>

              <!-- Signature Display -->
              <div class=" w-[80px] h-[80px] text-center">
                <template v-if="step.status_id === 2 && step.approver?.user_signature">
                  <!-- Approved signature -->
                  <a-image
                    :src="step.approver.user_signature.signature_url"
                    alt="signature"
                    :width="80"
                    :height="80"
                    :preview="false"
                    class="block"
                  />
                </template>
                <template v-else-if="step.status_id === 1">
                  <!-- Pending signature -->
                  <div class="h-full flex items-center justify-center bg-gray-50">
                    <span class="text-gray-400 text-center">{{ t("purchase-rq.pending") }}</span>
                  </div>
                </template>
              </div>

              <!-- Approver Info -->
              <div class="info text-sm text-slate-600 -space-y-1 text-center">
                <template v-if="step.approver">
                  <p class="font-medium">{{ step.approver.username }}</p>
                  <p class="text-xs">{{ step.position?.name || "-" }}</p>
                  <!-- <p class="text-xs" v-if="step.approved_at">
                    {{ formatDate(step.approved_at) }}
                  </p> -->
                </template>
                <template v-else-if="step.doc_approver?.[0]?.user">
                  <p class="font-medium">{{ step.doc_approver[0].user.username }}</p>
                  <p class="text-xs">{{ t("purchase-rq.pending") }}</p>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
