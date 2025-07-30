<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <a-table
    :columns="columns"
    :data-source="dataSource"
    :scroll="{ x: true }"
    :pagination="pagination"
    :rowClassName="rowClassName"
    :loading="loading"
    :customRow="customRowHandler"
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

// กำหนด interface ให้มีความยืดหยุ่น
export interface Column {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  title: string | any;
  key: string;
  dataIndex?: string;
  width?: number | string;
}

export interface TableRecord {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // เปลี่ยนเป็น any เพื่อความยืดหยุ่น
}

export interface TablePaginationType {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?:string[];
}

export interface SorterResult {
  column?: unknown;
  order?: "ascend" | "descend" | null;
  field?: string;
  columnKey?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  columns: Column[];
  dataSource: TableRecord[];
  pagination?: TablePaginationType;
  loading?: boolean;
  scrollX?: number;
  scrollY?: number;
  rowClassName?: string | ((record: TableRecord, index?: number) => string);
}>();

const emit = defineEmits<{
  (
    e: "change",
    pagination: TablePaginationType,
    filters: Record<string, string[]>,
    sorter: SorterResult
  ): void;
  (e: "row-click", record: TableRecord): void;
}>();

// ฟังก์ชันที่จะเพิ่ม event handler ให้กับแถว
const customRowHandler = (record: TableRecord) => {
  return {
    onClick: () => {
      emit("row-click", record);
    },
  };
};

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
