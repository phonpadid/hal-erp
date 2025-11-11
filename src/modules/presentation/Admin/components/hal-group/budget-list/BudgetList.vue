<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiSelect from "@/common/shared/components/Input/InputSelect.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { Icon } from "@iconify/vue";
import Table from "@/common/shared/components/table/Table.vue";

// Interface for budget data
interface BudgetRecord {
  id: string;
  category: string;
  description: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  period: string;
  department: string;
  approvedBy: string;
  approvedDate: string;
  status: "active" | "completed" | "cancelled";
  company: string;
}

const { warning } = useNotification();

// Props
const props = defineProps<{
  companyId: number;
}>();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");
const selectedYear = ref<number>(new Date().getFullYear());
const selectedPeriod = ref<string>("all");
const selectedDepartment = ref<string>("all");
const selectedStatus = ref<string>("all");
const currentPage = ref<number>(1);
const pageSize = ref<number>(10);

// Generate years for filter
const currentYear = new Date().getFullYear();
const years = computed(() => {
  const yearOptions = [];
  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    yearOptions.push({ value: year, label: `${year}` });
  }
  return yearOptions;
});

// Period options
const periodOptions = [
  { value: "all", label: "ທຸກໄລຍະ" },
  { value: "q1", label: "ໄຕມາດ 1" },
  { value: "q2", label: "ໄຕມາດ 2" },
  { value: "q3", label: "ໄຕມາດ 3" },
  { value: "q4", label: "ໄຕມາດ 4" },
];

// Department options
const departmentOptions = [
  { value: "all", label: "ທຸກພະແນກ" },
  { value: "it", label: "ພະແນກ IT" },
  { value: "hr", label: "ພະແນກບຸລິຄະມານ" },
  { value: "finance", label: "ພະແນກບັນຊີ" },
  { value: "procurement", label: "ພະແນກຊື້" },
  { value: "operations", label: "ພະແນກປະຕິບັດຕິພັນ" },
  { value: "marketing", label: "ພະແນກການຕະຫຼາດ" },
];

// Status options
const statusOptions = [
  { value: "all", label: "ທຸກສະຖານະ" },
  { value: "active", label: "ກຳລັງໃຊ້ງົບ" },
  { value: "completed", label: "ສຳເລັດແລ້ວ" },
  { value: "cancelled", label: "ຍົກເລີກ" },
];

// Mock data for budget records - generate company-specific data
const generateMockBudgets = (companyId: number): BudgetRecord[] => {
  const categories = [
    {
      category: "ຄ່າໃຊ້ຈ່າຍບຸລິຄະມານ",
      baseAmount: 5000000,
      department: "hr",
    },
    {
      category: "ຄ່າໃຊ້ຈ່າຍ IT",
      baseAmount: 8000000,
      department: "it",
    },
    {
      category: "ຄ່າໃຊ້ຈ່າຍການຕະຫຼາດ",
      baseAmount: 6000000,
      department: "marketing",
    },
    {
      category: "ຄ່າໃຊ້ຈ່າຍການຜະລິດ",
      baseAmount: 12000000,
      department: "operations",
    },
    {
      category: "ຄ່າໃຊ້ຈ່າຍສຳນັກງານ",
      baseAmount: 3000000,
      department: "admin",
    },
    {
      category: "ຄ່າຝຶກອົບຮົມ",
      baseAmount: 2000000,
      department: "hr",
    },
    {
      category: "ງົບປະມານສະໜັບສະໜູນ",
      baseAmount: 4000000,
      department: "admin",
    },
    {
      category: "ຄ່າລົດຂົນສົ່ງ",
      baseAmount: 1500000,
      department: "operations",
    },
  ];

  const companyNames = [
    "HAL ບໍລິສັດ",
    "HAL Tech",
    "HAL Energy",
    "HAL Service",
    "HAL Logistics",
  ];

  const periods = ["Q1", "Q2", "Q3", "Q4"];
  const statuses: Array<"active" | "completed" | "cancelled"> = ["active", "completed", "cancelled"];

  const budgets: BudgetRecord[] = [];

  // Generate budget records for each quarter
  for (let q = 0; q < 4; q++) {
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const variation = 0.8 + Math.random() * 0.4; // 80% to 120% variation
      const allocated = Math.round(cat.baseAmount * variation);
      const spent = Math.round(allocated * (0.3 + Math.random() * 0.8)); // 30% to 110% of allocated

      budgets.push({
        id: `BUD${q + 1}-${String(i + 1).padStart(2, '0')}`,
        category: cat.category,
        description: `${cat.category} ໄຕມາດ ${q + 1} ${currentYear}`,
        allocatedAmount: allocated,
        spentAmount: Math.min(spent, allocated),
        remainingAmount: Math.max(0, allocated - spent),
        period: periods[q],
        department: cat.department,
        approvedBy: "ຜູ້ອຳນວຍການ",
        approvedDate: `${currentYear}-${String(q * 3 + 1).padStart(2, '0')}-01`,
        status: budgets.length % 4 === 0 ? "completed" : (budgets.length % 7 === 0 ? "cancelled" : "active"),
        company: companyNames[Math.min(companyId - 1, companyNames.length - 1)],
      });
    }
  }

  return budgets.sort((a, b) => b.period.localeCompare(a.period));
};

