<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, computed, onMounted } from "vue";
import type { CompanyUserInterface } from "@/modules/interfaces/company-user.interface";
import type { PermissionGroup } from "@/modules/interfaces/permission.interface";
import { useI18n } from "vue-i18n";
import { createCompanyUserValidation } from "../../views/company-user/validation/company-user.validate";
import { useRoleStore } from "../../stores/role.store";
import { usePermissionStore } from "../../stores/permission.store";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UploadFile from "@/common/shared/components/Upload/UploadFile.vue";
import { uploadFile } from "@/modules/application/services/upload.service";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import PermissionSelector from "@/modules/presentation/Admin/components/permission/PermissionSelector.vue";
import { useRoute } from "vue-router";

const { t } = useI18n();
const roleStore = useRoleStore();
const permissionStore = usePermissionStore();
const route = useRoute();

const props = defineProps<{
  companyUser?: (CompanyUserInterface & { signature_url?: string | null }) | null;
  isEditMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    data: {
      username: string;
      email: string;
      tel: string;
      password: string;
      confirm_password: string;
      signature?: string | null;
      roleIds: number[];
      permissionIds: number[];
      company_id?: number | null;
    }
  ): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  username: "",
  email: "",
  tel: "",
  password: "",
  confirm_password: "",
  signature: null as string | null,
  roleIds: [] as number[],
  permissionIds: [] as number[],
});

// Company ID state
const companyId = ref<number | null>(null);

// Form files
const signatureFile = ref<File | null>(null);

// Preview states
const signaturePreview = ref<string | null>(null);

// Upload loading states
const signatureUploading = ref<boolean>(false);
const loadingPermissions = ref<boolean>(false);
const permissionData = ref<PermissionGroup[]>([]);

const validationState = reactive({
  password: formState.password,
  isEditMode: props.isEditMode,
  signature: formState.signature,
});

watch(
  () => formState.password,
  (newPassword) => {
    validationState.password = newPassword;
  }
);

watch(
  () => props.isEditMode,
  (newIsEditMode) => {
    validationState.isEditMode = newIsEditMode;
  }
);

// Get company user rules
const companyUserRules = computed(() => {
  return createCompanyUserValidation(t, validationState);
});

// Load roles and permissions on mount
onMounted(async () => {
  try {
    loadingPermissions.value = true;

    // Get company_id from query parameters
    const queryCompanyId = route.query.company_id;
    if (queryCompanyId) {
      companyId.value = Number(queryCompanyId);
    }

    await roleStore.fetchAllRoles({ page: 1, limit: 10000 });
    const result = await permissionStore.fetchPermission();
    permissionData.value = result.data as unknown as PermissionGroup[];
  } catch (error) {
    console.error("Error loading roles and permissions:", error);
  } finally {
    loadingPermissions.value = false;
  }
});

// Watch company user changes
watch(
  () => props.companyUser,
  (newCompanyUser) => {
    if (newCompanyUser) {
      // Handle nested user structure based on actual API response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const companyUserAny = newCompanyUser as any;

      // Check if data is nested under user object
      if (companyUserAny.user) {
        formState.username = companyUserAny.user.username || "";
        formState.email = companyUserAny.user.email || "";
        formState.tel = companyUserAny.user.tel || "";

        // Handle signature from nested structure
        if (companyUserAny.user.user_signature?.signature) {
          formState.signature = companyUserAny.user.user_signature.signature;
        }

        // Handle signature preview
        if (companyUserAny.user.user_signature?.signature_url) {
          signaturePreview.value = companyUserAny.user.user_signature.signature_url;
        }

        // Handle roles from nested structure
        const roles = companyUserAny.user.roles || newCompanyUser.roles;
        formState.roleIds = roles?.map((role: { id: number }) => role.id) || [];

        // Handle permissions from nested structure
        const permissions = companyUserAny.user.permissions || newCompanyUser.permissions;
        formState.permissionIds =
          permissions?.map((permission: { id: number }) => permission.id) || [];
      } else {
        // Fallback to flat structure

        formState.username = newCompanyUser.username || "";
        formState.email = newCompanyUser.email || "";
        formState.tel = newCompanyUser.tel || "";
        formState.signature = newCompanyUser.signature || null;

        // Handle roles and permissions
        formState.roleIds = newCompanyUser.roles?.map((role: { id: number }) => role.id) || [];
        formState.permissionIds =
          newCompanyUser.permissions?.map((permission: { id: number }) => permission.id) || [];

        // Handle signature preview
        if (newCompanyUser.signature_url) {
          signaturePreview.value = newCompanyUser.signature_url;
        }
      }
    } else {
      // Reset form for create mode
      formState.username = "";
      formState.email = "";
      formState.tel = "";
      formState.password = "";
      formState.confirm_password = "";
      formState.signature = null;
      formState.roleIds = [];
      formState.permissionIds = [];
      signaturePreview.value = null;
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();

    // Ensure roleIds and permissionIds are arrays
    const roleIds = Array.isArray(formState.roleIds)
      ? formState.roleIds.map((id) => Number(id))
      : formState.roleIds
      ? [Number(formState.roleIds)]
      : [];

    const permissionIds = Array.isArray(formState.permissionIds)
      ? formState.permissionIds.map((id) => Number(id))
      : [];

    const formData = {
      username: formState.username,
      email: formState.email,
      tel: formState.tel,
      password: formState.password,
      confirm_password: formState.confirm_password,
      signature: formState.signature,
      roleIds,
      permissionIds,
      company_id: companyId.value,
    };

    emit("submit", formData);
  } catch (error) {
    console.error("Form validation failed:", error);
    throw error;
  }
};

// Handle signature file upload - upload immediately on selection
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
    formState.signature = uploadResult.fileName;
    signatureFile.value = file;
  } catch (error) {
    console.error("Error uploading signature:", error);
    alert("Failed to upload user signature. Please try again.");
  } finally {
    signatureUploading.value = false;
  }
};

