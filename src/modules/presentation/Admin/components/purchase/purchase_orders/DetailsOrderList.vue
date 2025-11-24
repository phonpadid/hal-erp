<template>
  <div class="mt-10">
    <!-- Document Details -->
    <div v-if="showApprovalSuccess">
      <ApprovalsuccessDetails />
    </div>
    <!-- Header Component -->
    <div v-else>
      <!-- Header component -->
      <div
        class="fixed px-6 py-4 top-0 z-40 h-auto bg-white shadow-sm transition-all duration-150 mt-[4rem]"
        :class="topbarStyle"
      >
        <header-component
          header-title="ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ"
          :breadcrumb-items="['ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ', 'ອານຸມັດ']"
          document-prefix="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ"
          :document-number="orderDetails?.getPoNumber() || 'PO-13B786'"
          :document-date="formatDate(orderDetails?.getCreatedAt() || '2025-03-26')"
          document-status="ລໍຖ້າຫົວໜ້າພະແນກບໍລິຫານກວດສອບ"
          document-status-class="text-orange-500 font-medium ml-2 bg-orange-50 px-3 py-1 rounded-full"
        />
      </div>

      <!-- Main Content -->
      <div class="bg-white rounded-lg shadow-sm p-6 mt-40">
        <h2>ຂໍ້ມູນສ້າງໃບອານຸມັດຈັດຊື້ - ຈັດຈ້າງ</h2>
        <!-- Requester Information -->
        <div class="flex items-start gap-4 mb-2">
          <img
            :src="documentDetails.requester.avatar"
            alt="Requester Avatar"
            class="w-14 h-14 rounded-full mb-2"
          />
          <div>
            <h4>{{ orderDetails?.getRequester()?.username || documentDetails.requester.name }}</h4>
            <p class="text-gray-600">
              {{ orderDetails?.getDepartment()?.name || "ພະແນກໄອທີ" }},
              {{ orderDetails?.getPosition()?.[0]?.name || "ພະນັກງານພັດທະນາລະບົບ" }}
            </p>
          </div>
        </div>
        <!-- ຂໍ້ມຸນຜູ້ສະເໜີ -->
        <div>
          <h4>ສະເໜີ</h4>
          <div class="grid grid-cols-4">
            <div class="grid grid-rows-2">
              <h5>ຂໍ້ສະເໜີເບີກງົບປະມານ</h5>
              <span class="text-sm">{{
                orderDetails?.getPurchaseRequest()?.purchase_request_item[0]?.title ||
                "ສະເໜີຊື້ອຸປະກອນຄອມພິວເຕີ"
              }}</span>
            </div>
            <div class="grid grid-rows-2">
              <h5>ຈຳນວນ</h5>
              <span class="text-sm">
                {{ getPurchaseOrderQuantity || 2 }}
              </span>
            </div>
            <div class="grid grid-rows-2">
              <h5>ພະແນກ</h5>
              <span class="text-sm">{{ orderDetails?.getDepartment()?.name || "ພະແນກໄອທີ" }}</span>
            </div>
            <div class="grid grid-rows-2">
              <h5>ໜ່ວຍງານ</h5>
              <span class="text-sm">{{
                orderDetails?.getPosition()?.[0]?.name || "ຝ່າຍພັດທະນາລະບົບ"
              }}</span>
            </div>
          </div>
        </div>

        <!-- Purpose -->
        <div class="mb-6">
          <h4 class="text-base font-semibold mb-2">ຈຸດປະສົງ ແລະ ລາຍການ</h4>
          <p class="text-gray-600">
            {{ getPurchaseOrderRemark || "ທົດລອງລະບົບບັນທຶກ" }}
          </p>
        </div>

        <!-- Items Table -->
        <div class="mb-6">
          <h4 class="text-base font-semibold mb-2">ລາຍການ</h4>
          <Table :columns="columnsDetails(t)" :dataSource="getItemsForTable">
            <template #index="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
            <template #title="{ record }">
              <span>{{ record.title }}</span>
            </template>
            <template #image="{ record }">
              <a-image v-if="record.imageUrl" :src="record.imageUrl" :width="50" :height="50" />
            </template>
          </Table>
          <div>
            <p class="text-gray-500 mt-2 flex justify-end">
              {{ t("purchase_qequest.table.total") }}:
              <span class="font-semibold"> {{ formatPrice(getTotalAmount) }} ₭ </span>
            </p>
          </div>
        </div>

        <div class="mb-6">
          <h4 class="text-base font-semibold mb-2">ໃບສະເໜີລາຄາ</h4>
          <div class="border rounded-lg p-4">
            <!-- แสดงข้อมูลใบเสนอราคา -->
            <div
              v-if="
                orderDetails &&
                orderDetails.getPurchaseOrderItem() &&
                orderDetails.getPurchaseOrderItem().length > 0
              "
            >
              <div v-for="(item, index) in orderDetails.getPurchaseOrderItem()" :key="index">
                <!-- รูปภาพใบเสนอราคา -->
                <img
                  v-if="item.getQuotationImageUrl()"
                  :src="item.getQuotationImageUrl() ?? undefined"
                  alt="ໃບສະເໜີລາຄາ"
                  class="max-w-md rounded-lg mb-4"
                />
                <img
                  v-else
                  src="/public/5.png"
                  alt="ໃບສະເໜີລາຄາ"
                  class="max-w-md rounded-lg mb-4"
                />

                <!-- ข้อมูลรายละเอียด -->
                <div class="grid grid-cols-2 gap-2 mb-4">
                  <div class="font-medium">ລາຍການ:</div>
                  <div class="text-gray-600">{{ item.getRemark() }}</div>

                  <div class="font-medium">ຈຳນວນ:</div>
                  <div class="text-gray-600">{{ item.getQuantity() }} ລາຍການ</div>

                  <div class="font-medium">ລາຄາຕໍ່ຫົວໜ່ວຍ:</div>
                  <div class="text-gray-600">{{ formatPrice(item.getPrice()) }} ₭</div>

                  <div class="font-medium">ລາຄາລວມ:</div>
                  <div class="text-gray-600">{{ formatPrice(item.getTotal()) }} ₭</div>

                  <div class="font-medium">ພາສີມູນຄ່າເພີ່ມ (VAT):</div>
                  <div class="text-gray-600">
                    {{ item.getIsVat() ? `${formatPrice(item.getVatTotal())} ₭` : "ບໍ່ມີ" }}
                  </div>

                  <div class="font-medium">ລາຄາລວມທັງໝົດ:</div>
                  <div class="text-gray-600 font-bold">
                    {{ formatPrice(item.getTotalWithVat()) }} ₭
                  </div>

                  <div class="font-medium">ຜູ້ຂາຍ:</div>
                  <div class="text-gray-600">{{ item.getVendorName() }}</div>

                  <div class="font-medium">ຂໍ້ມູນຕິດຕໍ່:</div>
                  <div class="text-gray-600">{{ item.getVendorContactInfo() }}</div>
                </div>
              </div>
            </div>
            <div v-else>
              <img src="/public/5.png" alt="ໃບສະເໜີລາຄາ" class="max-w-md rounded-lg" />
              <p class="text-gray-500 mt-2">ບໍ່ມີໃບສະເໜີລາຄາ</p>
            </div>
          </div>
        </div>

        <!-- ຂໍ້ມູນບັນຊີທະນາຄານ -->
        <div class="mb-6">
          <h4 class="text-base font-semibold mb-4">ຂໍ້ມູນບັນຊີຮ້ານ</h4>
          <div
            v-if="
              orderDetails &&
              orderDetails.getPurchaseOrderItem() &&
              orderDetails.getPurchaseOrderItem().length > 0
            "
          >
            <!-- ข้อมูลธนาคารจาก API -->
            <div class="grid grid-cols-2 mb-2">
              <span class="font-medium">ທະນາຄານ:</span>
              <span class="text-gray-600 flex items-center gap-2">
                <img
                  :src="
                    orderDetails.getPurchaseOrderItem()[0].getBankLogo() || '/public/bclone.png'
                  "
                  class="w-8 h-8"
                  alt="ໂລໂກ້ທະນາຄານ"
                />
                <span>{{ orderDetails.getPurchaseOrderItem()[0].getBankName() }}</span>
              </span>
            </div>
            <div class="grid grid-cols-2 mb-2">
              <span class="font-medium">ຊື່ບັນຊີ:</span>
              <span class="text-gray-600">{{
                orderDetails.getPurchaseOrderItem()[0].getAccountName()
              }}</span>
            </div>
            <div class="grid grid-cols-2">
              <span class="font-medium"
                >ເລກບັນຊີ {{ orderDetails.getPurchaseOrderItem()[0].getCurrencyCode() }}:</span
              >
              <span class="text-gray-600">{{
                orderDetails.getPurchaseOrderItem()[0].getAccountNumber()
              }}</span>
            </div>
          </div>
          <div v-else>
            <!-- ข้อมูลธนาคารสำรอง -->
            <div class="grid grid-cols-2 mb-2">
              <span class="font-medium">ທະນາຄານ:</span>
              <span class="text-gray-600 flex items-center gap-2">
                <img src="/public/bclone.png" class="w-8 h-8" alt="ໂລໂກ້ທະນາຄານ" />
                <span>BCEL One ທະນາຄານການຄ້າຕ່າງປະເທດລາວ</span>
              </span>
            </div>
            <div class="grid grid-cols-2 mb-2">
              <span class="font-medium">ຊື່ບັນຊີ:</span>
              <span class="text-gray-600">KHAMTHANOM MALAYSIN MR</span>
            </div>
            <div class="grid grid-cols-2">
              <span class="font-medium">ເລກບັນຊີ LAK:</span>
              <span class="text-gray-600">0302000410086756</span>
            </div>
          </div>
        </div>

        <!-- Signatures -->
        <div class="grid grid-cols-2 gap-6">
          <h4 class="text-base font-semibold mb-4 col-span-2">ລາຍເຊັ່ນ</h4>
          <div v-for="(sig, index) in signatures" :key="index">
            <p class="font-semibold mb-2">{{ sig.role }}</p>
            <img
              :src="sig.signature"
              :alt="`${sig.role} signature`"
              class="h-16 mb-2"
              @error="handleSignatureError"
            />
            <p class="font-semibold">{{ sig.name }}</p>
            <p class="text-gray-600">{{ sig.position }}</p>
          </div>
        </div>
        <div>
          <span>ເອກະສານທີຕິດຂັດ</span>
          <HeaderComponent
            header-title="ໃບສະເໜີຈັດຊື້ - ເລກທີ 0036/ຈຊ/ຮລຕ/ນຄຫຼ"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { columnsDetails } from "../../../views/approval-department/column/columnDetails";
