<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import CompanyLogo from "./CompanyLogo.vue";
import MoneyText from "./MoneyText.vue";
import { useBudgetStatus } from "../composables/useBudgetStatus";
import type { BudgetSeverity, ThemeColor } from "../constants";

interface BudgetEntry {
  id: number | string;
  name: string;
  logo?: string | null;
  budget: number;
  budgetUsed: number;
  color?: ThemeColor | string;
}

interface Props {
  overBudget: BudgetEntry[];
  withinBudget: BudgetEntry[];
}

const props = defineProps<Props>();

const { getBudgetPercentage, getSeverity } = useBudgetStatus();

const SEVERITY_META: Record<
  BudgetSeverity,
  { bar: string; track: string; text: string; label: string; pill: string; icon: string; donut: string }
> = {
  idle:    { bar: "bg-gray-300",    track: "bg-gray-100",   text: "text-gray-500",    label: "ບໍ່ມີຂໍ້ມູນ", pill: "bg-gray-100 text-gray-700",       icon: "mdi:minus-circle-outline", donut: "#d1d5db" },
  safe:    { bar: "bg-emerald-500", track: "bg-emerald-50", text: "text-emerald-700", label: "ປອດໄພ",       pill: "bg-emerald-100 text-emerald-700", icon: "mdi:check-circle",         donut: "#10b981" },
  warning: { bar: "bg-amber-500",   track: "bg-amber-50",   text: "text-amber-700",   label: "ລະວັງ",       pill: "bg-amber-100 text-amber-700",     icon: "mdi:alert-circle-outline", donut: "#f59e0b" },
  danger:  { bar: "bg-orange-500",  track: "bg-orange-50",  text: "text-orange-700",  label: "ໃກ້ເຕັມ",     pill: "bg-orange-100 text-orange-700",   icon: "mdi:alert-circle",         donut: "#f97316" },
  over:    { bar: "bg-rose-500",    track: "bg-rose-50",    text: "text-rose-700",    label: "ເກີນງົບ",     pill: "bg-rose-100 text-rose-700",       icon: "mdi:fire",                 donut: "#f43f5e" },
};

