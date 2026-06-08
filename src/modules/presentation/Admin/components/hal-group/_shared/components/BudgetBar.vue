<script setup lang="ts">
import { computed } from "vue";
import { useBudgetStatus } from "../composables/useBudgetStatus";

/**
 * Single source of truth for the budget-progress bar that previously had
 * five separate copies inside OverView (header cards, over-budget list,
 * within-budget list), AffiliatedCompany table cell, BudgetList and
 * CompanyDetail.
 */
interface Props {
  used: number | null | undefined;
  allocated: number | null | undefined;
  /** Bar thickness — Tailwind utility class. */
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  /** Show the "+N%" overrun annotation when over 100%. */
  showOverrun?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  showLabel: true,
  showOverrun: true,
});

const { getBudgetPercentage, getBarColor, getTextColor, getTrackColor } = useBudgetStatus();

const percentage = computed(() => getBudgetPercentage(props.used, props.allocated));
const cappedWidth = computed(() => Math.min(percentage.value, 100));
const overruns = computed(() => percentage.value > 100);

const heightClass = computed(() => ({
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
}[props.size]));
</script>

<template>
  <div class="w-full">
    <div v-if="showLabel" class="flex items-center justify-between text-xs mb-1">
      <slot name="left" />
      <span class="font-medium tabular-nums" :class="getTextColor(percentage)">
        {{ percentage }}%
        <span v-if="showOverrun && overruns">(+{{ percentage - 100 }}%)</span>
      </span>
    </div>

    <div
      class="relative w-full overflow-hidden rounded-full"
      :class="[getTrackColor(percentage), heightClass]"
      role="progressbar"
      :aria-valuenow="percentage"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
        :class="[getBarColor(percentage), heightClass]"
        :style="{ width: `${cappedWidth}%` }"
      />
      <div
        v-if="overruns"
        class="absolute right-0 top-0 w-1 bg-rose-700 animate-pulse motion-reduce:animate-none"
        :class="heightClass"
        aria-hidden="true"
      />
    </div>
  </div>
</template>
