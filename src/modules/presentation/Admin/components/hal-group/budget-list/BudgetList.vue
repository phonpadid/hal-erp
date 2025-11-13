<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiSelect from "@/common/shared/components/Input/InputSelect.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { Icon } from "@iconify/vue";
import Table, { type TableRecord, type TablePaginationType } from "@/common/shared/components/table/Table.vue";

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
const selectedTopDepartmentsYear = ref<number>(new Date().getFullYear());
const selectedTopDepartmentsMonth = ref<number>(new Date().getMonth() + 1);
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

// Month options
const monthOptions = [
  { value: 1, label: "ມັງກອນ" },
  { value: 2, label: "ກຸມພາ" },
  { value: 3, label: "ມີນາ" },
  { value: 4, label: "ເມສາ" },
  { value: 5, label: "ພຶດສະພາ" },
  { value: 6, label: "ມິຖຸນາ" },
  { value: 7, label: "ກໍລະກົດ" },
  { value: 8, label: "ສິງຫາ" },
  { value: 9, label: "ກັນຍາ" },
  { value: 10, label: "ຕຸລາ" },
  { value: 11, label: "ພະຈິກ" },
  { value: 12, label: "ທັນວາ" },
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
        status: budgets.length % 4 === 0 ? "completed" : (budgets.length % 7 === 0 ? "cancelled" : "active") as "active" | "completed" | "cancelled",
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
const handlePaginationChange = (pagination: TablePaginationType, _filters: Record<string, string[]>, _sorter: any) => {
  currentPage.value = pagination.current || 1;
  pageSize.value = pagination.pageSize || 10;
};

// Handle row click
const handleRowClick = (record: TableRecord) => {
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

// Company budget usage by year
const companyBudgetUsage = computed(() => {
  const yearBudgets = mockBudgets.value.filter(budget =>
    budget.approvedDate.includes(selectedYear.value.toString())
  );

  const totalAllocated = yearBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpent = yearBudgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const usagePercentage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return {
    totalAllocated,
    totalSpent,
    usagePercentage,
    remaining: Math.max(0, totalAllocated - totalSpent)
  };
});

// Top 3 departments by budget usage for selected month/year
const topDepartmentsByBudget = computed(() => {
  const monthYearBudgets = mockBudgets.value.filter(budget => {
    const budgetDate = new Date(budget.approvedDate);
    const budgetMonth = budgetDate.getMonth() + 1;
    const budgetYear = budgetDate.getFullYear();

    return budgetMonth === selectedTopDepartmentsMonth.value &&
           budgetYear === selectedTopDepartmentsYear.value;
  });

  // Group by department
  const departmentSpending: { [key: string]: { spent: number; allocated: number; name: string } } = {};

  monthYearBudgets.forEach(budget => {
    if (!departmentSpending[budget.department]) {
      const dept = departmentOptions.find(d => d.value === budget.department);
      departmentSpending[budget.department] = {
        spent: 0,
        allocated: 0,
        name: dept ? dept.label : budget.department
      };
    }
    departmentSpending[budget.department].spent += budget.spentAmount;
    departmentSpending[budget.department].allocated += budget.allocatedAmount;
  });

  // Convert to array and sort by spent amount
  const sortedDepartments = Object.entries(departmentSpending)
    .map(([dept, data]) => ({
      department: dept,
      name: data.name,
      spent: data.spent,
      allocated: data.allocated,
      percentage: data.allocated > 0 ? Math.round((data.spent / data.allocated) * 100) : 0
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  const totalSpent = sortedDepartments.reduce((sum, dept) => sum + dept.spent, 0);

  // Add percentage for pie chart
  return sortedDepartments.map(dept => ({
    ...dept,
    piePercentage: totalSpent > 0 ? Math.round((dept.spent / totalSpent) * 100) : 0
  }));
});

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="budget-list-container">
    <!-- New Budget Statistics Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Box 1: Company Budget Usage by Year -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">ການໃຊ້ງົບປະມານຂອງບໍລິສັດ</h3>
          <UiFormItem class="w-32">
            <UiSelect
              v-model="selectedYear"
              :options="years"
              placeholder="ເລືອກປີ"
              :disabled="loading"
            />
          </UiFormItem>
        </div>

        <!-- Company Budget Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <!-- Annual Budget -->
          <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-blue-600 font-medium">ງົບປະມານຕົ້ນປີ</div>
                <div class="text-2xl font-bold text-blue-900 mt-1">
                  {{ formatCurrency(companyBudgetUsage.totalAllocated) }}
                </div>
              </div>
              <div class="p-3 bg-blue-200 rounded-full">
                <Icon icon="mdi:account-balance" class="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <!-- Used Budget -->
          <div class="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-orange-600 font-medium">ງົບປະມານທີ່ໃຊ້ແລ້ວ</div>
                <div class="text-2xl font-bold text-orange-900 mt-1">
                  {{ formatCurrency(companyBudgetUsage.totalSpent) }}
                </div>
              </div>
              <div class="p-3 bg-orange-200 rounded-full">
                <Icon icon="mdi:cash-minus" class="text-orange-600 text-xl" />
              </div>
            </div>
          </div>

          <!-- Usage Percentage -->
          <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-green-600 font-medium">ອັດຕາການໃຊ້ໄປ (%)</div>
                <div class="text-2xl font-bold text-green-900 mt-1">
                  {{ companyBudgetUsage.usagePercentage }}%
                </div>
              </div>
              <div class="p-3 bg-green-200 rounded-full">
                <Icon icon="mdi:percent" class="text-green-600 text-xl" />
              </div>
            </div>
            <!-- Progress Bar -->
            <div class="mt-3">
              <div class="w-full bg-green-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="companyBudgetUsage.usagePercentage > 100 ? 'bg-red-500' : 'bg-green-500'"
                  :style="`width: ${Math.min(companyBudgetUsage.usagePercentage, 100)}%`"
                ></div>
              </div>
            </div>
          </div>

          <!-- Remaining Budget -->
          <div class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-purple-600 font-medium">ງົບປະມານທີ່ຍັງເຫຼືອ</div>
                <div class="text-2xl font-bold text-purple-900 mt-1">
                  {{ formatCurrency(companyBudgetUsage.remaining) }}
                </div>
              </div>
              <div class="p-3 bg-purple-200 rounded-full">
                <Icon icon="mdi:cash-plus" class="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Box 2: Top 3 Departments by Budget Usage -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">3 ອັນດັບພະແນກທີ່ໃຊ້ງົບປະມານຫຼາຍ</h3>
          <div class="flex gap-2">
            <UiFormItem class="w-28">
              <UiSelect
                v-model="selectedTopDepartmentsMonth"
                :options="monthOptions"
                placeholder="ເລືອກເດືອນ"
                :disabled="loading"
              />
            </UiFormItem>
            <UiFormItem class="w-24">
              <UiSelect
                v-model="selectedTopDepartmentsYear"
                :options="years"
                placeholder="ເລືອກປີ"
                :disabled="loading"
              />
            </UiFormItem>
          </div>
        </div>

        <!-- Top Departments List -->
        <div v-if="topDepartmentsByBudget.length > 0" class="space-y-4">
          <!-- Pie Chart (Simple CSS Version) -->
          <div class="flex justify-center mb-6">
            <div class="relative w-40 h-40">
              <!-- Pie Chart using conic-gradient -->
              <div
                class="w-40 h-40 rounded-full shadow-lg"
                :style="`background: conic-gradient(
                  ${topDepartmentsByBudget[0] ? '#3B82F6 0% ' + topDepartmentsByBudget[0].piePercentage + '%' : '#E5E7EB 0% 33.33%'},
                  ${topDepartmentsByBudget[1] ? '#10B981 ' + topDepartmentsByBudget[0].piePercentage + '% ' + (topDepartmentsByBudget[0].piePercentage + topDepartmentsByBudget[1].piePercentage) + '%' : '#E5E7EB 33.33% 66.66%'},
                  ${topDepartmentsByBudget[2] ? '#F59E0B ' + (topDepartmentsByBudget[0].piePercentage + topDepartmentsByBudget[1].piePercentage) + '% ' + (topDepartmentsByBudget[0].piePercentage + topDepartmentsByBudget[1].piePercentage + topDepartmentsByBudget[2].piePercentage) + '%' : '#E5E7EB 66.66% 100%'}
                )`"
              ></div>
              <!-- Center circle for donut effect -->
              <div class="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                <div class="text-center">
                  <div class="text-lg font-bold text-gray-900">{{ topDepartmentsByBudget.length }}</div>
                  <div class="text-xs text-gray-500">ພະແນກ</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Department Rankings -->
          <div class="space-y-3">
            <div
              v-for="(dept, index) in topDepartmentsByBudget"
              :key="dept.department"
              class="flex items-center gap-4 p-3 rounded-lg border"
              :class="{
                'border-blue-200 bg-blue-50': index === 0,
                'border-green-200 bg-green-50': index === 1,
                'border-orange-200 bg-orange-50': index === 2
              }"
            >
              <!-- Rank Badge -->
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  :class="{
                    'bg-blue-500': index === 0,
                    'bg-green-500': index === 1,
                    'bg-orange-500': index === 2
                  }"
                >
                  {{ index + 1 }}
                </div>
              </div>

              <!-- Department Info -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">{{ dept.name }}</div>
                <div class="text-sm text-gray-600">{{ formatCurrency(dept.spent) }}</div>
              </div>

              <!-- Usage Percentage -->
              <div class="text-right">
                <div class="text-lg font-bold" :class="getUsageTextColor(dept.percentage)">
                  {{ dept.percentage }}%
                </div>
                <div class="text-xs text-gray-500">ຂອງງົບທີ່ກຳນົດ</div>
              </div>

              <!-- Mini Progress Bar -->
              <div class="w-20">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getUsageBarColor(dept.percentage)"
                    :style="`width: ${Math.min(dept.percentage, 100)}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="flex justify-center gap-4 mt-4">
            <div v-if="topDepartmentsByBudget[0]" class="flex items-center gap-2">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span class="text-xs text-gray-600">{{ topDepartmentsByBudget[0].name }}</span>
            </div>
            <div v-if="topDepartmentsByBudget[1]" class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-xs text-gray-600">{{ topDepartmentsByBudget[1].name }}</span>
            </div>
            <div v-if="topDepartmentsByBudget[2]" class="flex items-center gap-2">
              <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span class="text-xs text-gray-600">{{ topDepartmentsByBudget[2].name }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <Icon icon="mdi:chart-pie" class="text-4xl text-gray-300 mx-auto mb-2" />
          <p class="text-gray-500 text-sm">ບໍ່ມີຂໍ້ມູນການໃຊ້ງົບປະມານໃນເດືອນທີ່ເລືອກ</p>
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