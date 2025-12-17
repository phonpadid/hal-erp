<script setup lang="ts">
import { useI18n } from "vue-i18n";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { computed, onMounted, ref, watch } from "vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useRouter } from "vue-router";
import { useBudgetItemStore } from "../../../stores/budget/budget-item.store";
import { useBudgetAccountStore } from "../../../stores/budget/bud-get-account.store";
import {
  formState,
  moreFunction,
  resetForm,
  useIncreaseBudgetStore,
} from "../../../stores/budget/increase/increase-budget.store";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import { formatPrice, NumberOnly, parsePrice } from "@/modules/shared/utils/format-price";
import { increaseBudgetRules } from "../../../views/budget/increase-budget/validation/increase-budget.validate";
import axios from "@/common/config/axios/axios";

const { success, warning } = useNotification();
const { push } = useRouter();
const { t } = useI18n();
const loading = ref<boolean>(false);
const formRef = ref();
const fileInputRef = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const uploadStatus = ref<"uploading" | "done" | "error" | null>(null);

const icreaseStore = useIncreaseBudgetStore();
const budgetAccountStore = useBudgetAccountStore();
const budgetItemStore = useBudgetItemStore();
const budgetItemOption = computed(() =>
  budgetItemStore.budgetItems.map((item) => ({
    value: item.getId(),
    label: item.getName(),
  }))
);
const accountOption = computed(() =>
  budgetAccountStore.budgetAccounts.map((acc) => ({
    value: acc.getId() ?? "",
    label: acc.getName(),
  }))
);
onMounted(async () => {
  await budgetAccountStore.fetchBudgetAccounts({ limit: 1000, page: 1 });
});

watch(
  () => formState.budget_account_id,
  async (newBudgetId) => {
    if (newBudgetId) {
      await budgetItemStore.fetchBudgetItems({ limit: 1000, page: 1 }, newBudgetId);
    } else {
      budgetItemStore.budgetItems = [];
    }
  },
  { immediate: true }
);

// File upload handler
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

//remove
const removeMore = (index: number) => {
  formState.detail.splice(index, 1);
};

// Reset form function
// const resetForm = () => {
//   // Reset form fields
//   formRef.value?.resetFields();

//   // Reset file upload
//   selectedFile.value = null;
//   formState.file_name = "";
//   uploadStatus.value = null;
//   if (fileInputRef.value) {
//     fileInputRef.value.value = "";
//   }

//   // Reset details array to single empty item
//   formState.detail = [{ budget_item_id: "", allocated_amount: undefined as number | undefined }];

//   // Reset budget account selection which will also reset budget items
//   budgetItemStore.budgetItems = [];
// };

// Handle cancel button
const handleCancel = () => {
  resetForm();
  push({ name: "increase_budget" });
};

// Handle form close (could be called from parent component)
const handleClose = () => {
  resetForm();
};
const handleSubmit = async (): Promise<void> => {
  try {
    loading.value = true;
    await formRef.value.submitForm();
    const formData = new FormData();
    formData.append("image", selectedFile.value!); // <-- must be a File or Blob

    const upload = await axios.post("/users/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const item = formState.detail.map((item) => ({
      budget_item_id: Number(item.budget_item_id),
      allocated_amount: Number(item.allocated_amount),
    }));
    await icreaseStore.created({
      budget_account_id: Number(formState.budget_account_id),
      description: formState.description,
      file_name: upload.data.data.filename,
      increase_budget_details: item,
    });

    // Reset the entire form
    resetForm();

    success(t("approval-workflow-step.notify.created"));
    push({ name: "increase_budget" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("documentType.error.title"), String(errorMessage));
  } finally {
    loading.value = false;
  }
};
const formattedPrice = (index: number) =>
  computed({
    get() {
      return formatPrice(formState.detail[index].allocated_amount);
    },
    set(value: string) {
      const digitsOnly = value.replace(/\D/g, "");
      formState.detail[index].allocated_amount = parsePrice(digitsOnly);
    },
  });

