<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
// In-module account-code input widget (fresh, not reused from Finance-DPM).
import { useI18n } from "vue-i18n";

defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();
const { t } = useI18n();
</script>

<template>
  <div class="space-y-2">
    <h4 class="font-semibold">{{ t("expressDisbursementRequest.approval.account_code") }}</h4>
    <a-input
      :value="modelValue"
      :placeholder="t('expressDisbursementRequest.approval.account_code_placeholder')"
      @update:value="emit('update:modelValue', $event as string)"
    />
  </div>
</template>
