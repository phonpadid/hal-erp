<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { Icon } from "@iconify/vue";
import AffiliatedCompany from "../affiliated-company/AffiliatedCompany.vue";
import ProposalList from "../proposal-list/ProposalList.vue";
import BudgetList from "../budget-list/BudgetList.vue";
import ApproveProposal from "../approve-proposal/ApproveProposal.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

// Interface for company data
interface CompanyDetail {
  id: number;
  name: string;
  logo: string;
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

// Props
const props = defineProps<{
  companyId?: number;
}>();

// Emits
const emit = defineEmits<{
  (e: 'close'): void;
}>();

// State
const loading = ref<boolean>(false);
const showDetail = ref<boolean>(false);
const selectedCompany = ref<CompanyDetail | null>(null);
const activeTab = ref<string>("proposals");
const showApproveProposal = ref<boolean>(false);

// Get company detail from all companies
const getCompanyDetail = (companyId: number): CompanyDetail | null => {
  // Mock data for all 20 companies
  const companies: CompanyDetail[] = [
    {
      id: 1,
      name: "HAL ບໍລິສັດ",
      logo: "mdi:company",
      color: "blue",
      description: "ບໍລິສັດບໍລິຫານຈັດການ ແລະ ການລົງທຶນຫຼາຍດ້ານ ທາງດ້ານອຸດສາຫະກຳ ແລະ ການບໍລິການ",
      proposalCount: 45,
      budget: 50000000,
      budgetUsed: 55000000,
      employees: 250,
      establishedYear: 2015,
      registrationNumber: "HAL-001-2015",
      phone: "+856 21 123 456",
      email: "info@hal-group.la",
      address: "ຖະໜົນວຽງຈັນ, ເມືອງຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ",
      director: "ສົມສະຫວາດ ວົງສາ",
      status: "active",
      contractType: "annual",
    },
    {
      id: 2,
      name: "HAL Tech",
      logo: "mdi:rocket-launch",
      color: "green",
      description: "ບໍລິສັດເຕັກໂນໂລຊີຊັ້ນນຳ ຈັດການດ້ານການພັດທະນາຊອບແວຊອບ ແລະ ໂຄງການດິຈິຕອນ",
      proposalCount: 38,
      budget: 40000000,
      budgetUsed: 28000000,
      employees: 180,
      establishedYear: 2018,
      registrationNumber: "HLT-002-2018",
      phone: "+856 21 234 567",
      email: "tech@hal-group.la",
      address: "ຖະໜົນສີສະຫວັດ, ເມືອງໄຊທານີ, ນະຄອນຫຼວງວຽງຈັນ",
      director: "ຄຳພອນ ໄຊຍະສາດ",
      status: "active",
      contractType: "annual",
    },
    {
      id: 3,
      name: "HAL Energy",
      logo: "mdi:lightning-bolt",
      color: "yellow",
      description: "ບໍລິສັດຜະລິດ ແລະ ຈັດຈຳໜ່າຍພະລັງງານ ທັງພະລັງງານທົດແທນ ແລະ ພະລັງງານສະອາດ",
      proposalCount: 52,
      budget: 60000000,
      budgetUsed: 75000000,
      employees: 320,
      establishedYear: 2016,
      registrationNumber: "HLE-003-2016",
      phone: "+856 21 345 678",
      email: "energy@hal-group.la",
      address: "ຖະໜົນໂພນສຸວັນ, ເມືອງຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ",
      director: "ມາລີ ດວງສະຫວັນ",
      status: "active",
      contractType: "project",
    },
    {
      id: 4,
      name: "HAL Service",
      logo: "mdi:account-tie",
      color: "purple",
      description: "ບໍລິສັດບໍລິການຊັ້ນນຳ ຈັດການດ້ານການໃຫ້ບໍລິກາລະຊັບ ແລະ ການປຶກສາດ້ານຕ່າງໆ",
      proposalCount: 29,
      budget: 30000000,
      budgetUsed: 22000000,
      employees: 150,
      establishedYear: 2017,
      registrationNumber: "HLS-004-2017",
      phone: "+856 21 456 789",
      email: "service@hal-group.la",
      address: "ຖະໜົນສີສະຫວັດ, ເມືອງຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ",
      director: "ບຸນທອນ ວົງສາ",
      status: "active",
      contractType: "service",
    },
    {
      id: 5,
      name: "HAL Logistics",
      logo: "mdi:truck",
      color: "orange",
      description: "ບໍລິສັດຂົນສົ່ງສິນຄ້າ ແລະ ການຈັດການສາງຄ້າຊັ້ນນຳ ຄອບຄຸມທົ່ວປະເທດ",
      proposalCount: 18,
      budget: 25000000,
      budgetUsed: 18000000,
      employees: 120,
      establishedYear: 2019,
      registrationNumber: "HLL-005-2019",
      phone: "+856 21 567 890",
      email: "logistics@hal-group.la",
      address: "ຖະໜົນສຸກສະຫວັນ, ເມືອງສີສັດຕະນະ, ນະຄອນຫຼວງວຽງຈັນ",
      director: "ສີສຸດ ດວງສະຫວັນ",
      status: "active",
      contractType: "annual",
    },
    {
      id: 6,
      name: "HAL Construction",
      logo: "mdi:hammer",
      color: "red",
      description: "ບໍລິສັດຮັບເໝົາກໍ່າສ້າງ ແລະ ກໍ່າສ້າງໂຄງການອຸດສາຫະກຳ ແລະ ສິ່ງປຸກສ້າງຕ່າງໆ",
      proposalCount: 42,
      budget: 55000000,
      budgetUsed: 65000000,
      employees: 280,
      establishedYear: 2014,
      registrationNumber: "HLC-006-2014",
      phone: "+856 21 678 901",
      email: "construction@hal-group.la",
      address: "ຖະໜົນໂພນສຸວັນ, ເມືອງຫົວສາຍ, ນະຄອນຫຼວງວຽງຈັນ",
      director: "ອິນທະວົງ ວົງສາ",
      status: "active",
      contractType: "project",
    },
    {
      id: 7,
      name: "HAL Agriculture",
      logo: "mdi:tractor",
      color: "teal",
      description: "ບໍລິສັດການກະສິກຳ ແລະ ການປຸງຜະລິດທາງກະສິກຳ ສົ່ງເສີມປະກອນອາຫານ",
      proposalCount: 25,
      budget: 35000000,
      budgetUsed: 25000000,
      employees: 95,
      establishedYear: 2020,
      registrationNumber: "HLA-007-2020",
      phone: "+856 21 789 012",
      email: "agriculture@hal-group.la",
      address: "ເມືອງຄຳມ່ວນ, ແຂວງວຽງຈັນ",
      director: "ຄຳພອນ ດວງສະຫວັນ",
      status: "active",
      contractType: "annual",
    },
    {
      id: 8,
      name: "HAL Education",
      logo: "mdi:school",
      color: "indigo",
      description: "ບໍລິສັດການສຶກສາ ແລະ ຝຶກອົບຮົມ ສະໜອງການຝຶກອົບຮົມທັງລະດັບ ແລະ ການປຶກສາ",
      proposalCount: 33,
      budget: 45000000,
      budgetUsed: 30000000,
      employees: 140,
      establishedYear: 2018,
      registrationNumber: "HLE-008-2018",
      phone: "+856 21 890 123",
      email: "education@hal-group.la",
      address: "ຖະໜົນສີສະຫວັດ, ເມືອງໄຊທານີ, ນະຄອນຫຼວງວຽງຈັນ",
      director: "ດວນໄຊ ວົງສາ",
      status: "active",
      contractType: "service",
    },
    {
      id: 9,
      name: "HAL Healthcare",
      logo: "mdi:hospital",
      color: "pink",
      description: "ບໍລິສັດການປະກອບການສຸຂະພາບ ແລະ ການຄ້າ ສະຫນອງການປິ່ນປົວຍແລະຢາປະສົບ",
      proposalCount: 48,
      budget: 70000000,
      budgetUsed: 85000000,
      employees: 380,
      establishedYear: 2016,
      registrationNumber: "HLH-009-2016",
      phone: "+856 21 901 234",
      email: "healthcare@hal-group.la",
      address: "ຖະໜົນການເສີມ, ເມືອງຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ",
      director: "ນາງ ສຸວສີ ວົງສາ",
      status: "active",
      contractType: "annual",
    },
    {
      id: 10,
      name: "HAL Finance",
      logo: "mdi:bank",
      color: "cyan",
      description: "ບໍລິສັດການເງິນ ແລະ ການລົງທຶນ ສະໜອງການບໍລິການທາງດ້ານການເງິນທະນາຄານ",
      proposalCount: 36,
      budget: 48000000,
      budgetUsed: 32000000,
      employees: 165,
      establishedYear: 2017,
      registrationNumber: "HLF-010-2017",
      phone: "+856 21 012 345",
      email: "finance@hal-group.la",
      address: "ຖະໜົນລາດພັດທະນາ, ເມືອງຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ",
      director: "ສະໜອນ ດວງສະຫວັນ",
      status: "active",
      contractType: "service",
    },
  ];

  return companies.find(c => c.id === companyId) || null;
};

// Load company detail
const loadCompanyDetail = async (companyId: number) => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    selectedCompany.value = getCompanyDetail(companyId);

