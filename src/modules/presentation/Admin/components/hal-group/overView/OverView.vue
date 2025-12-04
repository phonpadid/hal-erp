\<script setup lang="ts">
import { ref, computed, onMounted, reactive, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useNotification } from "@/modules/shared/utils/useNotification";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiSelect from "@/common/shared/components/Input/InputSelect.vue";
import { Icon } from "@iconify/vue";
import { Tabs } from "ant-design-vue";
import AffiliatedCompany from "../affiliated-company/AffiliatedCompany.vue";
import ApproveProposal from "../approve-proposal/ApproveProposal.vue";
import CompanyDetail from "../company-detail/CompanyDetail.vue";
import { ReportCompanyService } from "@/modules/application/services/reports/report-company.service";
import { useReportHalStore } from "@/modules/presentation/Admin/stores/reports/report-hal.store";
import { departmentStore } from "@/modules/presentation/Admin/stores/departments/department.store";
import { useCompanyReportsStore } from "@/modules/presentation/Admin/stores/company-reports.store";
import type { CompanyReportData } from "@/modules/infrastructure/reports/report-company.repository";

// Interface for company data
interface Company {
  id: number;
  name: string;
  logo: string;
  proposalCount: number;
  budget: number;
  budgetUsed: number;
  color: string;
  userCount: number;
  allocated_amount: number;
  balance_amount: number;
  approvalWorkflowCount: number;
}

// Interface for affiliated company data (matching AffiliatedCompany.vue)
interface AffiliatedCompany {
  id: number;
  name: string;
  logo: string;
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

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { warning } = useNotification();

// Services
const reportCompanyService = new ReportCompanyService();
const reportHalStore = useReportHalStore();
const department = departmentStore();
const companyReportsStore = useCompanyReportsStore();

// State
const loading = ref<boolean>(false);
const searchKeyword = ref<string>("");
const activeTab = ref<string>("1");
const selectedCompany = ref<Company | null>(null);
const showCompanyDetail = ref<boolean>(false);
const selectedDetailCompany = ref<Company | null>(null);
const companies = ref<Company[]>([]);

// Filter state
const filters = reactive({
  year: new Date().getFullYear(),
  company: "all",
  departmentId: "all",
  dateRange: [] as string[],
});

// Generate years for filter
const currentYear = new Date().getFullYear();
const years = computed(() => {
  const yearOptions = [];
  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    yearOptions.push({ value: year, label: `${year}` });
  }
  return yearOptions;
});

// Company options
const companyOptions = computed(() => {
  const options = [{ value: "all", label: "ທຸກບໍລິສັດ" }];

  // Add companies from the companies data with both ID and name
  const uniqueCompanies = [...new Map(companies.value.map(c => [c.id, c])).values()];
  uniqueCompanies.forEach(company => {
    options.push({ value: company.id.toString(), label: company.name });
  });

  return options;
});

// Department options
const departmentOptions = computed(() => {
  const options = [{ value: "all", label: "ທຸກພະແນກ" }];

  // Add departments from store
  if (department.departments && department.departments.length > 0) {
    department.departments.forEach((dept) => {
      options.push({
        value: dept.getId(),
        label: dept.getName() || `ພະແນກ ${dept.getId()}`
      });
    });
  } else {
    // Mock departments if no data available
    const mockDepartments = [
      { value: "1", label: "ພະແນກບໍລິຫານ" },
      { value: "2", label: "ພະແນກຊື້" },
      { value: "3", label: "ພະແນກຂາຍ" },
      { value: "4", label: "ພະແນກບັນຊີ" },
      { value: "5", label: "ພະແນກການຜະລິດ" },
      { value: "6", label: "ພະແນກ IT" },
      { value: "7", label: "ພະແນກຊີການລູກຄ້າ" },
    ];
    options.push(...mockDepartments);
  }

  return options;
});


// Get filtered companies based on filters
const filteredCompanies = computed(() => {
  let filtered = [...companies.value];

  // Filter by company if not "all"
  if (filters.company !== "all") {
    filtered = filtered.filter((company) => company.name.includes(filters.company));
  }

  // Filter by search keyword
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter((company) => company.name.toLowerCase().includes(keyword));
  }

  return filtered;
});

// Get over budget companies
const overBudgetCompanies = computed(() => {
  // Use data from budgetReport API if available, otherwise fallback to filtered companies
  const budgetOverruns = reportHalStore.getBudgetOverruns();
  if (budgetOverruns?.budget) {
    const colors = ["red", "orange", "yellow", "purple", "pink"];
    return budgetOverruns.budget.map((item, index) => ({
      id: item.id,
      name: item.name,
      logo: item.logo,
      allocated_amount: item.allocated_amount,
      budgetUsed: item.total,
      budget: item.allocated_amount,
      color: colors[index % colors.length]
    }));
  }
  return filteredCompanies.value.filter((company) => company.budgetUsed >= company.budget);
});

// Get within budget companies
const withinBudgetCompanies = computed(() => {
  // Use data from budgetReport API if available, otherwise fallback to filtered companies
  const withinBudget = reportHalStore.getWithinBudget();
  if (withinBudget?.budget) {
    const colors = ["green", "blue", "teal", "indigo", "cyan"];
    return withinBudget.budget.map((item, index) => ({
      id: item.id,
      name: item.name,
      logo: item.logo,
      allocated_amount: item.allocated_amount,
      budgetUsed: item.total,
      budget: item.allocated_amount,
      color: colors[index % colors.length]
    }));
  }
  return filteredCompanies.value.filter((company) => company.budgetUsed < company.budget);
});

