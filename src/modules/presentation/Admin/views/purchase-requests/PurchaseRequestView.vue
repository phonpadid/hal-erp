<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Table from "@/common/shared/components/table/Table.vue";
import { useI18n } from "vue-i18n";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import UiTag from "@/common/shared/components/tag/UiTag.vue";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import { usePurchaseRequestsStore } from "../../stores/purchase_requests/purchase-requests.store";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { columns } from "./column";
import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";

const { t } = useI18n();
const { push } = useRouter();
const docTypeStore = useDocumentTypeStore();
const purchaseRequestStore = usePurchaseRequestsStore();

// Filters state
const selectedDocType = ref("all");
const selectedStatus = ref("all");
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const tablePagination = computed(() => ({
  current: purchaseRequestStore.pagination.page,
  pageSize: purchaseRequestStore.pagination.limit,
  total: purchaseRequestStore.pagination.total,
  showSizeChanger: true,
}));

// Computed properties
const docItem = computed(() => [
  { value: "all", label: "ທັງໝົດ" },
  ...docTypeStore.documentTypes.map((item: DocumentTypeEntity) => ({
    value: item.getId(),
    label: item.getname(),
  })),
]);
// Status options
const statusItem = [
  { value: "all", label: "ທັງໝົດ" },
  { value: "pending", label: "ລໍຖ້າອະນຸມັດ" },
  { value: "Approved", label: "ອະນຸມັດແລ້ວ" },
  { value: "Rejected", label: "ປະຕິເສດ" },
  { value: "canceled", label: "ຍົກເລີກ" },
];
// check if statusItem is defined
const getStatusLabel = (statusValue: string) => {
  const statusValueLower = statusValue?.toLowerCase();

  const foundStatus = statusItem.find((item) => item.value.toLowerCase() === statusValueLower);

  return foundStatus ? foundStatus.label : statusValue;
};
// Computed properties for status counts
const statusCounts = computed(() => {
  return purchaseRequestStore.statusSummary.reduce((acc, current) => {
    console.log("current", current.amount);
    const statusKey = current.status.toLowerCase();
    acc[statusKey] = current.amount;
    return acc;
  }, {} as Record<string, number>);
});

const statusCards = computed(() => {
  return [
    {
      label: t("purchase-rq.card_title.padding"), // "รอดำเนินการ"
      // ใช้ ?? 0 เพื่อป้องกัน error ถ้าไม่มีข้อมูล pending (จะแสดงเป็น 0)
      count: statusCounts.value.pending ?? 0,
      icon: "solar:document-text-bold",
      textColor: "text-yellow-600",
    },
    {
      label: t("purchase-rq.card_title.success"), // "สำเร็จ"
      count: statusCounts.value.approved ?? 0,
      icon: "solar:clipboard-check-bold",
      textColor: "text-green-600",
    },
    {
      label: t("purchase-rq.card_title.refused"), // "ปฏิเสธ"
      count: statusCounts.value.rejected ?? 0,
      icon: "solar:clipboard-remove-bold",
      textColor: "text-red-600",
    },
  ];
});

// Methods
const fetchData = async () => {
  loading.value = true;
  try {
    const apiParams: any = {
      page: currentPage.value,
      limit: pageSize.value,
    };

    // ตรวจสอบค่าที่เลือก ถ้าไม่ใช่ "all" ให้เพิ่ม vào apiParams
    if (selectedDocType.value !== "all") {
      apiParams.document_type_id = selectedDocType.value; // << FIXED KEY
    }
    if (selectedStatus.value !== "all") {
      // API ต้องการ status_id แต่ dropdown ของเรามี value เป็น string ("pending", "approved")
      // ที่นี่เราจะส่ง string ไปก่อน หาก API ต้องการ id จริงๆ ต้องมีการแปลงค่าที่นี่
      apiParams.status_id = selectedStatus.value; // << FIXED KEY
    }

    await purchaseRequestStore.fetchAll(apiParams);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};
const handleTableChange = (pagination: any) => {
  currentPage.value = pagination.current;
  pageSize.value = pagination.pageSize;
  fetchData();
};

const edit = (id: string) => {
  push({ name: "purchase_request_edit", params: { id } });
};
const details = (id: string) => {
  push({ name: "purchase_request_detail", params: { id } });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "yellow";
    case "approved":
      return "green";
    case "rejected":
      return "red";
    default:
      return "gray";
  }
};

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([docTypeStore.fetchdocumentType({ page: 1, limit: 1000 }), fetchData()]);
});
</script>

