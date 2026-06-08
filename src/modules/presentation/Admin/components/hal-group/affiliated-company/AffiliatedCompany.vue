<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { Icon } from "@iconify/vue";

import { useNotification } from "@/modules/shared/utils/useNotification";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiSelect from "@/common/shared/components/Input/InputSelect.vue";
import InputSearch from "@/common/shared/components/Input/InputSearch.vue";
import Table, {
  type TablePaginationType,
} from "@/common/shared/components/table/Table.vue";

import {
  SummaryCard,
  MoneyText,
  BudgetBar,
  CompanyLogo,
  useCompanyTheme,
  type ThemeColor,
} from "../_shared";

// ─────────────────────────────────────────────────────────────────────────────
// Types — match the actual `/company-reports/with-receipts` response.
// Renamed from `AffiliatedCompany` to avoid colliding with the component
// import in OverView.vue.
// ─────────────────────────────────────────────────────────────────────────────
interface ApiCompany {
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
}

export interface AffiliatedCompanyRecord {
  id: number;
  name: string;
  logo: string;
  logo_url?: string;
  tel: string;
  email: string;
  address: string;
  /** Number of receipts (proposals fulfilled). */
  receiptCount: number;
  /** Total budget allocated to the company (LAK). */
  budget: number;
  /** Total budget actually used (LAK). */
  budgetUsed: number;
  color: ThemeColor;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  statistics?: {
    totalCompanies: number;
    totalBudget: number;
    totalEmployees: number;
  };
  companiesFromApi?: ApiCompany[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  statistics: undefined,
  companiesFromApi: undefined,
  loading: false,
});

const emit = defineEmits<{
  (e: "view-details", company: AffiliatedCompanyRecord): void;
}>();

// ─────────────────────────────────────────────────────────────────────────────
// Dependencies
// ─────────────────────────────────────────────────────────────────────────────
const { warning } = useNotification();
const { colorForCompany } = useCompanyTheme();

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────
const localLoading = ref(false);
const searchKeyword = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const filters = reactive({
  budgetStatus: "all" as "all" | "within" | "over" | "idle",
  sortBy: "name" as "name" | "budget" | "budgetUsed" | "receiptCount" | "createdAt",
  sortOrder: "asc" as "asc" | "desc",
});

const budgetStatusOptions = [
  { value: "all", label: "ທັງໝົດ" },
  { value: "within", label: "ຢູ່ໃນງົບ" },
  { value: "over", label: "ໃຊ້ງົບເກີນ" },
  { value: "idle", label: "ຍັງບໍ່ໃຊ້ງົບ" },
];

const sortOptions = [
  { value: "name", label: "ຊື່ບໍລິສັດ" },
  { value: "budget", label: "ງົບປະມານທີ່ກຳນົດ" },
  { value: "budgetUsed", label: "ງົບປະມານທີ່ໃຊ້" },
  { value: "receiptCount", label: "ຈຳນວນໃບສະເໜີ" },
  { value: "createdAt", label: "ວັນທີ່ສ້າງ" },
];

const sortOrderOptions = [
  { value: "asc", label: "ໜ້ອຍ → ຫຼາຍ" },
  { value: "desc", label: "ຫຼາຍ → ໜ້ອຍ" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mapping — pure, deterministic, no random or Date.now()
// ─────────────────────────────────────────────────────────────────────────────
const mapApiCompany = (api: ApiCompany): AffiliatedCompanyRecord => ({
  id: api.id,
  name: api.name,
  logo: api.logo,
  logo_url: api.logo_url,
  tel: api.tel || "",
  email: api.email || "",
  address: api.address || "",
  receiptCount: api.receipt_count ?? 0,
  budget: api.total_allocated ?? 0,
  budgetUsed: api.total_used_amount ?? 0,
  color: colorForCompany(api.id),
  createdAt: api.created_at || "",
  updatedAt: api.updated_at || "",
});

const sourceCompanies = computed<AffiliatedCompanyRecord[]>(() =>
  (props.companiesFromApi ?? []).map(mapApiCompany),
);

// ─────────────────────────────────────────────────────────────────────────────
// Filter + sort + paginate
// ─────────────────────────────────────────────────────────────────────────────
// API returns dates as "DD-MM-YYYY HH:mm:ss". Parse to epoch ms so that
// chronological sorting doesn't fall back to alphabetical string compare.
const parseApiDate = (value: string): number => {
  const match = value?.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/);
  if (!match) return 0;
  const [, dd, mm, yyyy, hh = "0", mi = "0", ss = "0"] = match;
  return new Date(+yyyy, +mm - 1, +dd, +hh, +mi, +ss).getTime();
};

const matchesBudgetStatus = (record: AffiliatedCompanyRecord): boolean => {
  if (filters.budgetStatus === "all") return true;
  if (filters.budgetStatus === "idle") return record.budgetUsed === 0;
  if (filters.budgetStatus === "over") return record.budget > 0 && record.budgetUsed > record.budget;
  if (filters.budgetStatus === "within") {
    return record.budget > 0 && record.budgetUsed > 0 && record.budgetUsed <= record.budget;
  }
  return true;
};

const filteredCompanies = computed<AffiliatedCompanyRecord[]>(() => {
  let list = sourceCompanies.value.filter(matchesBudgetStatus);

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        c.email.toLowerCase().includes(keyword) ||
        c.tel.toLowerCase().includes(keyword) ||
        c.address.toLowerCase().includes(keyword),
    );
  }

  list = [...list].sort((a, b) => {
    if (filters.sortBy === "createdAt") {
      const av = parseApiDate(a.createdAt);
      const bv = parseApiDate(b.createdAt);
      return filters.sortOrder === "asc" ? av - bv : bv - av;
    }
    const av = a[filters.sortBy];
    const bv = b[filters.sortBy];
    if (typeof av === "string" && typeof bv === "string") {
      return filters.sortOrder === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    if (typeof av === "number" && typeof bv === "number") {
      return filters.sortOrder === "asc" ? av - bv : bv - av;
    }
    return 0;
  });

  return list;
});

