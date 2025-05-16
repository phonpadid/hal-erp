<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <a-table
    :columns="columns"
    :data-source="dataSource"
    :scroll="{ x: true }"
    :pagination="pagination"
    :rowClassName="rowClassName"
    :loading="loading"
    class="custom-table dark:bg-gray-800 dark:text-white dark:border-gray-700"
    @change="
      (pagination: TablePaginationType, filters: Record<string, string[]>, sorter: SorterResult) =>
        $emit('change', pagination, filters, sorter)
    "
  >
    <template #bodyCell="{ column, record, index }">
      <slot :name="column.key" :index="index" :record="record" :column="column">
        {{ getNestedValue(record, column.dataIndex) }}
      </slot>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

interface Column {
  title: string;
  key: string;
  dataIndex?: string;
  width?: number;
}

interface TableRecord {
  [key: string]: unknown;
}

interface TablePaginationType {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
}

interface SorterResult {
  column?: unknown;
  order?: "ascend" | "descend" | null;
  field?: string;
  columnKey?: string;
}

defineProps<{
  columns: Column[];
  dataSource: TableRecord[];
  pagination?: TablePaginationType;
  loading?: boolean;
  scrollX?: number;
  scrollY?: number;
  rowClassName?: string | ((record: TableRecord, index: number) => string);
}>();

defineEmits<{
  (
    e: "change",
    pagination: TablePaginationType,
    filters: Record<string, string[]>,
    sorter: SorterResult
  ): void;
}>();

function getNestedValue(record: TableRecord, path?: string | string[]): unknown {
  if (!path) return null;

  if (typeof path === "string") {
    path = path.split(".");
  }
  return path.reduce(
    (acc: unknown, key: string) =>
      acc && typeof acc === "object" && acc !== null && key in acc
        ? (acc as Record<string, unknown>)[key]
        : null,
    record
  );
}
</script>
