<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { Tabs } from "ant-design-vue";
import { Icon } from "@iconify/vue";

import { useNotification } from "@/modules/shared/utils/useNotification";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiSelect from "@/common/shared/components/Input/InputSelect.vue";

import AffiliatedCompany from "../affiliated-company/AffiliatedCompany.vue";
import ApproveProposal from "../approve-proposal/ApproveProposal.vue";
import CompanyDetail from "../company-detail/CompanyDetail.vue";

import { ReportCompanyService } from "@/modules/application/services/reports/report-company.service";
import { useReportHalStore } from "@/modules/presentation/Admin/stores/reports/report-hal.store";
import { departmentStore } from "@/modules/presentation/Admin/stores/departments/department.store";
import { useCompanyReportsStore } from "@/modules/presentation/Admin/stores/company-reports.store";
import { useReceiptStore } from "@/modules/presentation/Admin/stores/receipt.store";
import { useCompanyReportStore } from "@/modules/presentation/Admin/stores/company-report.store";
import type { CompanyReportData } from "@/modules/infrastructure/reports/report-company.repository";

import {
  SummaryCard,
  MoneyText,
  CompanyCard,
  BudgetUsageChart,
  EmptyState,
  LoadingSpinner,
  SectionHeader,
  useCompanyTheme,
  useDashboardFormat,
  OVER_BUDGET_PALETTE,
  WITHIN_BUDGET_PALETTE,
  type ThemeColor,
} from "../_shared";
import type { AffiliatedCompanyRecord } from "../affiliated-company/AffiliatedCompany.vue";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Company {
  id: number;
  name: string;
  logo: string;
  proposalCount: number;
  budget: number;
  budgetUsed: number;
  color: ThemeColor;
  userCount: number;
  allocated_amount: number;
  balance_amount: number;
  approvalWorkflowCount: number;
}

// `AffiliatedCompanyRecord` is the canonical shape coming back from the
// `/company-reports/with-receipts` endpoint via AffiliatedCompany.vue.
type ViewDetailsPayload = Company | AffiliatedCompanyRecord;

// ─────────────────────────────────────────────────────────────────────────────
// Dependencies
// ─────────────────────────────────────────────────────────────────────────────
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { warning } = useNotification();

const reportCompanyService = new ReportCompanyService();
const reportHalStore = useReportHalStore();
const department = departmentStore();
const companyReportsStore = useCompanyReportsStore();
const receiptStore = useReceiptStore();
const companyReportStore = useCompanyReportStore();

const { colorAtIndex } = useCompanyTheme();
const { formatPercent, safeRatio } = useDashboardFormat();

// ─────────────────────────────────────────────────────────────────────────────
// UI state
// ─────────────────────────────────────────────────────────────────────────────
const loading = ref(false);
const pageLoading = ref(false);
const tabLoading = ref<Record<string, boolean>>({});
const tabDataLoaded = ref<Record<string, boolean>>({});
const activeTab = ref("1");

const searchKeyword = ref("");
const selectedCompany = ref<Company | null>(null);
const selectedDetailCompany = ref<Company | null>(null);
const showCompanyDetail = ref(false);
const companies = ref<Company[]>([]);

const filters = reactive({
  year: new Date().getFullYear(),
  company: "all",
  departmentId: "all",
  dateRange: [] as string[],
});

// ─────────────────────────────────────────────────────────────────────────────
// Filter option lists
// ─────────────────────────────────────────────────────────────────────────────
const currentYear = new Date().getFullYear();
const years = computed(() =>
  Array.from({ length: 8 }, (_, i) => {
    const year = currentYear - 5 + i;
    return { value: year, label: `${year}` };
  }),
);

const companyOptions = computed(() => {
  const unique = [...new Map(companies.value.map((c) => [c.id, c])).values()];
  return [
    { value: "all", label: "ທຸກບໍລິສັດ" },
    ...unique.map((c) => ({ value: c.id.toString(), label: c.name })),
  ];
});

