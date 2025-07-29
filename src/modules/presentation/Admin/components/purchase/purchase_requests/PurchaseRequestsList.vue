<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import Table from "@/common/shared/components/table/Table.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import DateTime from "@/common/shared/components/Datepicker/DateTime.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const filterType = ref<string | null>(null);
const router = useRouter();
const dates = reactive({
  startDate: null,
  endDate: null,
});

const handleDetailsDocument = (record: any) => {
  console.log("Viewing details for document:", record);
  router.push({ name: "purchaseRequestsDetail", params: { id: record.key } });
};

const documentTypes = [
  { label: "ທັງໝົດ", value: "all" },
  { label: "ພະແນກ", value: "department" },
  { label: "ສາຂາ", value: "branch" },
];

const columns = [
  {
    title: "ເລກທີ",
    dataIndex: "documentNumber",
    key: "documentNumber",
    width: 100,
  },
  {
    title: "ຜູ້ສະເໜີ",
    dataIndex: "documentName",
    key: "documentName",
    width: 200,
  },
  {
    title: "ພະແນກ",
    dataIndex: "department",
    key: "department",
    width: 150,
  },
  {
    title: "ວັນທີສະເໜີ",
    dataIndex: "createdDate",
    key: "createdDate",
    width: 150,
  },
  {
    title: "ຈັດການ",
    key: "actions",
    width: 100,
    fixed: "right",
  },
];

const dataSource = ref([
  {
    key: "1",
    documentNumber: "0036",
    documentName: "ໃບນະເສນີ ຈັດໃຈ",
    department: "ພັດທະນາລະບົບ",
    createdDate: "26 ມີນາ 2025",
  },
]);

const handleSearch = () => {
  console.log("Searching with:", {
    type: filterType.value,
    dateRange: dates,
  });
};

// Pagination config
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: dataSource.value.length,
  showSizeChanger: true,
});

// Handle table change
const handleTableChange = (pag: any, filters: any, sorter: any) => {
  console.log("Table changed:", { pag, filters, sorter });
};
</script>

<template>
  <!-- Header with document count -->
  <div>
    <UiAvatar
      icon="solar:document-add-linear"
      color="#333446"
      class="flex justify-center items-center text-2xl"
    />
    <span class="text-sm">ໃບສະເໜີ</span>
  </div>
  <br />
  <div class="flex items-center gap-2 mb-6">
    <h1 class="text-xl font-semibold text-yellow-600">12 ໃບສະເໜີ</h1>
  </div>

  <!-- Filters section -->
  <div class="flex items-center gap-4">
    <span>ໜ່ວຍງານ</span>
    <a-radio-group v-model:value="filterType" class="flex gap-4">
      <a-radio value="department">ພະແນກ</a-radio>
      <a-radio value="branch">ສາຂາ</a-radio>
    </a-radio-group>
    <span class="ml-4">ວັນທີສະເໜີ</span>
  </div>

  <div class="bg-white p-2 rounded-lg shadow-sm">
    <div class="flex items-center gap-4">
      <!-- Radio buttons -->
      <!-- Department/Branch Select -->
      <div class="w-64">
        <InputSelect v-model="filterType" :options="documentTypes" placeholder="ເລືອກພະແນກ" />
      </div>

      <!-- Date Range Picker -->
      <div class="flex-grow">
        <DateTime v-model="dates.startDate" placeholder="ວັນທີ" />
      </div>

      <!-- Search Button -->
      <UiButton
        type="primary"
        icon="ant-design:search-outlined"
        @click="handleSearch"
        color-class="flex items-center "
      >
        ຄົ້ນຫາ
      </UiButton>
    </div>
  </div>

  <!-- Table section -->
  <div class="bg-white rounded-lg shadow-sm">
    <Table
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <!-- Custom cell rendering for actions column -->
      <template #actions="{ record }">
        <UiButton
          type="link"
          icon="ant-design:eye-outlined"
          color-class="flex items-center text-red-500 hover:!text-red-900"
          @click="() => handleDetailsDocument(record)"
        >
          ລາຍລະອຽດ
        </UiButton>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.custom-radio-group {
  display: flex;
  gap: 1rem;
}
</style>