import { useI18n } from "vue-i18n";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { usePurchaseOrderStore } from "@/modules/presentation/Admin/stores/purchase_requests/purchase-order";
import { useRoute } from "vue-router";
import { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import Table from "@/common/shared/components/table/Table.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { formatPrice } from "@/modules/shared/utils/format-price";
import { formatDate } from "@/modules/shared/formatdate";
import { useToggleStore } from "../../../stores/storage.store";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/authentication/auth.store";
/********************************************************* */
const purchaseOrderStore = usePurchaseOrderStore();
const route = useRoute();
const authStore = useAuthStore();
const orderId = ref<number>(parseInt(route.params.id as string, 10));
const { t } = useI18n();
const { error } = useNotification();
const visible = ref(false);
const showDrawer = () => {
  visible.value = true;
};
/**************control header****************** */
const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);
const topbarStyle = computed(() => {
  return toggle.value ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
});
/**************control header****************** */

/*********************Check State OTP**************************** *

/*******************************************/

const orderDetails = ref<PurchaseOrderEntity | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const orderItems = ref<any[]>([]);
const showApprovalSuccess = ref(false);

const getItemsForTable = computed(() => {
  if (
    orderDetails.value &&
    orderDetails.value.getPurchaseOrderItem &&
    orderDetails.value.getPurchaseOrderItem().length > 0
  ) {
    return orderDetails.value.getPurchaseOrderItem().map((item) => ({
      id: item.getId(),
      title: item.getRemark(),
      remark: item.getRemark(),
      quantity: item.getQuantity(),
      price: formatPrice(item.getPrice()),
      total: item.getTotal(),
      is_vat: item.getIsVat(),
      vat_total: item.getVatTotal(),
      total_with_vat: item.getTotalWithVat(),
      imageUrl: item.getQuotationImageUrl(),
    }));
  }
  return orderDetails.value?.getItems() ?? [];
});
const getTotalAmount = computed(() => {
  if (
    orderDetails.value &&
    orderDetails.value.getPurchaseOrderItem &&
    orderDetails.value.getPurchaseOrderItem().length > 0
  ) {
    return orderDetails.value.getPurchaseOrderItem().reduce((total, item) => {
      return total + item.getTotalWithVat();
    }, 0);
  }
  return (
    orderDetails.value?.getPurchaseRequest()?.purchase_request_item?.[0]?.total_price ||
    orderDetails.value?.getTotalWithVAT() ||
    22000000
  );
});

