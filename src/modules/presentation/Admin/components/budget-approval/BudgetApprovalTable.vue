<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { purchaseOrderData } from "@/modules/shared/utils/purchaseOrder";
import { columnsApproval } from "../../views/budget/budget-approval/column/cloumn";
import { useI18n } from "vue-i18n";
import UiTag from "@/common/shared/components/tag/UiTag.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import Table from "@/common/shared/components/table/Table.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import DatePicker from "@/common/shared/components/Datepicker/DatePicker.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

/******************************************************** */
const { t } = useI18n();
const filterType = ref<string | null>(null);
const router = useRouter();
const dates = reactive({
  startDate: null,
  endDate: null,
});

const handleDetailsDocument = (record: any) => {
  console.log("Viewing details for document:", record);
  router.push({ name: "approval_department_panak_detail", params: { id: record.id } });
};

const documentTypes = [
  { label: "ທັງໝົດ", value: "all" },
  { label: "ພະແນກ", value: "department" },
  { label: "ສາຂາ", value: "branch" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "warning";
    case "completed":
      return "success";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return "ant-design:clock-circle-outlined";
    case "completed":
      return "ant-design:check-circle-outlined";
    case "rejected":
      return "ant-design:close-circle-outlined";
    default:
      return "";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "ກຳລັງດຳເນີນການ";
    case "completed":
      return "ສຳເລັດ";
    case "rejected":
      return "ປະຕິເສດ";
    default:
      return status;
  }
};

const handleSearch = () => {
  console.log("Searching with:", {
    type: filterType.value,
    dateRange: dates,
  });
};

// Handle table change
const handleTableChange = (pag: any, filters: any, sorter: any) => {
  console.log("Table changed:", { pag, filters, sorter });
};
</script>

<template>
  <!-- Header with document count -->
  <div class="grid grid-cols-3">
    <div>
      <UiAvatar
        icon="solar:document-text-bold"
        color="#333446"
        class="flex justify-center items-center text-2xl"
      />
      <span class="text-sm">ກຳລັງດຳເນີນການ</span>
    </div>
    <div>
      <UiAvatar
        icon="solar:clipboard-check-bold"
        color="#333446"
        class="flex justify-center items-center text-2xl"
      />
      <span class="text-sm">ສຳເລັດ</span>
    </div>
    <div>
      <UiAvatar
        icon="solar:clipboard-remove-bold"
        color="#333446"
        class="flex justify-center items-center text-2xl"
      />
      <span class="text-sm">ປະຕິເສດ</span>
    </div>
  </div>
  <div></div>
  <div class="grid grid-cols-3 mt-2">
    <h1 class="text-xl font-semibold text-yellow-600">12 ໃບສະເໜີ</h1>
    <h1 class="text-xl font-semibold text-green-600">12 ໃບສະເໜີ</h1>
    <h1 class="text-xl font-semibold text-red-600">12 ໃບສະເໜີ</h1>
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
        <DatePicker
          v-model:modelValueStart="dates.startDate"
          v-model:modelValueEnd="dates.endDate"
          :cols="8"
        />
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
    <Table :columns="columnsApproval(t)" :data-source="purchaseOrderData" @change="handleTableChange">
      <!-- Custom cell rendering for actions column -->
      <template #status="{ record }">
        <UiTag
          :color="getStatusColor(record.status)"
          :icon="getStatusIcon(record.status)"
          :text="getStatusText(record.status)"
        />
      </template>
      <template #action="{ record }">
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
