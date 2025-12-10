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
import type { PaginationParams } from "@/modules/shared/pagination";
import { Icon } from "@iconify/vue";
import { isUserCompanyAdmin } from "@/modules/shared/utils/check-user-type.util";

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

// Track if signature was uploaded
const signatureUploaded = ref<boolean>(false);

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

    // Get company_id from query parameters (for create mode)
    const queryCompanyId = route.query.company_id;
    if (queryCompanyId) {
      companyId.value = Number(queryCompanyId);
    }
    // For edit mode, get company_id from companyUser data
    else if (props.isEditMode && props.companyUser?.company_id) {
      companyId.value = props.companyUser.company_id;
    }

    await loadRoles();
    const result = await permissionStore.fetchPermission();
    permissionData.value = result.data as unknown as PermissionGroup[];
  } catch (error) {
    console.error("Error loading roles and permissions:", error);
  } finally {
    loadingPermissions.value = false;
  }
});

// Watch company changes and reload roles
watch(
  () => companyId.value,
  async (newCompanyId) => {
    if (newCompanyId !== null) {
      await loadRoles();
    }
  }
);

// Load roles based on company
const loadRoles = async () => {
  try {
    loadingPermissions.value = true;
    const params: PaginationParams = { page: 1, limit: 10000 };
    if (companyId.value) {
      params.company_id = companyId.value;
    }
    await roleStore.fetchAllRoles(params);
  } catch (error) {
    console.error("Error loading roles:", error);
  } finally {
    loadingPermissions.value = false;
  }
};