const allCompanies = computed(() => {
  const combined = [...props.overBudget, ...props.withinBudget];
  return combined
    .map((c) => {
      const percentage = getBudgetPercentage(c.budgetUsed, c.budget);
      const severity = getSeverity(percentage);
      const remaining = c.budget - c.budgetUsed;
      return {
        ...c,
        percentage,
        severity,
        meta: SEVERITY_META[severity],
        remaining: Math.max(0, remaining),
        overrun: remaining < 0 ? -remaining : 0,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);
});

const counts = computed(() => {
  const c: Record<BudgetSeverity, number> = { idle: 0, safe: 0, warning: 0, danger: 0, over: 0 };
  for (const item of allCompanies.value) c[item.severity]++;
  return c;
});

const totalCount = computed(() => allCompanies.value.length);

const donutGradient = computed(() => {
  const order: BudgetSeverity[] = ["over", "danger", "warning", "safe", "idle"];
  const total = totalCount.value;
  if (!total) return "conic-gradient(#e5e7eb 0% 100%)";

  const segments: string[] = [];
  let running = 0;
  for (const key of order) {
    const value = counts.value[key];
    if (!value) continue;
    const start = (running / total) * 100;
    running += value;
    const end = (running / total) * 100;
    segments.push(`${SEVERITY_META[key].donut} ${start}% ${end}%`);
  }
  return `conic-gradient(${segments.join(", ")})`;
});

const STATUS_TILES: { key: BudgetSeverity; label: string; tile: string; valueClass: string }[] = [
  { key: "safe",    label: "ປອດໄພ (≤70%)",   tile: "bg-emerald-50 border-emerald-100", valueClass: "text-emerald-700" },
  { key: "warning", label: "ລະວັງ (70–90%)",  tile: "bg-amber-50 border-amber-100",     valueClass: "text-amber-700" },
  { key: "danger",  label: "ໃກ້ເຕັມ (90–100%)", tile: "bg-orange-50 border-orange-100",   valueClass: "text-orange-700" },
  { key: "over",    label: "ເກີນງົບ (>100%)", tile: "bg-rose-50 border-rose-100",       valueClass: "text-rose-700" },
];
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Header: donut + status tiles -->
    <div class="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div class="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 mx-auto sm:mx-0">
          <div class="w-full h-full rounded-full shadow-inner" :style="{ background: donutGradient }" />
          <div class="absolute inset-[18%] bg-white rounded-full flex items-center justify-center">
            <div class="text-center">
              <div class="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums leading-none">{{ totalCount }}</div>
              <div class="text-[10px] sm:text-xs text-gray-500 mt-0.5">ບໍລິສັດ</div>
            </div>
          </div>
        </div>

        <div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
          <div
            v-for="tile in STATUS_TILES"
            :key="tile.key"
            class="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg border"
            :class="tile.tile"
          >
            <Icon :icon="SEVERITY_META[tile.key].icon" class="text-lg sm:text-xl" :class="tile.valueClass" />
            <div class="min-w-0 flex-1">
              <div class="text-[10px] sm:text-[11px] text-gray-500 truncate">{{ tile.label }}</div>
              <div class="text-sm sm:text-base font-bold tabular-nums" :class="tile.valueClass">
                {{ counts[tile.key] }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ranked bar chart -->
    <div v-if="allCompanies.length" class="p-3 sm:p-4 space-y-1 max-h-[34rem] overflow-y-auto hal-scroll">
      <div
        v-for="(company, index) in allCompanies"
        :key="company.id"
        class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div class="w-6 text-center text-xs font-bold text-gray-400 tabular-nums flex-shrink-0">
          {{ index + 1 }}
        </div>

        <CompanyLogo :source="company.logo" :alt="company.name" :color="company.color" size="sm" />

        <div class="w-32 sm:w-44 flex-shrink-0 min-w-0">
          <div class="text-sm font-medium text-gray-900 truncate">{{ company.name }}</div>
          <span
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5"
            :class="company.meta.pill"
          >
            <Icon :icon="company.meta.icon" class="text-[11px]" />
            {{ company.meta.label }}
          </span>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1 gap-2">
            <div class="text-[11px] sm:text-xs text-gray-500 truncate">
              <MoneyText :value="company.budgetUsed" compact />
              <span class="mx-1 text-gray-300">/</span>
              <MoneyText :value="company.budget" compact />
            </div>
            <div class="text-xs sm:text-sm font-bold tabular-nums flex-shrink-0" :class="company.meta.text">
              {{ company.percentage }}%
            </div>
          </div>

          <div class="relative w-full h-2.5 sm:h-3 rounded-full overflow-hidden" :class="company.meta.track">
            <div
              class="h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
              :class="company.meta.bar"
              :style="{ width: `${Math.min(company.percentage, 100)}%` }"
            />
            <div
              v-if="company.percentage > 100"
              class="absolute right-0 top-0 h-full w-1 bg-rose-700 animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
          </div>

          <div class="flex items-center justify-between mt-1 text-[10px] sm:text-[11px]">
            <span v-if="company.overrun > 0" class="font-medium text-rose-600">
              ເກີນ: <MoneyText :value="company.overrun" compact />
            </span>
            <span v-else class="text-gray-500">
              ຍັງເຫຼືອ: <MoneyText :value="company.remaining" compact />
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="p-8 text-center text-gray-500">
      <Icon icon="solar:chart-2-outline" class="text-4xl mb-2 mx-auto block" />
      <div class="text-sm">ບໍ່ມີຂໍ້ມູນງົບປະມານ</div>
    </div>
  </div>
</template>

<style scoped>
.hal-scroll::-webkit-scrollbar { width: 6px; }
.hal-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
.hal-scroll::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
.hal-scroll::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
</style>
