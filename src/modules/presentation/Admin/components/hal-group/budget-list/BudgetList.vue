<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import { useNotification } from "@/modules/shared/utils/useNotification";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiSelect from "@/common/shared/components/Input/InputSelect.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import Table, {
  type TablePaginationType,
} from "@/common/shared/components/table/Table.vue";
import { useBudgetReportsStore } from "@/modules/presentation/Admin/stores/reports/budget-reports.store";

import {
  SummaryCard,
  MoneyText,
  BudgetBar,
  EmptyState,
  SectionHeader,
  useDashboardFormat,
  useBudgetStatus,
} from "../_shared";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface BudgetRow {
  id: number | string;
  company_id?: number;
  department_id?: string;
  code: string;
  name: string;
  type: string;
  fiscal_year: number;
  allocated_amount: number;
  used_amount: number;
  balance_amount: number;
}

interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  usagePercentage: number;
  remaining: number;
}

interface DepartmentRanking {
  department: string;
  name: string;
  code: string;
  spent: number;
  allocated: number;
  percentage: number;
  piePercentage: number;
}

interface SummaryApiData {
  allocated_total?: number;
  use_total?: number;
  balance_total?: number;
}

const props = defineProps<{ companyId: number }>();

// ─────────────────────────────────────────────────────────────────────────────
// Dependencies
// ─────────────────────────────────────────────────────────────────────────────
const { warning } = useNotification();
const budgetReportsStore = useBudgetReportsStore();
const { formatPercent } = useDashboardFormat();
const { getBudgetPercentage } = useBudgetStatus();

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────
const loading = computed(() => budgetReportsStore.budgetAccountsLoading);
const searchKeyword = ref("");
const selectedYear = ref(new Date().getFullYear());
const selectedPeriod = ref("all");
const selectedDepartment = ref("all");
const selectedStatus = ref("all");
const currentPage = ref(1);
const pageSize = ref(10);

const currentYear = new Date().getFullYear();
const years = computed(() =>
  Array.from({ length: 8 }, (_, i) => {
    const year = currentYear - 5 + i;
    return { value: year, label: `${year}` };
  }),
);

const periodOptions = [
  { value: "all", label: "ທຸກໄລຍະ" },
  { value: "q1", label: "ໄຕມາດ 1" },
  { value: "q2", label: "ໄຕມາດ 2" },
  { value: "q3", label: "ໄຕມາດ 3" },
  { value: "q4", label: "ໄຕມາດ 4" },
];

const departmentOptions = [
  { value: "all", label: "ທຸກພະແນກ" },
  { value: "it", label: "ພະແນກ IT" },
  { value: "hr", label: "ພະແນກບຸລິຄະມານ" },
  { value: "finance", label: "ພະແນກບັນຊີ" },
  { value: "procurement", label: "ພະແນກຊື້" },
  { value: "operations", label: "ພະແນກປະຕິບັດຕິພັນ" },
  { value: "marketing", label: "ພະແນກການຕະຫຼາດ" },
];

const statusOptions = [
  { value: "all", label: "ທຸກສະຖານະ" },
  { value: "active", label: "ກຳລັງໃຊ້ງົບ" },
  { value: "completed", label: "ສຳເລັດແລ້ວ" },
  { value: "cancelled", label: "ຍົກເລີກ" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — analyse the polymorphic API response (array OR summary) once.
// ─────────────────────────────────────────────────────────────────────────────
const isSummaryPayload = (data: unknown): data is SummaryApiData =>
  !!data && typeof data === "object" && !Array.isArray(data) && "allocated_total" in data;

const rowsFromArray = (data: BudgetRow[]): BudgetRow[] => data;

const rowFromSummary = (summary: SummaryApiData): BudgetRow => ({
  id: "summary",
  code: "SUMMARY",
  name: "ສະຫຼຸບງົບປະມານທັງໝົດ",
  type: "summary",
  allocated_amount: summary.allocated_total ?? 0,
  used_amount: summary.use_total ?? 0,
  balance_amount: summary.balance_total ?? 0,
  fiscal_year: selectedYear.value,
  company_id: props.companyId,
});

const budgetData = computed<BudgetRow[]>(() => {
  const report = budgetReportsStore.budgetAccountsReportData;
  if (!report?.data) return [];
  if (Array.isArray(report.data)) return rowsFromArray(report.data as BudgetRow[]);
  if (isSummaryPayload(report.data)) return [rowFromSummary(report.data)];
  return [];
});

// ─────────────────────────────────────────────────────────────────────────────
// Filter + paginate
// ─────────────────────────────────────────────────────────────────────────────
const filteredBudgets = computed(() => {
  if (!searchKeyword.value) return budgetData.value;
  const keyword = searchKeyword.value.toLowerCase();
  return budgetData.value.filter(
    (b) =>
      b.name.toLowerCase().includes(keyword) ||
      b.code.toLowerCase().includes(keyword) ||
      b.type.toLowerCase().includes(keyword),
  );
});

const paginatedBudgets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredBudgets.value.slice(start, start + pageSize.value);
});