const roleOptions = computed(() => {
  return roleStore.rawRoles.map((role) => ({
    value: Number(role.id),
    label: role.display_name || role.name,
  }));
});

defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
</script>

<template>
  <div class="company-user-form">
    <UiForm ref="formRef" :model="formState" :rules="companyUserRules">
      <!-- User Information Section -->
      <div class="form-section mb-6">
        <h3 class="section-title text-lg font-semibold mb-4 text-gray-700">
          {{ $t("company-user.form.userInfo") }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Username -->
          <UiFormItem :label="$t('company-user.form.username')" name="username" required>
            <UiInput
              v-model="formState.username"
              :placeholder="$t('company-user.form.usernamePlaceholder')"
              :disabled="loading"
            />
          </UiFormItem>

          <!-- Email -->
          <UiFormItem :label="$t('company-user.form.email')" name="email" required>
            <UiInput
              v-model="formState.email"
              :placeholder="$t('company-user.form.emailPlaceholder')"
              :disabled="loading"
              type="email"
            />
          </UiFormItem>
          <!-- Tel -->
          <UiFormItem :label="$t('company-user.form.tel')" name="tel" required>
            <UiInput
              v-model="formState.tel"
              :placeholder="$t('company-user.form.telPlaceholder')"
              :disabled="loading"
            />
          </UiFormItem>
          <!-- Password (only for create mode) -->
          <template v-if="!isEditMode">
            <UiFormItem :label="$t('company-user.form.password')" name="password" required>
              <UiInput
                v-model="formState.password"
                :placeholder="$t('company-user.form.passwordPlaceholder')"
                :disabled="loading"
                type="password"
              />
            </UiFormItem>
            <!-- Confirm Password - Full Width on Mobile -->
            <div class="md:col-span-2">
              <UiFormItem
                :label="$t('company-user.form.confirmPassword')"
                name="confirm_password"
                required
              >
                <UiInput
                  v-model="formState.confirm_password"
                  :placeholder="$t('company-user.form.confirmPasswordPlaceholder')"
                  :disabled="loading"
                  type="password"
                />
              </UiFormItem>
            </div>
          </template>
           <!-- Signature -->
          <UiFormItem :label="$t('company-user.form.signature')" name="signature">
            <UploadFile
              v-model:file="signatureFile"
              @onFileSelect="handleSignatureChange"
              :disabled="loading || signatureUploading"
              accept="image/*"
              :model-value="signaturePreview || formState.signature"
              :max-size="5"
              :uploading="signatureUploading"
            />
          </UiFormItem>
          <!-- Roles -->
          <UiFormItem :label="$t('company-user.form.roles')" name="roleIds" required>
            <InputSelect
              v-model="formState.roleIds"
              :options="roleOptions"
              :placeholder="$t('company-user.form.rolesPlaceholder')"
              :disabled="loading || loadingPermissions"
              width="100%"
            />
          </UiFormItem>
          <!-- Permissions -->
        </div>
        <UiFormItem :label="$t('company-user.form.permissions')" name="permissionIds" required>
          <PermissionSelector v-model="formState.permissionIds" :permissionData="permissionData" />
        </UiFormItem>
      </div>
    </UiForm>
  </div>
</template>
