<template>
  <UiDrawer
    :open="isOpen"
    title="ລາຍລະອຽດຮ້ານຄ້າ"
    placement="right"
    :width="800"
    @update:open="handleOpenChange"
  >
    <div v-if="shopDetails" class="p-6">
      <!-- ข้อมูลบัญชีธนาคาร -->
      <div class="mb-6">
        <h4 class="text-base font-semibold mb-4">ຂໍ້ມູນບັນຊີຮ້ານ</h4>
        <div class="grid grid-cols-2 mb-2">
          <span class="font-medium">ທະນາຄານ:</span>
          <span class="text-gray-600 flex items-center gap-2">
            <img
              :src="shopDetails.getBankLogo() || '/public/bclone.png'"
              class="w-8 h-8"
              alt="ໂລໂກ້ທະນາຄານ"
            />
            <span>{{ shopDetails.getBankName() }}</span>
          </span>
        </div>
        <div class="grid grid-cols-2 mb-2">
          <span class="font-medium">ຊື່ບັນຊີ:</span>
          <span class="text-gray-600">{{ shopDetails.getAccountName() }}</span>
        </div>
        <div class="grid grid-cols-2 mb-2">
          <span class="font-medium">ເລກບັນຊີ {{ shopDetails.getCurrencyCode() }}:</span>
          <span class="text-gray-600">{{ shopDetails.getAccountNumber() }}</span>
        </div>
        <div class="grid grid-cols-2 mb-2">
          <span class="font-medium">ຜູ້ຂາຍ:</span>
          <span class="text-gray-600">{{ shopDetails.getVendorName() }}</span>
        </div>
        <div class="grid grid-cols-2">
          <span class="font-medium">ຂໍ້ມູນຕິດຕໍ່:</span>
          <span class="text-gray-600">{{ shopDetails.getVendorContactInfo() }}</span>
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
import UiDrawer from '@/common/shared/components/Darwer/UiDrawer.vue';

// Props
interface Props {
  open: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shopDetails: any; 
}

const props = withDefaults(defineProps<Props>(), {
  open: false
});

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>();

// State
const isOpen = ref(props.open);

// Methods
const handleOpenChange = (value: boolean) => {
  isOpen.value = value;
  emit('update:open', value);
};

// Watchers
watch(() => props.open, (newValue) => {
  isOpen.value = newValue;
});
</script>