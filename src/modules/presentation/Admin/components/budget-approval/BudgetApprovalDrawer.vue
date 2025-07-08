<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { budgetData, budgetAdvanceData } from "@/modules/shared/utils/dataBudgetApprovalDrawer";
import { columns } from "./column";
import { useI18n } from "vue-i18n";
import { useCurrencyFormat } from "@/modules/shared/utils/useCurrencyFormat";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import Radio from "@/common/shared/components/Input/Radio.vue";
import Table, { type TableRecord } from "@/common/shared/components/table/Table.vue";

// Props
interface Props {
  itemName: string;
  itemPrice: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<Props>();
export interface BudgetItem extends TableRecord {
  id?: string; // ทำให้ id เป็น optional
  code: string;
  name: string;
  amount: number;
  used?: number;
  remaining?: number;
}

// State
const selectedValue = ref<string>("1");
const { formatCurrency } = useCurrencyFormat();
const { t } = useI18n();
const options = [
  { label: "ງົບປະມານລາຍຈ່າຍ", value: "1" },
  { label: "ງົບປະມານເບີກລ່ວງໜ້າ", value: "2" },
];

// const selectedBudgetType = ref<string>("expense");
const selectedBudgetCode = ref<string>("");
const searchQuery = ref<string>("");

// ข้อมูลที่เลือก
const selectedBudget = ref<any>(null);

// กรองข้อมูลตามการค้นหา - ใช้ any[] เพื่อความยืดหยุ่น
const filteredBudgetData = computed<any[]>(() => {
  const query = searchQuery.value.toLowerCase();
  // กำหนดให้ชัดเจนว่า budgetData เป็นอะไร
  const source: any[] = selectedValue.value === "1" ? budgetData : budgetAdvanceData;

  if (!query) return source;

  return source.filter(
    (item) =>
      (item.code && item.code.toLowerCase().includes(query)) ||
      (item.name && item.name.toLowerCase().includes(query))
  );
});

const isValid = computed(() => {
  return selectedBudget.value !== null;
});

// Methods
const formatPrice = (price: number) => {
  return `${price.toLocaleString()} LAK`;
};

const handleConfirm = () => {
  if (!selectedBudget.value) return;

  // Emit selected values
  emit("confirm", {
    budgetType: selectedValue.value === "1" ? "expense" : "advance",
    budgetCode: selectedBudget.value.code,
    budgetName: selectedBudget.value.name,
    budgetAmount: selectedBudget.value.amount,
  });
};

// เมื่อกดคลิกที่แถวในตาราง - ใช้ type TableRecord แทน
const handleRowClick = (record: TableRecord) => {
  selectedBudget.value = record;
  selectedBudgetCode.value = record.code;
};

// เมื่อเปลี่ยน radio option ให้ reset ข้อมูลที่เลือก
watch(selectedValue, () => {
  selectedBudget.value = null;
  selectedBudgetCode.value = "";
});

// Emits
const emit = defineEmits<{
  (
    e: "confirm",
    data: {
      budgetType: string;
      budgetCode: string;
      budgetName: string;
      budgetAmount: number;
    }
  ): void;
}>();
const getRowClassName = (record: TableRecord) => {
  return record.code === selectedBudgetCode.value ? "selected-row" : "";
};
</script>

<template>
  <div class="budget-selection-drawer">
    <div>
      <a-button type="primary" block @click="handleConfirm" :disabled="!isValid"> ສຳເລັດ </a-button>
    </div>
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

    <!-- Selected Budget Detail (แสดงเฉพาะเมื่อมีการเลือกรายการ) -->
    <div v-if="selectedBudget" class="mb-6">
      <div class="mb-2">
        <h4 class="text-gray-600 font-bold">ລະຫັດງົບປະມານທີ່ເລືອກ</h4>
        <div class="bg-blue-100 py-2 px-4 rounded-full inline-block text-blue-700 font-medium mt-1">
          {{ selectedBudget.code }} - {{ selectedBudget.name }}
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mt-4">
        <div>
          <h5 class="text-gray-500 text-sm">ງົບປະມານທີ່ຍັງເຫຼືອ</h5>
          <p class="font-semibold">{{ formatCurrency(selectedBudget.amount) }}</p>
        </div>
        <div>
          <h5 class="text-gray-500 text-sm">ງົບປະມານທີ່ໃຊ້ແລ້ວ</h5>
          <p class="font-semibold">{{ formatCurrency(selectedBudget.used || 0) }}</p>
        </div>
        <div>
          <h5 class="text-gray-500 text-sm">ງົບປະມານຄົງປີ</h5>
          <p class="font-semibold">{{ formatCurrency(selectedBudget.remaining || 0) }}</p>
        </div>
      </div>

      <div class="mt-3 text-sm text-gray-500">
        <span>ຜູ້ມີງົບປະມານ </span>
        <span class="text-blue-600">ພະແນກພັດທະນາທຸລະກິດ - ລະຫັດງົບປະມານ BD 6600</span>
      </div>
    </div>

    <!-- Budget Code Selection -->
    <div class="budget-code-section">
      <div class="flex justify-between items-center mb-4">
        <h3>ຂໍ້ມູນງົບປະມານ</h3>
        <div class="flex items-center gap-2" v-if="!selectedBudget">
          <span>ພະແນກພັດທະນາທຸລະກິດ - ລະຫັດງົບປະມານ BD 6600</span>
        </div>
      </div>

      <!-- Search Input -->
      <InputSearch v-model:value="searchQuery" placeholder="ຄົ້ນຫາ..." class="mb-4" />

      <!-- Budget List -->
      <Table
        v-if="selectedValue === '1'"
        :columns="columns(t)"
        :data-source="filteredBudgetData"
        class="cursor-pointer"
        :rowClassName="getRowClassName"
        @row-click="handleRowClick"
      >
        <template #code="{ record }">
          <span>{{ record.code }} - {{ record.name }}</span>
        </template>
        <template #amount="{ record }">
          <span>{{ formatCurrency(record.amount) }}</span>
        </template>
      </Table>

      <!-- Advance Budget List -->
      <Table
        v-else
        :columns="columns(t)"
        :data-source="filteredBudgetData"
        class="cursor-pointer"
        :rowClassName="getRowClassName"
        @row-click="handleRowClick"
      >
        <template #code="{ record }">
          <span>{{ record.code }} - {{ record.name }}</span>
        </template>
        <template #amount="{ record }">
          <span>{{ formatCurrency(record.amount) }}</span>
        </template>
        <template #used="{ record }">
          <span>{{ formatCurrency(record.used || 0) }}</span>
        </template>
        <template #remaining="{ record }">
          <span class="text-green-600">{{ formatCurrency(record.remaining || 0) }}</span>
        </template>
      </Table>
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

:deep(.selected-row) {
  background-color: #e6f7ff;
}
</style>