// Statistics data
const statistics = reactive({
  totalGroups: 0,
  activeGroups: 0,
  inactiveGroups: 0,
  thisMonthCreated: 0,
  totalMembers: 0,
  avgMembersPerGroup: 0,
});

// Calculate statistics
const calculateStatistics = () => {
  const filtered = filteredCompanies.value;

  statistics.totalGroups = filtered.length;
  statistics.activeGroups = filtered.filter((c) => c.budgetUsed < c.budget * 0.8).length;
  statistics.inactiveGroups = filtered.filter((c) => c.budgetUsed >= c.budget * 0.8).length;

  // Groups created this month
  statistics.thisMonthCreated = Math.floor(filtered.length * 0.3); // Mock calculation

  statistics.totalMembers = filtered.reduce((sum, company) => sum + company.proposalCount, 0);
  statistics.avgMembersPerGroup =
    filtered.length > 0 ? Math.round(statistics.totalMembers / filtered.length) : 0;
};

// Transform API data to Company interface
const transformCompanyData = (apiData: CompanyReportData): Company[] => {
  const colors = ["blue", "green", "yellow", "purple", "orange", "red", "teal", "indigo", "pink", "cyan"];

  return apiData.data.map((company, index) => ({
    id: company.id,
    name: company.name,
    logo: company.logo || "mdi:domain", // Use company logo from API or default icon
    proposalCount: company.approvalWorkflowCount,
    budget: company.total_budget,
    budgetUsed: company.totalUsedAmount,
    color: colors[index % colors.length],
    userCount: company.userCount,
    allocated_amount: company.allocated_amount,
    balance_amount: company.balance_amount,
    approvalWorkflowCount: company.approvalWorkflowCount
  }));
};

// Load data
const loadData = async () => {
  loading.value = true;
  try {
    // Load company data
    const reportData = await reportCompanyService.getReportCompany();
    companies.value = transformCompanyData(reportData);
    calculateStatistics();

    // Load departments for filters
    await loadDepartments();

    // Load budget report data for charts
    await loadBudgetReport();
  } catch (error) {
    console.error("Error loading data:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນບໍລິສັດໄດ້");
  } finally {
    loading.value = false;
  }
};

// Load departments data
const loadDepartments = async () => {
  try {
    // Try to fetch departments from store
    if (department.departments.length === 0) {
      await department.fetchDepartment({ page: 1, limit: 100 });
    }
  } catch (error) {
    console.error("Error loading departments:", error);
    // Silently fail - will use mock departments
  }
};

// Load budget report data
const loadBudgetReport = async () => {
  try {
    await reportHalStore.fetchReportHalGroupsMonthlyBudget({
      fiscal_year: filters.year,
      company_id: filters.company !== "all" ? parseInt(filters.company) : undefined,
      departmentId: filters.departmentId !== "all" ? filters.departmentId : undefined
    });
  } catch (error) {
    console.error("Error loading budget report:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນງົບປະມານໄດ້");
  }
};

// Handle filter changes
const handleFilterChange = async () => {
  calculateStatistics();

  // Load budget report data when filters change
  await loadBudgetReport();

  // Update selectedCompany when company filter changes
  if (filters.company !== "all") {
    const company = companies.value.find(c => c.name.includes(filters.company));
    if (company) {
      selectedCompany.value = company;
    }
  } else {
    selectedCompany.value = null;
  }

  // Update URL with query params
  router.push({
    query: {
      ...route.query,
      year: filters.year,
      company: filters.company,
      departmentId: filters.departmentId,
    },
  });
};



// Show company details with pending documents
const showCompanyDetails = async (company: Company) => {
  loading.value = true;
  try {
    // Check if data already exists in store
    let companyDetails = companyReportsStore.getCompanyById(company.id);

    // If not found or needs refresh, load from API
    if (!companyDetails) {
      companyDetails = await companyReportsStore.loadCompanyReport(company.id.toString());
    }

    // Set selected company for ApproveProposal and go to Tab 2
    selectedCompany.value = company;
    activeTab.value = "2";

    await nextTick();

  } catch (error) {
    console.error("Error loading company details:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລາຍລະອຽດບໍລິສັດໄດ້");
  } finally {
    loading.value = false;
  }
};



// Mock data for purchase requests
const mockPurchaseRequests = [
  {
    id: "PR001",
    requestNumber: "PR2024-001",
    title: "ຈັດຊື້ອຸປະກອນສໍານັກງານ",
    department: "ພະແນກຊື້",
    requester: "ສົມສະຫວາດ ວົງສາ",
    amount: 2500000,
    requestDate: "2024-11-01",
    status: "pending", // pending, approved, rejected
    urgency: "normal", // low, normal, high, urgent
    items: 5,
    company: "HAL ບໍລິສັດ",
  },
  {
    id: "PR002",
    requestNumber: "PR2024-002",
    title: "ຈັດຊື້ວັດຖຸດິບຜ່ານການຜະລິດ",
    department: "ພະແນກຜະລິດ",
    requester: "ຄຳພອນ ໄຊຍະສາດ",
    amount: 5800000,
    requestDate: "2024-11-02",
    status: "pending",
    urgency: "high",
    items: 12,
    company: "HAL ບໍລິສັດ",
  },
  {
    id: "PR003",
    requestNumber: "PR2024-003",
    title: "ຈັດຊື້ລົດຈັກບັນຊີ",
    department: "ພະແນກບັນຊີ",
    requester: "ມາລີ ດວງສະຫວັນ",
    amount: 12000000,
    requestDate: "2024-11-03",
    status: "approved",
    urgency: "normal",
    items: 3,
    company: "HAL Tech",
  },
  {
    id: "PR004",
    requestNumber: "PR2024-004",
    title: "ຈັດຊື້ລະບົບຄວາມປອດໄພ",
    department: "ພະແນກ IT",
    requester: "ສົມພອນ ອິນທະວົງ",
    amount: 8500000,
    requestDate: "2024-11-04",
    status: "pending",
    urgency: "urgent",
    items: 8,
    company: "HAL Energy",
  },
  {
    id: "PR005",
    requestNumber: "PR2024-005",
    title: "ຈັດຊື້ອາຫານສັດ",
    department: "ພະແນກຊີການລູກຄ້າ",
    requester: "ເດືອນ ໄຊຍະພອນ",
    amount: 3200000,
    requestDate: "2024-11-05",
    status: "rejected",
    urgency: "normal",
    items: 15,
    company: "HAL Service",
  },
];

