<script setup lang="ts">
import Table from "@/common/shared/components/table/Table.vue";
import { useI18n } from "vue-i18n";
import {
  dataAccounting,
  getStatusColor,
} from "@/modules/shared/utils/data.department";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiAvatar from "@/common/shared/components/UiAvatar/UiAvatar.vue";
import UiTag from "@/common/shared/components/tag/UiTag.vue";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import { computed, onMounted } from "vue";
import { statusItem } from "@/modules/shared/utils/data-user-approval";
import { useRouter } from "vue-router";
import { columns } from "./column";
const { t } = useI18n();
const { push } = useRouter();
const docTypeStore = useDocumentTypeStore();
const docItem = computed(() => [
  { value: "all", label: "ທັງໝົດ" }, // This is the "All" option
  ...docTypeStore.documentType.map((item) => ({
    value: item.getId(),
    label: item.getname(),
  })),
]);
const statusCards = computed(() => {
return [
{
    label: t('purchase-rq.card_title.padding') ,
    count: 4,
    icon: "solar:document-text-bold",
    textColor: "text-yellow-600",
  },
  {
    label: t('purchase-rq.card_title.success'),
    count: 6,
    icon: "solar:clipboard-check-bold",
    textColor: "text-green-600",
  },
  {
    label: t('purchase-rq.card_title.refused'),
    count: 10,
    icon: "solar:clipboard-remove-bold",
    textColor: "text-red-600",
  },
]
})
const details = (id: string) => {
  push({ name: "purchase_request_detail", params: { id: id } });
};
onMounted(async () => {
  await docTypeStore.fetchdocumentType({ page: 1, limit: 1000 });
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
              {{ card.count }} {{ t('purchase-rq.field.proposal') }}
            </p>
          </div>
        </div>
      </div>

      <div class="search flex flex-col md:flex-row justify-between gap-[14rem]">
        <div class="input flex flex-col md:flex-row gap-4 flex-1">
          <div class="search-by-doc-type w-full">
            <label for="" class="block text-sm font-medium text-gray-700 mb-1"
              >{{ t('purchase-rq.field.doc_type') }}</label
            >
            <InputSelect
              :options="docItem"
              placeholder="ທັງໝົດ"
              class="w-full"
            />
          </div>
          <div class="search-by-status w-full">
            <label for="" class="block text-sm font-medium text-gray-700 mb-1"
              >{{t('purchase-rq.field.status')}}</label
            >
            <InputSelect
              :options="statusItem"
              placeholder="ທັງໝົດ"
              class="w-full"
            />
          </div>
          <div class="search-button flex items-end">
            <UiButton
              icon="ant-design:search-outlined"
              color-class="flex items-center justify-center gap-2"
              class="w-full md:w-auto px-6"
            >
              <span>{{t('purchase-rq.search') }}</span>
            </UiButton>
          </div>
        </div>
        <div class="add flex items-end">
          <UiButton type="primary" @click="push({name: 'create_purchase_request', params: {}})" class="w-full md:w-auto"
            >{{t('purchase-rq.created') }}</UiButton
          >
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="mt-4 bg-white rounded-md shadow-sm p-1">
      <Table
        :columns="columns(t)"
        :dataSource="dataAccounting"
        :pagination="{ pageSize: 5 }"
        row-key="id"
      >
        <template #status="{ record }">
          <UiTag :color="getStatusColor(record.status)" class="rounded-full">
            {{ record.status }}
          </UiTag>
        </template>
        <template #actions="{ record }">
          <div class="flex items-center justify-center gap-2">
            <UiButton
              type="link"
              icon="ant-design:eye-outlined"
              color-class="flex items-center text-red-500 hover:!text-red-800"
              @click="details(record.id)"
            >
              {{ t('purchase-rq.description') }}
            </UiButton>
          </div>
        </template>
      </Table>
    </div>
  </div>
</template>