const mockBudgets = ref<BudgetRecord[]>([]);

// Load data
const loadData = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 800));
    mockBudgets.value = generateMockBudgets(props.companyId);
  } catch (error) {
    console.error("Error loading data:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
  } finally {
    loading.value = false;
  }
};

// Get filtered budgets
const filteredBudgets = computed(() => {
  let filtered = [...mockBudgets.value];

  // Filter by year (period already contains year info)
  if (selectedYear.value) {
    filtered = filtered.filter((budget) => budget.approvedDate.includes(selectedYear.value.toString()));
  }

  // Filter by period
  if (selectedPeriod.value !== "all") {
    filtered = filtered.filter((budget) => budget.period === selectedPeriod.value.toUpperCase());
  }

  // Filter by department
  if (selectedDepartment.value !== "all") {
    filtered = filtered.filter((budget) => budget.department === selectedDepartment.value);
  }

  // Filter by status
  if (selectedStatus.value !== "all") {
    filtered = filtered.filter((budget) => budget.status === selectedStatus.value);
  }

  // Filter by search keyword
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(
      (budget) =>
        budget.category.toLowerCase().includes(keyword) ||
        budget.description.toLowerCase().includes(keyword) ||
        budget.id.toLowerCase().includes(keyword)
    );
  }

  return filtered;
});

// Paginated budgets
const paginatedBudgets = computed(() => {
  const filtered = filteredBudgets.value;
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filtered.slice(start, end);
});

// Table columns
const tableColumns = computed(() => [
  {
    title: "ເລກທີ",
    key: "id",
    dataIndex: "id",
    width: 100,
  },
  {
    title: "ປະເພດງົບປະມານ",
    key: "category",
    dataIndex: "category",
    width: 200,
  },
  {
    title: "ລາຍລະອຽດ",
    key: "description",
    dataIndex: "description",
    width: 250,
  },
  {
    title: "ງົບປະມານທີ່ກຳນົດ",
    key: "allocatedAmount",
    dataIndex: "allocatedAmount",
    width: 150,
  },
  {
    title: "ງົບປະມານທີ່ໃຊ້",
    key: "spentAmount",
    dataIndex: "spentAmount",
    width: 150,
  },
  {
    title: "ງົບປະມານທີ່ຍັງເຫຼືອ",
    key: "remainingAmount",
    dataIndex: "remainingAmount",
    width: 150,
  },
  {
    title: "ໄລຍະ",
    key: "period",
    dataIndex: "period",
    width: 80,
  },
  {
    title: "ສະຖານະ",
    key: "status",
    dataIndex: "status",
    width: 120,
  },
]);

// Handle search
const handleSearch = (value: string) => {
  searchKeyword.value = value;
  currentPage.value = 1;
};

// Handle filter changes
const handleFilterChange = () => {
  currentPage.value = 1;
};

// Handle pagination change
const handlePaginationChange = (pagination: any) => {
  currentPage.value = pagination.current;
  pageSize.value = pagination.pageSize;
};

// Handle row click
const handleRowClick = (record: any) => {
  console.log("Budget clicked:", record);
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("LAK", "₭");
};

// Calculate usage percentage
const getUsagePercentage = (spent: number, allocated: number) => {
  return Math.round((spent / allocated) * 100);
};

// Get status badge classes
const getStatusBadgeClass = (status: string) => {
  const statusMap: { [key: string]: string } = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800";
};

// Get status label
const getStatusLabel = (status: string) => {
  const statusMap: { [key: string]: string } = {
    active: "ກຳລັງໃຊ້ງົບ",
    completed: "ສຳເລັດແລ້ວ",
    cancelled: "ຍົກເລີກ",
  };
  return statusMap[status] || status;
};

// Get usage bar color
const getUsageBarColor = (percentage: number) => {
  if (percentage >= 100) return "bg-red-500";
  if (percentage >= 80) return "bg-yellow-500";
  return "bg-green-500";
};

// Get usage text color
const getUsageTextColor = (percentage: number) => {
  if (percentage >= 100) return "text-red-600";
  if (percentage >= 80) return "text-yellow-600";
  return "text-green-600";
};

