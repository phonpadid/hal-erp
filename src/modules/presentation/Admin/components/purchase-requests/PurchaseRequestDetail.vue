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
import Table from "@/common/shared/components/table/Table.vue";
// import { printContent } from "./helpers/printer";
import { useRoute } from "vue-router";
import { usePurchaseRequestsStore } from "../../stores/purchase_requests/purchase-requests.store";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import { formatDate } from "@/modules/shared/formatdate";
import { Icon } from "@iconify/vue";

const { t } = useI18n();
const route = useRoute(); // << 3. Get route instance
const purchaseRequestStore = usePurchaseRequestsStore(); // << 4. Get store instance

const requestDetail = ref<PurchaseRequestEntity | null>(null);
const loading = ref(true);

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
const totalAmount = computed(() => requestDetail.value?.getTotal() ?? 0);
const documentStatus = computed(() => {
  const rejectedStep = requestDetail.value
    ?.getUserApproval()
    ?.approval_step?.find((step) => step.status_id === 3);

  if (rejectedStep) {
    return {
      status: `ຖືກປະຕິເສດ`,
      // ໂດຍ ${rejectedStep.approver?.username || ''} ${rejectedStep.position?.name || ''
      statusClass: "text-red-500 font-medium ml-2 bg-red-50 px-3 py-1 rounded-full",
    };
  }
  const pendingStep = requestDetail.value
    ?.getUserApproval()
    ?.approval_step?.find((step) => step.status_id === 1);

  if (!pendingStep) {
    return {
      status: "ອະນຸມັດສຳເລັດ",
      statusClass: "text-green-500 font-medium ml-2 bg-green-50 px-3 py-1 rounded-full",
    };
  }
  // const nextApprover = pendingStep.doc_approver?.[0]?.user?.username;
  const nextDepartment = pendingStep.doc_approver?.[0]?.department?.name;

  return {
    status: `ລໍຖ້າ ${nextDepartment || ""} ກວດສອບ`,
    // ${nextApprover || ''}
    statusClass: "text-orange-500 font-medium ml-2 bg-orange-50 px-3 py-1 rounded-full",
  };
});

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
        :document-date="formatDate(requestDetail?.getRequestedDate() ?? new Date())"
        :action-buttons="getCustomButtons()"
        :document-status="documentStatus.status"
        :document-status-class="documentStatus.statusClass"
      />
    </div>
    <div v-if="loading" class="mt-[10rem] text-center">Loading...</div>
    <div v-else-if="requestDetail" class="body mt-[10rem]">
      <div class="user-info shadow-sm">
        <h2 class="text-md font-semibold px-6 mb-4">{{ t("purchase-rq.field.proposer") }}</h2>
        <div class="flex justify-between">
          <div class="info flex items-center px-6 gap-4 mb-4">
            <div
              class="flex items-center justify-center **w-16 h-16** rounded-full **bg-blue-100** **text-4xl**"
            >
              <Icon icon="mdi:user" class="text-4xl" />
            </div>
            <div class="detail -space-y-2">
              <p class="font-medium">{{ requesterInfo?.username }}</p>
              <p class="text-gray-600">{{ positionInfo?.name }} - {{ departmentInfo?.name }}</p>
            </div>
          </div>
          <div class="want-date -space-y-0 px-6">
            <h2 class="text-md font-semibold">{{ t("purchase-rq.field.date_rq") }}</h2>
            <p class="text-gray-600 text-sm">{{ requestDetail.getExpiredDate() }}</p>
          </div>
        </div>

        <div class="purposes -space-y-0 px-6">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.purposes") }}</h2>
          <p class="text-gray-600 text-sm">{{ requestDetail.getPurposes() }}</p>
        </div>

        <div class="table -space-y-0 mb-2 w-full px-6 shadow-sm rounded-md">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.title") }}</h2>
          <Table :columns="columns(t)" :dataSource="items" :pagination="false" row-key="id">
            <template #index="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
            <template #price="{ record }">
              <span>₭ {{ formatPrice(record.getPrice()) }}</span>
            </template>
            <template #total_price="{ record }">
              <span>₭ {{ formatPrice(record.getTotalPrice()) }}</span>
            </template>
            <template #image="{ record }">
              <span v-if="!record.file_name_url">ບໍ່ມີ</span>
              <a-image
                v-else
                :src="record.file_name_url"
                alt="ຮູບພາບ"
                style="max-width: 50px; max-height: 50px; border-radius: 6px"
                :preview="true"
              />
            </template>
          </Table>
          <div class="total flex items-center md:justify-end justify-start gap-4">
            <p class="font-medium text-slate-600">{{ t("purchase-rq.field.amount") }}:</p>
            <p class="font-semibold md:text-lg text-sm text-slate-700">
              {{ formatPrice(totalAmount) }} ₭
            </p>
          </div>
        </div>
        <div class="shadow-sm">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.signature") }}</h2>
          <div class="flex justify-start gap-x-12">
            <div class="text-center">
              <p class="text-slate-500 text-sm">{{ t("purchase-rq.proposer") }}</p>
              <div class="felx justify-start">
                <a-image
                  :src="(requesterInfo as any)?.user_signature?.signature_url ?? '/public/2.png'"
                  alt="signature"
                  :width="60"
                  :height="50"
                  :preview="false"
                />
              </div>
              <div class="info text-sm text-slate-600 -space-y-2">
                <p>{{ requesterInfo?.username }}</p>
                <p>{{ departmentInfo?.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="mt-[10rem] text-center text-red-500">ບໍ່ມີພົບຂໍ້ມູນ</div>
  </div>
</template>
