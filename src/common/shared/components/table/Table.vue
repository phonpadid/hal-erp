<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="ui-table-scroll">
    <a-table
      class="ui-table-inner"
      :columns="columns"
      :data-source="dataSource"
      :scroll="{ x: scrollX ?? 'max-content' }"
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
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

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

const props = defineProps<{
  columns: Column[];
  dataSource: TableRecord[];
  pagination?: TablePaginationType | boolean;
  loading?: boolean;
  scrollX?: number;
  scrollY?: number;
  rowClassName?: string | ((record: TableRecord, index?: number) => string);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customRow?: (record: TableRecord, index?: number) => Record<string, any>;
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

const customRowHandler = (record: TableRecord, index?: number) => {
  const extra = props.customRow ? props.customRow(record, index) : {};
  const extraOnClick = extra.onClick as ((e: MouseEvent) => void) | undefined;
  return {
    ...extra,
    onClick: (e: MouseEvent) => {
      extraOnClick?.(e);
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

<style scoped>
.ui-table-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Force cells to size to content so the table actually exceeds the
   container width and ant-design's horizontal scroll kicks in. Without
   this, columns without explicit widths get squashed to fit. */
:deep(.ant-table-thead > tr > th),
:deep(.ant-table-tbody > tr > td) {
  white-space: nowrap;
}

/* On phones, guarantee the table is at least a tablet-width so users can
   reliably scroll horizontally to see all columns. */
@media (max-width: 767px) {
  :deep(.ant-table) {
    min-width: 720px;
  }
}
</style>
