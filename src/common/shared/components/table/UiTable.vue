<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="ui-table-wrapper">
    <div v-if="title || $slots.header" class="ui-table-header mb-4">
      <h3 v-if="title" class="text-lg font-medium">{{ title }}</h3>
      <slot name="header"></slot>
    </div>

    <div class="ui-table-actions mb-4" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>

    <div class="ui-table-container">
      <a-table
        :loading="loading"
        :columns="columns"
        :data-source="dataSource"
        :row-selection="rowSelection ? rowSelection : undefined"
        :scroll="scroll"
        :pagination="paginationConfig"
        :row-key="rowKey"
        :bordered="bordered"
        :size="size"
        @change="handleTableChange"
      >
        <!-- Custom Column Rendering -->
        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData"></slot>
        </template>

        <!-- Default Body Cell Slot -->
        <template #bodyCell="{ column, text, record, index }">
          <slot
            name="bodyCell"
            :column="column"
            :text="text"
            :record="record"
            :index="index"
          >
            <!-- Link Column Type -->
            <template v-if="column.link && text !== undefined">
              <a :href="typeof column.link === 'function' ? column.link(record) : '#'">{{ text }}</a>
            </template>

            <!-- Action Column Type -->
            <template v-else-if="column.dataIndex === 'action' || column.key === 'action'">
              <slot
                name="action"
                :record="record"
                :index="index"
              ></slot>
            </template>

            <!-- Status Column Type -->
            <template v-else-if="column.dataIndex === 'status' || column.status">
              <a-tag :color="getStatusColor(text)">{{ text }}</a-tag>
            </template>
          </slot>
        </template>

        <!-- Empty Data Template -->
        <template #emptyText>
          <slot name="emptyText">
            <div class="py-8 text-center text-gray-500">
              <div class="text-4xl mb-2">📊</div>
              <div>ບໍ່ມີຂໍ້ມູນ</div>
            </div>
          </slot>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue';
import type { TableProps, TableColumnType, TablePaginationConfig } from 'ant-design-vue';
import type { FilterValue, SorterResult } from 'ant-design-vue/es/table/interface';

// Define props for the component
const props = defineProps({
  columns: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: Array as PropType<TableColumnType<any>[]>,
    required: true,
  },
  dataSource: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: Array as PropType<any[]>,
    default: () => [],
  },
  rowSelection: {
    type: Object as PropType<TableProps['rowSelection']>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  pagination: {
    type: [Object, Boolean] as PropType<TablePaginationConfig | false>,
    default: () => ({
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total: number) => `ທັງໝົດ ${total} ລາຍການ`,
      pageSize: 10,
      current: 1,
    }),
  },
  scroll: {
    type: Object as PropType<{ x?: number | string | true; y?: number | string }>,
    default: () => ({ x: '100%' }),
  },
  rowKey: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: [String, Function] as PropType<string | ((record: any) => string)>,
    default: 'key',
  },
  bordered: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as PropType<'default' | 'middle' | 'small'>,
    default: 'default',
  },
  statusColors: {
    type: Object as PropType<Record<string, string>>,
    default: () => ({
      active: 'green',
      running: 'green',
      online: 'green',
      success: 'green',
      completed: 'green',

      pending: 'gold',
      processing: 'blue',
      warning: 'orange',

      stopped: 'red',
      failed: 'red',
      error: 'red',
      deleted: 'red',

      default: '',
    }),
  }
});

// Define emits
const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: 'change', pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<any> | SorterResult<any>[]): void;
  (e: 'update:pagination', pagination: TablePaginationConfig): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: 'select', selectedRowKeys: (string | number)[], selectedRows: any[]): void;
}>();

// Computed pagination configuration
const paginationConfig = computed(() => {
  if (props.pagination === false) {
    return false;
  }

  return {
    ...(typeof props.pagination === 'object' ? props.pagination : {}),
    showTotal: (total: number) => `ທັງໝົດ ${total} ລາຍການ`,
  };
});

// Handle table changes (sorting, filtering, pagination)
const handleTableChange = (
  pagination: TablePaginationConfig,
  filters: Record<string, FilterValue | null>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorter: SorterResult<any> | SorterResult<any>[],
) => {
  emit('change', pagination, filters, sorter);
  emit('update:pagination', pagination);
};

// Helper function to get status color
const getStatusColor = (status: string): string => {
  if (!status) return '';

  const normalizedStatus = status.toLowerCase();
  return props.statusColors[normalizedStatus] || props.statusColors.default || '';
};
</script>

<style scoped>
.ui-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

@media (max-width: 640px) {
  :deep(.ant-table-content) {
    overflow-x: auto;
  }

  :deep(.ant-table-body) {
    min-width: 100%;
  }
}
</style>
