<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";

import { useNotification } from "@/modules/shared/utils/useNotification";
import { useReceiptStore } from "@/modules/presentation/Admin/stores/receipt.store";
import UiButton from "@/common/shared/components/button/UiButton.vue";

import AffiliatedCompany from "../affiliated-company/AffiliatedCompany.vue";
import BudgetList from "../budget-list/BudgetList.vue";
import ApproveProposal from "../approve-proposal/ApproveProposal.vue";

import {
  SummaryCard,
  MoneyText,
  BudgetBar,
  CompanyLogo,
  EmptyState,
  LoadingSpinner,
  useBudgetStatus,
  useCompanyTheme,
  type ThemeColor,
} from "../_shared";

// ─────────────────────────────────────────────────────────────────────────────
// Types — narrow union for the company shape we accept from the parent
// ─────────────────────────────────────────────────────────────────────────────
interface BaseCompany {
  id: number;
  name: string;
  logo?: string;
  logoUrl?: string;
  logo_url?: string;
  color?: string;
  proposalCount: number;
  budget: number;
  budgetUsed: number;
}

interface ExtendedCompanyFields {
  description?: string;
  employees?: number;
  userCount?: number;
  establishedYear?: number;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  director?: string;
  status?: "active" | "inactive" | "pending";
  contractType?: "annual" | "project" | "service";
}

type CompanyInput = BaseCompany & ExtendedCompanyFields;

const props = defineProps<{
  companyId?: number;
  companyData?: CompanyInput | null;
}>();

const emit = defineEmits<{ (e: "close"): void }>();

// ─────────────────────────────────────────────────────────────────────────────
// Dependencies
// ─────────────────────────────────────────────────────────────────────────────
const route = useRoute();
const router = useRouter();
const { warning } = useNotification();
const receiptStore = useReceiptStore();

const { getBudgetPercentage } = useBudgetStatus();
const { colorForCompany } = useCompanyTheme();

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────
const loading = ref(false);
const showDetail = ref(false);
const showApproveProposal = ref(false);
const activeTab = ref<"proposals" | "budget">("proposals");
const selectedCompany = ref<CompanyInput | null>(null);

const receiptSearch = ref("");
const selectedStatus = ref("");
const selectedDateRange = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const goBack = () => router.back();

// ─────────────────────────────────────────────────────────────────────────────
// Derived data
// ─────────────────────────────────────────────────────────────────────────────
const themeColor = computed<ThemeColor>(() =>
  selectedCompany.value
    ? colorForCompany(selectedCompany.value.id)
    : "blue",
);

const logoSource = computed(() => {
  const c = selectedCompany.value;
  if (!c) return null;
  return c.logoUrl || c.logo_url || c.logo || null;
});

const fieldValue = <K extends keyof ExtendedCompanyFields>(
  key: K,
  fallback: string = "-",
): string => {
  const value = selectedCompany.value?.[key];
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
};

const contractLabel = computed(() => {
  const ct = selectedCompany.value?.contractType;
  if (ct === "project") return "ຕາມໂຄງການ";
  if (ct === "service") return "ບໍລິການ";
  if (ct === "annual") return "ປະຈຳປີ";
  return "-";
});

const statusInfo = computed(() => {
  const status = selectedCompany.value?.status ?? "active";
  if (status === "active") {
    return { label: "ກຳລັງຜູກສັນຍາ", class: "bg-emerald-100 text-emerald-800" };
  }
  if (status === "pending") {
    return { label: "ລໍຖ້າອະນຸມັດ", class: "bg-amber-100 text-amber-800" };
  }
  return { label: "ສິ້ນສຸດສັນຍາ", class: "bg-rose-100 text-rose-800" };
});

const budgetRemaining = computed(() => {
  const c = selectedCompany.value;
  return c ? Math.max(0, c.budget - c.budgetUsed) : 0;
});

const usagePercent = computed(() =>
  selectedCompany.value
    ? getBudgetPercentage(selectedCompany.value.budgetUsed, selectedCompany.value.budget)
    : 0,
);

