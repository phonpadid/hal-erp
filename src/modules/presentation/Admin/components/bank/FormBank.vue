<script setup lang="ts" name="FormBank.vue">
import { ref, computed, watch } from "vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UploadFile from "@/common/shared/components/Upload/UploadFile.vue";
import { useI18n } from "vue-i18n";
import { createBankValidation } from "@/modules/presentation/Admin/views/bank/validation/bank.validate";
import { useBankStore } from "@/modules/presentation/Admin/stores/bank.store";

const { t } = useI18n();
const bankStore = useBankStore();

const props = defineProps<{
  loading?: boolean;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: { name: string; short_name: string; logo: string | File | null }): void;
}>();

const formRef = ref();

const logoFile = ref<string | File | null>(null); // for file or url
const existingLogoUrl = ref<string | null>(null);

// Keep logoFile and bankFormModel.logo in sync
watch(logoFile, (newValue) => {
  bankStore.bankFormModel.logo = newValue;
});

// When the store updates the form model, update logoFile too
watch(
  () => bankStore.bankFormModel.logo,
  (newValue) => {
    if (newValue !== logoFile.value) {
      logoFile.value = newValue;
    }
  }
);

// When editing, initialize logoFile to the existing URL
watch(
  () => props.isEdit,
  (isEdit) => {
    if (isEdit && bankStore.bankFormModel.logoUrl) {
      existingLogoUrl.value = bankStore.bankFormModel.logoUrl;
      logoFile.value = bankStore.bankFormModel.logoUrl;
    } else if (!isEdit) {
      existingLogoUrl.value = null;
      logoFile.value = null;
    }
  },
  { immediate: true }
);

function handleFileChange(file: File) {
  console.log("File selected:", file);
  if (file) {
    existingLogoUrl.value = null;
    logoFile.value = file;
    bankStore.bankFormModel.logo = file;
  }
}

// On submit: use new file if present, else use existing image URL if present, else null
function submitForm() {
  let logoToSend: File | string | null = null;
  if(!existingLogoUrl.value){

  }
  if (logoFile.value instanceof File) {
    logoToSend = logoFile.value;
  } else if (typeof logoFile.value === "string" && logoFile.value) {
    logoToSend = logoFile.value;
  } else if (existingLogoUrl.value) {
    logoToSend = existingLogoUrl.value;
  }
   const image=existingLogoUrl.value === null? logoToSend :null;
  emit("submit", {
    ...bankStore.bankFormModel,
    logo: image,
  });
}

const rules = computed(() => createBankValidation(t, { isEditMode: props.isEdit ?? false }));

defineExpose({ submitForm });
</script>

<template>
  <UiForm ref="formRef" :model="bankStore.bankFormModel" :rules="rules">
    <UiFormItem :label="$t('banks.field.logo')" name="logo" required>
      <div class="flex flex-col">
        <!-- Show the existing image if present and no new file uploaded -->
        <div v-if="!logoFile && existingLogoUrl" class="mb-2">
          <img :src="existingLogoUrl" alt="Logo Preview" class="w-32 h-32 object-contain border" />
        </div>
        <UploadFile
          v-model="logoFile"
          :width="'100%'"
          :height="'200px'"
          :upload-text="props.isEdit ? 'ອັບເດດໂລໂກ້' : 'ອັບໂຫລດໂລໂກ'"
          @onFileSelect="handleFileChange"
        />
      </div>
    </UiFormItem>
    <UiFormItem :label="$t('banks.field.name')" name="name" required>
      <UiInput
        v-model="bankStore.bankFormModel.name"
        :placeholder="$t('banks.placeholder.name')"
        :disabled="props.loading"
      />
    </UiFormItem>
    <UiFormItem :label="$t('banks.field.short_name')" name="short_name" required>
      <UiInput
        v-model="bankStore.bankFormModel.short_name"
        :placeholder="$t('banks.placeholder.short_name')"
        :disabled="props.loading"
      />
    </UiFormItem>
  </UiForm>
</template>
