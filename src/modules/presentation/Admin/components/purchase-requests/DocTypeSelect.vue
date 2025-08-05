<script setup lang="ts">
import { computed, onMounted, reactive, watch } from "vue";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { t } from "@/common/config/i18n/i18n.config";
import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";
const formState = reactive({
  document_type_id: "all",
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

const nextStep = () => {
  if (formState.document_type_id) {
    // Emit the form data to parent and trigger next step
    emit("next-step", {
      document_type_id: formState.document_type_id,
      // Add any other data you want to pass to the next step
    });
  }
};

onMounted(async () => {
  await store.fetchdocumentType({ page: 1, limit: 1000 });

  // Populate form with initial data after mounting (if available)
  if (props.initialData && props.initialData.document_type_id) {
    formState.document_type_id = props.initialData.document_type_id;
  }
});
</script>

<template>
  <div class="px-2">
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
