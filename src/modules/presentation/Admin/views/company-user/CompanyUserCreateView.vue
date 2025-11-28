<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCompanyUserStore } from "../../stores/company-user.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useToggleStore } from "../../stores/storage.store";
import { storeToRefs } from "pinia";
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
  // Get company_id from query parameters
  const queryCompanyId = route.query.company_id;
  if (queryCompanyId) {
    companyId.value = Number(queryCompanyId);
  }
});

// State
const submitLoading = ref<boolean>(false);
const companyUserFormRef = ref();

const handleCancel = () => {
  const cancelUrl = companyId.value
    ? `/companies/users?company_id=${companyId.value}`
    : '/companies/users';
  router.push(cancelUrl);
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
    const listUrl = companyId.value
      ? `/companies/users?company_id=${companyId.value}`
      : '/companies/users';
    router.push(listUrl);
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
          <h1 class="text-2xl font-semibold">{{ t("company-user.modal.create") }}</h1>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
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

    <!-- Company User Create Form -->
    <div class="body mt-[6rem] px-6">
      <ManageCompanyUserForm
        ref="companyUserFormRef"
        :company-user="null"
        :is-edit-mode="false"
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