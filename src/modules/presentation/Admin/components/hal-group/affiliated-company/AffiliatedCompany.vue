<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiSelect from "@/common/shared/components/Input/InputSelect.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import { Icon } from "@iconify/vue";
import Table, {
  type TableRecord,
  type TablePaginationType,
} from "@/common/shared/components/table/Table.vue";

// Interface for company data
interface AffiliatedCompany {
  id: number;
  name: string;
  logo: string;
  logo_url?: string;
  proposalCount: number;
  budget: number;
  budgetUsed: number;
  color: string;
  status: "active" | "inactive" | "pending";
  contractType: "annual" | "project" | "service";
  establishedYear: number;
  employees: number;
  registrationNumber: string;
}

// Props
const props = withDefaults(
  defineProps<{
    statistics?: {
      totalCompanies: number;
      totalBudget: number;
      totalEmployees: number;
    };
    companiesFromAPI?: Array<{
      id: number;
      name: string;
      logo: string;
      logo_url?: string;
      tel: string;
      email: string;
      address: string;
      created_at: string;
      updated_at: string;
      receipt_count: number;
      total_allocated: number;
      total_used_amount: number;
    }>;
    loading?: boolean;
  }>(),
  {
    statistics: undefined,
    companiesFromAPI: undefined,
    loading: false,
  }
);

const { warning } = useNotification();

// Emits
const emit = defineEmits<{
  (e: "view-details", company: AffiliatedCompany): void;
}>();

