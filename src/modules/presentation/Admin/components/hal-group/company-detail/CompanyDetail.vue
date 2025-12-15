<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { Icon } from "@iconify/vue";
import { useReceiptStore } from "@/modules/presentation/Admin/stores/receipt.store";
import AffiliatedCompany from "../affiliated-company/AffiliatedCompany.vue";
import BudgetList from "../budget-list/BudgetList.vue";
import ApproveProposal from "../approve-proposal/ApproveProposal.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

// Import types from OverView
type Company = {
  id: number;
  name: string;
  logo: string;
  logo_url?: string;
  logoUrl?: string;
  proposalCount: number;
  budget: number;
  budgetUsed: number;
  color: string;
  userCount: number;
  allocated_amount: number;
  balance_amount: number;
  approvalWorkflowCount: number;
};

type AffiliatedCompany = {
  id: number;
  name: string;
  logo: string;
  logo_url?: string;
  logoUrl?: string;
  proposalCount: number;
  budget: number;
  budgetUsed: number;
  color: string;
  status: "active" | "inactive" | "pending";
  contractType: "annual" | "project" | "service";
  establishedYear: number;
  employees: number;
  registrationNumber: string;
};

// Interface for company data
interface CompanyDetail {
  id: number;
  name: string;
  logo: string;
  logoUrl:string;
  color: string;
  description: string;
  proposalCount: number;
  budget: number;
  budgetUsed: number;
  employees: number;
  establishedYear: number;
  registrationNumber: string;
  phone: string;
  email: string;
  address: string;
  director: string;
  status: "active" | "inactive" | "pending";
  contractType: "annual" | "project" | "service";
}

const { warning } = useNotification();
const route = useRoute();
const receiptStore = useReceiptStore();

// Props
const props = defineProps<{
  companyId?: number;
  companyData?: CompanyDetail | Company | AffiliatedCompany | null; // Add company data prop to receive from parent
}>();

// Emits
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  (e: 'close'): void;
}>();

// State
const loading = ref<boolean>(false);
const showDetail = ref<boolean>(false);
const selectedCompany = ref<CompanyDetail | Company | AffiliatedCompany | null>(null);
const activeTab = ref<string>("proposals");
const showApproveProposal = ref<boolean>(false);

// Receipts search and filter state
const receiptSearch = ref<string>("");
const selectedStatus = ref<string>("");
const selectedDateRange = ref<string>("");
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(10);

// Helper functions to safely access company properties
const getCompanyProperty = (property: string, fallback: any = '-') => {
  if (!selectedCompany.value) return fallback;

  const company = selectedCompany.value;
  // Check if property exists in the company object
  if (property in company) {
    return (company as any)[property];
  }

  // Map common properties between different company types
  const propertyMap: { [key: string]: string[] } = {
    'employees': ['userCount', 'employees'],
    'description': ['description', 'name'],
    'registrationNumber': ['registrationNumber', 'id'],
    'establishedYear': ['establishedYear', 'id'],
    'address': ['address', '-'],
    'phone': ['phone', '-'],
    'email': ['email', '-'],
    'director': ['director', '-'],
    'status': ['status', 'active'],
    'contractType': ['contractType', 'annual'],
    'logo': ['logo', 'mdi:company'],
    'logoUrl': ['logoUrl', 'logo_url'],
    'logo_url': ['logo_url', 'logoUrl']
  };

  const possibleProperties = propertyMap[property] || [property];
  for (const prop of possibleProperties) {
    if (prop in company && (company as any)[prop]) {
      return (company as any)[prop];
    }
  }

  return fallback;
};



