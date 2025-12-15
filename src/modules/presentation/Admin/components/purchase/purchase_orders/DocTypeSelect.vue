<script setup lang="ts">
import { computed, onMounted, reactive, watch, nextTick } from "vue";
import { useDocumentTypeStore } from "../../../stores/document-type.store";
import { useAuthStore } from "../../../stores/authentication/auth.store";
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
export type FormState = typeof formState;
interface Props {
  initialData?: FormState | null;
}
const props = defineProps<Props>();
const store = useDocumentTypeStore();
const authStore = useAuthStore();

// Get company data from localStorage
const companyId = computed(() => authStore.getCompanyId.value);

// Direct localStorage data as fallback
const directCompanyId = computed(() => {
  const userCompanyStr = localStorage.getItem("userCompany");
  return userCompanyStr ? JSON.parse(userCompanyStr).id : null;
});

// Effective company data
const effectiveCompanyId = computed(() => companyId.value || directCompanyId.value);
// options สำหรับ select
const docItem = computed(() =>
  store.documentTypes.map((item: DocumentTypeEntity) => ({
    value: item.getId(),
    label: item.getname(),
  }))
);
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.document_type_id) {
      formState.document_type_id = newData.document_type_id;
    }
  },
  { immediate: true }
);

// Watch for company changes and reload document types
watch(
  effectiveCompanyId,
  async (newCompanyId) => {
    if (newCompanyId) {
      // console.log("🎯 PO DocTypeSelect - Company changed, reloading with companyId:", newCompanyId);

      const params = {
        page: 1,
        limit: 10,
        column: 'id',
        sort_order: 'DESC' as const,
        search: '', // Empty search for now
        company_id: newCompanyId
      };

      // console.log("🎯 PO DocTypeSelect - Fetching with params:", params);
      await store.fetchdocumentType(params);
    }
  }
);

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
  // Wait for next tick to ensure computed values are updated
  await nextTick();

  // console.log("🎯 PO DocTypeSelect.onMounted - effectiveCompanyId:", effectiveCompanyId.value);

  const params = {
    page: 1,
    limit: 10,
    column: 'id',
    sort_order: 'DESC' as const,
    search: '', // Empty search for now
    company_id: effectiveCompanyId.value || undefined
  };

  // console.log("🎯 PO DocTypeSelect.onMounted - Initial fetch with params:", params);

  await store.fetchdocumentType(params);
});
</script>

<template>
  <div class="px-2 mt-8">
    <h2 class="text-md font-semibold px-0 mb-4">{{ t("purchase-rq.field.doc_type") }}</h2>

    <!-- Company Info Display -->
    <!-- <div v-if="effectiveCompanyId" class="mb-4 p-3 bg-gray-50 rounded-lg">
      <p class="text-sm text-gray-600">
        <span class="font-medium">ບໍລິສັດ:</span>
        <span class="text-blue-600">ບໍລິສັດ #{{ effectiveCompanyId }}</span>
      </p>
    </div> -->
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