const getPurchaseOrderRemark = computed(() => {
  if (
    orderDetails.value &&
    orderDetails.value.getPurchaseOrderItem &&
    orderDetails.value.getPurchaseOrderItem().length > 0
  ) {
    return orderDetails.value.getPurchaseOrderItem()[0].getRemark();
  }

  return (
    orderDetails.value?.getPurchaseRequest()?.purchase_request_item?.[0]?.remark ||
    "ທົດລອງລະບົບບັນທຶກ"
  );
});

const getPurchaseOrderQuantity = computed(() => {
  if (
    orderDetails.value &&
    orderDetails.value.getPurchaseOrderItem &&
    orderDetails.value.getPurchaseOrderItem().length > 0
  ) {
    return orderDetails.value.getPurchaseOrderItem()[0].getQuantity();
  }

  return orderDetails.value?.getPurchaseRequest()?.purchase_request_item?.[0]?.quantity || 2;
});
/**********************Data Detials Order*************************** */
const fetchOrderDetails = async () => {
  try {
    if (!orderId.value) {
      error("ບໍ່ພົບລະຫັດເອກະສານ");
      return;
    }

    const result = await purchaseOrderStore.fetchById(orderId.value);
    if (result) {
      orderDetails.value = result;

      if (result.getItems && result.getItems()) {
        orderItems.value = result.getItems();
      }

    } else {
      error("ບໍ່ພົບຂໍ້ມູນເອກະສານ");
    }
  } catch (err) {
    console.error("Error fetching order details:", err);
    error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ");
  }
};