const departmentOptions = computed(() => {
  const head = [{ value: "all", label: "ທຸກພະແນກ" }];
  if (department.departments?.length) {
    return [
      ...head,
      ...department.departments.map((d) => ({
        value: d.getId(),
        label: d.getName() || `ພະແນກ ${d.getId()}`,
      })),
    ];
  }
  return head;
});

const getCompanyLabel = (value: string): string =>
  companyOptions.value.find((c) => c.value === value)?.label ?? value;

// ─────────────────────────────────────────────────────────────────────────────
// Derived data — single source of truth for budget summaries
// ─────────────────────────────────────────────────────────────────────────────
const filteredCompanies = computed(() => {
  let list = companies.value;
  if (filters.company !== "all") {
    list = list.filter((c) => c.name.includes(filters.company));
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    list = list.filter((c) => c.name.toLowerCase().includes(keyword));
  }
  return list;
});

const overBudgetCompanies = computed(() => {
  const apiOverruns = reportHalStore.getBudgetOverruns()?.budget;
  if (apiOverruns) {
    return apiOverruns.map((item, index) => ({
      id: item.id,
      name: item.name,
      logo: item.logo,
      budget: item.allocated_amount,
      budgetUsed: item.total,
      color: colorAtIndex(index, OVER_BUDGET_PALETTE),
    }));
  }
  return filteredCompanies.value
    .filter((c) => c.budgetUsed >= c.budget)
    .map((c) => ({ id: c.id, name: c.name, logo: c.logo, budget: c.budget, budgetUsed: c.budgetUsed, color: c.color }));
});

const withinBudgetCompanies = computed(() => {
  const apiWithin = reportHalStore.getWithinBudget()?.budget;
  if (apiWithin) {
    return apiWithin.map((item, index) => ({
      id: item.id,
      name: item.name,
      logo: item.logo,
      budget: item.allocated_amount,
      budgetUsed: item.total,
      color: colorAtIndex(index, WITHIN_BUDGET_PALETTE),
    }));
  }
  return filteredCompanies.value
    .filter((c) => c.budgetUsed < c.budget)
    .map((c) => ({ id: c.id, name: c.name, logo: c.logo, budget: c.budget, budgetUsed: c.budgetUsed, color: c.color }));
});

const halState = computed(() => reportHalStore.getHalGroupStateData());