// ─────────────────────────────────────────────────────────────────────────────
// Receipts: filtering + pagination
// ─────────────────────────────────────────────────────────────────────────────
const filteredReceipts = computed(() => {
  let list = receiptStore.receipts;

  if (receiptSearch.value) {
    const term = receiptSearch.value.toLowerCase();
    list = list.filter(
      (r) =>
        r.receipt_number?.toLowerCase().includes(term) ||
        r.po_number?.toLowerCase().includes(term) ||
        r.remark?.toLowerCase().includes(term),
    );
  }

  if (selectedStatus.value) {
    list = list.filter((r) => r.user_approval?.document_status?.name === selectedStatus.value);
  }

  if (selectedDateRange.value) {
    const now = new Date();
    const startMap: Record<string, Date> = {
      today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getFullYear(), now.getMonth(), 1),
      year: new Date(now.getFullYear(), 0, 1),
    };
    const start = startMap[selectedDateRange.value] ?? new Date(0);
    list = list.filter((r) => {
      const d = new Date(r.receipt_date);
      return d >= start && d <= now;
    });
  }

  return list;
});

const paginatedReceipts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredReceipts.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredReceipts.value.length / itemsPerPage.value)),
);

const statusOptions = computed(() => {
  const unique = new Set<string>();
  for (const r of receiptStore.receipts) {
    const name = r.user_approval?.document_status?.name;
    if (name) unique.add(name);
  }
  return [...unique].map((value) => ({ label: value, value }));
});

const pageTotals = computed(() => ({
  subTotal: paginatedReceipts.value.reduce((sum, r) => sum + (r.sub_total || 0), 0),
  vat: paginatedReceipts.value.reduce((sum, r) => sum + (r.vat || 0), 0),
  total: paginatedReceipts.value.reduce((sum, r) => sum + (r.total || 0), 0),
}));

const hasActiveFilters = computed(
  () => Boolean(receiptSearch.value || selectedStatus.value || selectedDateRange.value),
);

const clearFilters = () => {
  receiptSearch.value = "";
  selectedStatus.value = "";
  selectedDateRange.value = "";
  currentPage.value = 1;
};

const goToPage = (page: number) => {
  currentPage.value = Math.min(Math.max(1, page), totalPages.value);
};

// ─────────────────────────────────────────────────────────────────────────────
// Data loading
// ─────────────────────────────────────────────────────────────────────────────
const loadCompanyReceipts = async (companyId: number) => {
  try {
    receiptStore.$patch({ receipts: [] });
    await receiptStore.fetchByCompanyId(companyId, { page: 1, limit: 100 });
    clearFilters();
  } catch (error) {
    console.error("Error loading receipts:", error);
  }
};