const paginatedCompanies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredCompanies.value.slice(start, start + pageSize.value);
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary statistics — prefer the server-provided totals when available
// ─────────────────────────────────────────────────────────────────────────────
const statistics = computed(() => {
  const list = sourceCompanies.value;
  const fallbackTotalBudget = list.reduce((s, c) => s + c.budget, 0);
  const fallbackTotalUsed = list.reduce((s, c) => s + c.budgetUsed, 0);
  const fallbackTotalReceipts = list.reduce((s, c) => s + c.receiptCount, 0);

  return {
    totalCompanies: props.statistics?.totalCompanies ?? list.length,
    totalBudget: props.statistics?.totalBudget ?? fallbackTotalBudget,
    totalUsed: fallbackTotalUsed,
    totalEmployees: props.statistics?.totalEmployees ?? 0,
    totalReceipts: fallbackTotalReceipts,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// Table columns
// ─────────────────────────────────────────────────────────────────────────────
const tableColumns = computed(() => [
  { title: "ບໍລິສັດ", key: "company", dataIndex: "name", width: 240 },
  { title: "ຕິດຕໍ່", key: "contact", dataIndex: "email", width: 200 },
  { title: "ໃບສະເໜີ", key: "receiptCount", dataIndex: "receiptCount", width: 100 },
  { title: "ງົບປະມານທີ່ກຳນົດ", key: "budget", dataIndex: "budget", width: 160 },
  { title: "ງົບປະມານທີ່ໃຊ້", key: "budgetUsed", dataIndex: "budgetUsed", width: 220 },
  { title: "ວັນທີ່ສ້າງ", key: "createdAt", dataIndex: "createdAt", width: 130 },
  { title: "Action", key: "action", width: 120 },
]);

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
  currentPage.value = pagination.current || 1;
  pageSize.value = pagination.pageSize || 10;
};

const handleRowClick = (): void => {
  // no-op — the view button below handles navigation
};

const handleViewDetails = (record: AffiliatedCompanyRecord) => {
  emit("view-details", record);
};

const loadData = async () => {
  localLoading.value = true;
  try {
    await Promise.resolve();
  } catch (error) {
    console.error("Error loading data:", error);
    warning("ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
  } finally {
    localLoading.value = false;
  }
};

onMounted(loadData);
</script>

<template>
  <div class="affiliated-company-container">
    <!-- Stats -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 lg:mb-6">
      <SummaryCard variant="tonal" color="blue" label="ບໍລິສັດທັງໝົດ" icon="mdi:domain">
        {{ statistics.totalCompanies.toLocaleString() }}
      </SummaryCard>
      <SummaryCard variant="tonal" color="purple" label="ງົບປະມານທັງໝົດ" icon="mdi:account-balance">
        <MoneyText :value="statistics.totalBudget" compact />
      </SummaryCard>
      <SummaryCard variant="tonal" color="orange" label="ງົບປະມານທີ່ໃຊ້" icon="mdi:cash-minus">
        <MoneyText :value="statistics.totalUsed" compact />
        <template #footer>
          <BudgetBar
            :used="statistics.totalUsed"
            :allocated="statistics.totalBudget"
            size="sm"
            :show-label="false"
          />
        </template>
      </SummaryCard>
      <SummaryCard variant="tonal" color="green" label="ໃບສະເໜີທັງໝົດ" icon="mdi:file-document">
        {{ statistics.totalReceipts.toLocaleString() }}
      </SummaryCard>
    </section>

    <!-- Filters -->
    <section class="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 lg:mb-6">
      <div class="flex flex-col lg:flex-row gap-3">
        <div class="flex-1">
          <InputSearch
            v-model="searchKeyword"
            placeholder="ຄົ້ນຫາຊື່ບໍລິສັດ, ອີເມວ, ໂທລະສັບ ຫຼື ທີ່ຢູ່..."
            :disabled="props.loading || localLoading"
            @search="handleSearch"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-[32rem]">
          <UiFormItem>
            <UiSelect
              v-model="filters.budgetStatus"
              :options="budgetStatusOptions"
              placeholder="ສະຖານະງົບປະມານ"
              :disabled="props.loading || localLoading"
              @change="handleFilterChange"
            />
          </UiFormItem>
          <UiFormItem>
            <UiSelect
              v-model="filters.sortBy"
              :options="sortOptions"
              placeholder="ຈັດລຽງຕາມ"
              :disabled="props.loading || localLoading"
              @change="handleFilterChange"
            />
          </UiFormItem>
          <UiFormItem>
            <UiSelect
              v-model="filters.sortOrder"
              :options="sortOrderOptions"
              placeholder="ລຳດັບ"
              :disabled="props.loading || localLoading"
              @change="handleFilterChange"
            />
          </UiFormItem>
        </div>
      </div>
    </section>

    <!-- Table -->
    <section class="bg-white rounded-xl shadow-sm">
      <Table
        :columns="tableColumns"
        :data-source="paginatedCompanies"
        :loading="props.loading || localLoading"
        :pagination="{
          current: currentPage,
          pageSize,
          total: filteredCompanies.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }"
        @row-click="handleRowClick"
        @change="handlePaginationChange"
      >
        <template #company="{ record }">
          <div class="flex items-center gap-3">
            <CompanyLogo :source="record.logo_url || record.logo" :alt="record.name" :color="record.color" size="sm" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate">{{ record.name }}</div>
              <div v-if="record.address" class="text-xs text-gray-500 truncate flex items-center gap-1">
                <Icon icon="mdi:map-marker-outline" class="flex-shrink-0" />
                {{ record.address }}
              </div>
            </div>
          </div>
        </template>

        <template #contact="{ record }">
          <div class="flex flex-col gap-0.5 min-w-0 text-xs">
            <a
              v-if="record.email"
              :href="`mailto:${record.email}`"
              class="text-blue-600 hover:underline truncate flex items-center gap-1"
              @click.stop
            >
              <Icon icon="mdi:email-outline" class="flex-shrink-0" />
              {{ record.email }}
            </a>
            <a
              v-if="record.tel"
              :href="`tel:${record.tel}`"
              class="text-gray-700 hover:underline truncate flex items-center gap-1 tabular-nums"
              @click.stop
            >
              <Icon icon="mdi:phone-outline" class="flex-shrink-0" />
              {{ record.tel }}
            </a>
            <span v-if="!record.email && !record.tel" class="text-gray-400">—</span>
          </div>
        </template>

        <template #receiptCount="{ record }">
          <div>
            <span class="font-medium text-blue-600 tabular-nums">{{ record.receiptCount.toLocaleString() }}</span>
            <div class="text-xs text-gray-500">ໃບສະເໜີ</div>
          </div>
        </template>

        <template #budget="{ record }">
          <MoneyText :value="record.budget" class="font-medium text-gray-900" />
        </template>

        <template #budgetUsed="{ record }">
          <div>
            <MoneyText :value="record.budgetUsed" class="font-medium text-gray-900" />
            <div class="mt-1.5 max-w-[14rem]">
              <BudgetBar :used="record.budgetUsed" :allocated="record.budget" size="sm" :show-label="true" />
            </div>
          </div>
        </template>

        <template #createdAt="{ record }">
          <span class="text-xs text-gray-600 tabular-nums whitespace-nowrap">
            {{ record.createdAt || "—" }}
          </span>
        </template>

        <template #action="{ record }">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            title="ດູລາຍລະອຽດ"
            @click.stop="handleViewDetails(record)"
          >
            <Icon icon="mdi:eye" />
            ລາຍລະອຽດ
          </button>
        </template>
      </Table>
    </section>
  </div>
</template>

<style scoped>
.affiliated-company-container {
  min-height: calc(100vh - 200px);
  background-color: #f8f9fa;
  padding: 0.75rem;
}

@media (min-width: 768px) {
  .affiliated-company-container {
    padding: 1rem;
  }
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
  vertical-align: middle;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #374151;
}
</style>
