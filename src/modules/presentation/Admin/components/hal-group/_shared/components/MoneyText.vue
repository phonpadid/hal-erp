<script setup lang="ts">
import { computed } from "vue";
import { useDashboardFormat } from "../composables/useDashboardFormat";

/**
 * Render a money amount in either the full localised form (₭ 1,250,000)
 * or compact form (₭1.2M). The full form is always available via the
 * `title` attribute so users can hover for the exact value.
 *
 * Replaces inline `formatCurrency(...)` / `formatLargeNumber(...)` calls
 * across every dashboard component.
 */
interface Props {
  value: number | null | undefined;
  /** Show abbreviated (1.2M / 350K) instead of full amount. */
  compact?: boolean;
  /** Include the currency symbol when in compact mode. */
  withSymbol?: boolean;
  /** Force a sign prefix (used for "+overrun" badges). */
  signed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  withSymbol: true,
  signed: false,
});

const { formatCurrency, formatLargeNumber } = useDashboardFormat();

const fullText = computed(() => formatCurrency(props.value));

const display = computed(() => {
  const text = props.compact
    ? formatLargeNumber(props.value, { withSymbol: props.withSymbol })
    : fullText.value;
  if (props.signed && Number(props.value ?? 0) > 0) {
    return `+${text}`;
  }
  return text;
});
</script>

<template>
  <span :title="fullText" class="tabular-nums whitespace-nowrap">{{ display }}</span>
</template>
