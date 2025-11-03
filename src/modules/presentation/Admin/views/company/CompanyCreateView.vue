<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useCompanyStore } from "../../stores/company.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import CompanyForm from "@/modules/presentation/Admin/components/company/FormCompany.vue";
import { useRouter } from "vue-router";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const { t } = useI18n();
const companyStore = useCompanyStore();
const { success, warning } = useNotification();
const router = useRouter();

// State
const submitLoading = ref<boolean>(false);
const companyFormRef = ref();

const handleFormSubmit = async (formData: {
  name: string;
  logo?: string | null;
  tel: string;
  email: string;
  address: string;
  user?: {
    username: string;
    email: string;
    tel: string;
    password: string;
    confirm_password: string;
    signature?: string | null;
  };
}) => {
  try {
    submitLoading.value = true;

    await companyStore.createCompany(formData);
    success(t("company.success.title"), t("company.success.created"));

    // Redirect to company list after successful creation
    router.push("/companies");
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("company.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const handleCancel = () => {
  router.push("/companies");
};

const submitForm = () => {
  companyFormRef.value?.submitForm();
};
</script>

<template>
  <div class="company-create-container">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ t("company.add") }}</h1>
        </div>
      </div>

      <!-- Company Creation Form -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <CompanyForm
          ref="companyFormRef"
          :company="null"
          :is-edit-mode="false"
          :loading="submitLoading"
          @submit="handleFormSubmit"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4 mt-6">
        <UiButton
          type="default"
          @click="handleCancel"
          :disabled="submitLoading"
        >
          {{ t("button.cancel") }}
        </UiButton>
        <UiButton
          type="primary"
          @click="submitForm"
          :loading="submitLoading"
          icon="ant-design:save-outlined"
          color-class="flex items-center gap-2"
        >
          {{ t("button.save") }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.company-create-container {
  min-height: calc(100vh - 120px);
  background-color: #f8f9fa;
}
</style>