// Budget statistics
const budgetStats = computed(() => {
  const filtered = filteredBudgets.value;
  const totalAllocated = filtered.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpent = filtered.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = filtered.reduce((sum, b) => sum + b.remainingAmount, 0);

  return {
    totalAllocated,
    totalSpent,
    totalRemaining,
    usagePercentage: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0,
    totalBudgets: filtered.length,
    activeBudgets: filtered.filter(b => b.status === 'active').length,
    completedBudgets: filtered.filter(b => b.status === 'completed').length,
  };
});

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="budget-list-container">
    <!-- Budget Statistics Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ budgetStats.totalBudgets }}</div>
          <div class="text-sm text-gray-600">ງົບປະມານທັງໝົດ</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ formatCurrency(budgetStats.totalAllocated) }}</div>
          <div class="text-sm text-gray-600">ງົບປະມານທີ່ກຳນົດ</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">{{ formatCurrency(budgetStats.totalSpent) }}</div>
          <div class="text-sm text-gray-600">ງົບປະມານທີ່ໃຊ້</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ formatCurrency(budgetStats.totalRemaining) }}</div>
          <div class="text-sm text-gray-600">ງົບປະມານຍັງເຫຼືອ</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ budgetStats.activeBudgets }}</div>
          <div class="text-sm text-gray-600">ກຳລັງໃຊ້ງົບ</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-center">
          <div class="text-2xl font-bold" :class="getUsageTextColor(budgetStats.usagePercentage)">
            {{ budgetStats.usagePercentage }}%
          </div>
          <div class="text-sm text-gray-600">ອັດຕາການໃຊ້</div>
        </div>
      </div>
    </div>

    <!-- Overall Budget Usage -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">ສະຖານະການໃຊ້ງົບປະມານທັງໝົດ</h3>
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">ການໃຊ້ງົບປະມານທັງໝົດ</span>
          <span class="text-sm font-bold" :class="getUsageTextColor(budgetStats.usagePercentage)">
            {{ budgetStats.usagePercentage }}%
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            class="h-4 rounded-full transition-all duration-300"
            :class="getUsageBarColor(budgetStats.usagePercentage)"
            :style="`width: ${Math.min(budgetStats.usagePercentage, 100)}%`"
          ></div>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">ໃຊ້ໄປ: {{ formatCurrency(budgetStats.totalSpent) }}</span>
          <span class="text-gray-600">ທັງໝົດ: {{ formatCurrency(budgetStats.totalAllocated) }}</span>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <InputSearch
            v-model="searchKeyword"
            placeholder="ຄົ້ນຫາປະເພດງົບປະມານ, ລາຍລະອຽດ, ຫຼື ເລກທີ..."
            :disabled="loading"
            @search="handleSearch"
          />
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <UiFormItem>
            <UiSelect
              v-model="selectedYear"
              :options="years"
              placeholder="ເລືອກປີ"
              @change="handleFilterChange"
              :disabled="loading"
            />
          </UiFormItem>

          <UiFormItem>
            <UiSelect
              v-model="selectedPeriod"
              :options="periodOptions"
              placeholder="ໄລຍະ"
              @change="handleFilterChange"
              :disabled="loading"
            />
          </UiFormItem>

          <UiFormItem>
            <UiSelect
              v-model="selectedDepartment"
              :options="departmentOptions"
              placeholder="ພະແນກ"
              @change="handleFilterChange"
              :disabled="loading"
            />
          </UiFormItem>

          <UiFormItem>
            <UiSelect
              v-model="selectedStatus"
              :options="statusOptions"
              placeholder="ສະຖານະ"
              @change="handleFilterChange"
              :disabled="loading"
            />
          </UiFormItem>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow-sm">
      <Table
        :columns="tableColumns"
        :data-source="paginatedBudgets"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: filteredBudgets.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }"
        @row-click="handleRowClick"
        @change="handlePaginationChange"
      >
        <!-- Custom cell renderers -->
        <template #allocatedAmount="{ record }">
          <div class="text-right font-medium">
            {{ formatCurrency(record.allocatedAmount) }}
          </div>
        </template>

        <template #spentAmount="{ record }">
          <div class="text-right">
            <div class="font-medium">{{ formatCurrency(record.spentAmount) }}</div>
            <div class="text-xs text-gray-500">{{ getUsagePercentage(record.spentAmount, record.allocatedAmount) }}%</div>
          </div>
        </template>

        <template #remainingAmount="{ record }">
          <div class="text-right">
            <div class="font-medium" :class="record.remainingAmount < 0 ? 'text-red-600' : 'text-gray-900'">
              {{ formatCurrency(Math.abs(record.remainingAmount)) }}
            </div>
            <div v-if="record.remainingAmount < 0" class="text-xs text-red-600">ເກີນງົບ</div>
          </div>
        </template>

        <template #period="{ record }">
          <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
            {{ record.period }}
          </span>
        </template>

        <template #status="{ record }">
          <span
            class="px-2 py-1 rounded-full text-xs font-medium"
            :class="getStatusBadgeClass(record.status)"
          >
            {{ getStatusLabel(record.status) }}
          </span>
        </template>
      </Table>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredBudgets.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
      <Icon icon="mdi:finance" class="text-6xl text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-600 mb-2">ບໍ່ພົບຂໍ້ມູນງົບປະມານ</h3>
      <p class="text-gray-500">ລອງປັບປ່ຽນຕົວກັ່ນຕອງ ຫຼື ຄຳຄົ້ນຫາ</p>
    </div>
  </div>
</template>

<style scoped>
.budget-list-container {
  min-height: 400px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-2.md\:grid-cols-3.lg\:grid-cols-6 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-cols-2.md\:grid-cols-3.lg\:grid-cols-6 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>