    if (!selectedCompany.value) {
      warning("ຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນບໍລິສັດ");
    }
  } catch (error) {
    console.error("Error loading company detail:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
  } finally {
    loading.value = false;
  }
};

// Show company detail
const showCompanyDetail = (company: { id: number }) => {
  loadCompanyDetail(company.id);
  showDetail.value = true;
};

// Close detail
const closeDetail = () => {
  showDetail.value = false;
  showApproveProposal.value = false;
  selectedCompany.value = null;
  emit('close');
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

// Expose methods to parent
defineExpose({
  showCompanyDetail,
});

// Load company if companyId prop is provided or from route params
onMounted(() => {
  const companyId = props.companyId || Number(route.params.id);
  if (companyId) {
    loadCompanyDetail(companyId);
    showDetail.value = true;
  }
});

// Watch for companyId prop changes
watch(() => props.companyId, (newCompanyId) => {
  if (newCompanyId) {
    loadCompanyDetail(newCompanyId);
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
                class="p-6 rounded-full flex-shrink-0"
                :class="[getLogoBgColor(selectedCompany.color), getLogoTextColor(selectedCompany.color)]"
              >
                <Icon :icon="selectedCompany.logo" class="text-5xl" />
              </div>

              <!-- Company Info -->
              <div class="flex-1">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ selectedCompany.name }}</h2>
                <p class="text-gray-600 text-lg">{{ selectedCompany.description }}</p>
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
                          <span class="font-medium">{{ selectedCompany.registrationNumber }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ປີທີ່ສ້າງ:</span>
                          <span class="font-medium">{{ selectedCompany.establishedYear }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ພະນັກງານ:</span>
                          <span class="font-medium">{{ selectedCompany.employees }} ຄົນ</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ປະເພດສັນຍາ:</span>
                          <span class="font-medium">
                            {{ selectedCompany.contractType === 'annual' ? 'ປະຈຳປີ' : selectedCompany.contractType === 'project' ? 'ຕາມໂຄງການ' : 'ບໍລິການ' }}
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
                          <span class="font-medium text-right">{{ selectedCompany.address }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ໂທລະສັບ:</span>
                          <span class="font-medium">{{ selectedCompany.phone }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ອີເມວ:</span>
                          <span class="font-medium">{{ selectedCompany.email }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">ຜູ້ອຳນວຍການ:</span>
                          <span class="font-medium">{{ selectedCompany.director }}</span>
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
                              :class="selectedCompany.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                            >
                              {{ selectedCompany.status === 'active' ? 'ກຳລັງຜູກສັນຍາ' : 'ສິ້ນສຸດສັນຍາ' }}
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
              <!-- Proposals Tab -->
              <div v-if="activeTab === 'proposals'">
                <ProposalList :company-id="selectedCompany.id" />
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