<template>
  <UiDrawer
    :open="isOpen"
    title="ລາຍລະອຽດຮ້ານຄ້າ"
    placement="right"
    :width="800"
    @update:open="handleOpenChange"
  >
    <div v-if="isLoading" class="flex justify-center items-center p-8">
      loading...
    </div>

    <div v-else-if="orderDetails" class="p-6">

      <!-- ข้อมูลบัญชีธนาคาร -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-4">ຂໍ້ມູນບັນຊີຮ້ານ</h4>
        <div
          v-if="
            orderDetails &&
            orderDetails.getPurchaseOrderItem() &&
            orderDetails.getPurchaseOrderItem().length > 0
          "
        >
          <div class="grid grid-cols-2 mb-2">
            <span class="font-medium">ທະນາຄານ:</span>
            <span class="text-gray-600 flex items-center gap-2">
              <img
                :src="orderDetails.getPurchaseOrderItem()[0].getBankLogo() || '/public/bclone.png'"
                class="w-8 h-8"
                alt="ໂລໂກ້ທະນາຄານ"
              />
              <span>{{ orderDetails.getPurchaseOrderItem()[0].getBankName() }}</span>
            </span>
          </div>
          <div class="grid grid-cols-2 mb-2">
            <span class="font-medium">ຊື່ບັນຊີ:</span>
            <span class="text-gray-600">
              {{ orderDetails.getPurchaseOrderItem()[0].getAccountName() }}
            </span>
          </div>
          <div class="grid grid-cols-2 mb-2">
            <span class="font-medium">
              ເລກບັນຊີ {{ orderDetails.getPurchaseOrderItem()[0].getCurrencyCode() }}:
            </span>
            <span class="text-gray-600">
              {{ orderDetails.getPurchaseOrderItem()[0].getAccountNumber() }}
            </span>
          </div>
          <div class="grid grid-cols-2 mb-2">
            <span class="font-medium">ຜູ້ຂາຍ:</span>
            <span class="text-gray-600">{{ orderDetails.getPurchaseOrderItem()[0].getVendorName() }}</span>
          </div>
          <div class="grid grid-cols-2">
            <span class="font-medium">ຂໍ້ມູນຕິດຕໍ່:</span>
            <span class="text-gray-600">{{ orderDetails.getPurchaseOrderItem()[0].getVendorContactInfo() }}</span>
          </div>
        </div>
        <div v-else>
          <span>ບໍ່ມີຂໍ້ມູນບັນຊີ</span>
        </div>
      </div>
    </div>
    
    <div v-else class="p-6 text-center text-gray-500">
      ບໍ່ພົບຂໍ້ມູນຮ້ານຄ້າ
    </div>
  </UiDrawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
import UiDrawer from '@/common/shared/components/Darwer/UiDrawer.vue';

import { usePurchaseOrderStore } from "../../stores/purchase_requests/purchase-order";

const purchaseOrderStore = usePurchaseOrderStore();

// Props
interface Props {
  open: boolean;
  shopId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  shopId: undefined
});

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>();

// State
const isOpen = ref(props.open);
const isLoading = ref(false);
const orderDetails = ref<PurchaseOrderEntity | null>(null);

// Methods
const handleOpenChange = (value: boolean) => {
  isOpen.value = value;
  emit('update:open', value);
  if (!value) {
    orderDetails.value = null;
    isLoading.value = false;
  }
};

const fetchOrderDetails = async (id: number) => {
  try {
   
    if (!isOpen.value) return;

    isLoading.value = true;
    const result = await purchaseOrderStore.fetchById(id);
    if (isOpen.value && result) {
      orderDetails.value = result;
    }
  } catch (error) {
    console.error('Error fetching shop details:', error);
  } finally {
    isLoading.value = false;
  }
};

// Watchers
watch(
  [() => props.shopId, () => props.open],
  async ([newShopId, newOpenState]) => {
    console.log('Watch triggered:', { newShopId, newOpenState }); // debug log
    
    // อัพเดท isOpen state
    isOpen.value = newOpenState;
    
    // ถ้า drawer ปิด ให้ reset ค่า
    if (!newOpenState) {
      orderDetails.value = null;
      isLoading.value = false;
      return;
    }
    
    // ถ้า drawer เปิดและมี shopId ให้โหลดข้อมูล
    if (newOpenState && newShopId !== undefined) {
      await fetchOrderDetails(newShopId);
    }
  },
  { immediate: true }
);
</script>