// Filter purchase requests based on company
const filteredPurchaseRequests = computed(() => {
  if (filters.company === 'all') {
    return mockPurchaseRequests;
  }

  const companyName = getCompanyLabel(filters.company);
  return mockPurchaseRequests.filter(req => req.company === companyName);
});

// Get company label
const getCompanyLabel = (companyValue: string) => {
  const company = companyOptions.value.find((c) => c.value === companyValue);
  return company ? company.label : companyValue;
};

// Handle view company details
const handleViewDetails = (company: Company | AffiliatedCompany) => {
  // Convert company data to Company format if needed
  const isAffiliatedCompany = 'employees' in company && 'contractType' in company;
  const affiliatedCompany = company as AffiliatedCompany;
  const companyData = company as Company;

  selectedDetailCompany.value = {
    ...company,
    // Map from AffiliatedCompany format if needed
    userCount: isAffiliatedCompany ? affiliatedCompany.employees : companyData.userCount,
    allocated_amount: company.budget || companyData.allocated_amount || 0,
    balance_amount: (company.budget || companyData.allocated_amount || 0) - (company.budgetUsed || 0),
    approvalWorkflowCount: company.proposalCount || companyData.approvalWorkflowCount || 0
  } as Company;
  showCompanyDetail.value = true;
};

// Close company detail view
const closeCompanyDetail = () => {
  showCompanyDetail.value = false;
  selectedDetailCompany.value = null;
};

// Handle batch approve/reject for ApproveProposal component
const handleBatchApprove = (ids: string[]) => {
  console.log('Approve proposals:', ids);
  warning("ອະນຸມັດ", `ອະນຸມັດ ${ids.length} ລາຍກາສຳເລັດ`);
};

const handleBatchReject = (ids: string[]) => {
  console.log('Reject proposals:', ids);
  warning("ປະຕິເສດ", `ປະຕິເສດ ${ids.length} ລາຍກາສຳເລັດ`);
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

// Format compact number
const formatCompactNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Calculate budget percentage
const getBudgetPercentage = (budgetUsed: number, budget: number) => {
  return Math.round((budgetUsed / budget) * 100);
};

// Get color classes for budget bars
const getBudgetBarColor = (percentage: number) => {
  if (percentage > 80) return "bg-red-500";
  if (percentage > 60) return "bg-yellow-500";
  return "bg-green-500";
};

// Get background color classes for company logos
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
  };
  return colorMap[color] || "bg-gray-100";
};

// Get text color classes for company logos
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
  };
  return colorMap[color] || "text-gray-600";
};


onMounted(async () => {
  // Initialize filters from URL query params
  if (route.query.year) filters.year = parseInt(route.query.year as string);
  if (route.query.company) filters.company = route.query.company as string;

  // Load company reports data first
  await companyReportsStore.loadCompanyReports();

  // Load overview data
  await loadData();

  // Initialize selectedCompany from company filter after data is loaded
  if (filters.company !== "all") {
    const company = companies.value.find(c => c.name.includes(filters.company));
    if (company) {
      selectedCompany.value = company;
    }
  }
});
</script>