<template>
  <div class="container mx-auto py-4">
    <!-- Header Cards -->
    <div class="bg-white rounded-md shadow-sm p-2 py-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="(card, index) in statusCards" :key="index">
          <UiAvatar
            size="large"
            :icon="card.icon"
            color="#333446"
            class="flex justify-center items-center text-3xl"
          />
          <div>
            <p class="text-gray-600 mt-2">{{ card.label }}</p>
            <p class="text-xl font-semibold" :class="card.textColor">
              {{ card.count }} {{ t("purchase-rq.field.proposal") }}
            </p>
          </div>
        </div>
      </div>

      <div class="search flex flex-col md:flex-row justify-between gap-[14rem] mt-4">
        <div class="input flex flex-col md:flex-row gap-4 flex-1">
          <div class="search-by-doc-type w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("purchase-rq.field.doc_type") }}
            </label>
            <InputSelect
              v-model="selectedDocType"
              :options="docItem"
              placeholder="ທັງໝົດ"
              class="w-full"
              @clear="fetchData"
            />
          </div>
          <div class="search-by-status w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("purchase-rq.field.status") }}
            </label>
            <InputSelect
              v-model="selectedStatus"
              :options="statusItem"
              placeholder="ທັງໝົດ"
              class="w-full"
              @clear="fetchData"
            />
          </div>
          <div class="search-button flex items-end">
            <UiButton
              :loading="loading"
              icon="ant-design:search-outlined"
              color-class="flex items-center justify-center gap-2"
              class="w-full md:w-auto px-6"
              @click="handleSearch"
            >
              <span>{{ t("purchase-rq.search") }}</span>
            </UiButton>
          </div>
        </div>
        <div class="add flex items-end">
          <UiButton
            type="primary"
            @click="push({ name: 'create_purchase_request' })"
            class="w-full md:w-auto"
          >
            {{ t("purchase-rq.created") }}
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="mt-4 bg-white rounded-md shadow-sm p-1">
      <Table
        :columns="columns(t)"
        :dataSource="purchaseRequestStore.requests"
        :loading="loading"
        :pagination="tablePagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #status="{ record }">
          <UiTag :color="getStatusColor(record.status)" class="rounded-full">
            {{ getStatusLabel(record.status) }}
          </UiTag>
        </template>
        <template #actions="{ record }">
          <div class="flex items-center justify-center gap-2">
            <UiButton
              type="link"
              icon="material-symbols:edit-square"
              color-class="flex items-center text-blue-500 hover:!text-blue-800"
              @click="edit(record.getId())"
            >
              {{ t("purchase-rq.edit") }}
            </UiButton>
            <UiButton
              type="link"
              icon="ant-design:eye-outlined"
              color-class="flex items-center text-red-500 hover:!text-red-800"
              @click="details(record.getId())"
            >
              {{ t("purchase-rq.description") }}
            </UiButton>
          </div>
        </template>
        <template #username="{ record }">
          <span class="text-gray-600">{{ record.getRequester()?.username }}</span>
        </template>
        <template #position="{ record }">
          <span class="text-gray-600">{{ record.getPosition()?.name ?? "ບໍ່ມີພົບຂໍ້ມູນ" }}</span>
        </template>
        <template #department="{ record }">
          <span class="text-gray-600">{{ record.getDepartment()?.name }}</span>
        </template>

        <template #document_type="{ record }">
          <span class="text-gray-600">{{ record.getDocumentType()?.name }}</span>
        </template>
      </Table>
    </div>
  </div>
</template>