// Load company detail
const loadCompanyDetail = async (companyId: number) => {
  // console.log('🔍 loadCompanyDetail called with companyId:', companyId);

  // Prevent double loading if already loading the same company
  if (loading.value && selectedCompany.value?.id === companyId) {
    return;
  }

  loading.value = true;
  try {
    // First try to use companyData from props if available
    if (props.companyData && props.companyData.id === companyId) {
      // console.log('✅ Using companyData from props:', props.companyData);
      selectedCompany.value = props.companyData;
    } else {
      // Fallback to mock data search
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!selectedCompany.value) {
      // console.log('❌ Company not found for ID:', companyId);
      warning("ຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນບໍລິສັດ");
    } else {
      // console.log('✅ Company found:', selectedCompany.value.name);

      // ໂຫຼດข้อมูล receipt ของบริษัทนี้
      await loadCompanyReceipts(companyId);
    }
  } catch (error) {
    console.error("Error loading company detail:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
  } finally {
    loading.value = false;
  }
};

// ໂຫຼດข้อมูล receipt ตาม company_id
const loadCompanyReceipts = async (companyId: number) => {
  try {
    console.log('🔍 Loading receipts for company:', companyId);
    // Clear receipt data before loading new data
    receiptStore.receipts = [];
    const result = await receiptStore.fetchByCompanyId(companyId, { page: 1, limit: 100 });
    console.log('✅ Receipts loaded:', result?.data?.length || 0, 'items');

    // Reset filters
    receiptSearch.value = "";
    selectedStatus.value = "";
    selectedDateRange.value = "";
    currentPage.value = 1;
  } catch (error) {
    console.error('❌ Error loading receipts:', error);
  }
};

// Computed property for filtered receipts
const filteredReceipts = computed(() => {
  let filtered = receiptStore.receipts;

  // Filter by search term
  if (receiptSearch.value) {
    const searchLower = receiptSearch.value.toLowerCase();
    filtered = filtered.filter(receipt =>
      receipt.receipt_number?.toLowerCase().includes(searchLower) ||
      receipt.po_number?.toLowerCase().includes(searchLower) ||
      receipt.remark?.toLowerCase().includes(searchLower)
    );
  }

  // Filter by status
  if (selectedStatus.value) {
    filtered = filtered.filter(receipt =>
      receipt.user_approval?.document_status?.name === selectedStatus.value
    );
  }

  // Filter by date range
  if (selectedDateRange.value) {
    const now = new Date();
    let startDate: Date;

    switch(selectedDateRange.value) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    filtered = filtered.filter(receipt => {
      const receiptDate = new Date(receipt.receipt_date);
      return receiptDate >= startDate && receiptDate <= now;
    });
  }

  return filtered;
});

// Computed property for paginated receipts
const paginatedReceipts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReceipts.value.slice(start, end);
});

// Computed property for total pages
const totalPages = computed(() => {
  return Math.ceil(filteredReceipts.value.length / itemsPerPage.value);
});

// Get unique statuses for filter options
const statusOptions = computed(() => {
  const statuses = [...new Set(receiptStore.receipts.map(r => r.user_approval?.document_status?.name).filter(Boolean))];
  return statuses.map(status => ({ label: status, value: status }));
});

// Change page function
const changePage = (page: number) => {
  currentPage.value = page;
};

// Change items per page
const changeItemsPerPage = (limit: number) => {
  itemsPerPage.value = limit;
  currentPage.value = 1;
};

// Show company detail
const showCompanyDetail = (company: { id: number }) => {
  loadCompanyDetail(company.id);
  showDetail.value = true;
};


// Navigate to approve proposal
const navigateToApproveProposal = () => {
  showApproveProposal.value = true;
};

// Close approve proposal
const closeApproveProposal = () => {
  showApproveProposal.value = false;
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

// Calculate budget percentage
const getBudgetPercentage = (budgetUsed: number, budget: number) => {
  return Math.round((budgetUsed / budget) * 100);
};

// Get color classes for company logo
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

// Handle image error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
};

// Expose methods to parent
defineExpose({
  showCompanyDetail,
});

// Load company if companyId prop is provided or from route params
onMounted(() => {
  const companyId = props.companyId || Number(route.params.id);
  // console.log('🔍 CompanyDetail onMounted - companyId:', companyId);
  if (companyId) {
    loadCompanyDetail(companyId);
    showDetail.value = true;
  }
});

// Watch for companyId prop changes
watch(() => props.companyId, (newCompanyId) => {
  // console.log('🔍 CompanyDetail watch - companyId changed:', newCompanyId);
  if (newCompanyId) {
    loadCompanyDetail(newCompanyId);
    showDetail.value = true;
  }
}, { immediate: true });

// Watch for companyData prop changes
watch(() => props.companyData, (newCompanyData) => {
  // console.log('🔍 CompanyDetail watch - companyData changed:', newCompanyData);
  if (newCompanyData) {
    selectedCompany.value = newCompanyData;
    showDetail.value = true;
  }
}, { immediate: true });
</script>

