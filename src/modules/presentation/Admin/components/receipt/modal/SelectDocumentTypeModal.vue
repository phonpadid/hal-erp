<script setup lang="ts">
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useDocumentTypeStore } from "../../../stores/document-type.store";
import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { useI18n } from "vue-i18n";
const { push } = useRouter();
const {t} = useI18n()
const props = defineProps<{
  visible: boolean;
  loading?: boolean;
  itemid?: string;
}>();
const document_type_id = ref()
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}>();
const store = useDocumentTypeStore();
const docItem = computed(() =>
  store.documentTypes.map((item: DocumentTypeEntity) => ({
    value: item.getId(),
    label: item.getname(),
  }))
);
const submitLoading = ref(false);

const handleCancel = () => {
  emit("update:visible", false);
  // resetForm();
};

const submitForm = () => {
  submitLoading.value = true;
  push({
    name: "create-receipt",
    params: {
      id: props.itemid,
      docid: document_type_id.value,
    },
  });
};
onMounted(async () => {
  await store.fetchdocumentType({ page: 1, limit: 1000 });
})
</script>

<template>
  <UiModal
    :title="t('purchase-rq.phd.doc_type')"
    :visible="visible"
    @cancel="handleCancel"
  >
  <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t("purchase-rq.field.doc_type") }}
        </label>
        <InputSelect
          v-model="document_type_id"
          :options="docItem"
          :placeholder="t('purchase-rq.phd.doc_type')"
          class="min-w-[370px] w-auto"
        />

    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton @click="handleCancel">
          {{ $t("button.cancel") }}
        </UiButton>
        <UiButton type="primary" :loading="submitLoading" @click="submitForm">
          {{ $t("button.next") }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
