<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCompanyStore } from "../../stores/company.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useToggleStore } from "../../stores/storage.store";
import { storeToRefs } from "pinia";
import CompanyForm from "@/modules/presentation/Admin/components/company/FormCompany.vue";
import { useRouter, useRoute } from "vue-router";
import type { CompanyInterface } from "@/modules/interfaces/company.interface";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const { t } = useI18n();
const companyStore = useCompanyStore();
const { success, warning } = useNotification();
const router = useRouter();
const route = useRoute();

// State
const submitLoading = ref<boolean>(false);
const companyFormRef = ref();
const company = ref<CompanyInterface | null>(null);
const loading = ref<boolean>(false);

// Load company data on mount
onMounted(async () => {
  try {
    loading.value = true;
    const companyId = route.params.id as string;
    const companyData = await companyStore.fetchCompanyById(companyId);
    company.value = companyData;
  } catch (error) {
    console.error("Error loading company:", error);
    warning(t("company.error.title"), t("company.error.loadFailed"));
    router.push("/companies");
  } finally {
    loading.value = false;
  }
});

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

    if (company.value) {
      await companyStore.updateCompany(company.value.id.toString(), {
        ...formData,
      });
      success(t("company.success.title"), t("company.success.updated"));
    }

    // Redirect to company list after successful update
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
          <h1 class="text-2xl font-semibold">{{ t("company.modal.edit") }}</h1>
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
        <p class="mt-4 text-gray-600">{{ t("company.loading") }}</p>
      </div>
    </div>

    <!-- Company Edit Form -->
    <div v-else class="body mt-[6rem] px-6">
      <CompanyForm
        ref="companyFormRef"
        :company="company"
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