// Expose functions for parent component
defineExpose({
  resetForm,
  handleClose
});
</script>
<template>
  <div class="mt-[1rem] px-6 shadow-sm p-2">
    <h4 class="text-2xl font-bold text-gray-700">
      {{ t("increase-budget.title_create") }}
    </h4>
    <UiForm ref="formRef" :model="formState" :rules="increaseBudgetRules(t)">
      <div class="md:flex w-full gap-1 items-start">
        <UiFormItem
          class="md:w-1/3"
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
          class="md:w-1/3"
          :label="t('increase-budget.table.file_name')"
          name="file_name"
          required
        >
          <!-- Upload Button -->
          <div
            v-if="!selectedFile"
            class="h-10 border border-gray-300 rounded-md px-3 flex items-center cursor-pointer hover:border-red-500 transition"
            @click="handleFileUpload"
          >
            <span class="text-sm text-gray-500 truncate">
              {{ t("increase-budget.phd.file_name") }}
            </span>
          </div>

          <!-- File Display -->
          <div
            v-if="selectedFile"
            class="h-10 border border-gray-300 rounded-md px-3 flex items-center justify-between"
          >
            <div class="flex items-center gap-2 overflow-hidden">
              <svg width="18" height="18" fill="#1890ff" viewBox="0 0 1024 1024">
                <path
                  d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7
          0-32 14.3-32 32v832c0 17.7 14.3
          32 32 32h640c17.7 0 32-14.3
          32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2
          326H602V137.8L790.2 326z"
                />
              </svg>
              <span class="text-sm font-medium text-gray-700 truncate">
                {{ selectedFile.name }}
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
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </UiFormItem>
      </div>
      <div class="md:flex w-full items-start">
        <UiFormItem
          class="md:w-2/3"
          :label="t('increase-budget.table.description')"
          name="description"
        >
          <Textarea
            v-model="formState.description"
            :placeholder="t('increase-budget.phd.description')"
            :rows="4"
          ></Textarea>
        </UiFormItem>
      </div>

      <div class="items" v-for="(value, index) in formState.detail" :key="index">
        <h1 class="md:text-lg text-md font-semibold flex md:gap-2 gap-1">
          {{ $t("increase-budget.add_item") }}
          <p class="text-md font-medium">({{ index + 1 }})</p>
        </h1>
        <div class="md:flex gap-1 w-full items-start">
          <UiFormItem
            class="md:w-1/3"
            :label="t('increase-budget.phd.item')"
            :name="['detail', index.toString(), 'budget_item_id']"
            required
          >
            <InputSelect
              v-model="value.budget_item_id"
              :options="budgetItemOption"
              :placeholder="t('increase-budget.phd.item')"
            />
          </UiFormItem>

          <UiFormItem
            class="md:w-1/3"
            :label="t('increase-budget.table.allocated_amount')"
            :name="['detail', index.toString(), 'allocated_amount']"
            @keypress="NumberOnly"
            required
          >
            <UiInput v-model="formattedPrice(index).value" placeholder="0.00" class="w-full" />
          </UiFormItem>
        </div>
        <UiFormItem :label="t('approval-workflow.addMore')">
          <div class="add mb-4 flex gap-2">
            <UiButton
              type="primary"
              size="small"
              icon="ant-design:plus-outlined"
              @click="moreFunction"
              colorClass="flex items-center"
            />
            <UiButton
              size="small"
              icon="ant-design:minus-outlined"
              :disabled="formState.detail.length <= 1"
              @click="removeMore(index)"
              colorClass="flex items-center"
            />
          </div>
        </UiFormItem>
      </div>
      <div class="btn mb-16 flex items-center justify-start gap-3">
        <UiButton @click="handleCancel">{{
          t("button.cancel")
        }}</UiButton>
        <UiButton @click="handleSubmit" type="primary">{{ t("button.save") }}</UiButton>
      </div>
    </UiForm>
  </div>
</template>
