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

const { t } = useI18n();
const props = defineProps<{
  company?: CompanyInterface & {
    logo_url?: string;
    user?: {
      username: string;
      email: string;
      tel: string;
      signature?: string | null;
      signature_url?: string;
    };
  } | null;
  isEditMode: boolean;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: "submit", data: {
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
  }): void;
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
    formState: formState
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
  <div class="company-form">
    <UiForm ref="formRef" :model="formState" :rules="companyRules">
      <!-- Company Information Section -->
      <div class="form-section mb-6">
        <h3 class="section-title text-lg font-semibold mb-4 text-gray-700">
          {{ $t('company.form.companyInfo') }}
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Company Name - Full Width -->
          <div class="md:col-span-2">
            <UiFormItem :label="$t('company.form.name')" name="name" required>
              <UiInput
                v-model="formState.name"
                :placeholder="$t('company.form.namePlaceholder')"
                :disabled="loading"
              />
            </UiFormItem>
          </div>

          <!-- Tel -->
          <UiFormItem :label="$t('company.form.tel')" name="tel" required>
            <UiInput
              v-model="formState.tel"
              :placeholder="$t('company.form.telPlaceholder')"
              :disabled="loading"
            />
          </UiFormItem>

          <!-- Email -->
          <UiFormItem :label="$t('company.form.email')" name="email" required>
            <UiInput
              v-model="formState.email"
              :placeholder="$t('company.form.emailPlaceholder')"
              :disabled="loading"
              type="email"
            />
          </UiFormItem>

          <!-- Address - Full Width -->
          <div class="md:col-span-2">
            <UiFormItem :label="$t('company.form.address')" name="address" required>
              <Textarea
                v-model="formState.address"
                :placeholder="$t('company.form.addressPlaceholder')"
                :disabled="loading"
                :rows="3"
                :max-length="500"
              />
            </UiFormItem>
          </div>

          <!-- Logo - Full Width -->
          <div class="md:col-span-2">
            <UiFormItem :label="$t('company.form.logo')" name="logo">
              <UploadFile
                @onFileSelect="handleLogoChange"
                :disabled="loading || logoUploading"
                accept="image/*"
                :model-value="logoPreview"
                :max-size="5"
                :uploading="logoUploading"
              />
            </UiFormItem>
          </div>
        </div>
      </div>

      <!-- User Information (only for create mode) -->
      <template v-if="!isEditMode">
        <div class="form-section">
          <h3 class="section-title text-lg font-semibold mb-4 text-gray-700">
            {{ $t('company.form.userSection') }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Username -->
            <UiFormItem :label="$t('company.form.username')" name="user.username" required>
              <UiInput
                v-model="formState.user.username"
                :placeholder="$t('company.form.usernamePlaceholder')"
                :disabled="loading"
              />
            </UiFormItem>

            <!-- User Email -->
            <UiFormItem :label="$t('company.form.userEmail')" name="user.email" required>
              <UiInput
                v-model="formState.user.email"
                :placeholder="$t('company.form.userEmailPlaceholder')"
                :disabled="loading"
                type="email"
              />
            </UiFormItem>

            <!-- User Tel -->
            <UiFormItem :label="$t('company.form.userTel')" name="user.tel" required>
              <UiInput
                v-model="formState.user.tel"
                :placeholder="$t('company.form.userTelPlaceholder')"
                :disabled="loading"
              />
            </UiFormItem>

            <!-- Password -->
            <UiFormItem :label="$t('company.form.password')" name="user.password" required>
              <UiInput
                v-model="formState.user.password"
                :placeholder="$t('company.form.passwordPlaceholder')"
                :disabled="loading"
                type="password"
              />
            </UiFormItem>

            <!-- Confirm Password - Full Width on Mobile -->
            <div class="md:col-span-2">
              <UiFormItem :label="$t('company.form.confirmPassword')" name="user.confirm_password" required>
                <UiInput
                  v-model="formState.user.confirm_password"
                  :placeholder="$t('company.form.confirmPasswordPlaceholder')"
                  :disabled="loading"
                  type="password"
                />
              </UiFormItem>
            </div>

            <!-- Signature - Full Width -->
            <div class="md:col-span-2">
              <UiFormItem :label="$t('company.form.signature')" name="user.signature" >
                <UploadFile
                  @onFileSelect="handleSignatureChange"
                  :disabled="loading || signatureUploading"
                  accept="image/*"
                  :model-value="signaturePreview"
                  :max-size="5"
                  :uploading="signatureUploading"
                />
              </UiFormItem>
            </div>
          </div>
        </div>
      </template>
    </UiForm>
  </div>
</template>