<template>
  <div class="company-detail-manager">
    <!-- Main Affiliated Company List -->
    <AffiliatedCompany
      v-if="!showDetail"
      @view-details="showCompanyDetail"
    />

    <!-- Company Detail View -->
    <div v-if="showDetail" class="company-detail-view">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <Icon icon="mdi:loading" class="text-4xl text-blue-600 animate-spin" />
      </div>

      <!-- Company Detail Content -->
      <div v-else-if="selectedCompany" class="bg-gray-50 min-h-screen">
        <!-- Header -->
        <!-- <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div class="max-w-7xl mx-auto px-4 py-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <button
                  @click="closeDetail"
                  class="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Icon icon="mdi:arrow-left" class="text-xl" />
                </button>
                <h1 class="text-2xl font-bold">ລາຍລະອຽດບໍລິສັດ</h1>
              </div>
            </div>
          </div>
        </div> -->
        <div class="max-w-7xl mx-auto px-4 py-6">
          <!-- Company Header Card -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex items-start gap-6">
              <!-- Company Logo -->
              <div
                class="p-6 rounded-full flex-shrink-0 flex items-center justify-center"
                :class="[getLogoBgColor(selectedCompany.color), getLogoTextColor(selectedCompany.color)]"
              >
                <!-- Show actual logo if logoUrl exists, otherwise show icon -->
                <img
                  v-if="getCompanyProperty('logoUrl')"
                  :src="getCompanyProperty('logoUrl')"
                  :alt="selectedCompany.name"
                  class="w-20 h-20 rounded-full object-cover"
                  @error="handleImageError"
                />
                <Icon
                  v-else
                  :icon="selectedCompany.logo"
                  class="text-5xl"
                />
              </div>

              <!-- Company Info -->
              <div class="flex-1">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ selectedCompany.name }}</h2>
                <p class="text-gray-600 text-lg">{{ getCompanyProperty('description', selectedCompany.name) }}</p>
              </div>
            </div>
          </div>

          <!-- Collapsible Information Section -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <details class="group">
              <summary class="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                <h3 class="text-lg font-semibold text-gray-900">ຂໍ້ມູນທົ່ວໄປຂອງບໍລິສັດ</h3>
                <Icon
                  icon="mdi:chevron-down"
                  class="text-xl text-gray-500 group-open:rotate-180 transition-transform duration-200"
                />
              </summary>

              <div class="px-6 pb-6 border-t">
                <div class="mt-6">
                  <!-- Statistics Cards -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <!-- ໃບສະເໜີ -->
                    <div class="bg-blue-50 rounded-lg p-4 text-center">
                      <div class="text-2xl font-bold text-blue-600 mb-1">{{ selectedCompany.proposalCount }}</div>
                      <div class="text-sm text-blue-700">ໃບສະເໜີ</div>
                    </div>

                    <!-- ງົບປະມານຕົ້ນປີ -->
                    <div class="bg-green-50 rounded-lg p-4 text-center">
                      <div class="text-2xl font-bold text-green-600 mb-1">{{ formatCurrency(selectedCompany.budget) }}</div>
                      <div class="text-sm text-green-700">ງົບປະມານຕົ້ນປີ</div>
                    </div>

                    <!-- ງົບປະມານທີ່ໃຊ້ແລ້ວ -->
                    <div class="bg-orange-50 rounded-lg p-4 text-center">
                      <div class="text-2xl font-bold text-orange-600 mb-1">{{ formatCurrency(selectedCompany.budgetUsed) }}</div>
                      <div class="text-sm text-orange-700">ງົບປະມານທີ່ໃຊ້ແລ້ວ</div>
                    </div>

                    <!-- ງົບປະມານທີ່ຍັງເຫຼືອ -->
                    <div class="bg-purple-50 rounded-lg p-4 text-center">
                      <div class="text-2xl font-bold text-purple-600 mb-1">
                        {{ formatCurrency(Math.max(0, selectedCompany.budget - selectedCompany.budgetUsed)) }}
                      </div>
                      <div class="text-sm text-purple-700">ງົບປະມານທີ່ຍັງເຫຼືອ</div>
                    </div>
                  </div>

                  <!-- Detailed Information -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Basic Info -->
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-3">ຂໍ້ມູນພື້ນຖານ</h4>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">ເລກທະບຽນ:</span>
                          <span class="font-medium">{{ getCompanyProperty('registrationNumber') }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ປີທີ່ສ້າງ:</span>
                          <span class="font-medium">{{ getCompanyProperty('establishedYear') }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ພະນັກງານ:</span>
                          <span class="font-medium">{{ getCompanyProperty('employees') }} ຄົນ</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ປະເພດສັນຍາ:</span>
                          <span class="font-medium">
                            {{ getCompanyProperty('contractType') === 'annual' ? 'ປະຈຳປີ' : getCompanyProperty('contractType') === 'project' ? 'ຕາມໂຄງການ' : 'ບໍລິການ' }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Contact Info -->
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-3">ຂໍ້ມູນຕິດຕໍ່</h4>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">ທີ່ຢູ່:</span>
                          <span class="font-medium text-right">{{ getCompanyProperty('address') }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ໂທລະສັບ:</span>
                          <span class="font-medium">{{ getCompanyProperty('phone') }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ອີເມວ:</span>
                          <span class="font-medium">{{ getCompanyProperty('email') }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ຜູ້ອຳນວຍການ:</span>
                          <span class="font-medium">{{ getCompanyProperty('director') }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Performance -->
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-3">ຜົນດຳເນີນງານຂອງບໍລິສັດໃນເຄືອ</h4>
                      <div class="space-y-3">
                        <div>
                          <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600">ການໃຊ້ງົບປະມານ</span>
                            <span class="font-medium">{{ getBudgetPercentage(selectedCompany.budgetUsed, selectedCompany.budget) }}%</span>
                          </div>
                          <div class="w-full bg-gray-200 rounded-full h-2">
                            <div
                              class="h-2 rounded-full transition-all duration-300"
                              :class="getBudgetPercentage(selectedCompany.budgetUsed, selectedCompany.budget) > 100 ? 'bg-red-500' : 'bg-blue-500'"
                              :style="`width: ${Math.min(getBudgetPercentage(selectedCompany.budgetUsed, selectedCompany.budget), 100)}%`"
                            ></div>
                          </div>
                        </div>

                        <div class="pt-2 border-t">
                          <div class="flex justify-between text-sm">
                            <span class="text-gray-600">ສະຖານະບໍລິສັດ:</span>
                            <span
                              class="px-2 py-1 rounded-full text-xs font-medium"
                              :class="getCompanyProperty('status') === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                            >
                              {{ getCompanyProperty('status') === 'active' ? 'ກຳລັງຜູກສັນຍາ' : 'ສິ້ນສຸດສັນຍາ' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <!-- Pending Proposals Section -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold text-gray-900">ໃບສະເໜີທີ່ລໍຖ້າອະນຸມັດ</h3>
                <div class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  {{ selectedCompany.proposalCount }} ໃບສະເໜີ
                </div>
              </div>
              <!-- Approve Button with Auto Zoom Animation -->
              <UiButton
                class="relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-500 transform shadow-md hover:shadow-xl flex items-center gap-3 group overflow-hidden animate-zoom-in-out font-semibold text-base"
                @click="navigateToApproveProposal"
                size="large"
              >
                <!-- Animated background ripple effect -->
                <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-all duration-300 rounded-lg"></div>
                <!-- Left side - Icon -->
                <div class="relative z-10 icon-check">
                  <Icon icon="mdi:check-circle" class="text-2xl" />
                </div>
                <!-- Center text -->
                <div class="relative z-10">
                  <span class="font-semibold block ">
                    ອະນຸມັດໃບສະເໜີ
                  </span>
                </div>
                <!-- Right side - Arrow -->
                <div class="relative z-10">
                  <Icon icon="mdi:arrow-right" class="text-xl" />
                </div>
                <!-- Shimmer effect -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-lg"></div>
              </UiButton>
            </div>

            <!-- Pending Proposals Summary -->
            <div class="grid grid-cols-3 gap-3 mt-4">
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
                <div class="p-2 bg-yellow-100 rounded-full">
                  <Icon icon="mdi:clock" class="text-yellow-600 text-xl" />
                </div>
                <div>
                  <div class="text-xs text-yellow-700 font-medium">ລໍຖ້າອະນຸມັດ</div>
                  <div class="text-xl font-bold text-yellow-900">{{ selectedCompany.proposalCount }}</div>
                </div>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                <div class="p-2 bg-blue-100 rounded-full">
                  <Icon icon="mdi:file-eye" class="text-blue-600 text-xl" />
                </div>
                <div>
                  <div class="text-xs text-blue-700 font-medium">ກຳລັງພິຈາລະນາ</div>
                  <div class="text-xl font-bold text-blue-900">{{ 8 }}</div>
                </div>
              </div>

              <div class="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                <div class="p-2 bg-green-100 rounded-full">
                  <Icon icon="mdi:check-circle" class="text-green-600 text-xl" />
                </div>
                <div>
                  <div class="text-xs text-green-700 font-medium">ອະນຸມັດແລ້ວ</div>
                  <div class="text-xl font-bold text-green-900">{{ 22 }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs Section -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <!-- Tab Headers -->
            <div class="flex border-b">
              <button
                @click="activeTab = 'proposals'"
                :class="[
                  'flex-1 px-4 py-3 text-center font-medium transition-colors',
                  activeTab === 'proposals'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                ]"
              >
                <Icon icon="mdi:file-document" class="inline mr-1" />
                ໃບສະເໜີ
              </button>

              <button
                @click="activeTab = 'budget'"
                :class="[
                  'flex-1 px-4 py-3 text-center font-medium transition-colors',
                  activeTab === 'budget'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                ]"
              >
                <Icon icon="mdi:finance" class="inline mr-1" />
                ງົບປະມານ
              </button>
            </div>

            <!-- Tab Content -->
            <div class="p-4">
              <!-- Proposals Tab (แสดง Receipts) -->
              <div v-if="activeTab === 'proposals'">
                <div class="space-y-4">
                  <!-- Loading State -->
                  <div v-if="receiptStore.loading" class="flex items-center justify-center py-8">
                    <Icon icon="mdi:loading" class="text-4xl text-blue-600 animate-spin mr-2" />
                    <span class="text-gray-600">ກຳລັງໂຫຼດຂໍ້ມູນຮັບເງິນ...</span>
                  </div>

                  <!-- Receipts Table with Search and Filters -->
                  <div v-else>
                    <!-- Header with Title and Results Count -->
                    <div class="bg-gray-50 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-4">
                        <h4 class="text-lg font-semibold text-gray-900">
                          <Icon icon="mdi:receipt" class="inline mr-2" />
                          ຂໍ້ມູນຮັບເງິນ
                        </h4>
                        <div class="text-sm text-gray-600">
                          ພົບ {{ filteredReceipts.length }} ລາຍການ (ຈາກທັງໝົດ {{ receiptStore.receipts.length }} ລາຍການ)
                        </div>
                      </div>

                      <!-- Search and Filter Controls -->
                      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                        <!-- Search Input -->
                        <div class="md:col-span-2">
                          <div class="relative">
                            <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              v-model="receiptSearch"
                              type="text"
                              placeholder="ຄົ້ນຫາ ເລກທີ່ຮັບເງິນ, PO, ຫຼື ໝາຍເຫດ..."
                              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <!-- Status Filter -->
                        <div>
                          <select
                            v-model="selectedStatus"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">ສະຖານະທັງໝົດ</option>
                            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                              {{ status.label }}
                            </option>
                          </select>
                        </div>

                        <!-- Date Range Filter -->
                        <div>
                          <select
                            v-model="selectedDateRange"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">ວັນທີ່ທັງໝົດ</option>
                            <option value="today">ມື້ນີ້</option>
                            <option value="week">7 ວັນທີ່ຜ່ານມາ</option>
                            <option value="month">ເດືອນນີ້</option>
                            <option value="year">ປີນີ້</option>
                          </select>
                        </div>
                      </div>

                      <!-- Clear Filters Button -->
                      <div v-if="receiptSearch || selectedStatus || selectedDateRange" class="mb-4">
                        <button
                          @click="
                            receiptSearch = '';
                            selectedStatus = '';
                            selectedDateRange = '';
                            currentPage = 1;
                          "
                          class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Icon icon="mdi:filter-remove" />
                          ລ້າງຕົວກັ່ນ
                        </button>
                      </div>

                      <!-- Results Table -->
                      <div class="overflow-x-auto">
                        <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                          <thead class="bg-gray-100">
                            <tr>
                              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ເລກທີ່ຮັບເງິນ</th>
                              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ເລກທີ່ PO</th>
                              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ວັນທີ່ຮັບເງິນ</th>
                              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ຜູ້ຮ້ອງຂໍ</th>
                              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ຈຸດຮັບ/ສົ່ງ</th>
                              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ຈຳນວນລາຍການ</th>
                              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ມູນຄ່າ</th>
                              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">VAT</th>
                              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ລວມທັງໝົດ</th>
                              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ສະຖານະ</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200">
                            <tr v-for="receipt in paginatedReceipts" :key="receipt.id" class="hover:bg-gray-50">
                              <td class="px-4 py-3 text-sm">{{ receipt.receipt_number }}</td>
                              <td class="px-4 py-3 text-sm">{{ receipt.po_number }}</td>
                              <td class="px-4 py-3 text-sm">{{ receipt.receipt_date }}</td>
                              <!-- Requester -->
                              <td class="px-4 py-3 text-sm">
                                <div class="flex flex-col">
                                  <span class="font-medium">{{ receipt.document?.requester?.username || '-' }}</span>
                                  <span class="text-xs text-gray-500">{{ receipt.document?.requester?.email || '-' }}</span>
                                </div>
                              </td>
                              <!-- Department (Pickup/Delivery Point) -->
                              <td class="px-4 py-3 text-sm">
                                <div class="flex flex-col">
                                  <span class="font-medium">{{ receipt.document?.department?.name || '-' }}</span>
                                  <span class="text-xs text-gray-500">{{ receipt.document?.department?.code || '-' }}</span>
                                </div>
                              </td>
                              <td class="px-4 py-3 text-sm text-center">{{ receipt.receipt_item?.length || 0 }}</td>
                              <td class="px-4 py-3 text-sm text-right">{{ formatCurrency(receipt.sub_total || 0) }}</td>
                              <td class="px-4 py-3 text-sm text-right">{{ formatCurrency(receipt.vat || 0) }}</td>
                              <td class="px-4 py-3 text-sm text-right font-semibold">{{ formatCurrency(receipt.total || 0) }}</td>
                              <td class="px-4 py-3 text-sm">
                                <span
                                  class="px-2 py-1 rounded-full text-xs font-medium"
                                  :class="receipt.user_approval?.document_status?.name === 'APPROVED'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'"
                                >
                                  {{ receipt.user_approval?.document_status?.name || 'PENDING' }}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                          <tfoot class="bg-gray-50">
                            <tr>
                              <td colspan="6" class="px-4 py-3 text-sm font-semibold text-gray-700">ລວມທັງໝົດ:</td>
                              <td class="px-4 py-3 text-sm text-right font-semibold">
                                {{ formatCurrency(paginatedReceipts.reduce((sum, r) => sum + (r.sub_total || 0), 0)) }}
                              </td>
                              <td class="px-4 py-3 text-sm text-right font-semibold">
                                {{ formatCurrency(paginatedReceipts.reduce((sum, r) => sum + (r.vat || 0), 0)) }}
                              </td>
                              <td class="px-4 py-3 text-sm text-right font-semibold">
                                {{ formatCurrency(paginatedReceipts.reduce((sum, r) => sum + (r.total || 0), 0)) }}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <!-- Pagination -->
                      <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-gray-600">ສະແດງລາຍການ:</span>
                          <select
                            v-model="itemsPerPage"
                            @change="changeItemsPerPage(Number(($event.target as HTMLSelectElement)?.value))"
                            class="px-3 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option :value="10">10</option>
                            <option :value="25">25</option>
                            <option :value="50">50</option>
                            <option :value="100">100</option>
                          </select>
                        </div>

                        <div class="flex items-center gap-2">
                          <button
                            @click="changePage(1)"
                            :disabled="currentPage === 1"
                            class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            <Icon icon="mdi:page-first" />
                          </button>
                          <button
                            @click="changePage(currentPage - 1)"
                            :disabled="currentPage === 1"
                            class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            <Icon icon="mdi:chevron-left" />
                          </button>

                          <span class="px-4 py-1 text-sm">
                            ໜ້າ {{ currentPage }} ຈາກ {{ totalPages }}
                          </span>

                          <button
                            @click="changePage(currentPage + 1)"
                            :disabled="currentPage === totalPages"
                            class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            <Icon icon="mdi:chevron-right" />
                          </button>
                          <button
                            @click="changePage(totalPages)"
                            :disabled="currentPage === totalPages"
                            class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            <Icon icon="mdi:page-last" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- No Results After Filter -->
                  <div v-if="filteredReceipts.length === 0 && receiptStore.receipts.length > 0" class="text-center py-8">
                    <Icon icon="mdi:filter-off" class="text-6xl text-gray-300 mb-4" />
                    <p class="text-gray-500 text-lg">ບໍ່ພົບຂໍ້ມູນທີ່ຕົງກັບຕົວກັ່ນ</p>
                    <button
                      @click="
                        receiptSearch = '';
                        selectedStatus = '';
                        selectedDateRange = '';
                        currentPage = 1;
                      "
                      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      ລ້າງຕົວກັ່ນ
                    </button>
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="receiptStore.receipts.length === 0" class="text-center py-8">
                    <Icon icon="mdi:receipt" class="text-6xl text-gray-300 mb-4" />
                    <p class="text-gray-500 text-lg">ຍັງບໍ່ມີຂໍ້ມູນຮັບເງິນ</p>
                    <p class="text-gray-400 text-sm mt-2">ບໍລິສັດນີ້ຍັງບໍ່ມີການດຳເນີນການຮັບເງິນ</p>
                  </div>
                </div>
              </div>

              <!-- Budget Tab -->
              <div v-if="activeTab === 'budget'">
                <BudgetList :company-id="selectedCompany.id" />
              </div>
            </div>
          </div>

          <!-- Approve Proposal Modal/Overlay -->
          <div
            v-if="showApproveProposal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            @click.self="closeApproveProposal"
          >
            <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-zoom-in">
              <!-- Modal Header -->
              <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-xl font-bold">ອະນຸມັດໃບສະເໜີ</h3>
                    <p class="text-orange-100 mt-1">ຈັດການອະນຸມັດໃບສະເໜີຂອງ {{ selectedCompany?.name }}</p>
                  </div>
                  <button
                    @click="closeApproveProposal"
                    class="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Icon icon="mdi:close" class="text-xl" />
                  </button>
                </div>
              </div>

              <!-- Modal Content -->
              <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 120px);">
                <ApproveProposal
                  :selectedCompany="selectedCompany ? { name: selectedCompany.name, id: selectedCompany.id } : null"
                  @approve="(ids) => console.log('Approved:', ids)"
                  @reject="(ids) => console.log('Rejected:', ids)"
                  @selectRequest="(request) => console.log('Selected:', request)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.company-detail-manager {
  min-height: calc(100vh - 200px);
  background-color: #f8f9fa;
}

.company-detail-view {
  background-color: #f8f9fa;
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

/* Zoom in animation for modal */
@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-zoom-in {
  animation: zoom-in 0.3s ease-out;
}

/* Pulse animation for badge */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Auto zoom in/out animation for approve button */
@keyframes zoom-in-out {
  0%, 100% {
    transform: scale(1) translateY(0px);
  }
  25% {
    transform: scale(1.02) translateY(-1px);
  }
  50% {
    transform: scale(1.04) translateY(-2px);
  }
  75% {
    transform: scale(1.02) translateY(-1px);
  }
}

.animate-zoom-in-out {
  background: linear-gradient(135deg, #fb923c, #ea580c) !important;
  background-size: 200% 200% !important;
  animation: zoom-in-out 2.5s ease-in-out infinite, gradient-shift 3.5s ease infinite, glow-pulse 2s ease-in-out infinite;
}

.animate-zoom-in-out:hover {
  animation-play-state: paused;
}

/* Gradient animation */
@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Glow animation */
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(251, 146, 60, 0.2);
  }
  50% {
    box-shadow: 0 0 25px rgba(251, 146, 60, 0.4);
  }
}

/* Icon bounce animation */
@keyframes icon-bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.1);
  }
}

/* Apply icon bounce to check icon */
.animate-zoom-in-out .icon-check {
  animation: icon-bounce 2.5s ease-in-out infinite;
}

/* Button hover effects */
.button-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Modal backdrop blur */
.backdrop-blur {
  backdrop-filter: blur(4px);
}

/* Custom details styling */
details summary::-webkit-details-marker {
  display: none;
}

details summary {
  list-style: none;
}

/* Focus styles */
details summary:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  border-radius: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>