<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCompanyUserStore } from "../../stores/company-user.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useToggleStore } from "../../stores/storage.store";
import { storeToRefs } from "pinia";
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

    console.log('📦 Company User Data from API:', companyUserData);

    // Log roles structure for debugging
    if (companyUserData?.roles) {
      console.log('👤 User Roles:', companyUserData.roles);
      console.log('🔍 Has company_admin?', companyUserData.roles.some((r: any) => r.name === 'company_admin'));
    }

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

// Toggle sidebar logic
const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);
const topbarStyle = computed(() => {
  return toggle.value ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
});
const handleToggle = () => {
  toggle.value = !toggle.value;
  localStorage.setItem("toggle", toggle.value.toString());
};
</script>

<template>
  <div class="container mx-auto py-1 px-0">
    <!-- Fixed Header with Action Buttons -->
    <div
      class="fixed px-6 py-4 top-0 z-20 bg-white shadow-sm transition-all duration-150 mt-[4rem]"
      :class="topbarStyle"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ t("company-user.modal.edit") }}</h1>
        </div>

        <!-- Action Buttons in Header -->
        <div class="flex gap-3" v-if="!loading">
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

    <!-- Loading State -->
    <div v-if="loading" class="mt-[10rem] text-center">
      <div class="bg-white rounded-lg shadow-sm p-6 inline-block">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p class="mt-4 text-gray-600">{{ t("common.loading") }}</p>
      </div>
    </div>

    <!-- Company User Edit Form -->
    <div v-else class="body mt-[6rem] px-6">   
      <ManageCompanyUserForm
        ref="companyUserFormRef"
        :company-user="companyUser"
        :is-edit-mode="true"
        :loading="submitLoading"
        @submit="handleFormSubmit"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: #f8f9fa;
  min-height: calc(100vh - 120px);
}

.body {
  background-color: #f8f9fa;
}
</style>