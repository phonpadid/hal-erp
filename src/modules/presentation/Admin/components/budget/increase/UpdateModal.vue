<script setup lang="ts" name="FormBankModal.vue">
import { ref, computed, watch, onMounted } from "vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiModal from "@/common/shared/components/Modal/UiModal.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import { useI18n } from "vue-i18n";
import { createBankValidation } from "@/modules/presentation/Admin/views/bank/validation/bank.validate";
import { formState } from "../../../stores/budget/increase/increase-budget.store";
import { useBudgetAccountStore } from "../../../stores/budget/bud-get-account.store";
import { useIncreaseBudgetStore } from '../../../stores/budget/increase/increase-budget.store';
import { useNotification } from '@/modules/shared/utils/useNotification';
import axios from "@/common/config/axios/axios";

const { t } = useI18n();
const increaseStore = useIncreaseBudgetStore();
const { success, warning } = useNotification();
const fileInputRef = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const uploadStatus = ref<"uploading" | "done" | "error" | null>(null);
const budgetAccountStore = useBudgetAccountStore();

const props = defineProps<{
  visible: boolean;
  loading?: boolean;
  isEdit?: boolean;
  editData?: {
    id: number;
    budget_account_id: number;
    description: string;
    increase_budget_files: { file_name: string }[];
  } | null;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}>();

const accountOption = computed(() =>
  budgetAccountStore.budgetAccounts.map((acc) => ({
    value: Number(acc.getId()),
    label: acc.getName(),
  }))
);

const formRef = ref();
const submitLoading = ref(false);


// Watch for modal visibility changes
watch(() => props.visible, (newVal) => {
  if (newVal && props.isEdit && props.editData) {

    Object.assign(formState, props.editData);
    if (props.editData.budget_account_id) {
      formState.budget_account_id = props.editData.budget_account_id;
    }
    if (props.editData.increase_budget_files.length > 0) {
      formState.file_name = props.editData?.increase_budget_files[0]?.file_name;
    }
  } else if (newVal && !props.isEdit) {
    // Reset form for new entry
    resetForm();
  }
});

const handleFileUpload = () => {
  fileInputRef.value?.click();
};

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
    formState.file_name = file.name;
    uploadStatus.value = "done";
  }
};

const removeFile = () => {
  selectedFile.value = null;
  formState.file_name = "";
  uploadStatus.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const resetForm = () => {
  formState.budget_account_id = null as number | null;
  formState.description = "";
  formState.file_name = "";
  selectedFile.value = null;
  uploadStatus.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  formRef.value?.resetFields();
};

const handleCancel = () => {
  emit("update:visible", false);
  resetForm();
};

const submitForm = async () => {
  try {
    submitLoading.value = true;
    await formRef.value.submitForm();

    let uploadedFileName = formState.file_name;
    if (selectedFile.value) {
      const formData = new FormData();
      formData.append("image", selectedFile.value);

      const upload = await axios.post("/users/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      uploadedFileName = upload.data.data.filename;
    }

    if (props.isEdit && props.editData) {
      // Update existing record
      await increaseStore.updated(props.editData.id.toString(), {
        id: props.editData.id,
        budget_account_id: Number(formState.budget_account_id),
        description: formState.description,
        file_name: selectedFile.value ? uploadedFileName : ""
      });
      success(t("increase-budget.notify.updated"));


    resetForm();
    emit("update:visible", false);
    emit("success");
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("increase-budget.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const rules = computed(() => createBankValidation(t, { isEditMode: props.isEdit ?? false }));

onMounted(async () => {
  await budgetAccountStore.fetchBudgetAccounts({ limit: 1000, page: 1 });
});
</script>

<template>
  <UiModal
    :visible="visible"
    :title="isEdit ? t('increase-budget.title_edit') : t('increase-budget.title_create')"
    width="600px"
    @update:visible="emit('update:visible', $event)"
  >
    <UiForm ref="formRef" :model="formState" :rules="rules">
      <div class="md:flex w-full gap-4 items-start">
        <UiFormItem
          class="md:w-1/2"
          :label="t('increase-budget.table.title')"
          name="budget_account_id"
          required
        >
          <InputSelect
            v-model="formState.budget_account_id"
            :options="accountOption"
            size="large"
            :placeholder="t('increase-budget.phd.title')"
          />
        </UiFormItem>

        <UiFormItem
          class="md:w-1/2"
          :label="t('increase-budget.table.file_name')"
          name="file_name"
          required
        >
          <!-- Upload Button -->
          <div
            v-if="!selectedFile && !formState.file_name"
            class="h-10 border border-gray-300 rounded-md px-3 flex items-center cursor-pointer hover:border-red-500 transition"
            @click="handleFileUpload"
          >
            <span class="text-sm text-gray-500 truncate">
              {{ t("increase-budget.phd.file_name") }}
            </span>
          </div>

          <!-- File Display -->
          <div
            v-if="selectedFile || formState.file_name"
            class="h-10 border border-gray-300 rounded-md px-3 flex items-center justify-between"
          >
            <div class="flex items-center gap-2 overflow-hidden">
              <svg
                width="18"
                height="18"
                fill="#1890ff"
                viewBox="0 0 1024 1024"
              >
                <path
                  d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7
          0-32 14.3-32 32v832c0 17.7 14.3
          32 32 32h640c17.7 0 32-14.3
          32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2
          326H602V137.8L790.2 326z"
                />
              </svg>
              <span class="text-sm font-medium text-gray-700 truncate">
                {{ selectedFile ? selectedFile.name : formState.file_name }}
              </span>
            </div>
            <button
              @click="removeFile"
              type="button"
              class="text-red-500 hover:text-red-700 text-sm"
            >
              ✕
            </button>
          </div>

          <input
            ref="fileInputRef"
            type="file"
            @change="onFileChange"
            style="display: none"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
        </UiFormItem>
      </div>

      <div class="w-full">
        <UiFormItem
          :label="t('increase-budget.table.description')"
          name="description"
        >
          <Textarea
            v-model="formState.description"
            :placeholder="t('increase-budget.phd.description')"
            :rows="4"
          />
        </UiFormItem>
      </div>
    </UiForm>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton @click="handleCancel">
          {{ t('button.cancel') }}
        </UiButton>
        <UiButton
          type="primary"
          :loading="submitLoading"
          @click="submitForm"
        >
          {{ t('button.edit') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