// Helper function to generate random color
const getRandomColor = () => {
  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#ef4444", // red
    "#8b5cf6", // purple
    "#f97316", // orange
    "#ec4899", // pink
    "#14b8a6", // teal
    "#6b7280", // gray
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// State
const localLoading = ref<boolean>(false);

const searchKeyword = ref<string>("");
const currentPage = ref<number>(1);
const pageSize = ref<number>(10);

// Filter state
const filters = reactive({
  year: new Date().getFullYear(),
  status: "all",
  contractType: "all",
  sortBy: "name",
  sortOrder: "asc" as "asc" | "desc",
});

// Status options
const statusOptions = [
  { value: "all", label: "ທັງໝົດ" },
  { value: "active", label: "ກຳລັງຜູກສັນຍາ" },
  { value: "inactive", label: "ສິ້ນສຸດສັນຍາ" },
  { value: "pending", label: "ລໍຖ້າອະນຸມັດ" },
];

// Contract type options
const contractTypeOptions = [
  { value: "all", label: "ທັງໝົດ" },
  { value: "annual", label: "ປະຈຳປີ" },
  { value: "project", label: "ຕາມໂຄງການ" },
  { value: "service", label: "ບໍລິການ" },
];

// Sort options
const sortOptions = [
  { value: "name", label: "ຊື່ບໍລິສັດ" },
  { value: "budget", label: "ງົບປະມານ" },
  { value: "employees", label: "ຈຳນວນພະນັກງານ" },
  { value: "establishedYear", label: "ປີທີ່ສ້າງ" },
];

// Paginated companies data
const paginatedCompanies = computed(() => {
  const filtered = filteredCompanies.value;
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filtered.slice(start, end);
});

// Mock data for affiliated companies (20 companies)
const mockAffiliatedCompanies: AffiliatedCompany[] = [
  {
    id: 1,
    name: "HAL ບໍລິສັດ",
    logo: "mdi:company",
    proposalCount: 45,
    budget: 50000000,
    budgetUsed: 55000000,
    color: "blue",
    status: "active",
    contractType: "annual",
    establishedYear: 2015,
    employees: 250,
    registrationNumber: "HAL-001-2015",
  },
  {
    id: 2,
    name: "HAL Tech",
    logo: "mdi:rocket-launch",
    proposalCount: 38,
    budget: 40000000,
    budgetUsed: 28000000,
    color: "green",
    status: "active",
    contractType: "annual",
    establishedYear: 2018,
    employees: 180,
    registrationNumber: "HLT-002-2018",
  },
  {
    id: 3,
    name: "HAL Energy",
    logo: "mdi:lightning-bolt",
    proposalCount: 52,
    budget: 60000000,
    budgetUsed: 75000000,
    color: "yellow",
    status: "active",
    contractType: "project",
    establishedYear: 2016,
    employees: 320,
    registrationNumber: "HLE-003-2016",
  },
  {
    id: 4,
    name: "HAL Service",
    logo: "mdi:account-tie",
    proposalCount: 29,
    budget: 30000000,
    budgetUsed: 22000000,
    color: "purple",
    status: "active",
    contractType: "service",
    establishedYear: 2017,
    employees: 150,
    registrationNumber: "HLS-004-2017",
  },
  {
    id: 5,
    name: "HAL Logistics",
    logo: "mdi:truck",
    proposalCount: 18,
    budget: 25000000,
    budgetUsed: 18000000,
    color: "orange",
    status: "active",
    contractType: "annual",
    establishedYear: 2019,
    employees: 120,
    registrationNumber: "HLL-005-2019",
  },
  {
    id: 6,
    name: "HAL Construction",
    logo: "mdi:hammer",
    proposalCount: 42,
    budget: 55000000,
    budgetUsed: 65000000,
    color: "red",
    status: "active",
    contractType: "project",
    establishedYear: 2014,
    employees: 280,
    registrationNumber: "HLC-006-2014",
  },
  {
    id: 7,
    name: "HAL Agriculture",
    logo: "mdi:tractor",
    proposalCount: 25,
    budget: 35000000,
    budgetUsed: 25000000,
    color: "teal",
    status: "active",
    contractType: "annual",
    establishedYear: 2020,
    employees: 95,
    registrationNumber: "HLA-007-2020",
  },
  {
    id: 8,
    name: "HAL Education",
    logo: "mdi:school",
    proposalCount: 33,
    budget: 45000000,
    budgetUsed: 30000000,
    color: "indigo",
    status: "active",
    contractType: "service",
    establishedYear: 2018,
    employees: 140,
    registrationNumber: "HLE-008-2018",
  },
  {
    id: 9,
    name: "HAL Healthcare",
    logo: "mdi:hospital",
    proposalCount: 48,
    budget: 70000000,
    budgetUsed: 85000000,
    color: "pink",
    status: "active",
    contractType: "annual",
    establishedYear: 2016,
    employees: 380,
    registrationNumber: "HLH-009-2016",
  },
  {
    id: 10,
    name: "HAL Finance",
    logo: "mdi:bank",
    proposalCount: 36,
    budget: 48000000,
    budgetUsed: 32000000,
    color: "cyan",
    status: "active",
    contractType: "service",
    establishedYear: 2017,
    employees: 165,
    registrationNumber: "HLF-010-2017",
  },
  {
    id: 11,
    name: "HAL Digital",
    logo: "mdi:cellphone",
    proposalCount: 41,
    budget: 52000000,
    budgetUsed: 48000000,
    color: "blue",
    status: "active",
    contractType: "project",
    establishedYear: 2021,
    employees: 200,
    registrationNumber: "HLD-011-2021",
  },
  {
    id: 12,
    name: "HAL Food & Beverage",
    logo: "mdi:food",
    proposalCount: 22,
    budget: 28000000,
    budgetUsed: 19000000,
    color: "green",
    status: "pending",
    contractType: "annual",
    establishedYear: 2022,
    employees: 85,
    registrationNumber: "HLF-012-2022",
  },
  {
    id: 13,
    name: "HAL Tourism",
    logo: "mdi:airplane",
    proposalCount: 15,
    budget: 20000000,
    budgetUsed: 12000000,
    color: "orange",
    status: "active",
    contractType: "service",
    establishedYear: 2020,
    employees: 65,
    registrationNumber: "HLT-013-2020",
  },
  {
    id: 14,
    name: "HAL Manufacturing",
    logo: "mdi:factory",
    proposalCount: 58,
    budget: 75000000,
    budgetUsed: 82000000,
    color: "gray",
    status: "active",
    contractType: "annual",
    establishedYear: 2015,
    employees: 420,
    registrationNumber: "HLM-014-2015",
  },
  {
    id: 15,
    name: "HAL Real Estate",
    logo: "mdi:home",
    proposalCount: 31,
    budget: 65000000,
    budgetUsed: 58000000,
    color: "brown",
    status: "active",
    contractType: "project",
    establishedYear: 2019,
    employees: 110,
    registrationNumber: "HLR-015-2019",
  },
  {
    id: 16,
    name: "HAL Media",
    logo: "mdi:television",
    proposalCount: 27,
    budget: 32000000,
    budgetUsed: 29000000,
    color: "purple",
    status: "active",
    contractType: "service",
    establishedYear: 2021,
    employees: 75,
    registrationNumber: "HLM-016-2021",
  },
  {
    id: 17,
    name: "HAL Consulting",
    logo: "mdi:briefcase",
    proposalCount: 35,
    budget: 38000000,
    budgetUsed: 34000000,
    color: "indigo",
    status: "active",
    contractType: "service",
    establishedYear: 2020,
    employees: 92,
    registrationNumber: "HLC-017-2020",
  },
  {
    id: 18,
    name: "HAL Transport",
    logo: "mdi:bus",
    proposalCount: 20,
    budget: 22000000,
    budgetUsed: 16000000,
    color: "yellow",
    status: "inactive",
    contractType: "annual",
    establishedYear: 2018,
    employees: 58,
    registrationNumber: "HLT-018-2018",
  },
  {
    id: 19,
    name: "HAL Telecom",
    logo: "mdi:phone",
    proposalCount: 44,
    budget: 58000000,
    budgetUsed: 51000000,
    color: "blue",
    status: "active",
    contractType: "project",
    establishedYear: 2017,
    employees: 195,
    registrationNumber: "HLT-019-2017",
  },
  {
    id: 20,
    name: "HAL Water Solutions",
    logo: "mdi:water",
    proposalCount: 17,
    budget: 18000000,
    budgetUsed: 14000000,
    color: "cyan",
    status: "pending",
    contractType: "project",
    establishedYear: 2023,
    employees: 42,
    registrationNumber: "HLW-020-2023",
  },
];

// Get filtered companies
const filteredCompanies = computed(() => {
  // Use companies from API if provided, otherwise use mock data
  let filtered = props.companiesFromAPI
    ? props.companiesFromAPI.map((company) => ({
        id: company.id,
        name: company.name,
        logo: company.logo,
        logo_url: company.logo_url,
        proposalCount: company.receipt_count,
        budget: company.total_allocated,
        budgetUsed: company.total_used_amount,
        color: getRandomColor(),
        status: "active" as "active" | "inactive" | "pending",
        contractType: "annual" as "annual" | "project" | "service",
        establishedYear: new Date().getFullYear() - Math.floor(Math.random() * 10),
        employees: Math.floor(Math.random() * 100) + 10,
        registrationNumber: `HLW-${String(company.id).padStart(
          3,
          "0"
        )}-${new Date().getFullYear()}`,
        tel: company.tel,
        email: company.email,
        address: company.address,
        created_at: company.created_at,
        updated_at: company.updated_at,
      }))
    : [...mockAffiliatedCompanies];

  // Filter by status
  if (filters.status !== "all") {
    filtered = filtered.filter((company) => company.status === filters.status);
  }

  // Filter by contract type
  if (filters.contractType !== "all") {
    filtered = filtered.filter((company) => company.contractType === filters.contractType);
  }

  // Filter by search keyword
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(
      (company) =>
        company.name.toLowerCase().includes(keyword) ||
        company.registrationNumber.toLowerCase().includes(keyword)
    );
  }

  // Sort companies
  filtered.sort((a, b) => {
    const aValue = a[filters.sortBy as keyof AffiliatedCompany];
    const bValue = b[filters.sortBy as keyof AffiliatedCompany];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return filters.sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return filtered;
});

// Statistics
const statistics = computed(() => {
  // If props.statistics is provided (from API), use it; otherwise calculate from companies data
  if (props.statistics) {
    const filtered = filteredCompanies.value;
    const activeCount = filtered.filter((c) => c.status === "active").length;
    const totalBudgetUsed = filtered.reduce((sum, c) => sum + c.budgetUsed, 0);

    return {
      totalCompanies: props.statistics.totalCompanies,
      activeCompanies: activeCount,
      totalBudget: props.statistics.totalBudget,
      totalBudgetUsed,
      totalEmployees: props.statistics.totalEmployees,
      avgEmployees:
        props.statistics.totalCompanies > 0
          ? Math.round(props.statistics.totalEmployees / props.statistics.totalCompanies)
          : 0,
    };
  }

  // Calculate from companies data (fallback)
  const filtered = filteredCompanies.value;
  const activeCount = filtered.filter((c) => c.status === "active").length;
  const totalBudget = filtered.reduce((sum, c) => sum + c.budget, 0);
  const totalBudgetUsed = filtered.reduce((sum, c) => sum + c.budgetUsed, 0);
  const totalEmployees = filtered.reduce((sum, c) => sum + c.employees, 0);

  return {
    totalCompanies: filtered.length,
    activeCompanies: activeCount,
    totalBudget,
    totalBudgetUsed,
    totalEmployees,
    avgEmployees: filtered.length > 0 ? Math.round(totalEmployees / filtered.length) : 0,
  };
});

// Table columns
const tableColumns = computed(() => [
  {
    title: "ບໍລິສັດ",
    key: "company",
    dataIndex: "name",
    width: 200,
  },
  {
    title: "ໃບສະເໜີ",
    key: "proposalCount",
    dataIndex: "proposalCount",
    width: 100,
  },
  {
    title: "ງົບປະມານຕົ້ນປີ",
    key: "budget",
    dataIndex: "budget",
    width: 150,
  },
  {
    title: "ທີ່ໃຊ້ແລ້ວ",
    key: "budgetUsed",
    dataIndex: "budgetUsed",
    width: 150,
  },
  {
    title: "Action",
    key: "action",
    width: 120,
  },
]);

// Load data
const loadData = async () => {
  localLoading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 800));
  } catch (error) {
    console.error("Error loading data:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
  } finally {
    localLoading.value = false;
  }
};

