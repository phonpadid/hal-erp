<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { ButtonType } from "@/modules/shared/buttonType";
// import { useI18n } from "vue-i18n";
const selectType = ref<string>(''); // Single selection - empty string initially
// Components
import Table from "@/common/shared/components/table/Table.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import UiDrawer from "@/common/shared/components/Darwer/UiDrawer.vue";
import PurchaseOrderShowDrawer from "../purchase/purchase_orders/PurchaseOrderShowDrawer.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import Radio from "@/common/shared/components/Input/Radio.vue";
import { usePurchaseOrderStore } from "../../stores/purchase_requests/purchase-order";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useReceiptStore } from "../../stores/receipt.store";
const purchaseOrderStore = usePurchaseOrderStore();
const orderDetails = ref<PurchaseOrderEntity | null>(null);
const { error, success } = useNotification();
const rStore = useReceiptStore()
// Updated form state to match API payload structure
const formState = ref({
  purchase_order_id: undefined as number | undefined,
  remark: '',
  document: {
    documentTypeId: 21 // Fixed documentTypeId based on your API payload
  },
  receipt_items: [] as Array<{
    purchase_order_item_id: number;
    payment_currency_id: number;
    payment_type: string;
    remark: string;
  }>
});

/********************************************************* */
// const { t } = useI18n();
const router = useRouter();
const { params } = useRoute();
const purchaseOrderId = params.id?.toString();
// State for Drawer
const visible = ref(false);
const showDrawer = () => {
  visible.value = true;
};

// --- Reactive State for Form Inputs ---
const remark = ref("");

// Computed property to build receipt_items array
const buildReceiptItems = computed(() => {
  if (!orderDetails.value || !selectType.value) return [];

  return orderDetails.value.getPurchaseOrderItem().map(item => ({
    purchase_order_item_id: String(item.getId()), // Assuming item has an id property
    payment_currency_id: String(item?.getCurrency()?.id), // You might need to get this from the item or set it based on your logic
    payment_type: selectType.value || "",
    remark: remark.value || ''
  }));
});

