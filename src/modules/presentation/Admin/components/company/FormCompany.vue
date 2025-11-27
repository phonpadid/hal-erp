<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, computed } from "vue";
import type { CompanyInterface } from "@/modules/interfaces/company.interface";
import { useI18n } from "vue-i18n";
import { createCompanyValidation } from "../../views/company/validation/company.vallidate";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UploadFile from "@/common/shared/components/Upload/UploadFile.vue";
import { uploadFile } from "@/modules/application/services/upload.service";
import { Icon } from "@iconify/vue";

const { t } = useI18n();
const props = defineProps<{
  company?:
    | (CompanyInterface & {
        logo_url?: string;
        user?: {
          username: string;
          email: string;
          tel: string;
          signature?: string | null;
          signature_url?: string;
        };
      })
    | null;
  isEditMode: boolean;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (
    e: "submit",
    data: {
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
    }
  ): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  name: "",
  logo: null as string | null,
  tel: "",
  email: "",
  address: "",
  // User fields for initial setup
  user: {
    username: "",
    email: "",
    tel: "",
    password: "",
    confirm_password: "",
    signature: null as string | null,
  },
});

// Form files
const logoFile = ref<File | null>(null);
const signatureFile = ref<File | null>(null);

// Track if logo was uploaded
const logoUploaded = ref<boolean>(false);

// Preview states
const logoPreview = ref<string | null>(null);
const signaturePreview = ref<string | null>(null);

// Upload loading states
const logoUploading = ref<boolean>(false);
const signatureUploading = ref<boolean>(false);

const validationState = reactive({
  isEditMode: props.isEditMode,
  formState: formState, // ✅ Pass formState for reactive validation
});

watch(
  () => props.isEditMode,
  (newIsEditMode) => {
    validationState.isEditMode = newIsEditMode;
  }
);

// Get company rules
const companyRules = computed(() => {
  // ✅ Pass current formState for reactive validation
  const currentValidationState = {
    ...validationState,
    formState: formState,
  };

  const rules = createCompanyValidation(t, currentValidationState);

  return rules;
});