<template>
  <div class="hal-group-overview-container">
    <div class="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <!-- Tabs Section - Moved to Top -->
      <div class="bg-white rounded-lg shadow-sm">
        <Tabs v-model:activeKey="activeTab" type="card" size="large">
          <Tabs.TabPane key="1" tab="ພາບລວມ">
            <!-- Dynamic Header for Tab 1 -->
            <div
              class="border-b border-gray-200 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
                    {{ t("hal-group.overview") }}
                  </h1>
                  <p class="text-gray-600 mt-1">{{ t("hal-group.followingDescription") }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {{ filteredCompanies.length }} ບໍລິສັດ
                  </div>
                  <div
                    class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {{ new Date().getFullYear() }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab Content -->
            <!-- Filters Section -->
            <div class="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon icon="solar:filter-outline" class="text-base" />
                {{ t("hal-group.filters") }}
              </h2>
              <div class="flex justify-between">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <!-- Year Filter -->
                  <UiFormItem>
                    <UiSelect
                      v-model="filters.year"
                      :options="years"
                      placeholder="ເລືອກປີ"
                      @change="handleFilterChange"
                      :disabled="loading"
                    />
                  </UiFormItem>
                   <!-- Department Filter -->
                  <UiFormItem>
                    <UiSelect
                      v-model="filters.departmentId"
                      :options="departmentOptions"
                      placeholder="ເລືອກພະແນກ"
                      @change="handleFilterChange"
                      :disabled="loading"
                    />
                  </UiFormItem>
                  <!-- Company Filter -->
                  <UiFormItem>
                    <UiSelect
                      v-model="filters.company"
                      :options="companyOptions"
                      placeholder="ເລືອກບໍລິສັດ"
                      @change="handleFilterChange"
                      :disabled="loading"
                    />
                  </UiFormItem>

                 

                
                 
                </div>
                <div>
                  {{ t("hal-group.showdata") }}{{ t("hal-group.overyear") }} {{ filters.year }}
                  {{ getCompanyLabel(filters.company) }}
                </div>
              </div>
            </div>

            <!-- Statistics Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2 p-2">
              <!-- Total Proposals -->
              <div
                class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-white/20 rounded-lg">
                    <Icon
                      icon="material-symbols:nest-clock-farsight-analog-outline"
                      class="text-xl md:text-2xl"
                    />
                  </div>
                  <span class="text-xs md:text-sm opacity-90 font-medium"
                    >ໃບສະເໜີທີລໍຖ້າອະນຸມັດ</span
                  >
                </div>
                <div class="space-y-1">
                  <div class="text-2xl md:text-3xl font-bold tracking-tight">
                    {{
                      formatCompactNumber(
                        filteredCompanies.reduce((sum, c) => sum + c.proposalCount, 0)
                      )
                    }}
                  </div>
                  <div class="text-xs md:text-sm opacity-80">
                    {{
                      Math.round(
                        filteredCompanies.reduce((sum, c) => sum + c.proposalCount, 0) /
                          filteredCompanies.length
                      )
                    }}
                    ໃບ
                  </div>
                </div>
              </div>

              <div
                class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-white/20 rounded-lg">
                    <Icon icon="material-symbols:description" class="text-xl md:text-2xl" />
                  </div>
                  <span class="text-xs md:text-sm opacity-90 font-medium">ໃບສະເໜີທັງໝົດ</span>
                </div>
                <div class="space-y-1">
                  <div class="text-2xl md:text-3xl font-bold tracking-tight">
                    {{
                      formatCompactNumber(
                        filteredCompanies.reduce((sum, c) => sum + c.proposalCount, 0)
                      )
                    }}
                  </div>
                  <div class="text-xs md:text-sm opacity-80">
                    ໂປດປະຈຳ:
                    {{
                      Math.round(
                        filteredCompanies.reduce((sum, c) => sum + c.proposalCount, 0) /
                          filteredCompanies.length
                      )
                    }}
                    ໃບ/ບໍລິສັດ
                  </div>
                </div>
              </div>

              <!-- Total Budget -->
              <div
                class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-white/20 rounded-lg">
                    <Icon icon="material-symbols:account-balance" class="text-xl md:text-2xl" />
                  </div>
                  <span class="text-xs md:text-sm opacity-90 font-medium">ງົບປະມານທັງໝົດ</span>
                </div>
                <div class="space-y-1">
                  <div class="text-2xl md:text-3xl font-bold tracking-tight">
                    {{ formatLargeNumber(filteredCompanies.reduce((sum, c) => sum + c.budget, 0)) }}
                  </div>
                  <div class="text-xs md:text-sm opacity-80">
                    ບໍລິສັດສະເລຍ່:
                    {{
                      formatLargeNumber(
                        filteredCompanies.reduce((sum, c) => sum + c.budget, 0) /
                          filteredCompanies.length
                      )
                    }}
                  </div>
                </div>
              </div>

              <!-- Budget Used -->
              <div
                class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-white/20 rounded-lg">
                    <Icon icon="material-symbols:payments" class="text-xl md:text-2xl" />
                  </div>
                  <span class="text-xs md:text-sm opacity-90 font-medium">ງົບທີໃຊ້ໄປ</span>
                </div>
                <div class="space-y-1">
                  <div class="text-2xl md:text-3xl font-bold tracking-tight">
                    {{
                      formatLargeNumber(filteredCompanies.reduce((sum, c) => sum + c.budgetUsed, 0))
                    }}
                  </div>
                  <div class="text-xs md:text-sm opacity-80">
                    ໃຊ້ໄປແລ້ວ:
                    {{
                      getBudgetPercentage(
                        filteredCompanies.reduce((sum, c) => sum + c.budgetUsed, 0),
                        filteredCompanies.reduce((sum, c) => sum + c.budget, 0)
                      )
                    }}%
                  </div>
                </div>
              </div>

              <!-- Remaining Budget -->
              <div
                class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-white/20 rounded-lg">
                    <Icon icon="material-symbols:savings" class="text-xl md:text-2xl" />
                  </div>
                  <span class="text-xs md:text-sm opacity-90 font-medium">ງົບປະມານຍັງຄ້າງ</span>
                </div>
                <div class="space-y-1">
                  <div class="text-2xl md:text-3xl font-bold tracking-tight">
                    {{
                      formatLargeNumber(
                        filteredCompanies.reduce((sum, c) => sum + (c.budget - c.budgetUsed), 0)
                      )
                    }}
                  </div>
                  <div class="text-xs md:text-sm opacity-80">
                    ຍັງຄ້າງ:
                    {{
                      getBudgetPercentage(
                        filteredCompanies.reduce((sum, c) => sum + (c.budget - c.budgetUsed), 0),
                        filteredCompanies.reduce((sum, c) => sum + c.budget, 0)
                      )
                    }}%
                  </div>
                </div>
              </div>

              <!-- Companies Count -->
              <div
                class="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-white/20 rounded-lg">
                    <Icon
                      icon="material-symbols:group-outline-rounded"
                      class="text-xl md:text-2xl"
                    />
                  </div>
                  <span class="text-xs md:text-sm opacity-90 font-medium">ພະນັກງານ</span>
                </div>
                <div class="space-y-1">
                  <div class="text-2xl md:text-3xl font-bold">2000ຄົນ</div>
                  <div class="text-xs md:text-sm opacity-80">ສະເລ່ຍ: 200ຄົນ/ບໍລິສັດ</div>
                </div>
              </div>

              <!-- Over Budget Count -->
              <!-- <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center justify-between mb-3">
            <div class="p-2 bg-white/20 rounded-lg">
              <Icon icon="material-symbols:warning" class="text-xl md:text-2xl" />
            </div>
            <span class="text-xs md:text-sm opacity-90 font-medium">ບໍລິສັດເກີນງົບ</span>
          </div>
          <div class="space-y-1">
            <div class="text-2xl md:text-3xl font-bold">
              {{ overBudgetCompanies.length }}
            </div>
            <div class="text-xs md:text-sm opacity-80">
              ອດສວານທັງໝົດ: {{ overBudgetCompanies.length > 0 ?
                `(${Math.round((overBudgetCompanies.length / filteredCompanies.length) * 100)}%)` :
                '(0%)'
              }}
            </div>
          </div>
        </div> -->
            </div>
            <!-- Proposal Overview Header -->
            <div class="p-2 md:p-6 border-b border-gray-200">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <h2 class="text-lg font-semibold flex items-center gap-2 flex-wrap">
                  <Icon icon="material-symbols:description" class="text-blue-600" />
                  <span class="break-words">ໃບສະເໜີທີລໍຖ້າອະນຸມັດ</span>
                  <span class="text-blue-600 font-bold"
                    >({{ filteredCompanies.reduce((sum, c) => sum + c.proposalCount, 0) }} ໃບ)</span
                  >
                  <span class="text-gray-600">ຈາກ {{ filteredCompanies.length }} ບໍລິສັດ</span>
                </h2>
                <span class="text-sm text-gray-500 font-normal whitespace-nowrap"
                  >ລວມໃບສະເໜີທີລໍຖ້າອະນຸມັດ</span
                >
              </div>
            </div>

            <!-- Company Boxes Grid -->
            <div class="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <div
                  v-for="company in filteredCompanies"
                  :key="company.id"
                  @click="showCompanyDetails(company)"
                  class="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 hover:scale-105"
                >
                  <!-- Company Logo -->
                  <div class="flex justify-center mb-3">
                    <!-- If logo is a URL, show image, otherwise show icon -->
                    <div v-if="company.logo && company.logo.startsWith('http')" class="relative w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                      <img
                        :src="company.logo"
                        :alt="company.name"
                        class="w-full h-full object-cover"
                        @error="(e) => {
                          const target = e.target as HTMLImageElement;
                          target.classList.add('hidden');
                          target.parentElement!.querySelector('.fallback-icon')!.classList.remove('hidden');
                        }"
                      />
                      <div
                        class="fallback-icon hidden absolute inset-0 p-3 rounded-full"
                        :class="[getLogoBgColor(company.color), getLogoTextColor(company.color)]"
                      >
                        <Icon icon="mdi:domain" class="text-2xl" />
                      </div>
                    </div>
                    <div
                      v-else
                      class="p-3 rounded-full"
                      :class="[getLogoBgColor(company.color), getLogoTextColor(company.color)]"
                    >
                      <Icon :icon="company.logo" class="text-2xl" />
                    </div>
                  </div>

                  <!-- Company Name -->
                  <h3 class="text-center font-semibold text-gray-900 mb-2 text-sm">
                    {{ company.name }}
                  </h3>

                  <!-- Proposal Count -->
                  <div class="text-center">
                    <div class="text-xs text-gray-500 mb-1">ໃບສະເໜີ</div>
                    <div class="text-lg font-bold text-blue-600">{{ company.proposalCount }}</div>
                  </div>

                  <!-- Budget Progress -->
                  <div class="mt-3">
                    <div class="flex justify-between text-xs text-gray-600 mb-1">
                      <span>ງົບປະມານ</span>
                      <span
                        class="font-medium"
                        :class="
                          getBudgetPercentage(company.budgetUsed, company.budget) > 100
                            ? 'text-red-600'
                            : 'text-gray-700'
                        "
                      >
                        {{ getBudgetPercentage(company.budgetUsed, company.budget) }}%
                      </span>
                    </div>
                    <div class="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        class="h-2 rounded-full transition-all duration-300 relative"
                        :class="
                          getBudgetBarColor(getBudgetPercentage(company.budgetUsed, company.budget))
                        "
                        :style="`width: ${Math.min(
                          getBudgetPercentage(company.budgetUsed, company.budget),
                          100
                        )}%`"
                      >
                        <!-- Over budget indicator -->
                        <div
                          v-if="getBudgetPercentage(company.budgetUsed, company.budget) > 100"
                          class="absolute right-0 top-0 h-2 w-1 bg-red-600 animate-pulse"
                        ></div>
                      </div>
                      <!-- Over budget text for very high percentages -->
                      <span
                        v-if="getBudgetPercentage(company.budgetUsed, company.budget) > 100"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-white font-medium"
                      >
                        +{{ getBudgetPercentage(company.budgetUsed, company.budget) - 100 }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="!loading && filteredCompanies.length === 0" class="p-8 text-center">
                <div class="text-gray-400 mb-4">
                  <Icon icon="solar:inbox-outline" class="text-4xl mx-auto" />
                </div>
                <p class="text-gray-600">ບໍ່ພົບຂໍ້ມູນບໍລິສັດ</p>
              </div>
            </div>

            <div class="p-2 md:p-6 border-b border-gray-200">
              <h2 class="text-lg font-semibold flex items-center gap-2">
                ງົບປະມານຂອງບໍລິສັດໃນເຄືອ
              </h2>
              <span class="text-sm text-gray-500 font-normal">ລວມໃບສະເໜີທີລໍຖ້າອະນຸມັດ</span>
            </div>

            <!-- Budget Chart Section -->
            <div class="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h3 class="text-lg font-semibold mb-4">ການໃຊ້ງົບປະມານປະຈຳເດືອນ</h3>

              <!-- Budget Summary -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <Icon icon="material-symbols:warning" class="text-red-600 text-xl" />
                    <h4 class="text-red-800 font-semibold">ບໍລິສັດທີໃຊ້ງົບເກີນ</h4>
                  </div>
                  <div class="text-sm text-red-700">
                    <div>
                      ຈຳນວນ:
                      {{ reportHalStore.getBudgetOverruns()?.amount || 0 }} ບໍລິສັດ
                    </div>
                    <div class="mt-1">
                      ມູນຄ່າທີ່ເກີນ:
                      <span class="font-bold">
                        {{
                          formatCurrency(
                            reportHalStore.getBudgetOverruns()?.total || 0
                          )
                        }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <Icon icon="material-symbols:check-circle" class="text-green-600 text-xl" />
                    <h4 class="text-green-800 font-semibold">ບໍລິສັດທີ່ຢູ່ໃນງົບ</h4>
                  </div>
                  <div class="text-sm text-green-700">
                    <div>
                      ຈຳນວນ:
                      {{ reportHalStore.getWithinBudget()?.amount || 0 }} ບໍລິສັດ
                    </div>
                    <div class="mt-1">
                      ງົບປະມານທີ່ຍັງຄ້າງ:
                      <span class="font-bold">
                        {{
                          formatCurrency(
                            reportHalStore.getWithinBudget()?.total || 0
                          )
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Compact Budget Chart -->
              <div class="max-h-96 overflow-y-auto">
                <!-- Over Budget Companies -->
                <div v-if="overBudgetCompanies.length > 0" class="mb-4">
                  <h4 class="text-sm font-semibold text-red-600 flex items-center gap-2 mb-2">
                    <Icon icon="material-symbols:warning" />
                    ບໍລິສັດທີໃຊ້ງົບເກີນ ({{ overBudgetCompanies.length }})
                  </h4>
                  <div class="space-y-2">
                    <div
                      v-for="company in overBudgetCompanies"
                      :key="company.id"
                      class="flex items-center gap-3 p-2 bg-red-50 rounded border border-red-200"
                    >
                      <!-- Company Logo -->
                      <div class="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 relative">
                        <img
                          v-if="company.logo && company.logo.startsWith('http')"
                          :src="company.logo"
                          :alt="company.name"
                          class="w-full h-full object-cover"
                          @error="(e) => {
                            const target = e.target as HTMLImageElement;
                            target.classList.add('hidden');
                            target.parentElement!.querySelector('.fallback-icon')!.classList.remove('hidden');
                          }"
                        />
                        <div
                          v-if="company.logo && company.logo.startsWith('http')"
                          class="fallback-icon hidden absolute inset-0 rounded-full"
                          :class="[getLogoBgColor(company.color), getLogoTextColor(company.color)]"
                        >
                          <Icon icon="mdi:domain" class="text-xs" />
                        </div>
                        <div
                          v-else
                          class="w-full h-full rounded-full flex items-center justify-center"
                          :class="[getLogoBgColor(company.color), getLogoTextColor(company.color)]"
                        >
                          <Icon :icon="company.logo" class="text-xs" />
                        </div>
                      </div>

                      <!-- Company Name & Over Budget -->
                      <div class="w-32 flex-shrink-0">
                        <div class="text-xs font-medium text-gray-900 truncate">
                          {{ company.name }}
                        </div>
                        <div class="text-xs text-red-600 font-medium">
                          +{{ formatCurrency(company.budgetUsed - company.budget) }}
                        </div>
                      </div>

                      <!-- Compact Budget Bar -->
                      <div class="flex-1 min-w-0">
                        <div class="relative">
                          <div class="w-full bg-red-100 rounded h-4 overflow-hidden">
                            <div
                              class="h-4 rounded bg-red-500 transition-all duration-300 relative"
                              :style="`width: ${Math.min(
                                getBudgetPercentage(company.budgetUsed, company.budget),
                                100
                              )}%`"
                            >
                              <!-- Over budget indicator -->
                              <div
                                v-if="getBudgetPercentage(company.budgetUsed, company.budget) > 100"
                                class="absolute right-0 top-0 h-4 w-1 bg-red-700 animate-pulse"
                              ></div>
                            </div>
                          </div>
                          <span
                            class="absolute right-1 top-0 text-xs text-red-700 font-medium leading-4"
                          >
                            {{ getBudgetPercentage(company.budgetUsed, company.budget) }}%
                          </span>
                          <!-- Over budget text -->
                          <span
                            v-if="getBudgetPercentage(company.budgetUsed, company.budget) > 100"
                            class="absolute right-6 top-0 text-xs text-red-700 font-medium leading-4"
                          >
                            +{{ getBudgetPercentage(company.budgetUsed, company.budget) - 100 }}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Within Budget Companies -->
                <div v-if="withinBudgetCompanies.length > 0">
                  <h4 class="text-sm font-semibold text-green-600 flex items-center gap-2 mb-2">
                    <Icon icon="material-symbols:check-circle" />
                    ບໍລິສັດທີ່ຢູ່ໃນງົບ ({{ withinBudgetCompanies.length }})
                  </h4>
                  <div class="space-y-2">
                    <div
                      v-for="company in withinBudgetCompanies"
                      :key="company.id"
                      class="flex items-center gap-3 p-2 bg-green-50 rounded border border-green-200"
                    >
                      <!-- Company Logo -->
                      <div class="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 relative">
                        <img
                          v-if="company.logo && company.logo.startsWith('http')"
                          :src="company.logo"
                          :alt="company.name"
                          class="w-full h-full object-cover"
                          @error="(e) => {
                            const target = e.target as HTMLImageElement;
                            target.classList.add('hidden');
                            target.parentElement!.querySelector('.fallback-icon')!.classList.remove('hidden');
                          }"
                        />
                        <div
                          v-if="company.logo && company.logo.startsWith('http')"
                          class="fallback-icon hidden absolute inset-0 rounded-full"
                          :class="[getLogoBgColor(company.color), getLogoTextColor(company.color)]"
                        >
                          <Icon icon="mdi:domain" class="text-xs" />
                        </div>
                        <div
                          v-else
                          class="w-full h-full rounded-full flex items-center justify-center"
                          :class="[getLogoBgColor(company.color), getLogoTextColor(company.color)]"
                        >
                          <Icon :icon="company.logo" class="text-xs" />
                        </div>
                      </div>

                      <!-- Company Name & Remaining Budget -->
                      <div class="w-32 flex-shrink-0">
                        <div class="text-xs font-medium text-gray-900 truncate">
                          {{ company.name }}
                        </div>
                        <div class="text-xs text-green-600 font-medium">
                          ຍັງ: {{ formatCurrency(company.budget - company.budgetUsed) }}
                        </div>
                      </div>

                      <!-- Compact Budget Bar -->
                      <div class="flex-1 min-w-0">
                        <div class="relative">
                          <div class="w-full bg-gray-200 rounded h-4 overflow-hidden">
                            <div
                              class="h-4 rounded transition-all duration-300 relative"
                              :class="
                                getBudgetBarColor(
                                  getBudgetPercentage(company.budgetUsed, company.budget)
                                )
                              "
                              :style="`width: ${Math.min(
                                getBudgetPercentage(company.budgetUsed, company.budget),
                                100
                              )}%`"
                            >
                              <!-- Over budget indicator (just in case) -->
                              <div
                                v-if="getBudgetPercentage(company.budgetUsed, company.budget) > 100"
                                class="absolute right-0 top-0 h-4 w-1 bg-red-600 animate-pulse"
                              ></div>
                            </div>
                          </div>
                          <span
                            class="text-xs text-gray-700 font-medium leading-4"
                            :class="
                              getBudgetPercentage(company.budgetUsed, company.budget) > 50
                                ? 'absolute right-1 top-0 text-white'
                                : 'absolute right-1 top-0'
                            "
                          >
                            {{ getBudgetPercentage(company.budgetUsed, company.budget) }}%
                          </span>
                          <!-- Over budget text (just in case) -->
                          <span
                            v-if="getBudgetPercentage(company.budgetUsed, company.budget) > 100"
                            class="absolute right-6 top-0 text-xs text-red-600 font-medium leading-4"
                          >
                            +{{ getBudgetPercentage(company.budgetUsed, company.budget) - 100 }}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.TabPane>

          <!-- Tab 2: ອະນຸມັດເອກະສານ  -->
          <Tabs.TabPane key="2" tab="ອະນຸມັດເອກະສານ">
            <!-- Compact Header for Tab 2 -->
            <div
              class="border-b border-gray-200 p-3 md:p-2 bg-gradient-to-r from-orange-50 to-yellow-50"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 class="text-lg md:text-xl font-bold text-gray-900">ອະນຸມັດເອກະສານ</h2>
                  <p class="text-sm text-gray-600 mt-0.5">ຈັດການການອະນຸມັດເອກະສານທັງໝົດ</p>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    <Icon icon="ant-design:clock-circle-outlined" class="inline mr-1" />
                    {{ filteredPurchaseRequests.filter(r => r.status === 'pending').length }} ລໍຖ້າອະນຸມັດ
                  </div>
                  |
                  <div
                    class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    ລວມເປັນຈຳນວນເງິນ

                    {{ formatCurrency(
                      filteredPurchaseRequests
                        .filter(r => r.status === 'approved')
                        .reduce((sum, r) => sum + r.amount, 0)
                    ) }}
                  </div>
                </div>
              </div>
            </div>
            <!-- Tab Content -->
            <div class="p-0">
              <!-- Replace with ApproveProposal Component -->
              <ApproveProposal
                :selectedCompany="selectedCompany"
                :searchKeyword="searchKeyword"
                :statusFilter="'pending'"
                @approve="handleBatchApprove"
                @reject="handleBatchReject"
              />
            </div>
          </Tabs.TabPane>

          <!-- Tab 3: ບໍລິສັດໃນເຄືອ -->
          <Tabs.TabPane key="3" tab="ບໍລິສັດໃນເຄືອ">
            <!-- Dynamic Header for Tab 3 -->
            <div
              class="border-b border-gray-200 p-4 md:p-6 bg-gradient-to-r from-purple-50 to-pink-50"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 class="text-2xl md:text-3xl font-bold text-gray-900">ບໍລິສັດໃນເຄືອ</h1>
                  <p class="text-gray-600 mt-1">ຈັດການບໍລິສັດທັງໝົດໃນເຄືອລະບົບ</p>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <Icon icon="ant-design:building-outlined" class="inline mr-1" />
                    10 ບໍລິສັດ
                  </div>
                  <div
                    class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <Icon icon="ant-design:check-circle-outlined" class="inline mr-1" />
                    8 ກຳລັງຜູກສັນຍາ
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab Content -->
            <div class="p-0">
                <!-- Show Affiliated Company List if no detail selected -->
              <AffiliatedCompany
                v-if="!showCompanyDetail"
                @view-details="handleViewDetails"
              />

              <!-- Show Company Detail if selected -->
              <div v-if="showCompanyDetail && selectedDetailCompany">
                <div class="bg-gray-50 min-h-full">
                  <!-- Detail Header -->
                  <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div class="px-6 py-4">
                      <div class="flex items-center gap-4">
                        <button
                          @click="closeCompanyDetail"
                          class="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <Icon icon="mdi:arrow-left" class="text-xl" />
                        </button>
                        <h1 class="text-xl font-bold">ລາຍລະອຽດບໍລິສັດ</h1>
                        <div class="ml-auto">
                          <span class="bg-white/20 px-3 py-1 rounded-full text-sm">
                            {{ selectedDetailCompany?.name }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Company Detail Component -->
                  <div class="p-0">
                    <CompanyDetail
                      :company-id="selectedDetailCompany?.id"
                      @close="closeCompanyDetail"
                    />
                  </div>
                </div>
              </div>

              <!-- Show Affiliated Company List if no detail selected -->
              <AffiliatedCompany
                v-if="!showCompanyDetail"
                @view-details="handleViewDetails"
              />
            </div>
          </Tabs.TabPane>

          <!-- Tab 4: ການເງີນ -->
          <!-- <Tabs.TabPane key="4" tab="ການເງີນ">
           
            <div
              class="border-b border-gray-200 p-4 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 class="text-2xl md:text-3xl font-bold text-gray-900">ການເງີນ</h1>
                  <p class="text-gray-600 mt-1">ຈັດການການເງີນ ແລະ ງົບປະມານ</p>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <Icon icon="ant-design:bank-outlined" class="inline mr-1" />
                    3 ທະນາຄານ
                  </div>
                  <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Icon icon="ant-design:credit-card-outlined" class="inline mr-1" />
                    12 ບັນຊີ
                  </div>
                </div>
              </div>
              </div>
            </div>
          </Tabs.TabPane>

          <!-- Tab 4: ການເງີນ -->
          <!-- <Tabs.TabPane key="4" tab="ການເງີນ">

            <div
              class="border-b border-gray-200 p-4 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 class="text-2xl md:text-3xl font-bold text-gray-900">ການເງີນ</h1>
                  <p class="text-gray-600 mt-1">ຈັດການການເງີນ ແລະ ງົບປະມານ</p>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <Icon icon="ant-design:bank-outlined" class="inline mr-1" />
                    3 ທະນາຄານ
                  </div>
                  <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Icon icon="ant-design:credit-card-outlined" class="inline mr-1" />
                    12 ບັນຊີ
                  </div>
                </div>
              </div>
            </div>


            <div class="p-6">
              <div class="text-center py-12">
                <Icon icon="ant-design:bank-outlined" class="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 class="text-xl font-semibold text-gray-600 mb-2">ການເງີນ</h3>
                <p class="text-gray-500">ຈັດການການເງີນ ແລະ ງົບປະມານ</p>
              </div>
            </div>
          </Tabs.TabPane> -->

          <!-- Tab 5: ລາຍງານປະມານ -->
          <!-- <Tabs.TabPane key="5" tab="ລາຍງານປະມານ">
          
            <div
              class="border-b border-gray-200 p-4 md:p-6 bg-gradient-to-r from-red-50 to-rose-50"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 class="text-2xl md:text-3xl font-bold text-gray-900">ລາຍງານປະມານ</h1>
                  <p class="text-gray-600 mt-1">ສະແດງລາຍງານງົບປະມານທັງໝົດ</p>
                </div>
                <div class="flex items-center gap-2">
                  <div class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Icon icon="ant-design:file-text-outlined" class="inline mr-1" />
                    {{ new Date().getMonth() + 1 }} ເດືອນ
                  </div>
                  <div
                    class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <Icon icon="ant-design:exclamation-circle-outlined" class="inline mr-1" />
                    4 ເກີນງົບ
                  </div>
                </div>
              </div>
            </div>

          
            <div class="p-6">
              <div class="text-center py-12">
                <Icon
                  icon="ant-design:bar-chart-outlined"
                  class="text-6xl text-gray-300 mx-auto mb-4"
                />
                <h3 class="text-xl font-semibold text-gray-600 mb-2">ລາຍງານປະມານ</h3>
                <p class="text-gray-500">ສະແດງລາຍງານງົບປະມານທັງໝົດ</p>
              </div>
            </div>
          </Tabs.TabPane> -->
        </Tabs>
      </div>
    </div>
  </div>

  </template>

<style scoped>
.hal-group-overview-container {
  min-height: calc(100vh - 120px);
  background-color: #f8f9fa;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid-cols-1.sm\:grid-cols-2.lg\:grid-cols-3.xl\:grid-cols-6 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .grid-cols-1.sm\:grid-cols-2.lg\:grid-cols-3.xl\:grid-cols-6 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1025px) and (max-width: 1280px) {
  .grid-cols-1.sm\:grid-cols-2.lg\:grid-cols-3.xl\:grid-cols-6 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Card hover effects */
.grid > div {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.grid > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Smooth transitions for all interactive elements */
button,
input,
select {
  transition: all 0.2s ease-in-out;
}

/* Company box hover effects */
.company-box {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.company-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Budget bar animations */
.budget-bar {
  transition: width 0.5s ease-in-out;
}

/* Loading animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Custom scrollbar for budget chart */
.max-h-96::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Ensure text doesn't overflow in statistics cards */
.text-2xl\.md\:text-3xl {
  word-wrap: break-word;
  word-break: break-all;
  hyphens: auto;
  overflow-wrap: break-word;
}

/* Responsive font sizes for large numbers */
@media (max-width: 640px) {
  .text-2xl.md\:text-3xl {
    font-size: 1.25rem; /* 20px */
    line-height: 1.4;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .text-2xl.md\:text-3xl {
    font-size: 1.5rem; /* 24px */
    line-height: 1.3;
  }
}

/* Header responsive text */
.break-words {
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

/* Flex wrap for better responsive behavior */
.flex-wrap {
  flex-wrap: wrap;
}
</style>