// Handle search
const handleSearch = (value: string) => {
  searchKeyword.value = value;
};

// Handle filter changes
const handleFilterChange = () => {
  // Filter logic is handled by computed property
};
// Handle row click
const handleRowClick = (record: TableRecord) => {
  console.log("Company clicked:", record);
};
// Handle pagination change
const handlePaginationChange = (
  pagination: TablePaginationType,
  _filters: Record<string, string[]>
) => {
  currentPage.value = pagination.current || 1;
  pageSize.value = pagination.pageSize || 10;
};

// Handle view details
const handleViewDetails = (record: AffiliatedCompany) => {
  emit("view-details", record);
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

// Format large numbers with abbreviations
const formatLargeNumber = (amount: number) => {
  if (amount >= 1000000000) {
    return `₭${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `₭${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₭${(amount / 1000).toFixed(1)}K`;
  }
  return `₭${amount}`;
};

// Calculate budget percentage
const getBudgetPercentage = (budgetUsed: number, budget: number) => {
  return Math.round((budgetUsed / budget) * 100);
};

// Get color classes for company logos
const getLogoBgColor = (color: string) => {
  const colorMap: { [key: string]: string } = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    yellow: "bg-yellow-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
    red: "bg-red-100",
    teal: "bg-teal-100",
    indigo: "bg-indigo-100",
    pink: "bg-pink-100",
    cyan: "bg-cyan-100",
    gray: "bg-gray-100",
    brown: "bg-brown-100",
  };
  return colorMap[color] || "bg-gray-100";
};

const getLogoTextColor = (color: string) => {
  const colorMap: { [key: string]: string } = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600",
    teal: "text-teal-600",
    indigo: "text-indigo-600",
    pink: "text-pink-600",
    cyan: "text-cyan-600",
    gray: "text-gray-600",
    brown: "text-brown-600",
  };
  return colorMap[color] || "text-gray-600";
};

// Get status badge classes
const getStatusBadgeClass = (status: string) => {
  const statusMap: { [key: string]: string } = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800";
};

// Get status label
const getStatusLabel = (status: string) => {
  const statusMap: { [key: string]: string } = {
    active: "ກຳລັງຜູກສັນຍາ",
    inactive: "ສິ້ນສຸດສັນຍາ",
    pending: "ລໍຖ້າອະນຸມັດ",
  };
  return statusMap[status] || status;
};

// Get contract type label
const getContractTypeLabel = (type: string) => {
  const typeMap: { [key: string]: string } = {
    annual: "ປະຈຳປີ",
    project: "ຕາມໂຄງການ",
    service: "ບໍລິການ",
  };
  return typeMap[type] || type;
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="affiliated-company-container">
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">ບໍລິສັດທັງໝົດ</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.totalCompanies }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <Icon icon="mdi:domain" class="text-blue-600 text-xl" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">ງົບປະມານທັງໝົດ</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatLargeNumber(statistics.totalBudget) }}
            </p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <Icon icon="mdi:account-balance" class="text-purple-600 text-xl" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">ພະນັກງານທັງໝົດ</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ statistics.totalEmployees.toLocaleString() }}
            </p>
          </div>
          <div class="p-3 bg-orange-100 rounded-full">
            <Icon icon="mdi:account-group" class="text-orange-600 text-xl" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <InputSearch
            v-model="searchKeyword"
            placeholder="ຄົ້ນຫາຊື່ບໍລິສັດ ຫຼື ເລກທະບຽນ..."
            :disabled="props.loading || localLoading"
            @search="handleSearch"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-96">
          <UiFormItem>
            <UiSelect
              v-model="filters.status"
              :options="statusOptions"
              placeholder="ສະຖານະ"
              @change="handleFilterChange"
              :disabled="props.loading || localLoading"
            />
          </UiFormItem>

          <UiFormItem>
            <UiSelect
              v-model="filters.contractType"
              :options="contractTypeOptions"
              placeholder="ປະເພດສັນຍາ"
              @change="handleFilterChange"
              :disabled="props.loading || localLoading"
            />
          </UiFormItem>

          <UiFormItem>
            <UiSelect
              v-model="filters.sortBy"
              :options="sortOptions"
              placeholder="ຈັດລຽງຕາມ"
              @change="handleFilterChange"
              :disabled="props.loading || localLoading"
            />
          </UiFormItem>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow-sm">
      <Table
        :columns="tableColumns"
        :data-source="paginatedCompanies"
        :loading="props.loading || loading"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: filteredCompanies.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }"
        @row-click="handleRowClick"
        @change="handlePaginationChange"
      >
        <!-- Custom cell renderers -->
        <template #company="{ record }">
          <div class="flex items-center gap-3">
            <div
              class="p-2 rounded-full flex-shrink-0"
              :class="[getLogoBgColor(record.color), getLogoTextColor(record.color)]"
            >
              <img
                v-if="record.logo_url"
                :src="record.logo_url"
                class="w-8 h-8 object-cover rounded"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate">{{ record.name }}</div>
              <div class="text-xs text-gray-500">{{ record.registrationNumber }}</div>
              <div class="flex items-center gap-2 mt-1">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusBadgeClass(record.status)"
                >
                  {{ getStatusLabel(record.status) }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ getContractTypeLabel(record.contractType) }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <template #proposalCount="{ record }">
          <div>
            <span class="font-medium text-blue-600">{{ record.proposalCount }}</span>
            <div class="text-xs text-gray-500">ໃບສະເໜີ</div>
          </div>
        </template>

        <template #budget="{ record }">
          <div>
            <span class="font-medium text-gray-900">{{ formatCurrency(record.budget) }}</span>
            <div class="text-xs text-gray-500">{{ record.employees }} ຄົນ</div>
          </div>
        </template>

        <template #budgetUsed="{ record }">
          <div>
            <div class="font-medium text-gray-900">{{ formatCurrency(record.budgetUsed) }}</div>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex-1 max-w-16 bg-gray-200 rounded-full h-1.5">
                <div
                  class="h-1.5 rounded-full"
                  :class="
                    getBudgetPercentage(record.budgetUsed, record.budget) > 100
                      ? 'bg-red-500'
                      : getBudgetPercentage(record.budgetUsed, record.budget) > 80
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  "
                  :style="`width: ${Math.min(
                    getBudgetPercentage(record.budgetUsed, record.budget),
                    100
                  )}%`"
                ></div>
              </div>
              <span
                class="text-xs font-medium"
                :class="
                  getBudgetPercentage(record.budgetUsed, record.budget) > 100
                    ? 'text-red-600'
                    : 'text-gray-600'
                "
              >
                {{ getBudgetPercentage(record.budgetUsed, record.budget) }}%
              </span>
            </div>
          </div>
        </template>

        <template #action="{ record }">
          <button
            @click.stop="handleViewDetails(record)"
            class="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            title="ດູລາຍລະອຽດ"
          >
            <Icon icon="mdi:eye" class="text-base" />
            ລາຍລະອຽດ
          </button>
        </template>
      </Table>
    </div>
  </div>
</template>

<style scoped>
.affiliated-company-container {
  min-height: calc(100vh - 200px);
  background-color: #f8f9fa;
  padding: 1rem;
}

/* Custom styles for table cells */
:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
  vertical-align: middle;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #374151;
}

/* Smooth transitions */
.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .affiliated-company-container {
    padding: 0.5rem;
  }

  .grid-cols-1.sm\:grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-cols-1.sm\:grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
