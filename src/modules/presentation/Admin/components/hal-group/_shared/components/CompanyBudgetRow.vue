<script setup lang="ts">
import { computed } from "vue";
import { useDashboardFormat } from "../composables/useDashboardFormat";
import { useBudgetStatus } from "../composables/useBudgetStatus";
import CompanyLogo from "./CompanyLogo.vue";
import BudgetBar from "./BudgetBar.vue";
import type { ThemeColor } from "../constants";

/**
 * A single row in the over-/within-budget lists at the bottom of OverView.
 * Pulled into its own component so the same markup doesn't get duplicated
 * for the two buckets.
 */
interface Props {
  name: string;
  logo?: string | null;
  color?: ThemeColor | string;
  used: number;
  allocated: number;
  variant: "over" | "within";
}

const props = withDefaults(defineProps<Props>(), {
  logo: undefined,
  color: "blue",
});

const { formatCurrency } = useDashboardFormat();
const { getBudgetPercentage } = useBudgetStatus();

const percentage = computed(() => getBudgetPercentage(props.used, props.allocated));
const overrun = computed(() => Math.max(0, props.used - props.allocated));
const remaining = computed(() => Math.max(0, props.allocated - props.used));

const wrapperClass = computed(() =>
  props.variant === "over"
    ? "bg-rose-50/70 border-rose-200"
    : "bg-emerald-50/60 border-emerald-200",
);

const amountClass = computed(() =>
  props.variant === "over" ? "text-rose-700" : "text-emerald-700",
);
</script>

<template>
  <div
    :class="wrapperClass"
    class="flex flex-wrap sm:flex-nowrap items-center gap-3 p-2 sm:p-3 rounded-lg border"
  >
    <CompanyLogo :source="logo" :alt="name" :color="color" size="xs" />

    <div class="flex flex-col min-w-[8rem] sm:w-40 flex-shrink-0">
      <div class="text-xs sm:text-sm font-medium text-gray-900 truncate">
        {{ name }}
      </div>
      <div class="text-[11px] sm:text-xs font-medium tabular-nums" :class="amountClass">
        <template v-if="variant === 'over'">+{{ formatCurrency(overrun) }}</template>
        <template v-else>ຍັງ: {{ formatCurrency(remaining) }}</template>
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <BudgetBar
        :used="used"
        :allocated="allocated"
        size="md"
        :show-label="true"
        :show-overrun="variant === 'over'"
      />
    </div>

    <div class="text-[11px] sm:text-xs text-gray-500 w-16 text-right tabular-nums">
      {{ percentage }}%
    </div>
  </div>
</template>
