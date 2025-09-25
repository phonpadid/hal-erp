// In your Vue component - updated script setup section

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { onMounted, ref } from "vue";
import { columnsTitle, columnTitle } from "./column";
import { usePurchaseOrderStore } from "../../../../stores/purchase_requests/purchase-order";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { numberToLaoWords } from "@/modules/shared/utils/read-number-lao";

// Import the print helper
const purchaseOrderStore = usePurchaseOrderStore();
const orderDetails = ref<PurchaseOrderEntity | null>(null);
  const { error } = useNotification();
const { t } = useI18n();
const profileImage = ref("/public/Profile-PNG-File.png");
const userName = ref("ທ້າວສຸກີ້");
const department = ref("ພະແນກການເງິນ");
const props = defineProps<{
  id: number | null;
}>();
const fetchOrderDetails = async () => {
    const result = await purchaseOrderStore.fetchById(Number(props.id));
    if (result) {
      orderDetails.value = result;
    } else {
      error("ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    }
};
onMounted( async () => {
  await fetchOrderDetails();
});
</script>

<template>
  <div class="container mx-auto py-0 px-0 -mt-2">
    <div class="user-info shadow-sm py-2">
        <h2 class="text-md font-semibold px-6 mb-4">ຂໍ້ມູນສ້າງໃບອະນຸມັດຈັດຊື້ {{ props.id }}</h2>
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
            <p class="font-medium">{{ orderDetails?.getRequester().username }}</p>
            <p class="text-gray-500 text-sm">{{ orderDetails?.getDepartment().name }}, {{ orderDetails?.getPosition()[0].name }}</p>
          </div>
        </div>
        <div class="title md:w-[40rem] -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">ສະເໜີ</h2>
          <a-table
          :columns="columnsTitle(t)"
          :dataSource="orderDetails?.getPurchaseOrderItem()"
          :pagination="false"
          >
            <template #bodyCell="{ column }">
              <template v-if="column.key === 'department'">
                <span>{{ orderDetails?.getDepartment().name }}</span>
              </template>
              <template v-if="column.key === 'work'">
                <span>{{ orderDetails?.getPosition()[0].name  }}</span>
              </template>
            </template>
        </a-table>
        </div>

        <div class="purposes -space-y-0 px-6 mb-4">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.purposes") }}</h2>
          <p class="text-gray-600 text-sm pl-4">
            {{ orderDetails?.getPurposes() }}
          </p>
        </div>
        <div class="table -space-y-0 mb-2 w-full px-6 shadow-sm rounded-md">
          <h2 class="text-md font-semibold">{{ t("purchase-rq.field.title") }}</h2>
          <a-table
            :columns="columnTitle(t)"
            :dataSource="orderDetails?.getPurchaseOrderItem() ?? []"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'unit'">
                <span>{{ record.purchase_request_item.unit.name }}</span>
              </template>
              <template v-if="column.key === 'price_per_unit'">
                <span>₭ {{ formatPrice(record.price) }}</span>
              </template>
              <template v-if="column.key === 'amount'">
                <span>₭ {{ formatPrice(record.total) }}</span>
              </template>
              <template v-if="column.key === 'price_in_words'">
                <span>{{ numberToLaoWords(Number(record?.total)) }}</span>
              </template>
            </template>
          </a-table>
          <div class="total flex items-center md:justify-end justify-start md:px-6 px-1 pt-4 gap-4">
            <p class="font-medium text-slate-600">ມູນຄ່າລວມທັງໝົດ:</p>
            <p class="font-semibold md:text-lg text-sm text-slate-700">
              {{ formatPrice(orderDetails?.getPurchaseRequest().total || 0) }} ₭
            </p>
          </div>
          <div class="total flex items-center md:justify-end justify-start md:px-6 px-1 gap-4">
            <p class="font-medium text-slate-600 -mt-3 ">ມູນຄ່າລວມທັງໝົດກີບ:</p>
            <p class="font-semibold md:text-lg text-sm -mt-3 text-slate-700">
              {{ formatPrice(orderDetails?.getPurchaseRequest().total || 0) }} ₭
            </p>
          </div>
        </div>
        <!-- image and signature  -->
        <div class="image space-y-4 py-4 shadow-sm px-6 rounded-md">
          <h2 class="text-md font-semibold">ວິເຄາະການຈັດຊື້</h2>
          <div class="grid grid-cols-1 md:grid-cols-1 gap-2 text-sm">
          <div class="flex items-center gap-2">
            <label class="w-40 text-gray-700">ຮ້ານທີ່ເລືອກ:</label>
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
<style scoped>
::v-deep(.title .ant-table-thead > tr > th) {
  background-color: white; /* bg-blue-400 */
  color: #1f2937;            /* text-gray-800 */
  box-shadow: none !important;
  border: none;
  padding-bottom: 1px !important;
}

::v-deep(.title .ant-table) {
  border: none !important;
}

::v-deep(.title .ant-table table) {
  border: none !important;
}

::v-deep(.title .ant-table td),
::v-deep(.title .ant-table th) {
  border: none !important;
}
::v-deep(.ant-table-tbody > tr > td) {
 padding-bottom: 1px;
}

</style>