// Watch company user changes
watch(
  () => props.companyUser,
  (newCompanyUser) => {
    if (newCompanyUser) {
      // Reset signature upload tracker when loading company user data
      signatureUploaded.value = false;

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
      signatureUploaded.value = false;
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

    // For company_admin users, send empty permissionIds array to backend
    const finalPermissionIds = disableRolePermissionSelection.value ? [] : permissionIds;

    const formData = {
      username: formState.username,
      email: formState.email,
      tel: formState.tel,
      password: props.isEditMode ? "" : formState.password, // Don't send password in edit mode
      confirm_password: props.isEditMode ? "" : formState.confirm_password, // Don't send confirm_password in edit mode
      signature: signatureUploaded.value ? formState.signature : "", // Send empty string if no new signature uploaded
      roleIds,
      permissionIds: finalPermissionIds,
      company_id: companyId.value,
    };

    // Debug logging for company_admin submit
    if (disableRolePermissionSelection.value) {
      console.log('🔒 Company Admin Submit - Sending only role data:', {
        roleIds,
        permissionIds: '[] (empty array)',
        isCompanyAdmin: true
      });
    }

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
    signatureUploaded.value = true;

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

// Check if user has company_admin role (for edit mode restrictions)
const hasCompanyAdminRole = computed(() => {
  if (!props.isEditMode || !props.companyUser) return false;

  return isUserCompanyAdmin(props.companyUser);
});

// Disable role and permission selection for company_admin users
const disableRolePermissionSelection = computed(() => {
  return props.isEditMode && hasCompanyAdminRole.value;
});

// Debug function to check company admin status
const debugCompanyAdminStatus = computed(() => {
  if (!props.isEditMode || !props.companyUser) return { status: 'not-edit-mode' };

  const isAdmin = isUserCompanyAdmin(props.companyUser);
  const roles = props.companyUser.roles || [];

  const result = {
    status: isAdmin ? 'is-company-admin' : 'not-company-admin',
    roles: roles,
    user: props.companyUser,
    hasCompanyAdminRole: isAdmin,
    disableSelection: props.isEditMode && isAdmin
  };

  // Log to console for debugging
  console.log('🔍 Company User Edit Status:', result);

  return result;
});

defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});
</script>

<template>
  <div class="company-user-form min-h-screen p-0">
    <UiForm ref="formRef" :model="formState" :rules="companyUserRules">
      <!-- Main Layout Container -->
      <div class="flex flex-col lg:flex-row gap-4 h-full">

        <!-- LEFT SIDE - Visual Content -->
        <div class="lg:w-1/3 xl:w-1/4 space-y-4">
          <!-- User Avatar Section -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 shadow-sm border border-blue-100">
            <div class="text-center space-y-4">
              <div class="w-32 h-32 mx-auto bg-white rounded-full shadow-md flex items-center justify-center p-2">
                <img
                  v-if="signaturePreview"
                  :src="signaturePreview"
                  alt="User Signature"
                  class="w-full h-full object-contain rounded-full"
                />
                <Icon
                  v-else
                  icon="ic:sharp-supervised-user-circle"
                  class="w-16 h-16 text-blue-400"
                />
              </div>
              <div>
                <h4 class="font-semibold text-gray-800">{{ $t('company-user.form.signature') }}</h4>
                <p class="text-sm text-gray-600 mt-1">{{ $t('company-user.form.signatureUpload') }}</p>
              </div>
              <UploadFile
                v-model:file="signatureFile"
                @onFileSelect="handleSignatureChange"
                :disabled="loading || signatureUploading"
                accept="image/*"
                :model-value="signaturePreview || formState.signature"
                :max-size="5"
                :uploading="signatureUploading"
                class="max-w-[200px] mx-auto"
              />
            </div>
          </div>

          
        </div>

        <!-- RIGHT SIDE - Form Content -->
        <div class="lg:w-2/3 xl:w-3/4">
          <!-- User Information Section -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon icon="ic:sharp-supervised-user-circle" class="text-blue-600 text-xl" />
              </div>
              <h3 class="text-xl font-semibold text-gray-800">
                {{ $t("company-user.form.userInfo") }}
              </h3>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <!-- Username -->
              <UiFormItem :label="$t('company-user.form.username')" name="username" required>
                <UiInput
                  v-model="formState.username"
                  :placeholder="$t('company-user.form.usernamePlaceholder')"
                  :disabled="loading"
                  size="large"
                >
                  <template #prefix>
                    <Icon icon="material-symbols:person-outline" class="text-gray-400" />
                  </template>
                </UiInput>
              </UiFormItem>

              <!-- Email -->
              <UiFormItem :label="$t('company-user.form.email')" name="email" required>
                <UiInput
                  v-model="formState.email"
                  :placeholder="$t('company-user.form.emailPlaceholder')"
                  :disabled="loading"
                  type="email"
                  size="large"
                >
                  <template #prefix>
                    <Icon icon="material-symbols:mail-outline" class="text-gray-400" />
                  </template>
                </UiInput>
              </UiFormItem>

              <!-- Tel -->
              <UiFormItem :label="$t('company-user.form.tel')" name="tel" required>
                <UiInput
                  v-model="formState.tel"
                  :placeholder="$t('company-user.form.telPlaceholder')"
                  :disabled="loading"
                  size="large"
                >
                  <template #prefix>
                    <Icon icon="material-symbols:phone-in-talk" class="text-gray-400" />
                  </template>
                </UiInput>
              </UiFormItem>

              <!-- Roles -->
              <UiFormItem :label="$t('company-user.form.roles')" name="roleIds" required>
                <InputSelect
                  v-model="formState.roleIds"
                  :options="roleOptions"
                  :placeholder="$t('company-user.form.rolesPlaceholder')"
                  :disabled="loading || loadingPermissions || disableRolePermissionSelection"
                  width="100%"
                  size="large"
                />
              </UiFormItem>

              <!-- Password fields -->
              <template v-if="!isEditMode">
                <!-- Create mode - editable password fields -->
                <UiFormItem :label="$t('company-user.form.password')" name="password" required>
                  <UiInput
                    v-model="formState.password"
                    :placeholder="$t('company-user.form.passwordPlaceholder')"
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
                    size="large"
                  >
                    <template #prefix>
                      <Icon icon="material-symbols:lock-outline" class="text-gray-400" />
                    </template>
                  </UiInput>
                </UiFormItem>
              </template>

              <template v-else>
                <!-- Edit mode - disabled password fields -->
                <UiFormItem :label="$t('company-user.form.password')" name="password">
                  <UiInput
                    v-model="formState.password"
                    placeholder="••••••••"
                    :disabled="true"
                    type="password"
                    size="large"
                  >
                    <template #prefix>
                      <Icon icon="material-symbols:lock-outline" class="text-gray-400" />
                    </template>
                  </UiInput>
                </UiFormItem>
                <!-- Confirm Password -->
                <UiFormItem
                  :label="$t('company-user.form.confirmPassword')"
                  name="confirm_password"
                >
                  <UiInput
                    v-model="formState.confirm_password"
                    placeholder="••••••••"
                    :disabled="true"
                    type="password"
                    size="large"
                  >
                    <template #prefix>
                      <Icon icon="material-symbols:lock-outline" class="text-gray-400" />
                    </template>
                  </UiInput>
                </UiFormItem>
              </template>
            </div>
          </div>
        </div>
      </div>
       <!-- Permissions Section (Full Width) - Hidden for company_admin -->
          <div v-if="!disableRolePermissionSelection" class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon icon="material-symbols:security" class="text-purple-600 text-xl" />
              </div>
              <h3 class="text-xl font-semibold text-gray-800">
                {{ $t("company-user.form.permissions") }}
              </h3>
            </div>

            <UiFormItem :label="$t('company-user.form.permissions')" name="permissionIds" required>
              <PermissionSelector
                v-model="formState.permissionIds"
                :permissionData="permissionData"
              />
            </UiFormItem>
          </div>
    </UiForm>
  </div>
</template>
