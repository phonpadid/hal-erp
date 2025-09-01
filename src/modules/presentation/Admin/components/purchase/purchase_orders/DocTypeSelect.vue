<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { useDocumentTypeStore } from "../../../stores/document-type.store";
import { useRoute, useRouter } from "vue-router";
import { t } from "@/common/config/i18n/i18n.config";
import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const route = useRoute();
const router = useRouter();

const formState = reactive({
  document_type_id: "",
});

const store = useDocumentTypeStore();

// options สำหรับ select
const docItem = computed(() =>
  store.documentTypes.map((item: DocumentTypeEntity) => ({
    value: item.getId(),
    label: item.getname(),
  }))
);

// เมื่อกดปุ่มยืนยัน
const nextStep = () => {
  if (formState.document_type_id) {
    const purchaseRequestId = route.query.purchase_request_id;

    if (purchaseRequestId) {
      router.push({
        name: "purchaseOrdersDetail",
        params: {
          id: purchaseRequestId.toString(),
        },
        query: {
          document_type_id: formState.document_type_id,
        },
      });
    }
  }
};

onMounted(async () => {
  await store.fetchdocumentType({ page: 1, limit: 1000 });
});
</script>

<template>
  <div class="px-2 mt-8">
    <h2 class="text-md font-semibold px-0 mb-4">{{ t("purchase-rq.field.doc_type") }}</h2>
    <div class="input flex flex-col md:flex-row items-start gap-4">
      <div class="search-by-doc-type">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t("purchase-rq.field.doc_type") }}
        </label>
        <InputSelect
          v-model="formState.document_type_id"
          :options="docItem"
          :placeholder="t('purchase-rq.phd.doc_type')"
          class="min-w-[370px] w-auto"
        />
      </div>
      <div class="search-button md:mt-7 mt-0">
        <UiButton
          :disabled="!formState.document_type_id"
          @click="nextStep"
          color-class="flex items-center justify-center gap-2"
          class="px-6"
        >
          <span>{{ t("purchase-rq.btn.confirm") }}</span>
        </UiButton>
      </div>
    </div>
  </div>
</template>
