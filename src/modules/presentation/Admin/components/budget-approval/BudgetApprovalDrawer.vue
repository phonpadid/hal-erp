<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { columns } from "./column";
import { useI18n } from "vue-i18n";
import { useCurrencyFormat } from "@/modules/shared/utils/useCurrencyFormat";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import Radio from "@/common/shared/components/Input/Radio.vue";
import Table, { type TableRecord } from "@/common/shared/components/table/Table.vue";
import { useBudgetItemStore } from "../../stores/budget/budget-item.store";

// State
const budgetItemStore = useBudgetItemStore();
const selectedValue = ref<string>("1");
const { formatCurrency } = useCurrencyFormat();
const { t } = useI18n();
const options = [
  { label: "ງົບປະມານລາຍຈ່າຍ", value: "1" },
  { label: "ງົບປະມານເບີກລ່ວງໜ້າ", value: "2" },
];
const selectedBudget = ref<any>(null);
const searchQuery = ref<string>("");

const isValid = computed(() => {
  return selectedBudget.value !== null;
});

const fetchData = async () => {
  const budgetType = selectedValue.value === "1" ? "expenditure" : "advance";
  await budgetItemStore.getAllReport({ page: 1, limit: 10 }, budgetType);
};

const filteredBudgetData = computed<any[]>(() => {
  const query = searchQuery.value.toLowerCase();
  const source = budgetItemStore.budgetItems;

  // console.log("Raw data:", source);

  if (!query) return source;

  return source.filter(
    (item: any) =>
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.budget_account?.code && item.budget_account.code.toLowerCase().includes(query))
  );
});
// Methods
const formatPrice = (price: number) => {
  return `${price.toLocaleString()} LAK`;
};
const handleConfirm = () => {
  if (!selectedBudget.value) return;
  emit("confirm", {
    id: Number(selectedBudget.value.id),
    budgetType: selectedValue.value === "1" ? "expenditure" : "advance",
    budgetCode: selectedBudget.value.code,
    budgetName: selectedBudget.value.name,
    budgetAmount: selectedBudget.value.amount,
  });
};

const handleRowClick = (record: TableRecord) => {
  selectedBudget.value = {
    ...record,
    id: Number(record.id),
    code: record.budget_account?.code,
    amount: record.allocated_amount,
    used: record.use_amount,
    remaining: record.balance_amount,
  };
  console.log("ข้อมูลรายการที่ถูกเลือก:", selectedBudget.value);
};

// Watchers
watch(selectedValue, () => {
  selectedBudget.value = null;
  searchQuery.value = "";
  fetchData();
});
watch(searchQuery, () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});
// Emits
const emit = defineEmits<{
  (
    e: "confirm",
    data: {
      id: number;
      budgetType: string;
      budgetCode: string;
      budgetName: string;
      budgetAmount: number;
    }
  ): void;
}>();
const getRowClassName = (record: TableRecord) => {
  return record.id === selectedBudget.value?.id ? "selected-row" : "";
};
</script>
<template>
  <div class="budget-selection-drawer">
    <div>
      <a-button type="primary" block @click="handleConfirm" :disabled="!isValid"> ສຳເລັດ </a-button>
    </div>
    <div class="header-section">
      <div class="item-details">
        <h3>ລາຍການ</h3>
        <div class="grid grid-rows-2 gap-2" v-if="selectedBudget">
          <span>{{ selectedBudget.name }}</span>
          <span class="text-red-500 font-semibold">{{ formatPrice(selectedBudget.amount) }}</span>
        </div>
        <!-- <div v-else>
          <span>{{ itemName }}</span>
          <span class="text-red-500 font-semibold">{{ formatPrice(itemPrice) }}</span>
        </div> -->
      </div>
    </div>
    <div class="budget-type-section mb-6 mt-4">
      <h3 class="text-gray-600 font-bold mb-2">ປະເພດງົບປະມານ</h3>
      <Radio v-model="selectedValue" :options="options" :gap="80" />
    </div>
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
    <div class="budget-code-section">
      <div class="flex justify-between items-center mb-4">
        <h3>ຂໍ້ມູນງົບປະມານ</h3>
        <div class="flex items-center gap-2" v-if="!selectedBudget">
          <span>ພະແນກພັດທະນາທຸລະກິດ - ລະຫັດງົບປະມານ BD 6600</span>
        </div>
      </div>
      <InputSearch v-model:value="searchQuery" placeholder="ຄົ້ນຫາ..." class="mb-4" />
      <div v-if="budgetItemStore.loading" class="text-center">
        <p>ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
      </div>
      <div v-else-if="budgetItemStore.error" class="text-center text-red-500">
        <p>ເກີດຂໍ້ຜິດພາດ: {{ budgetItemStore.error }}</p>
      </div>
      <Table
        v-else-if="selectedValue === '1'"
        :columns="columns(t)"
        :data-source="budgetItemStore.budgetItems"
        class="cursor-pointer"
        :rowClassName="getRowClassName"
        @row-click="handleRowClick"
      >
        <template #code="{ record }">
          <span>{{ record?.budget_account?.code }} - {{ record.name }}</span>
        </template>
        <template #amount="{ record }">
          <span>{{ formatCurrency(record.allocated_amount) }}</span>
        </template>
      </Table>
      <Table
        v-else
        :columns="columns(t)"
        :data-source="filteredBudgetData"
        class="cursor-pointer"
        :rowClassName="getRowClassName"
        @row-click="handleRowClick"
      >
        <template #code="{ record }">
          <span>{{ record?.getBudgetAccount()?.getCode() }} - {{ record.name }}</span>
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
