<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCompanyUserStore } from "../../stores/company-user.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import ManageCompanyUserForm from "@/modules/presentation/Admin/components/company-user/ManageCompanyUserForm.vue";
import { useRouter, useRoute } from "vue-router";
import type { CompanyUserInterface } from "@/modules/interfaces/company-user.interface";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const { t } = useI18n();
const companyUserStore = useCompanyUserStore();
const { success, warning } = useNotification();
const router = useRouter();
const route = useRoute();

// Get user ID from route
const userId = ref<string>(route.params.id as string);

// State
const submitLoading = ref<boolean>(false);
const companyUserFormRef = ref();
const companyUser = ref<CompanyUserInterface | null>(null);
const loading = ref<boolean>(false);

// Load company user data on mount
const loadCompanyUserData = async () => {
  try {
    loading.value = true;

    // Load company user data
    const companyUserData = await companyUserStore.fetchCompanyUserById(parseInt(userId.value));

    companyUser.value = companyUserData;
  } catch (error) {
    console.error("Error loading company user:", error);
    warning(t("company-user.error.title"), t("company-user.error.loadFailed"));
    const errorUrl = route.query.company_id
      ? `/companies/users?company_id=${route.query.company_id}`
      : '/companies/users';
    router.push(errorUrl);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCompanyUserData();
});

const handleFormSubmit = async (formData: {
  username: string;
  email: string;
  tel: string;
  password: string;
  confirm_password: string;
  signature?: string | null;
  roleIds: number[];
  permissionIds: number[];
  company_id?: number | null;
}) => {
  try {
    submitLoading.value = true;

    if (companyUser.value) {
      await companyUserStore.updateCompanyUser(companyUser.value.id, {
        username: formData.username,
        email: formData.email,
        tel: formData.tel,
        signature: formData.signature,
        roleIds: formData.roleIds,
        permissionIds: formData.permissionIds,
      });
      success(t("company-user.success.title"), t("company-user.success.updated"));
    }

    // Redirect to company user list after successful update
    const listUrl = formData.company_id
      ? `/companies/users?company_id=${formData.company_id}`
      : '/companies/users';
    router.push(listUrl);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    warning(t("company-user.error.title"), String(errorMessage));
  } finally {
    submitLoading.value = false;
  }
};

const handleCancel = () => {
  // Check if we have company_id from route query or from the loaded company user
  const queryCompanyId = route.query.company_id;
  const companyId = queryCompanyId
    ? Number(queryCompanyId)
    : companyUser.value?.company_id;

  const cancelUrl = companyId
    ? `/companies/users?company_id=${companyId}`
    : '/companies/users';
  router.push(cancelUrl);
};

const submitForm = () => {
  companyUserFormRef.value?.submitForm();
};
</script>

<template>
  <div class="company-user-edit-container">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <div>
            <h1 class="text-2xl font-semibold">{{ t("company-user.modal.edit") }}</h1>
          </div>
        </div>
      </div>

      <!-- Company User Edit Form -->
      <div class="bg-white rounded-lg shadow-sm p-6" v-if="!loading">
        <ManageCompanyUserForm
          ref="companyUserFormRef"
          :company-user="companyUser"
          :is-edit-mode="true"
          :loading="submitLoading"
          @submit="handleFormSubmit"
        />
      </div>

      <!-- Loading State -->
      <div class="bg-white rounded-lg shadow-sm p-6 text-center" v-else>
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p class="mt-4 text-gray-600">{{ t("common.loading") }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4 mt-6" v-if="!loading">
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
          icon="ant-design:edit-outlined"
          color-class="flex items-center gap-2"
        >
          {{ t("button.edit") }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.company-user-edit-container {
  min-height: calc(100vh - 120px);
  background-color: #f8f9fa;
}
</style>