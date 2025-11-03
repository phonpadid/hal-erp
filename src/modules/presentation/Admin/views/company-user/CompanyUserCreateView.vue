<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCompanyUserStore } from "../../stores/company-user.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import ManageCompanyUserForm from "@/modules/presentation/Admin/components/company-user/ManageCompanyUserForm.vue";
import { useRouter, useRoute } from "vue-router";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const { t } = useI18n();
const companyUserStore = useCompanyUserStore();
const { success, warning } = useNotification();
const router = useRouter();
const route = useRoute();

// Get company ID from query parameters
const companyId = ref<number | null>(null);

onMounted(() => {
  // No need company_id parameter
});

// State
const submitLoading = ref<boolean>(false);
const companyUserFormRef = ref();

const handleCancel = () => {
  router.push(`/companies/users`);
};

const handleFormSubmit = async (formData: {
  username: string;
  email: string;
  tel: string;
  password: string;
  confirm_password: string;
  signature?: string | null;
  roleIds: number[];
  permissionIds: number[];
}) => {
  try {
    submitLoading.value = true;

    await companyUserStore.createCompanyUser(formData);
    success(t("company-user.success.title"), t("company-user.success.created"));

    // Redirect to company user list after successful creation
    router.push(`/companies/users`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("companyUser.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const submitForm = () => {
  companyUserFormRef.value?.submitForm();
};
</script>

<template>
  <div class="company-user-create-container">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <div>
            <h1 class="text-2xl font-semibold">{{ t("company-user.modal.create") }}</h1>
          </div>
        </div>
      </div>

      <!-- Company User Create Form -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <ManageCompanyUserForm
          ref="companyUserFormRef"
          :company-user="null"
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
          {{ t("company-user.button.create") }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.company-user-create-container {
  min-height: calc(100vh - 120px);
  background-color: #f8f9fa;
}
</style>