const tableColumns = computed(() => [
  { title: "ລະຫັດ", key: "code", dataIndex: "code", width: 130 },
  { title: "ຊື່ບັນຊີງົບປະມານ", key: "name", dataIndex: "name", width: 260 },
  { title: "ປະເພດ", key: "type", dataIndex: "type", width: 120 },
  { title: "ງົບປະມານທີ່ກຳນົດ", key: "allocated_amount", dataIndex: "allocated_amount", width: 170 },
  { title: "ງົບປະມານທີ່ໃຊ້", key: "used_amount", dataIndex: "used_amount", width: 200 },
  { title: "ງົບປະມານທີ່ຍັງເຫຼືອ", key: "balance_amount", dataIndex: "balance_amount", width: 170 },
  { title: "ປີບັນຊີ", key: "fiscal_year", dataIndex: "fiscal_year", width: 100 },
]);

// ─────────────────────────────────────────────────────────────────────────────
// Aggregations — one summary, top-3 departments
// ─────────────────────────────────────────────────────────────────────────────
const companyBudgetUsage = computed<BudgetSummary>(() => {
  const report = budgetReportsStore.budgetAccountsReportData;
  if (!report?.data) return { totalAllocated: 0, totalSpent: 0, usagePercentage: 0, remaining: 0 };

  if (isSummaryPayload(report.data)) {
    const allocated = report.data.allocated_total ?? 0;
    const spent = report.data.use_total ?? 0;
    return {
      totalAllocated: allocated,
      totalSpent: spent,
      usagePercentage: getBudgetPercentage(spent, allocated),
      remaining: Math.max(0, allocated - spent),
    };
  }

  if (Array.isArray(report.data)) {
    const allocated = report.data.reduce(
      (s: number, r: { allocated_amount?: number }) => s + (r.allocated_amount || 0),
      0,
    );
    const spent = report.data.reduce(
      (s: number, r: { used_amount?: number }) => s + (r.used_amount || 0),
      0,
    );
    return {
      totalAllocated: allocated,
      totalSpent: spent,
      usagePercentage: getBudgetPercentage(spent, allocated),
      remaining: Math.max(0, allocated - spent),
    };
  }

  return { totalAllocated: 0, totalSpent: 0, usagePercentage: 0, remaining: 0 };
});

