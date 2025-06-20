<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

// Define emit for parent communication
const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'next-step': [data: any];
}>();

const store = useDocumentTypeStore();
const docItem = computed(() =>
  store.documentType.map((item) => ({
    value: item.getId(),
    label: item.getname(),
  }))
);

const formState = reactive({
  document_type_id: "",
});

const nextStep = () => {
  if (formState.document_type_id) {
    // Emit the form data to parent and trigger next step
    emit('next-step', {
      document_type_id: formState.document_type_id,
      // Add any other data you want to pass to the next step
    });
  }
};

onMounted(async () => {
  await store.fetchdocumentType({ page: 1, limit: 1000 });
});
</script>

<template>
  <div class="px-2">
    <h2 class="text-md font-semibold px-0 mb-4">ປະເພດໃບສະເໜິ</h2>
    <div class="input flex flex-col md:flex-row items-start gap-4">
      <div class="search-by-doc-type">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          ປະເພດໃບສະເໜິ
        </label>
        <InputSelect
          v-model="formState.document_type_id"
          :options="docItem"
          placeholder="ເລືອກປະເພດໃບສະເໜີ"
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
          <span>ຢືນຢັນ</span>
        </UiButton>
      </div>
    </div>
  </div>
</template>