const halSummary = computed(() => {
  const data = halState.value;
  const totalBudget = data?.total_budget ?? 0;
  const totalUsed = data?.totalUsedAmount ?? 0;
  const remaining = totalBudget - totalUsed;
  const list = filteredCompanies.value;
  const proposalTotal = list.reduce((sum, c) => sum + c.proposalCount, 0);
  const budgetTotal = list.reduce((sum, c) => sum + c.budget, 0);

  return {
    pendingReceipts: data?.totalReceiptsPadding ?? 0,
    totalReceipts: data?.totalReceipts ?? 0,
    totalBudget,
    totalUsed,
    remaining,
    totalUsers: data?.totalUsers ?? 0,
    avgProposalsPerCompany: list.length ? Math.round(proposalTotal / list.length) : 0,
    avgBudgetPerCompany: list.length ? budgetTotal / list.length : 0,
    usagePercent: Math.round(safeRatio(totalUsed, totalBudget) * 100),
    remainingPercent: Math.round(safeRatio(remaining, totalBudget) * 100),
    proposalTotal,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// Data loading
// ─────────────────────────────────────────────────────────────────────────────
const transformCompanyData = (apiData: CompanyReportData): Company[] =>
  apiData.data.map((company, index) => ({
    id: company.companyId,
    name: company.companyName,
    logo: company.logo || "mdi:domain",
    proposalCount: company.approvalWorkflowCount,
    budget: company.allocated_amount || company.total_budget,
    budgetUsed: company.totalUsedAmount,
    color: colorAtIndex(index),
    userCount: company.userCount,
    allocated_amount: company.allocated_amount,
    balance_amount: company.balance_amount,
    approvalWorkflowCount: company.approvalWorkflowCount,
  }));

const loadDepartments = async () => {
  if (department.departments.length === 0) {
    try {
      await department.fetchDepartment({ page: 1, limit: 100 });
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  }
};

const loadBudgetReport = async () => {
  try {
    await reportHalStore.fetchReportHalGroupsMonthlyBudget({
      fiscal_year: filters.year,
      company_id: filters.company !== "all" ? Number.parseInt(filters.company, 10) : undefined,
      departmentId: filters.departmentId !== "all" ? filters.departmentId : undefined,
    });
  } catch (error) {
    console.error("Error loading budget report:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນງົບປະມານໄດ້");
  }
};

const loadHalGroupState = async () => {
  try {
    await reportHalStore.fetchReportHalGroupState();
  } catch (error) {
    console.error("Error loading HAL group state:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສະຖານະ HAL Group ໄດ້");
  }
};

const loadTabData = async (tabKey: string) => {
  if (tabDataLoaded.value[tabKey]) return;

  tabLoading.value[tabKey] = true;
  try {
    if (tabKey === "1") {
      const reportData = await reportCompanyService.getReportCompany();
      companies.value = transformCompanyData(reportData);
      await Promise.all([loadDepartments(), loadBudgetReport(), loadHalGroupState()]);
    } else if (tabKey === "2") {
      if (!selectedCompany.value) {
        await receiptStore.fetchAll({ page: 1, limit: 10000 });
      }
    } else if (tabKey === "3") {
      await Promise.all([
        companyReportStore.fetchReportStatistics(),
        companyReportStore.fetchCompaniesWithReceipts({
          page: 1,
          limit: 10,
          sort_by: "created_at",
          sort_order: "DESC",
        }),
      ]);
    }
    tabDataLoaded.value[tabKey] = true;
  } catch (error) {
    console.error(`Error loading tab ${tabKey} data:`, error);
    warning("ເກີດຂໍ້ຜິດພາດ", `ບໍ່ສາມາດໂຫຼດຂໍ້ມູນ Tab ${tabKey} ໄດ້`);
  } finally {
    tabLoading.value[tabKey] = false;
  }
};

const loadInitialData = async () => {
  pageLoading.value = true;
  try {
    if (route.query.year) filters.year = Number.parseInt(route.query.year as string, 10);
    if (route.query.company) filters.company = route.query.company as string;
    await loadTabData("1");
  } catch (error) {
    console.error("Error loading initial data:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນເບື້ອຕົ້ນໄດ້");
  } finally {
    pageLoading.value = false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Event handlers
// ─────────────────────────────────────────────────────────────────────────────
const handleFilterChange = async () => {
  await loadBudgetReport();
  if (filters.company !== "all") {
    const company = companies.value.find((c) => c.name.includes(filters.company));
    selectedCompany.value = company ?? null;
  } else {
    selectedCompany.value = null;
  }
  router.push({
    query: {
      ...route.query,
      year: String(filters.year),
      company: filters.company,
      departmentId: filters.departmentId,
    },
  });
};

const showCompanyDetails = async (company: Company) => {
  if (!company?.id) {
    warning("ເກີດຂໍ້ຜິດພາດ", "ຂໍ້ມູນບໍລິສັດບໍ່ຖືກຕ້ອງ");
    return;
  }

  loading.value = true;
  try {
    let details = companyReportsStore.getCompanyById(company.id);
    if (!details) {
      details = await companyReportsStore.loadCompanyReport(company.id.toString());
    }
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

const handleViewDetails = (company: ViewDetailsPayload) => {
  const isAffiliated = "receiptCount" in company;
  const affiliated = isAffiliated ? (company as AffiliatedCompanyRecord) : null;
  const base = isAffiliated ? null : (company as Company);

  const proposalCount = affiliated?.receiptCount ?? base?.proposalCount ?? 0;
  const allocated = company.budget || base?.allocated_amount || 0;

  selectedDetailCompany.value = {
    id: company.id,
    name: company.name,
    logo: company.logo,
    color: (company.color ?? "blue") as ThemeColor,
    proposalCount,
    budget: company.budget,
    budgetUsed: company.budgetUsed,
    userCount: base?.userCount ?? 0,
    allocated_amount: allocated,
    balance_amount: allocated - (company.budgetUsed || 0),
    approvalWorkflowCount: proposalCount,
  };
  showCompanyDetail.value = true;
};

const closeCompanyDetail = () => {
  showCompanyDetail.value = false;
  selectedDetailCompany.value = null;
};

watch(activeTab, async (newTab) => {
  if (newTab && !tabDataLoaded.value[newTab]) {
    await loadTabData(newTab);
  }
});

onMounted(async () => {
  await loadInitialData();
  if (filters.company !== "all") {
    const company = companies.value.find((c) => c.name.includes(filters.company));
    if (company) selectedCompany.value = company;
  }
});
</script>

<template>
  <div class="hal-group-overview-container">
    <LoadingSpinner v-if="pageLoading" overlay message="ກຳລັງໂຫຼດຂໍ້ມູນ..." size="lg" />

    <div class="mx-auto w-full max-w-screen-2xl 3xl:max-w-[120rem] p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div class="bg-white rounded-xl shadow-sm">
        <Tabs v-model:activeKey="activeTab" type="card" size="large">
          <!-- ───────────────────────── Tab 1 : Overview ───────────────────────── -->
          <Tabs.TabPane key="1" tab="ພາບລວມ">
            <LoadingSpinner v-if="tabLoading['1']" message="ກຳລັງໂຫຼດຂໍ້ມູນພາບລວມ..." />

            <template v-else>
              <header class="border-b border-gray-200 p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {{ t("hal-group.overview") }}
                    </h1>
                    <p class="text-sm sm:text-base text-gray-600 mt-1">
                      {{ t("hal-group.followingDescription") }}
                    </p>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      {{ filteredCompanies.length }} ບໍລິສັດ
                    </span>
                    <span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      {{ currentYear }}
                    </span>
                  </div>
                </div>
              </header>

              <!-- Filters -->
              <section class="p-4 lg:p-6 border-b border-gray-100">
                <h2 class="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
                  <Icon icon="solar:filter-outline" />
                  {{ t("hal-group.filters") }}
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                  <UiFormItem>
                    <UiSelect
                      v-model="filters.year"
                      :options="years"
                      placeholder="ເລືອກປີ"
                      :disabled="loading"
                      @change="handleFilterChange"
                    />
                  </UiFormItem>
                  <UiFormItem>
                    <UiSelect
                      v-model="filters.departmentId"
                      :options="departmentOptions"
                      placeholder="ເລືອກພະແນກ"
                      :disabled="loading"
                      @change="handleFilterChange"
                    />
                  </UiFormItem>
                  <UiFormItem>
                    <UiSelect
                      v-model="filters.company"
                      :options="companyOptions"
                      placeholder="ເລືອກບໍລິສັດ"
                      :disabled="loading"
                      @change="handleFilterChange"
                    />
                  </UiFormItem>
                  <div class="hidden xl:flex items-center text-sm text-gray-500">
                    {{ t("hal-group.showdata") }}{{ t("hal-group.overyear") }}
                    {{ filters.year }} · {{ getCompanyLabel(filters.company) }}
                  </div>
                </div>
              </section>

              <!-- HAL Group State Summary -->
              <section
                v-if="halState"
                class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4"
              >
                <SummaryCard
                  color="yellow"
                  label="ໃບສະເໜີທີ່ລໍຖ້າອະນຸມັດ"
                  icon="material-symbols:nest-clock-farsight-analog-outline"
                  :value-title="`${halSummary.pendingReceipts} ໃບ`"
                >
                  {{ halSummary.pendingReceipts.toLocaleString() }}
                  <template #footer>{{ halSummary.pendingReceipts }} ໃບ</template>
                </SummaryCard>

                <SummaryCard
                  color="blue"
                  label="ໃບສະເໜີທັງໝົດ"
                  icon="material-symbols:description"
                  :value-title="`${halSummary.totalReceipts} ໃບ`"
                >
                  {{ halSummary.totalReceipts.toLocaleString() }}
                  <template #footer>ສະເລ່ຍ: {{ halSummary.avgProposalsPerCompany }} ໃບ / ບໍລິສັດ</template>
                </SummaryCard>

                <SummaryCard
                  color="green"
                  label="ງົບປະມານທັງໝົດ"
                  icon="material-symbols:account-balance"
                >
                  <MoneyText :value="halSummary.totalBudget" compact />
                  <template #footer>
                    ສະເລ່ຍ: <MoneyText :value="halSummary.avgBudgetPerCompany" compact />
                  </template>
                </SummaryCard>

                <SummaryCard
                  color="orange"
                  label="ງົບທີ່ໃຊ້ໄປ"
                  icon="material-symbols:payments"
                >
                  <MoneyText :value="halSummary.totalUsed" compact />
                  <template #footer>ໃຊ້ໄປແລ້ວ: {{ formatPercent(halSummary.usagePercent) }}</template>
                </SummaryCard>

                <SummaryCard
                  color="purple"
                  label="ງົບປະມານຍັງຄ້າງ"
                  icon="material-symbols:savings"
                >
                  <MoneyText :value="halSummary.remaining" compact />
                  <template #footer>ຍັງຄ້າງ: {{ formatPercent(halSummary.remainingPercent) }}</template>
                </SummaryCard>

                <SummaryCard
                  color="teal"
                  label="ພະນັກງານ"
                  icon="material-symbols:group-outline-rounded"
                  :value-title="`${halSummary.totalUsers} ຄົນ`"
                >
                  {{ halSummary.totalUsers.toLocaleString() }}
                </SummaryCard>
              </section>

              <!-- Pending Proposals header -->
              <section class="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
                <SectionHeader
                  title="ໃບສະເໜີທີ່ລໍຖ້າອະນຸມັດ"
                  subtitle="ລວມໃບສະເໜີທີ່ລໍຖ້າອະນຸມັດ"
                  icon="material-symbols:description"
                  icon-color="text-blue-600"
                >
                  <template #badge>
                    <span class="text-blue-600 font-bold tabular-nums">
                      ({{ halSummary.proposalTotal.toLocaleString() }} ໃບ)
                    </span>
                    <span class="text-gray-600 text-sm">ຈາກ {{ filteredCompanies.length }} ບໍລິສັດ</span>
                  </template>
                </SectionHeader>

                <div
                  v-if="filteredCompanies.length"
                  class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-3 sm:gap-4"
                >
                  <CompanyCard
                    v-for="company in filteredCompanies"
                    :key="company.id"
                    :name="company.name"
                    :logo="company.logo"
                    :color="company.color"
                    :proposal-count="company.proposalCount"
                    :budget="company.budget"
                    :budget-used="company.budgetUsed"
                    @click="showCompanyDetails(company)"
                  />
                </div>

                <EmptyState
                  v-else
                  title="ບໍ່ພົບຂໍ້ມູນບໍລິສັດ"
                  message="ລອງປ່ຽນຕົວກອງ ຫຼື ຄຳຄົ້ນຫາ"
                  icon="solar:inbox-outline"
                />
              </section>

              <!-- Budget split section -->
              <section class="p-3 sm:p-4 lg:p-6 space-y-4">
                <SectionHeader
                  title="ງົບປະມານຂອງບໍລິສັດໃນເຄືອ"
                  subtitle="ການໃຊ້ງົບປະມານ — ຈັດອັນດັບຕາມເປີເຊັນທີ່ໃຊ້"
                >
                  <template #badge>
                    <span class="text-rose-600 text-xs sm:text-sm">
                      ເກີນ: <MoneyText :value="reportHalStore.getBudgetOverruns()?.total || 0" class="font-bold" />
                    </span>
                    <span class="text-emerald-600 text-xs sm:text-sm">
                      ໃນງົບ: <MoneyText :value="reportHalStore.getWithinBudget()?.total || 0" class="font-bold" />
                    </span>
                  </template>
                </SectionHeader>

                <BudgetUsageChart
                  :over-budget="overBudgetCompanies"
                  :within-budget="withinBudgetCompanies"
                />
              </section>
            </template>
          </Tabs.TabPane>

          <!-- ───────────────────────── Tab 2 : Approve ───────────────────────── -->
          <Tabs.TabPane key="2" tab="ອະນຸມັດເອກະສານ">
            <LoadingSpinner v-if="tabLoading['2']" message="ກຳລັງໂຫຼດຂໍ້ມູນການອະນຸມັດເອກະສານ..." />

            <template v-else>
              <header class="border-b border-gray-200 p-3 lg:p-4 bg-gradient-to-r from-orange-50 to-amber-50">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 class="text-lg md:text-xl font-bold text-gray-900">ອະນຸມັດເອກະສານ</h2>
                    <p class="text-sm text-gray-600 mt-0.5">ຈັດການການອະນຸມັດເອກະສານທັງໝົດ</p>
                  </div>
                </div>
              </header>

              <ApproveProposal
                :selected-company="selectedCompany"
                :search-keyword="searchKeyword"
                :status-filter="'pending'"
              />
            </template>
          </Tabs.TabPane>

          <!-- ───────────────────────── Tab 3 : Affiliated ───────────────────────── -->
          <Tabs.TabPane key="3" tab="ບໍລິສັດໃນເຄືອ">
            <LoadingSpinner v-if="tabLoading['3']" message="ກຳລັງໂຫຼດຂໍ້ມູນບໍລິສັດໃນເຄືອ..." />

            <template v-else>
              <header class="border-b border-gray-200 p-4 lg:p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">ບໍລິສັດໃນເຄືອ</h1>
                    <p class="text-sm sm:text-base text-gray-600 mt-1">ຈັດການບໍລິສັດທັງໝົດໃນເຄືອລະບົບ</p>
                  </div>
                  <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-flex items-center gap-1">
                    <Icon icon="ant-design:building-outlined" />
                    {{ companyReportStore.companiesWithReceipts?.length ?? 0 }} ບໍລິສັດ
                  </span>
                </div>
              </header>

              <AffiliatedCompany
                v-if="!showCompanyDetail"
                :statistics="
                  companyReportStore.statistics
                    ? {
                        totalCompanies: companyReportStore.statistics.total_companies,
                        totalBudget: companyReportStore.statistics.total_allocated,
                        totalEmployees: companyReportStore.statistics.total_users,
                      }
                    : undefined
                "
                :companies-from-api="companyReportStore.companiesWithReceipts"
                :loading="companyReportStore.loading"
                @view-details="handleViewDetails"
              />

              <div v-else-if="selectedDetailCompany" class="bg-gray-50">
                <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <div class="px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button
                      type="button"
                      class="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                      @click="closeCompanyDetail"
                    >
                      <Icon icon="mdi:arrow-left" class="text-xl" />
                    </button>
                    <h1 class="text-lg sm:text-xl font-bold">ລາຍລະອຽດບໍລິສັດ</h1>
                    <span class="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm truncate max-w-[60%]">
                      {{ selectedDetailCompany.name }}
                    </span>
                  </div>
                </div>

                <CompanyDetail
                  :company-id="selectedDetailCompany.id"
                  :company-data="selectedDetailCompany"
                  @close="closeCompanyDetail"
                />
              </div>
            </template>
          </Tabs.TabPane>
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

/* Custom scrollbar used for the budget-list panes. */
.hal-scroll::-webkit-scrollbar {
  width: 6px;
}
.hal-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
.hal-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.hal-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Define a "3xl" breakpoint Tailwind doesn't ship by default. */
@media (min-width: 1920px) {
  .\33xl\:max-w-\[120rem\] {
    max-width: 120rem;
  }
  .\33xl\:grid-cols-7 {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
}
</style>
