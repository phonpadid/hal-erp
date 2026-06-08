<script setup lang="ts">
import CompanyLogo from "./CompanyLogo.vue";
import BudgetBar from "./BudgetBar.vue";
import MoneyText from "./MoneyText.vue";
import type { ThemeColor } from "../constants";

/**
 * Clickable company tile used in the Pending-Proposals grid on OverView.
 * Replaces ~95 lines of repeated markup with a single declarative component.
 */
interface Props {
  name: string;
  logo?: string | null;
  color?: ThemeColor | string;
  proposalCount: number;
  budget: number;
  budgetUsed: number;
}

withDefaults(defineProps<Props>(), {
  logo: undefined,
  color: "blue",
});

defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <button
    type="button"
    class="group bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-left w-full
           cursor-pointer transition-all duration-200 motion-reduce:transition-none
           hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    @click="$emit('click')"
  >
    <div class="flex justify-center mb-3">
      <CompanyLogo :source="logo" :alt="name" :color="color" size="md" />
    </div>

    <h3 class="text-center font-semibold text-gray-900 mb-2 text-sm line-clamp-2 min-h-[2.5rem]">
      {{ name }}
    </h3>

    <div class="text-center mb-3">
      <div class="text-[11px] text-gray-500 mb-0.5">ໃບສະເໜີ</div>
      <div class="text-lg font-bold text-blue-600 tabular-nums">
        {{ proposalCount.toLocaleString() }}
      </div>
    </div>

    <div class="text-[10px] text-gray-400 mb-1 flex justify-between tabular-nums">
      <span>ງົບ <MoneyText :value="budget" compact :with-symbol="false" /></span>
      <span>ໃຊ້ <MoneyText :value="budgetUsed" compact :with-symbol="false" /></span>
    </div>

    <BudgetBar :used="budgetUsed" :allocated="budget" size="md" :show-label="false" />
  </button>
</template>
