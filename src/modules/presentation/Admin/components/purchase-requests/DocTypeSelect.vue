<script setup lang="ts">
import { computed, onMounted, reactive, watch, nextTick } from "vue";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import { useAuthStore } from "../../stores/authentication/auth.store";
import { t } from "@/common/config/i18n/i18n.config";
import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
const formState = reactive({
  document_type_id: "",
});
export type FormState = typeof formState;
interface Props {
  initialData?: FormState | null;
}

const props = defineProps<Props>();

// Define emit for parent communication
const emit = defineEmits<{
  "next-step": [data?: FormState];
}>();

const store = useDocumentTypeStore();
const authStore = useAuthStore();

// Get company data from localStorage
const companyId = computed(() => authStore.getCompanyId.value);

// Direct localStorage data as fallback
const directCompanyData = computed(() => {
  const userCompanyStr = localStorage.getItem("userCompany");
  return userCompanyStr ? JSON.parse(userCompanyStr) : null;
});

const directCompanyId = computed(() => directCompanyData.value?.id || null);

// Effective company data
const effectiveCompanyId = computed(() => companyId.value || directCompanyId.value);
const docItem = computed(() =>
  store.documentTypes.map((item: DocumentTypeEntity) => ({
    value: item.getId(),
    label: item.getname(),
  }))
);

// Watch for initialData changes and populate form
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

      const params = {
        page: 1,
        limit: 10,
        column: 'id',
        sort_order: 'DESC' as const,
        search: '', // Empty search for now
        company_id: newCompanyId
      };
      await store.fetchdocumentType(params);
    }
  }
);

const nextStep = () => {
  if (formState.document_type_id) {
    // Emit the form data to parent and trigger next step
    emit("next-step", {
      document_type_id: formState.document_type_id,
    });
  }
};

onMounted(async () => {
  // Wait for next tick to ensure computed values are updated
  await nextTick();

  const params = {
    page: 1,
    limit: 10,
    column: 'id',
    sort_order: 'DESC' as const,
    search: '', // Empty search for now
    company_id: effectiveCompanyId.value || undefined
  };


  await store.fetchdocumentType(params);

  // Populate form with initial data after mounting (if available)
  if (props.initialData && props.initialData.document_type_id) {
    formState.document_type_id = props.initialData.document_type_id;
  }
});
</script>

<template>
  <div class="px-2">
    <h2 class="text-md font-semibold px-0 mb-4">{{ t("purchase-rq.field.doc_type") }}</h2>

    <!-- Company Info Display -->
    <!-- <div v-if="effectiveCompanyName" class="mb-4 p-3 bg-gray-50 rounded-lg">
      <p class="text-sm text-gray-600">
        <span class="font-medium">ບໍລິສັດ:</span>
        <span class="text-blue-600">{{ effectiveCompanyName }}</span>
        <span v-if="effectiveCompanyId" class="text-gray-500 ml-2">(ID: {{ effectiveCompanyId }})</span>
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
