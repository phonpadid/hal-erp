<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCompanyStore } from "../../stores/company.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useToggleStore } from "../../stores/storage.store";
import { storeToRefs } from "pinia";
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
          <h1 class="text-2xl font-semibold">{{ t("company.add") }}</h1>
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
            {{ t("button.save") }}
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Company Creation Form -->
    <div class="body mt-[6rem] px-6">
      <CompanyForm
        ref="companyFormRef"
        :company="null"
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