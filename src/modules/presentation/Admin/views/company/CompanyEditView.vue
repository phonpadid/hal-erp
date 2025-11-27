<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCompanyStore } from "../../stores/company.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
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
</script>

<template>
  <div class="company-edit-container">
    <div class="w-full p-3 pl-2">
      <!-- Header with Action Buttons -->
      <div class="flex items-center justify-between mb-4">
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

      <!-- Loading State -->
      <div class="bg-white rounded-lg shadow-sm p-6 text-center" v-if="loading">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p class="mt-4 text-gray-600">{{ t("company.loading") }}</p>
      </div>

      <!-- Company Edit Form -->
      <div class="w-full" v-else>
        <CompanyForm
          ref="companyFormRef"
          :company="company"
          :is-edit-mode="true"
          :loading="submitLoading"
          @submit="handleFormSubmit"
        />
      </div>

      <!-- Fixed Bottom Action Buttons (Sticky) -->
      <div class="fixed bottom-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10" style="left: 256px;" v-if="!loading">
        <div class="flex justify-end gap-3 max-w-4xl mx-auto">
          <!-- <UiButton
            type="default"
            @click="handleCancel"
            :disabled="submitLoading"
            size="default"
          >
            {{ t("button.cancel") }}
          </UiButton>
          <UiButton
            type="primary"
            @click="submitForm"
            :loading="submitLoading"
            icon="ant-design:edit-outlined"
            color-class="flex items-center gap-2"
            size="default"
          >
            {{ t("button.edit") }}
          </UiButton> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.company-edit-container {
  min-height: calc(100vh - 120px);
  background-color: #f8f9fa;
}
</style>