watch(
  () => props.company,
  (newCompany) => {
    if (newCompany) {
      formState.name = newCompany.name || "";
      formState.logo = newCompany.logo || null;
      formState.tel = newCompany.tel || "";
      formState.email = newCompany.email || "";
      formState.address = newCompany.address || "";

      // Reset logo upload tracker when loading company data
      logoUploaded.value = false;

      // Set logo preview for display using logo_url if available
      if (newCompany.logo_url) {
        logoPreview.value = newCompany.logo_url;
      }

      // Handle user data if available (for edit mode)
      if (newCompany.user) {
        formState.user.username = newCompany.user.username || "";
        formState.user.email = newCompany.user.email || "";
        formState.user.tel = newCompany.user.tel || "";
        formState.user.signature = newCompany.user.signature || null;

        // Set signature preview if signature_url is available
        if (newCompany.user.signature_url) {
          signaturePreview.value = newCompany.user.signature_url;
        }
      }
    } else {
      // Reset form for create mode
      formState.name = "";
      formState.logo = null;
      formState.tel = "";
      formState.email = "";
      formState.address = "";
      formState.user.username = "";
      formState.user.email = "";
      formState.user.tel = "";
      formState.user.password = "";
      formState.user.confirm_password = "";
      formState.user.signature = null;
      logoPreview.value = null;
      signaturePreview.value = null;
      logoUploaded.value = false;
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();

    const formData = {
      name: formState.name,
      logo: logoUploaded.value ? formState.logo : "", // Send empty string if no new logo uploaded
      tel: formState.tel,
      email: formState.email,
      address: formState.address,
    };

    // Include user data only in create mode
    if (!props.isEditMode) {
      const formDataWithUser = formData as typeof formData & { user: typeof formState.user };
      formDataWithUser.user = { ...formState.user }; // signature already uploaded
      emit("submit", formDataWithUser);
    } else {
      emit("submit", formData);
    }
  } catch (error) {
    console.error("Form validation failed:", error);
    throw error; // Re-throw to let parent handle the error
  }
};

// Handle file uploads - upload immediately on selection
const handleLogoChange = async (file: File) => {
  try {
    logoUploading.value = true;
    logoUploaded.value = true;

    // For preview, convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Upload file immediately
    const formData = new FormData();
    formData.append("file", file);
    const uploadResult = await uploadFile(formData);

    // Store the uploaded filename in formState
    formState.logo = uploadResult.fileName;
    logoFile.value = file;
  } catch (error) {
    console.error("Error uploading logo:", error);
    // Show error message (you might want to add a notification system)
    alert("Failed to upload company logo. Please try again.");
  } finally {
    logoUploading.value = false;
  }
};

const handleSignatureChange = async (file: File) => {
  try {
    signatureUploading.value = true;

    // For preview, convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      signaturePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Upload file immediately
    const formData = new FormData();
    formData.append("file", file);
    const uploadResult = await uploadFile(formData);

    // Store the uploaded filename in formState
    formState.user.signature = uploadResult.fileName;
    signatureFile.value = file;
  } catch (error) {
    console.error("Error uploading signature:", error);
    // Show error message
    alert("Failed to upload user signature. Please try again.");
  } finally {
    signatureUploading.value = false;
  }
};

defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
</script>

<template>
  <div class="company-form min-h-screen p-0">
    <UiForm ref="formRef" :model="formState" :rules="companyRules">
      <!-- Main Layout Container -->
      <div class="flex flex-col lg:flex-row gap-4 h-full">

        <!-- LEFT SIDE - Visual Content -->
        <div class="lg:w-1/3 xl:w-1/4 space-y-4">
          <!-- Logo Section -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 shadow-sm border border-blue-100">
            <div class="text-center space-y-4">
              <div class="w-32 h-32 mx-auto bg-white rounded-full shadow-md flex items-center justify-center p-2">
                <img
                  v-if="logoPreview"
                  :src="logoPreview"
                  alt="Company Logo"
                  class="w-full h-full object-contain rounded-full"
                />
                <Icon
                  v-else
                  icon="material-symbols:account-balance-outline-rounded"
                  class="w-16 h-16 text-blue-400"
                />
              </div>
              <div>
                <h4 class="font-semibold text-gray-800">{{ $t('company.form.logo') }}</h4>
                <p class="text-sm text-gray-600 mt-1">{{ $t('company.form.uploadLogo') }}</p>
              </div>
              <UploadFile
                @onFileSelect="handleLogoChange"
                :disabled="loading || logoUploading"
                accept="image/*"
                :model-value="logoPreview"
                :max-size="5"
                :uploading="logoUploading"
                class="max-w-[200px] mx-auto"
              />
            </div>
          </div>

          <!-- Signature Section (only for create mode) -->
          <div v-if="!isEditMode" class="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-4 shadow-sm border border-green-100">
            <div class="text-center space-y-4">
              <div class="w-24 h-24 mx-auto bg-white rounded-lg shadow-md flex items-center justify-center p-2">
                <img
                  v-if="signaturePreview"
                  :src="signaturePreview"
                  alt="User Signature"
                  class="w-full h-full object-contain"
                />
                <Icon
                  v-else
                  icon="material-symbols:draw-outline"
                  class="w-12 h-12 text-green-400"
                />
              </div>
              <div>
                <h4 class="font-semibold text-gray-800">{{ $t('company.form.signature') }}</h4>
                <p class="text-sm text-gray-600 mt-1">{{ $t('company.form.uploadSignature') }}</p>
              </div>
              <UploadFile
                @onFileSelect="handleSignatureChange"
                :disabled="loading || signatureUploading"
                accept="image/*"
                :model-value="signaturePreview"
                :max-size="5"
                :uploading="signatureUploading"
                class="max-w-[200px] mx-auto"
              />
            </div>
          </div>

          <!-- Company Info Card -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-4 shadow-sm border border-purple-100">
            <div class="text-center space-y-3">
              <Icon icon="ic:sharp-supervised-user-circle" class="w-16 h-16 text-purple-400 mx-auto" />
              <h4 class="font-semibold text-gray-800">{{ $t("company.form.companySetup") }}</h4>
              <p class="text-sm text-gray-600">{{ $t("company.form.companySetupDescription") }}</p>
            </div>
          </div>
        </div>

        <!-- RIGHT SIDE - Form Content -->
        <div class="lg:w-2/3 xl:w-3/4">
          <!-- Company Information Section -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-2">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon icon="material-symbols:account-balance-outline-rounded" class="text-blue-600 text-xl" />
              </div>
              <h3 class="text-xl font-semibold text-gray-800">
                {{ $t("company.form.companyInfo") }}
              </h3>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <!-- Company Name -->
              <div class="lg:col-span-2">
                <UiFormItem :label="$t('company.form.name')" name="name" required>
                  <UiInput
                    v-model="formState.name"
                    :placeholder="$t('company.form.namePlaceholder')"
                    :disabled="loading"
                    size="large"
                  />
                </UiFormItem>
              </div>

              <!-- Tel -->
              <UiFormItem :label="$t('company.form.tel')" name="tel" required>
                <UiInput
                  v-model="formState.tel"
                  :placeholder="$t('company.form.telPlaceholder')"
                  :disabled="loading"
                  size="large"
                >
                  <template #prefix>
                    <Icon icon="material-symbols:phone-in-talk" class="text-gray-400" />
                  </template>
                </UiInput>
              </UiFormItem>

              <!-- Email -->
              <UiFormItem :label="$t('company.form.email')" name="email" required>
                <UiInput
                  v-model="formState.email"
                  :placeholder="$t('company.form.emailPlaceholder')"
                  :disabled="loading"
                  type="email"
                  size="large"
                >
                  <template #prefix>
                    <Icon icon="material-symbols:mail-outline" class="text-gray-400" />
                  </template>
                </UiInput>
              </UiFormItem>

              <!-- Address -->
              <div class="lg:col-span-2">
                <UiFormItem :label="$t('company.form.address')" name="address" required>
                  <Textarea
                    v-model="formState.address"
                    :placeholder="$t('company.form.addressPlaceholder')"
                    :disabled="loading"
                    :rows="4"
                    :max-length="500"
                  />
                </UiFormItem>
              </div>
            </div>
          </div>

          <!-- User Information Section (only for create mode) -->
          <div v-if="!isEditMode" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 ">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon icon="ic:sharp-supervised-user-circle" class="text-green-600 text-xl" />
              </div>
              <h3 class="text-xl font-semibold text-gray-800">
                {{ $t("company.form.userSection") }}
              </h3>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <!-- Username -->
              <UiFormItem :label="$t('company.form.username')" name="user.username" required>
                <UiInput
                  v-model="formState.user.username"
                  :placeholder="$t('company.form.usernamePlaceholder')"
                  :disabled="loading"
                  size="large"
                >
                  <template #prefix>
                    <Icon icon="material-symbols:person-outline" class="text-gray-400" />
                  </template>
                </UiInput>
              </UiFormItem>

              <!-- User Email -->
              <UiFormItem :label="$t('company.form.userEmail')" name="user.email" required>
                <UiInput
                  v-model="formState.user.email"
                  :placeholder="$t('company.form.userEmailPlaceholder')"
                  :disabled="loading"
                  type="email"
                  size="large"
                >
                  <template #prefix>
                    <Icon icon="material-symbols:mail-outline" class="text-gray-400" />
                  </template>
                </UiInput>
              </UiFormItem>

              <!-- User Tel -->
              <UiFormItem :label="$t('company.form.userTel')" name="user.tel" required>
                <UiInput
                  v-model="formState.user.tel"
                  :placeholder="$t('company.form.userTelPlaceholder')"
                  :disabled="loading"
                  size="large"
                >
                  <template #prefix>
                    <Icon icon="material-symbols:phone-in-talk" class="text-gray-400" />
                  </template>
                </UiInput>
              </UiFormItem>

              <!-- Password -->
              <UiFormItem :label="$t('company.form.password')" name="user.password" required>
                <UiInput
                  v-model="formState.user.password"
                  :placeholder="$t('company.form.passwordPlaceholder')"
                  :disabled="loading"
                  type="password"
                  size="large"
                >
                  <template #prefix>
                    <Icon icon="material-symbols:lock-outline" class="text-gray-400" />
                  </template>
                </UiInput>
              </UiFormItem>

              <!-- Confirm Password -->
              <div class="lg:col-span-2">
                <UiFormItem
                  :label="$t('company.form.confirmPassword')"
                  name="user.confirm_password"
                  required
                >
                  <UiInput
                    v-model="formState.user.confirm_password"
                    :placeholder="$t('company.form.confirmPasswordPlaceholder')"
                    :disabled="loading"
                    type="password"
                    size="large"
                  >
                    <template #prefix>
                      <Icon icon="material-symbols:lock-outline" class="text-gray-400" />
                    </template>
                  </UiInput>
                </UiFormItem>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UiForm>
  </div>
</template>