const topDepartmentsByBudget = computed<DepartmentRanking[]>(() => {
  const report = budgetReportsStore.budgetAccountsReportData;
  if (!report?.data) return [];

  if (isSummaryPayload(report.data)) {
    const allocated = report.data.allocated_total ?? 0;
    const spent = report.data.use_total ?? 0;
    return [
      {
        department: "summary",
        name: "ສະຫຼຸບທັງໝົດ",
        code: "ALL",
        spent,
        allocated,
        percentage: getBudgetPercentage(spent, allocated),
        piePercentage: 100,
      },
    ];
  }

  if (!Array.isArray(report.data)) return [];

  const grouped = new Map<string, { spent: number; allocated: number; name: string; code: string }>();
  for (const b of report.data as BudgetRow[]) {
    const key = b.name || b.code || "unknown";
    const entry = grouped.get(key);
    if (entry) {
      entry.spent += b.used_amount || 0;
      entry.allocated += b.allocated_amount || 0;
    } else {
      grouped.set(key, {
        spent: b.used_amount || 0,
        allocated: b.allocated_amount || 0,
        name: b.name || "Unknown",
        code: b.code || "",
      });
    }
  }

  const top = [...grouped.entries()]
    .map(([department, data]) => ({
      department,
      name: data.name,
      code: data.code,
      spent: data.spent,
      allocated: data.allocated,
      percentage: getBudgetPercentage(data.spent, data.allocated),
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  const totalSpent = top.reduce((s, t) => s + t.spent, 0);
  return top.map((t) => ({
    ...t,
    piePercentage: totalSpent > 0 ? Math.round((t.spent / totalSpent) * 100) : 0,
  }));
});

const pieGradient = computed(() => {
  const ranks = topDepartmentsByBudget.value;
  if (ranks.length === 0) return "conic-gradient(#E5E7EB 0% 100%)";

  const palette = ["#3B82F6", "#10B981", "#F59E0B", "#A855F7", "#EC4899"];
  const segments: string[] = [];
  let runningTotal = 0;
  for (let i = 0; i < ranks.length; i++) {
    const next = runningTotal + ranks[i].piePercentage;
    segments.push(`${palette[i % palette.length]} ${runningTotal}% ${next}%`);
    runningTotal = next;
  }
  if (runningTotal < 100) {
    segments.push(`#E5E7EB ${runningTotal}% 100%`);
  }
  return `conic-gradient(${segments.join(", ")})`;
});

// ─────────────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────────────
const handleSearch = (value: string) => {
  searchKeyword.value = value;
  currentPage.value = 1;
};

const handleFilterChange = () => {
  currentPage.value = 1;
};

const handlePaginationChange = (pagination: TablePaginationType) => {
  currentPage.value = (pagination.current as number) || 1;
  pageSize.value = (pagination.pageSize as number) || 10;
};

const handleRowClick = (): void => {
  // intentionally no-op
};

const loadData = async () => {
  try {
    await budgetReportsStore.fetchBudgetAccountsReport(props.companyId, selectedYear.value);
  } catch (error) {
    console.error("Error loading budget data:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນງົບປະມານໄດ້");
  }
};

watch(
  () => selectedYear.value,
  (newYear) => {
    if (newYear && props.companyId) loadData();
  },
);

watch(
  () => props.companyId,
  (newId) => {
    if (newId && selectedYear.value) loadData();
  },
);

onMounted(() => {
  if (props.companyId && selectedYear.value) loadData();
});
</script>

<template>
  <div class="budget-list-container">
    <!-- Top stat row -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
      <!-- Company budget usage -->
      <article class="bg-white rounded-xl shadow-sm p-4 sm:p-5">
        <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">ການໃຊ້ງົບປະມານຂອງບໍລິສັດ</h3>
          <UiFormItem class="w-28">
            <UiSelect v-model="selectedYear" :options="years" placeholder="ປີ" :disabled="loading" />
          </UiFormItem>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SummaryCard variant="tonal" color="blue" label="ງົບປະມານຕົ້ນປີ" icon="mdi:account-balance">
            <MoneyText :value="companyBudgetUsage.totalAllocated" compact />
          </SummaryCard>

          <SummaryCard variant="tonal" color="orange" label="ງົບປະມານທີ່ໃຊ້ແລ້ວ" icon="mdi:cash-minus">
            <MoneyText :value="companyBudgetUsage.totalSpent" compact />
          </SummaryCard>

          <SummaryCard variant="tonal" color="green" label="ອັດຕາການໃຊ້ໄປ" icon="mdi:percent">
            {{ formatPercent(companyBudgetUsage.usagePercentage) }}
            <template #footer>
              <BudgetBar
                :used="companyBudgetUsage.totalSpent"
                :allocated="companyBudgetUsage.totalAllocated"
                size="sm"
                :show-label="false"
              />
            </template>
          </SummaryCard>

          <SummaryCard variant="tonal" color="purple" label="ງົບປະມານທີ່ຍັງເຫຼືອ" icon="mdi:cash-plus">
            <MoneyText :value="companyBudgetUsage.remaining" compact />
          </SummaryCard>
        </div>
      </article>

      <!-- Top departments -->
      <article class="bg-white rounded-xl shadow-sm p-4 sm:p-5">
        <SectionHeader title="3 ອັນດັບບັນຊີງົບປະມານທີ່ໃຊ້ຫຼາຍ" />

        <div v-if="topDepartmentsByBudget.length" class="space-y-4">
          <div class="flex justify-center">
            <div class="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44">
              <div class="w-full h-full rounded-full shadow-lg" :style="{ background: pieGradient }" />
              <div class="absolute inset-[18%] bg-white rounded-full flex items-center justify-center">
                <div class="text-center">
                  <div class="text-base sm:text-lg font-bold text-gray-900 tabular-nums">
                    {{ topDepartmentsByBudget.length }}
                  </div>
                  <div class="text-xs text-gray-500">ພະແນກ</div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div
              v-for="(dept, index) in topDepartmentsByBudget"
              :key="dept.department"
              class="flex items-center gap-3 p-2.5 rounded-lg border"
              :class="[
                'border-gray-200 bg-gray-50',
                { 'border-blue-200 bg-blue-50': index === 0 },
                { 'border-emerald-200 bg-emerald-50': index === 1 },
                { 'border-amber-200 bg-amber-50': index === 2 },
              ]"
            >
              <div
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0"
                :class="[
                  { 'bg-blue-500': index === 0 },
                  { 'bg-emerald-500': index === 1 },
                  { 'bg-amber-500': index === 2 },
                ]"
              >
                {{ index + 1 }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate text-sm">{{ dept.name }}</div>
                <div class="text-xs text-gray-500">
                  <MoneyText :value="dept.spent" />
                </div>
              </div>

              <div class="w-24 sm:w-32 flex-shrink-0">
                <BudgetBar :used="dept.spent" :allocated="dept.allocated" size="sm" :show-label="true" />
              </div>
            </div>
          </div>
        </div>

        <EmptyState
          v-else
          icon="mdi:chart-pie"
          message="ບໍ່ມີຂໍ້ມູນການໃຊ້ງົບປະມານໃນປີທີ່ເລືອກ"
        />
      </article>
    </section>

    <!-- Filters -->
    <section class="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 lg:mb-6">
      <div class="flex flex-col lg:flex-row gap-3">
        <div class="flex-1">
          <InputSearch
            v-model="searchKeyword"
            placeholder="ຄົ້ນຫາປະເພດງົບປະມານ, ລາຍລະອຽດ ຫຼື ເລກທີ..."
            :disabled="loading"
            @search="handleSearch"
          />
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:w-[40rem]">
          <UiFormItem>
            <UiSelect v-model="selectedYear" :options="years" placeholder="ປີ" :disabled="loading" @change="handleFilterChange" />
          </UiFormItem>
          <UiFormItem>
            <UiSelect v-model="selectedPeriod" :options="periodOptions" placeholder="ໄລຍະ" :disabled="loading" @change="handleFilterChange" />
          </UiFormItem>
          <UiFormItem>
            <UiSelect v-model="selectedDepartment" :options="departmentOptions" placeholder="ພະແນກ" :disabled="loading" @change="handleFilterChange" />
          </UiFormItem>
          <UiFormItem>
            <UiSelect v-model="selectedStatus" :options="statusOptions" placeholder="ສະຖານະ" :disabled="loading" @change="handleFilterChange" />
          </UiFormItem>
        </div>
      </div>
    </section>

    <!-- Table -->
    <section class="bg-white rounded-xl shadow-sm">
      <Table
        :columns="tableColumns"
        :data-source="paginatedBudgets"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize,
          total: filteredBudgets.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }"
        @row-click="handleRowClick"
        @change="handlePaginationChange"
      >
        <template #allocated_amount="{ record }">
          <div class="text-right font-medium">
            <MoneyText :value="record.allocated_amount" />
          </div>
        </template>

        <template #used_amount="{ record }">
          <div class="text-right">
            <div class="font-medium">
              <MoneyText :value="record.used_amount" />
            </div>
            <div class="mt-1.5 max-w-[10rem] ml-auto">
              <BudgetBar :used="record.used_amount" :allocated="record.allocated_amount" size="sm" :show-label="true" />
            </div>
          </div>
        </template>

        <template #balance_amount="{ record }">
          <div class="text-right">
            <div class="font-medium" :class="record.balance_amount < 0 ? 'text-rose-600' : 'text-gray-900'">
              <MoneyText :value="Math.abs(record.balance_amount)" />
            </div>
            <div v-if="record.balance_amount < 0" class="text-xs text-rose-600">ເກີນງົບ</div>
          </div>
        </template>

        <template #type="{ record }">
          <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {{ record.type === "expenditure" ? "ລາຍຈ່າຍ" : record.type === "summary" ? "ສະຫຼຸບ" : "ລາຍຮັບ" }}
          </span>
        </template>
      </Table>
    </section>

    <EmptyState
      v-if="!loading && filteredBudgets.length === 0"
      icon="mdi:finance"
      title="ບໍ່ພົບຂໍ້ມູນງົບປະມານ"
      message="ລອງປ່ຽນຕົວກອງ ຫຼື ຄຳຄົ້ນຫາ"
    />
  </div>
</template>

<style scoped>
.budget-list-container {
  min-height: 400px;
}
</style>