// Function to send data to API
const submitPaymentRequest = async () => {
  try {
    if (!orderDetails.value) {
      error("ບໍ່ພົບຂໍ້ມູນເອກະສານ");
      return;
    }

    if (!selectType.value) {
      error("ກະລຸນາເລືອກປະເພດການຈ່າຍເງິນ");
      return;
    }

    const payload = {
      purchase_order_id: purchaseOrderId,
      remark: formState.value.remark,
      documentType_id: formState.value.document.documentTypeId.toString(),
      receipt_items: buildReceiptItems.value
    };
    await rStore.created(payload)
    success("ສ້າງໃບເບີກຈ່າຍສຳເລັດແລ້ວ");
    router.push({ name: "review-money-success" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    error("ເກີດຂໍ້ຜິດພາດໃນການສ້າງໃບເບີກຈ່າຍ", err);
  }
};

// Header buttons based on the image
const customButtons = [
  {
    label: "ສ້າງໃບເບີກຈ່າຍ",
    type: "primary" as ButtonType,
    danger: true, // Making the button red as in the image
    onClick: submitPaymentRequest
  },
  {
    label: "Print",
    icon: "ant-design:printer-outlined",
    class: "bg-white flex items-center gap-2 hover:bg-gray-100",
    type: "default" as ButtonType,
    onClick: () => {
      window.print();
    },
  },
];

// Static data from the image
const requesterInfo = {
  name: "ນາງ ປະກາຍແສງ ດາລາວົງ",
  position: "ພະແນກບໍລິຫານ, ພະນັກງານ",
};

const typeOption = [
  { label: "ເງິນສົດ (Cash)", value: "cash" },
  { label: "ໂອນເງິນ (Transfer)", value: "transfer" },
  { label: "ເຊັກ (Cheque)", value: "cheque" },
];

const columns = [
  {
    title: "ລຳດັບ",
    dataIndex: "id",
    key: "id",
    width: 80,
    align: "center",
  },
  {
    title: "ເນື້ອໃນລາຍການ",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "ລະຫັດງົບປະມານ",
    dataIndex: "budgetCode",
    key: "budgetCode",
  },
  {
    title: "ລາຄາລວມ",
    dataIndex: "total",
    key: "total",
    align: "right",
  },
];

const fetchOrderDetails = async () => {
  try {
    const result = await purchaseOrderStore.fetchById(Number(purchaseOrderId));
    if (result) {
      orderDetails.value = result;
      // Set the purchase_order_id in formState
      formState.value.purchase_order_id = Number(purchaseOrderId);
    } else {
      error("ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ", err);
  }
};

onMounted(async () => {
  await fetchOrderDetails();
  console.log('Order details:', orderDetails.value);
});
</script>

<template>
  <div class="p-4">
    <header-component
      header-title="ໃບເບີກຈ່າຍ"
      :breadcrumb-items="['ອະນຸມັດໃບສະເໜີ', 'ສ້າງໃບເບີກຈ່າຍ']"
      :show-document-date="false"
      :show-document-number="false"
      document-prefix="ສ້າງໃບເບີກຈ່າຍ"
      :action-buttons="customButtons"
    />

    <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ຈາກໜ່ວຍງານ</h3>
        <div class="flex items-center gap-3">
          <a-avatar size="large" :src="'/public/4.png'" />
          <div>
            <p class="font-medium">{{ requesterInfo.name }}</p>
            <p class="text-gray-500 text-sm">{{ requesterInfo.position }}</p>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ຈຸດປະສົງ</h3>
        <UiInput
          v-model="formState.remark"
          placeholder="ປ້ອນຈຸດປະສົງ"
          className="bg-gray-50"
        />
      </div>

      <div class="mb-6 border rounded-lg p-4">
        <h3 class="text-base font-semibold mb-4">ຂໍ້ມູນຮ້ານຄ້າ</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="flex">
            <span class="font-medium w-28">ຊື່ຮ້ານຄ້າ</span>
            <span class="text-gray-700">{{ orderDetails?.getPurchaseOrderItem()[0].getSelectedVendor()?.getVendor().name }}</span>
          </div>
          <div class="flex">
            <span class="font-medium w-28">ທະນາຄານ</span>
            <span class="text-gray-700 flex items-center gap-2">
              <img :src="orderDetails?.getBankLogo() ?? ''" class="w-6 h-6" alt="Bank Icon" />
              {{ orderDetails?.getBankName() }}
            </span>
          </div>
          <div class="flex">
            <span class="font-medium w-28">ຊື່ບັນຊີ</span>
            <span class="text-gray-700">{{ orderDetails?.getAccountName() }}</span>
          </div>
          <div class="flex">
            <span class="font-medium w-28">ເລກບັນຊີ LAK</span>
            <span class="text-gray-700">{{ orderDetails?.getAccountNumber() }}</span>
          </div>
        </div>
      </div>

      <!-- FIXED CHECKBOX SECTION - SINGLE SELECTION -->
      <div class="select-type mb-6">
        <h3 class="text-base font-semibold mb-4">ປະເພດການຈ່າຍເງິນ</h3>
        <div class="space-y-2">
          <Radio
            v-model="selectType"
            :options="typeOption"
          />
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ລາຍການ</h3>
        <Table :columns="columns" :dataSource="orderDetails?.getPurchaseOrderItem() ?? []">
          <template #id="{ index }">
            <span class="font-medium">{{ index + 1 }}</span>
          </template>
          <template #total="{ record }">
            <span class="font-medium"> {{ record.total.toLocaleString() }} ₭ </span>
          </template>
        </Table>
        <div class="flex justify-end mt-4">
          <div class="w-1/3">
            <div class="flex justify-center gap-2 items-center">
              <span class="font-semibold text-gray-700">ມູນຄ່າລວມທັງໝົດ:</span>
              <span class="font-bold text-lg text-red-600">
                {{ orderDetails?.getPurchaseRequest().total.toLocaleString() }} ₭
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-base font-semibold mb-2">ໝາຍເຫດ</h3>
        <UiInput
          v-model="remark"
          placeholder="ລະບຸຂໍ້ມູນເພີ່ມເຕີມ (ຖ້າມີ)"
          className="bg-gray-50"
        />
      </div>

      <div>
        <span>ເອກະສານທີຕິດຂັດ</span>
        <div class="flex items-center gap-2 mt-2">
          <HeaderComponent
            header-title="ໃບສະເໜີຂໍ້ຈັດຊື້ - ເລກທີ 0036/ຈຊ/ຮລຕ/ນຄຫຼ"
            header-title-color="blue-600"
            prefix-icon="mdi:file-document-outline"
            suffix-icon="mdi:arrow-top-right"
            prefix-icon-class="text-blue-500"
            suffix-icon-class="text-blue-500"
            :suffix-icon-clickable="true"
            :show-document-date="false"
            :show-document-number="false"
            :show-document-prefix="false"
            :show-breadcrumb="false"
            class="cursor-pointer"
            @click="showDrawer"
          />
          <HeaderComponent
            header-title="ໃບອະນຸມັດຈັດຊື້ - ເລກທີ 0036/ຈຊ/ຮລຕ/ນຄຫຼ"
            header-title-color="blue-600"
            prefix-icon="mdi:file-document-outline"
            suffix-icon="mdi:arrow-top-right"
            prefix-icon-class="text-blue-500"
            suffix-icon-class="text-blue-500"
            :suffix-icon-clickable="true"
            :show-document-date="false"
            :show-document-number="false"
            :show-document-prefix="false"
            :show-breadcrumb="false"
            class="cursor-pointer"
            @click="showDrawer"
          />
        </div>
      </div>

      <!-- Debug info (remove in production) -->
      <!-- <div class="mt-6 p-4 bg-gray-100 rounded">
        <h4 class="font-semibold mb-2">Debug Info:</h4>
        <pre class="text-xs">{{ JSON.stringify({
          purchase_order_id: Number(purchaseOrderId),
          remark: formState.remark,
          document: formState.document,
          receipt_items: buildReceiptItems,
          selectType: selectType
        }, null, 2) }}</pre>
      </div> -->
    </div>
  </div>

  <UiDrawer
    v-model:open="visible"
    title="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ - ເລກທີ 0044/ຈຊນ.ນວ/ບຫ - ວັນທີ 26 ມີນາ 2025"
    placement="right"
    :width="1050"
  >
    <PurchaseOrderShowDrawer />
  </UiDrawer>
</template>

<style scoped>
.select-type .space-y-2 > * + * {
  margin-top: 0.5rem;
}
</style>