onMounted(async () => {
  await fetchOrderDetails();
});

// Get user signature from localStorage
const userSignature = computed(() => {
  // Try to get signature from auth store user data first
  if (authStore.user?.getSignature()) {
    return authStore.user.getSignature();
  }

  // Fallback to localStorage directly
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.signature;
    }
  } catch (error) {
    console.error('Error parsing userData from localStorage:', error);
  }

  // Fallback to default signature image if no signature found
  return '/public/2.png';
});

// Handle signature image error
const handleSignatureError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Fallback to default signature image if user signature fails to load
  img.src = '/public/2.png';
};

const documentDetails = {
  requester: {
    name: "ທ່ານ ພົມມະກອນ ຄວາມຄູ",
    position: "ພະນັກງານພັດທະນາລະບົບ, ຝ່າຍໄອທີ",
    avatar: "/public/4.png",
  },
  requestDate: "30 ມີນາ 2025",
  purpose:
    "ເພື່ອໃຫ້ແທດເໝາະ ໃຫ້ຮອງຮັບກັບການປະຕິບັດວຽກງານ ແລະ ເພື່ອອຳນວຍຄວາມສະດວກໃນການປະຕິບັດໜ້າທີ່ວຽກງານ",
};

// Signatures
const signatures = computed(() => [
  {
    role: "ຜູ້ສະເໜີ",
    name: authStore.user?.getUsername() || orderDetails.value?.getRequester()?.username || "ຜູ້ສະເໜີ",
    position: authStore.user?.getDepartmentName() || orderDetails.value?.getDepartment()?.name || "ພະນັກງານພັດທະນາລະບົບ",
    signature: userSignature.value,
  },
]);
</script>
