<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { useCompanyTheme } from "../composables/useCompanyTheme";
import type { ThemeColor } from "../constants";

/**
 * A single dashboard summary tile (the gradient stat card).
 * Replaces the inline copy-pasted card pattern repeated 17+ times across
 * OverView, CompanyDetail, AffiliatedCompany, BudgetList.
 *
 * Slots:
 *  - default: primary value (a string, a MoneyText, etc.)
 *  - footer:  optional small text under the value
 */
interface Props {
  label: string;
  color?: ThemeColor;
  icon?: string;
  /** Optional title attribute for accessibility/long-form value. */
  valueTitle?: string;
  /** "filled" (gradient) for hero summaries, "tonal" for inner cards. */
  variant?: "filled" | "tonal";
}

const props = withDefaults(defineProps<Props>(), {
  color: "blue",
  icon: undefined,
  valueTitle: undefined,
  variant: "filled",
});

const { getGradientClass, getBgClass, getTextClass } = useCompanyTheme();

const wrapperClass = computed(() => {
  if (props.variant === "filled") {
    return [
      "bg-gradient-to-br text-white shadow-lg hover:shadow-xl",
      getGradientClass(props.color),
    ];
  }
  return ["bg-white border border-gray-100 shadow-sm hover:shadow-md"];
});

const iconWrapClass = computed(() =>
  props.variant === "filled"
    ? "bg-white/20"
    : `${getBgClass(props.color)} ${getTextClass(props.color)}`,
);

const labelClass = computed(() =>
  props.variant === "filled" ? "text-white/85" : "text-gray-500",
);

const valueClass = computed(() =>
  props.variant === "filled" ? "text-white" : "text-gray-900",
);
</script>

<template>
  <div
    :class="wrapperClass"
    class="rounded-xl p-3 sm:p-4 md:p-5 transition-shadow duration-300 motion-reduce:transition-none"
  >
    <div class="flex items-center justify-between mb-2 sm:mb-3 gap-2">
      <div v-if="icon" :class="iconWrapClass" class="p-1.5 sm:p-2 rounded-lg flex-shrink-0">
        <Icon :icon="icon" class="text-lg sm:text-xl md:text-2xl" />
      </div>
      <span
        :class="labelClass"
        class="text-[11px] sm:text-xs md:text-sm font-medium leading-tight text-right truncate"
      >
        {{ label }}
      </span>
    </div>

    <div class="space-y-1">
      <div
        :class="valueClass"
        :title="valueTitle"
        class="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight tabular-nums break-words"
      >
        <slot />
      </div>
      <div
        v-if="$slots.footer"
        :class="labelClass"
        class="text-[11px] sm:text-xs md:text-sm opacity-80 leading-tight"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