const loadCompanyDetail = async (companyId: number) => {
  if (loading.value && selectedCompany.value?.id === companyId) return;

  loading.value = true;
  try {
    if (props.companyData && props.companyData.id === companyId) {
      selectedCompany.value = props.companyData;
    }
    if (!selectedCompany.value) {
      warning("ຂໍ້ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນບໍລິສັດ");
      return;
    }
    await loadCompanyReceipts(companyId);
  } catch (error) {
    console.error("Error loading company detail:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
  } finally {
    loading.value = false;
  }
};

const showCompanyDetailFromList = (company: { id: number }) => {
  loadCompanyDetail(company.id);
  showDetail.value = true;
};

defineExpose({ showCompanyDetail: showCompanyDetailFromList });

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────────────────────────────────────
onMounted(() => {
  const companyId = props.companyId || Number(route.params.id);
  if (companyId) {
    loadCompanyDetail(companyId);
    showDetail.value = true;
  }
});

watch(
  () => props.companyId,
  (newId) => {
    if (newId) {
      loadCompanyDetail(newId);
      showDetail.value = true;
    }
  },
  { immediate: true },
);

watch(
  () => props.companyData,
  (newData) => {
    if (newData) {
      selectedCompany.value = newData;
      showDetail.value = true;
    }
  },
  { immediate: true },
);

void emit; // mark referenced
</script>

<template>
  <div class="company-detail-manager">
    <div class="flex justify-end mb-2">
      <UiButton
        icon="mdi:arrow-left"
        size="small"
        class="flex items-center gap-2 text-white bg-blue-600 hover:!bg-blue-900 hover:!text-white"
        @click="goBack"
      >
        ກັບຄືນ
      </UiButton>
    </div>

    <AffiliatedCompany v-if="!showDetail" @view-details="showCompanyDetailFromList" />

    <div v-else class="company-detail-view">
      <LoadingSpinner v-if="loading" message="ກຳລັງໂຫຼດຂໍ້ມູນ..." size="lg" />

      <div v-else-if="selectedCompany" class="bg-gray-50 min-h-screen">
        <div class="mx-auto w-full max-w-screen-2xl 3xl:max-w-[120rem] px-3 sm:px-4 lg:px-6 py-4 lg:py-6 space-y-4 lg:space-y-6">
          <!-- Hero -->
          <section class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div class="flex items-start gap-4 sm:gap-6 flex-col sm:flex-row">
              <CompanyLogo :source="logoSource" :alt="selectedCompany.name" :color="themeColor" size="xl" />
              <div class="flex-1 min-w-0">
                <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 break-words">
                  {{ selectedCompany.name }}
                </h2>
                <p class="text-gray-600 text-sm sm:text-base lg:text-lg">
                  {{ fieldValue("description", selectedCompany.name) }}
                </p>
                <div class="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm">
                  <span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                    {{ contractLabel }}
                  </span>
                  <span class="px-2.5 py-1 rounded-full font-medium" :class="statusInfo.class">
                    {{ statusInfo.label }}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- Stats -->
          <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <SummaryCard variant="tonal" color="blue" label="ໃບສະເໜີ" icon="mdi:file-document">
              {{ selectedCompany.proposalCount.toLocaleString() }}
            </SummaryCard>
            <SummaryCard variant="tonal" color="green" label="ງົບປະມານຕົ້ນປີ" icon="mdi:account-balance">
              <MoneyText :value="selectedCompany.budget" compact />
            </SummaryCard>
            <SummaryCard variant="tonal" color="orange" label="ງົບປະມານທີ່ໃຊ້ແລ້ວ" icon="mdi:cash-minus">
              <MoneyText :value="selectedCompany.budgetUsed" compact />
              <template #footer>
                <BudgetBar
                  :used="selectedCompany.budgetUsed"
                  :allocated="selectedCompany.budget"
                  size="sm"
                  :show-label="false"
                />
              </template>
            </SummaryCard>
            <SummaryCard variant="tonal" color="purple" label="ງົບປະມານທີ່ຍັງເຫຼືອ" icon="mdi:cash-plus">
              <MoneyText :value="budgetRemaining" compact />
              <template #footer>ໃຊ້ໄປ {{ usagePercent }}%</template>
            </SummaryCard>
          </section>

          <!-- Company info -->
          <section class="bg-white rounded-xl shadow-sm overflow-hidden">
            <details class="group">
              <summary class="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900">ຂໍ້ມູນທົ່ວໄປຂອງບໍລິສັດ</h3>
                <Icon icon="mdi:chevron-down" class="text-xl text-gray-500 group-open:rotate-180 transition-transform duration-200" />
              </summary>

              <div class="px-4 sm:px-6 pb-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
                <div>
                  <h4 class="font-semibold text-gray-900 mb-2">ຂໍ້ມູນພື້ນຖານ</h4>
                  <dl class="space-y-1.5 text-sm">
                    <div class="flex justify-between gap-2">
                      <dt class="text-gray-500">ເລກທະບຽນ:</dt>
                      <dd class="font-medium text-right truncate">{{ fieldValue("registrationNumber") }}</dd>
                    </div>
                    <div class="flex justify-between gap-2">
                      <dt class="text-gray-500">ປີທີ່ສ້າງ:</dt>
                      <dd class="font-medium">{{ fieldValue("establishedYear") }}</dd>
                    </div>
                    <div class="flex justify-between gap-2">
                      <dt class="text-gray-500">ພະນັກງານ:</dt>
                      <dd class="font-medium">
                        {{ fieldValue("employees", fieldValue("userCount", "0")) }} ຄົນ
                      </dd>
                    </div>
                    <div class="flex justify-between gap-2">
                      <dt class="text-gray-500">ປະເພດສັນຍາ:</dt>
                      <dd class="font-medium">{{ contractLabel }}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 class="font-semibold text-gray-900 mb-2">ຂໍ້ມູນຕິດຕໍ່</h4>
                  <dl class="space-y-1.5 text-sm">
                    <div class="flex justify-between gap-2">
                      <dt class="text-gray-500">ທີ່ຢູ່:</dt>
                      <dd class="font-medium text-right break-words">{{ fieldValue("address") }}</dd>
                    </div>
                    <div class="flex justify-between gap-2">
                      <dt class="text-gray-500">ໂທລະສັບ:</dt>
                      <dd class="font-medium">{{ fieldValue("phone") }}</dd>
                    </div>
                    <div class="flex justify-between gap-2">
                      <dt class="text-gray-500">ອີເມວ:</dt>
                      <dd class="font-medium truncate">{{ fieldValue("email") }}</dd>
                    </div>
                    <div class="flex justify-between gap-2">
                      <dt class="text-gray-500">ຜູ້ອຳນວຍການ:</dt>
                      <dd class="font-medium">{{ fieldValue("director") }}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 class="font-semibold text-gray-900 mb-2">ຜົນດຳເນີນງານ</h4>
                  <BudgetBar :used="selectedCompany.budgetUsed" :allocated="selectedCompany.budget" size="md">
                    <template #left>
                      <span class="text-gray-500">ການໃຊ້ງົບປະມານ</span>
                    </template>
                  </BudgetBar>
                  <div class="flex justify-between text-sm pt-3 mt-3 border-t border-gray-100">
                    <span class="text-gray-500">ສະຖານະບໍລິສັດ:</span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="statusInfo.class">
                      {{ statusInfo.label }}
                    </span>
                  </div>
                </div>
              </div>
            </details>
          </section>

          <!-- Pending proposals -->
          <section class="bg-white rounded-xl shadow-sm p-4 sm:p-5">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div class="flex items-center gap-3 flex-wrap">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900">ໃບສະເໜີທີ່ລໍຖ້າອະນຸມັດ</h3>
                <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {{ selectedCompany.proposalCount }} ໃບສະເໜີ
                </span>
              </div>
              <UiButton
                class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold flex items-center gap-2"
                size="large"
                @click="showApproveProposal = true"
              >
                <Icon icon="mdi:check-circle" class="text-xl" />
                ອະນຸມັດໃບສະເໜີ
                <Icon icon="mdi:arrow-right" />
              </UiButton>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SummaryCard variant="tonal" color="yellow" label="ລໍຖ້າອະນຸມັດ" icon="mdi:clock">
                {{ selectedCompany.proposalCount.toLocaleString() }}
              </SummaryCard>
              <SummaryCard variant="tonal" color="blue" label="ກຳລັງພິຈາລະນາ" icon="mdi:file-eye">
                8
              </SummaryCard>
              <SummaryCard variant="tonal" color="green" label="ອະນຸມັດແລ້ວ" icon="mdi:check-circle">
                22
              </SummaryCard>
            </div>
          </section>

          <!-- Tabs -->
          <section class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="flex border-b border-gray-100" role="tablist">
              <button
                v-for="tab in [
                  { key: 'proposals', label: 'ໃບສະເໜີ', icon: 'mdi:file-document' },
                  { key: 'budget', label: 'ງົບປະມານ', icon: 'mdi:finance' },
                ] as const"
                :key="tab.key"
                role="tab"
                :aria-selected="activeTab === tab.key"
                :class="[
                  'flex-1 px-4 py-3 text-center font-medium transition-colors flex items-center justify-center gap-1.5',
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                ]"
                @click="activeTab = tab.key"
              >
                <Icon :icon="tab.icon" />
                {{ tab.label }}
              </button>
            </div>

            <div class="p-3 sm:p-4 lg:p-5">
              <div v-if="activeTab === 'proposals'">
                <LoadingSpinner v-if="receiptStore.loading" message="ກຳລັງໂຫຼດຂໍ້ມູນຮັບເງິນ..." />

                <div v-else>
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <h4 class="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-1.5">
                      <Icon icon="mdi:receipt" />
                      ຂໍ້ມູນຮັບເງິນ
                    </h4>
                    <div class="text-xs sm:text-sm text-gray-500">
                      ພົບ <span class="font-semibold text-gray-700">{{ filteredReceipts.length }}</span>
                      ລາຍການ (ຈາກທັງໝົດ {{ receiptStore.receipts.length }})
                    </div>
                  </div>

                  <!-- Filters -->
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <div class="md:col-span-2 relative">
                      <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        v-model="receiptSearch"
                        type="text"
                        placeholder="ຄົ້ນຫາ ເລກທີ່ຮັບເງິນ, PO ຫຼື ໝາຍເຫດ..."
                        class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      v-model="selectedStatus"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">ສະຖານະທັງໝົດ</option>
                      <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                    </select>
                    <select
                      v-model="selectedDateRange"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">ວັນທີ່ທັງໝົດ</option>
                      <option value="today">ມື້ນີ້</option>
                      <option value="week">7 ວັນທີ່ຜ່ານມາ</option>
                      <option value="month">ເດືອນນີ້</option>
                      <option value="year">ປີນີ້</option>
                    </select>
                  </div>

                  <div v-if="hasActiveFilters" class="mb-3">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      @click="clearFilters"
                    >
                      <Icon icon="mdi:filter-remove" />
                      ລ້າງຕົວກອງ
                    </button>
                  </div>

                  <!-- Receipts table -->
                  <div class="overflow-x-auto -mx-3 sm:mx-0">
                    <table class="min-w-full bg-white border border-gray-100 rounded-lg text-sm">
                      <thead class="bg-gray-50 text-gray-600">
                        <tr>
                          <th class="px-3 py-2.5 text-left font-medium">ເລກທີ່ຮັບເງິນ</th>
                          <th class="px-3 py-2.5 text-left font-medium">ເລກທີ່ PO</th>
                          <th class="px-3 py-2.5 text-left font-medium">ວັນທີ່ຮັບເງິນ</th>
                          <th class="px-3 py-2.5 text-left font-medium">ຜູ້ຮ້ອງຂໍ</th>
                          <th class="px-3 py-2.5 text-left font-medium">ຈຸດຮັບ/ສົ່ງ</th>
                          <th class="px-3 py-2.5 text-right font-medium">ລາຍການ</th>
                          <th class="px-3 py-2.5 text-right font-medium">ມູນຄ່າ</th>
                          <th class="px-3 py-2.5 text-right font-medium">VAT</th>
                          <th class="px-3 py-2.5 text-right font-medium">ລວມ</th>
                          <th class="px-3 py-2.5 text-left font-medium">ສະຖານະ</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="receipt in paginatedReceipts" :key="receipt.id" class="hover:bg-gray-50">
                          <td class="px-3 py-2.5 tabular-nums">{{ receipt.receipt_number }}</td>
                          <td class="px-3 py-2.5 tabular-nums">{{ receipt.po_number }}</td>
                          <td class="px-3 py-2.5">{{ receipt.receipt_date }}</td>
                          <td class="px-3 py-2.5">
                            <div class="font-medium">{{ receipt.document?.requester?.username || "-" }}</div>
                            <div class="text-xs text-gray-500 truncate max-w-[10rem]">
                              {{ receipt.document?.requester?.email || "-" }}
                            </div>
                          </td>
                          <td class="px-3 py-2.5">
                            <div class="font-medium">{{ receipt.document?.department?.name || "-" }}</div>
                            <div class="text-xs text-gray-500">{{ receipt.document?.department?.code || "-" }}</div>
                          </td>
                          <td class="px-3 py-2.5 text-right tabular-nums">{{ receipt.receipt_item?.length || 0 }}</td>
                          <td class="px-3 py-2.5 text-right">
                            <MoneyText :value="receipt.sub_total || 0" />
                          </td>
                          <td class="px-3 py-2.5 text-right">
                            <MoneyText :value="receipt.vat || 0" />
                          </td>
                          <td class="px-3 py-2.5 text-right font-semibold">
                            <MoneyText :value="receipt.total || 0" />
                          </td>
                          <td class="px-3 py-2.5">
                            <span
                              class="px-2 py-0.5 rounded-full text-xs font-medium"
                              :class="
                                receipt.user_approval?.document_status?.name === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              "
                            >
                              {{ receipt.user_approval?.document_status?.name || "PENDING" }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot v-if="paginatedReceipts.length" class="bg-gray-50">
                        <tr>
                          <td colspan="6" class="px-3 py-2.5 font-semibold text-gray-700">ລວມໜ້ານີ້</td>
                          <td class="px-3 py-2.5 text-right font-semibold">
                            <MoneyText :value="pageTotals.subTotal" />
                          </td>
                          <td class="px-3 py-2.5 text-right font-semibold">
                            <MoneyText :value="pageTotals.vat" />
                          </td>
                          <td class="px-3 py-2.5 text-right font-semibold">
                            <MoneyText :value="pageTotals.total" />
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <!-- Pagination -->
                  <div
                    v-if="totalPages > 1"
                    class="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div class="flex items-center gap-2 text-sm">
                      <span class="text-gray-500">ສະແດງລາຍການ:</span>
                      <select
                        v-model.number="itemsPerPage"
                        class="px-2 py-1 border border-gray-300 rounded text-sm"
                        @change="currentPage = 1"
                      >
                        <option v-for="size in [10, 25, 50, 100]" :key="size" :value="size">{{ size }}</option>
                      </select>
                    </div>
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        class="px-2.5 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="currentPage === 1"
                        @click="goToPage(1)"
                      >
                        <Icon icon="mdi:page-first" />
                      </button>
                      <button
                        type="button"
                        class="px-2.5 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="currentPage === 1"
                        @click="goToPage(currentPage - 1)"
                      >
                        <Icon icon="mdi:chevron-left" />
                      </button>
                      <span class="px-3 py-1 text-sm">ໜ້າ {{ currentPage }} ຈາກ {{ totalPages }}</span>
                      <button
                        type="button"
                        class="px-2.5 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="currentPage === totalPages"
                        @click="goToPage(currentPage + 1)"
                      >
                        <Icon icon="mdi:chevron-right" />
                      </button>
                      <button
                        type="button"
                        class="px-2.5 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="currentPage === totalPages"
                        @click="goToPage(totalPages)"
                      >
                        <Icon icon="mdi:page-last" />
                      </button>
                    </div>
                  </div>

                  <EmptyState
                    v-if="filteredReceipts.length === 0 && receiptStore.receipts.length > 0"
                    icon="mdi:filter-off"
                    title="ບໍ່ພົບຂໍ້ມູນທີ່ຕົງກັບຕົວກອງ"
                  >
                    <template #action>
                      <button
                        type="button"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        @click="clearFilters"
                      >
                        ລ້າງຕົວກອງ
                      </button>
                    </template>
                  </EmptyState>

                  <EmptyState
                    v-else-if="receiptStore.receipts.length === 0"
                    icon="mdi:receipt"
                    title="ຍັງບໍ່ມີຂໍ້ມູນຮັບເງິນ"
                    message="ບໍລິສັດນີ້ຍັງບໍ່ມີການດຳເນີນການຮັບເງິນ"
                  />
                </div>
              </div>

              <div v-else-if="activeTab === 'budget'">
                <BudgetList :company-id="selectedCompany.id" />
              </div>
            </div>
          </section>
        </div>

        <!-- Approve modal -->
        <Transition name="fade">
          <div
            v-if="showApproveProposal"
            class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            @click.self="showApproveProposal = false"
          >
            <div
              class="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
              role="dialog"
              aria-modal="true"
            >
              <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 sm:p-5 flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="text-lg sm:text-xl font-bold">ອະນຸມັດໃບສະເໜີ</h3>
                  <p class="text-orange-100 text-sm mt-0.5 truncate">
                    ຈັດການອະນຸມັດໃບສະເໜີຂອງ {{ selectedCompany.name }}
                  </p>
                </div>
                <button
                  type="button"
                  class="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="ປິດ"
                  @click="showApproveProposal = false"
                >
                  <Icon icon="mdi:close" class="text-xl" />
                </button>
              </div>
              <div class="p-4 sm:p-5 overflow-y-auto flex-1">
                <ApproveProposal
                  :selected-company="{ name: selectedCompany.name, id: selectedCompany.id }"
                />
              </div>
            </div>
          </div>
        </Transition>
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

details summary::-webkit-details-marker {
  display: none;
}
details summary {
  list-style: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (min-width: 1920px) {
  .\33xl\:max-w-\[120rem\] {
    max-width: 120rem;
  }
}
</style>
