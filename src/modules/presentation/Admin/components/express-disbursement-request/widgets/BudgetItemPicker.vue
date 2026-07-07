<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
// In-module budget-item picker (written fresh for the express module — does NOT
// reuse the PO approval view's embedded picker, per additive-first). Assigns a
// budget_item_id to each express line item. Emits [{ id, budget_item_id }].
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBudgetItemStore } from "@/modules/presentation/Admin/stores/budget/budget-item.store";

const props = defineProps<{
  lineItems: Array<{ id: number; title: string }>;
  modelValue: Array<{ id: number; budget_item_id: number }>;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: Array<{ id: number; budget_item_id: number }>): void;
}>();

const { t } = useI18n();
const budgetStore = useBudgetItemStore();
const options = ref<Array<{ value: number; label: string }>>([]);

// local map: line item id -> budget_item_id
const selection = ref<Record<number, number | undefined>>({});

onMounted(async () => {
  await budgetStore.fetchBudgetItems({ page: 1, limit: 200 });
  options.value = (budgetStore.budgetItems as any[]).map((b: any) => ({
    value: Number(b.getId ? b.getId() : b.id),
    label: b.getName ? b.getName() : b.name,
  }));
  props.modelValue.forEach((m) => (selection.value[m.id] = m.budget_item_id));
});

watch(
  selection,
  () => {
    const result = Object.entries(selection.value)
      .filter(([, v]) => v != null)
      .map(([id, v]) => ({ id: Number(id), budget_item_id: Number(v) }));
    emit("update:modelValue", result);
  },
  { deep: true }
);
</script>

<template>
  <div class="space-y-2">
    <h4 class="font-semibold">{{ t("expressDisbursementRequest.approval.select_budget") }}</h4>
    <div
      v-for="item in props.lineItems"
      :key="item.id"
      class="flex items-center justify-between gap-3 border rounded p-2"
    >
      <span class="text-sm">{{ item.title }}</span>
      <a-select
        v-model:value="selection[item.id]"
        :options="options"
        style="min-width: 220px"
        :placeholder="t('expressDisbursementRequest.approval.budget_placeholder')"
      />
    </div>
  </div>
</template>
