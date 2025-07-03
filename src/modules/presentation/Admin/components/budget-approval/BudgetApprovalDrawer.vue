<script setup lang="ts">
import { ref, computed } from "vue";
import { budgetData } from "@/modules/shared/utils/dataBudgetApprovalDrawer";
import { columns } from "./column";
import { useI18n } from "vue-i18n";
import { useCurrencyFormat } from "@/modules/shared/utils/useCurrencyFormat";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import Radio from "@/common/shared/components/Input/Radio.vue";
import Table from "@/common/shared/components/table/Table.vue";

// Props
interface Props {
  itemName: string;
  itemPrice: number;
}
const selectedValue = ref("1");
const { formatCurrency } = useCurrencyFormat();
const { t } = useI18n();
const options = [
  { label: "ງົບປະມານລາຍຈ່າຍ", value: "1" },
  { label: "ງົບປະມານເບີກລ່ວງໜ້າ", value: "2" },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<Props>();

// State
const selectedBudgetType = ref("expense");
const selectedBudgetCode = ref("");
const searchQuery = ref("");


const isValid = computed(() => {
  return selectedBudgetType.value && selectedBudgetCode.value;
});

// Methods
const formatPrice = (price: number) => {
  return `${price.toLocaleString()} LAK`;
};

const handleConfirm = () => {
  // Emit selected values
  emit("confirm", {
    budgetType: selectedBudgetType.value,
    budgetCode: selectedBudgetCode.value,
  });
};

// Emits
const emit = defineEmits<{
  (e: "confirm", data: { budgetType: string; budgetCode: string }): void;
}>();
</script>

<template>
  <div class="budget-selection-drawer">
    <!-- Header Section -->
    <div class="header-section">
      <div class="item-details">
        <h3>ລາຍການ</h3>
        <div class="grid grid-rows-2 gap-2">
          <span>{{ itemName }}</span>
          <span class="text-red-500 font-semibold">{{ formatPrice(itemPrice) }}</span>
        </div>
      </div>
    </div>

    <!-- Budget Type Selection -->
    <div class="budget-type-section mb-6 mt-4">
      <h3 class="text-gray-600 font-bold mb-2">ປະເພດງົບປະມານ</h3>
      <Radio v-model="selectedValue" :options="options" :gap="80" />
    </div>

    <!-- Budget Code Selection -->
    <div class="budget-code-section">
      <div class="flex justify-between items-center mb-4">
        <h3>ຂໍ້ມູນງົບປະມານ</h3>
        <div class="flex items-center gap-2">
          <span>ພະແນກພັດທະນາທຸລະກິດ - ລະຫັດງົບປະມານ BD 6600</span>
        </div>
      </div>

      <!-- Search Input -->
      <InputSearch v-model:value="searchQuery" placeholder="ຄົ້ນຫາ..." class="mb-4" />

      <!-- Budget List -->
      <Table :columns="columns(t)" :data-source="budgetData">
        <template #code="{record}">
          <span>{{ record.code }} - {{ record.name }}</span>
        </template>
        <template #amount="{record}">
          <span>{{formatCurrency( record.amount )}}</span>
        </template>
      </Table>
    </div>

    <!-- Footer Actions -->
    <div class="footer-actions fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
      <a-button type="primary" block @click="handleConfirm" :disabled="!isValid"> ສຳເລັດ </a-button>
    </div>
  </div>
</template>

<style scoped>
.budget-radio :deep(.ant-radio) {
  display: none;
}

.budget-radio :deep(.ant-radio-wrapper) {
  width: 100%;
  margin-right: 0;
}

.budget-radio :deep(.ant-radio-wrapper-checked) .border {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.budget-list :deep(.ant-radio-wrapper) {
  width: 100%;
  margin-right: 0;
}

.budget-list :deep(.ant-radio-wrapper-checked) .border {
  border-color: #1890ff;
  background-color: #e6f7ff;
}
</style>
