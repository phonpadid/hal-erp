<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, onMounted, computed } from "vue";
import type { UserCreatePayload, UserInterface } from "@/modules/interfaces/user.interface";
import type { PermissionGroup } from "@/modules/interfaces/permission.interface";
import { useI18n } from "vue-i18n";
import { createUserValidation } from "../../views/user/validation/user.validate";
import { useRoleStore } from "../../stores/role.store";
import { usePermissionStore } from "../../stores/permission.store";
import { uploadFile } from "@/modules/application/services/upload.service";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputPassword from "@/common/shared/components/Input/UiInputPassword.vue";
import UiSelect from "@/common/shared/components/Input/InputSelect.vue";
import PermissionSelector from "@/modules/presentation/Admin/components/permission/PermissionSelector.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import UploadFile from "@/common/shared/components/Upload/UploadFile.vue";
import { message } from "ant-design-vue";
const { t } = useI18n();
const roleStore = useRoleStore();
const permissionStore = usePermissionStore();

const props = defineProps<{
  user?: UserInterface | null;
  isEditMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    data: {
      username: string;
      email: string;
      password?: string;
      tel?: string;
      roleIds: number[];
      permissionIds: number[];
      signature: string | File;
    }
  ): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const formState = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  tel: "",
  roleIds: [] as number[],
  permissionIds: [] as (string | number)[],
  signature: "" as string | File,
});

const signatureFile = ref<File | null>(null);
// Add handler for signature file changes
const handleFileChange = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadFile(formData);
    if (result.fileName) {
      formState.signature = result.fileName;
    } else {
      throw new Error("Upload failed: No filename returned");
    }
  } catch (error) {
    console.error("Error uploading signature:", error);
    message.error(t("user.error.uploadFailed"));
  }
};

const permissionData = ref<PermissionGroup[]>([]);
const loadingPermissions = ref(false);
// Load roles and permissions
onMounted(async () => {
  try {
    loadingPermissions.value = true;
    await roleStore.fetchAllRoles();
    const result = await permissionStore.fetchPermission();
    permissionData.value = result.data as unknown as PermissionGroup[];
  } catch (error) {
    console.error("Error loading roles and permissions:", error);
  } finally {
    loadingPermissions.value = false;
  }
});

// Handle permission selection
const handlePermissionSelect = (values: (string | number)[]) => {
  formState.permissionIds = values;
};
// Create validation rules
const validationState = reactive({
  password: formState.password,
  isEditMode: props.isEditMode,
  signature: formState.signature,
});

// Watch for password changes
watch(
  () => formState.password,
  (newPassword) => {
    validationState.password = newPassword;
  }
);

// Watch for isEditMode changes
watch(
  () => props.isEditMode,
  (newIsEditMode) => {
    validationState.isEditMode = newIsEditMode;
  }
);

// Get validation rules
const userRules = createUserValidation(t, validationState);

// Watch for user changes
// Update the watch for user changes
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      formState.username = newUser.username;
      formState.email = newUser.email;
      formState.tel = newUser.tel || "";
      formState.roleIds = newUser.roleIds.map(Number);
      formState.permissionIds = newUser.permissionIds.map(Number);
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  try {
    await formRef.value.submitForm();
    const formData = {
      username: formState.username,
      email: formState.email,
      tel: formState.tel || undefined,
      roleIds: formState.roleIds.map((id) => Number(id)),
      permissionIds: formState.permissionIds.map((id) => Number(id)),
      signature: formState.signature,
    } as UserCreatePayload;

    if (formState.password) {
      formData.password = formState.password;
    }

    emit("submit", formData);
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};

defineExpose({
  submitForm,
  resetForm: () => formRef.value?.resetFields(),
});

const roleOptions = computed(() => {
  return roleStore.rawRoles.map((role) => ({
    value: Number(role.id),
    label: role.display_name || role.name,
  }));
});

watch(
  () => formState.signature,
  (newValue) => {
    validationState.signature = newValue;
  }
);
</script>

<template>
  <div class="user-form">
    <UiForm ref="formRef" :model="formState" :rules="userRules" layout="vertical">
      <!-- Basic Information -->
      <UiFormItem :label="t('user.form.signatureUpload')" name="signature" required>
        <UploadFile
          v-model="signatureFile"
          :width="'100%'"
          :height="'200px'"
          :upload-text="t('user.form.signatureUpload')"
          @onFileSelect="handleFileChange"
          accept="image/*"
          :defaultUrl="formState.signature"
        />
      </UiFormItem>
      <div class="form-section">
        <h2 class="section-title">{{ t("user.form.basicInfo") }}</h2>
        <div class="form-grid">
          <UiFormItem :label="t('user.form.username')" name="username" required>
            <UiInput
              v-model="formState.username"
              :placeholder="t('user.form.usernamePlaceholder')"
              :disabled="loading"
            />
          </UiFormItem>

          <UiFormItem :label="t('user.form.email')" name="email" required>
            <UiInput
              v-model="formState.email"
              :placeholder="t('user.form.emailPlaceholder')"
              type="email"
              :disabled="loading"
            />
          </UiFormItem>

          <UiFormItem :label="t('user.form.tel')" name="tel">
            <UiInput
              v-model="formState.tel"
              :placeholder="t('user.form.telPlaceholder')"
              :disabled="loading"
            />
          </UiFormItem>
        </div>
      </div>
      <a-divider style="margin-bottom: 10px; margin-top: -10px" v-if="!isEditMode" />

      <!-- Password -->
      <div class="form-section" v-if="!isEditMode">
        <h2 class="section-title">{{ t("user.form.password") }}</h2>
        <div class="form-grid">
          <UiFormItem :label="t('user.form.password')" name="password" :required="!isEditMode">
            <UiInputPassword
              v-model="formState.password"
              :placeholder="
                isEditMode
                  ? t('user.form.passwordEditPlaceholder')
                  : t('user.form.passwordPlaceholder')
              "
              :disabled="loading"
            />
          </UiFormItem>

          <UiFormItem
            :label="t('user.form.confirmPassword')"
            name="confirmPassword"
            :required="!isEditMode || formState.password"
          >
            <UiInputPassword
              v-model="formState.confirmPassword"
              :placeholder="t('user.form.confirmPasswordPlaceholder')"
              :disabled="loading"
            />
          </UiFormItem>
        </div>
      </div>
      <a-divider style="margin-bottom: 10px; margin-top: -10px" />

      <!-- Roles -->
      <div class="form-section">
        <h2 class="section-title">{{ t("user.form.roles") }}</h2>
        <UiFormItem :label="t('user.form.selectRoles')" name="roleIds">
          <UiSelect
            v-model:value="formState.roleIds"
            mode="multiple"
            :options="roleOptions"
            :loading="roleStore.loading"
            :disabled="loading"
          />
        </UiFormItem>
      </div>
      <a-divider style="margin-bottom: 10px; margin-top: -10px" />

      <!-- Permissions -->
      <div class="form-section">
        <h2 class="section-title">
          {{ t("user.form.permissions") }}
          <span class="permission-count">
            ({{ formState.permissionIds.length }} {{ t("user.form.selected") }})
          </span>
        </h2>
        <a-spin :spinning="loadingPermissions">
          <PermissionSelector
            v-model="formState.permissionIds"
            :permissionData="permissionData"
            @update:modelValue="handlePermissionSelect"
          />
        </a-spin>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <UiButton type="primary" :loading="loading" @click="submitForm">
          {{ isEditMode ? t("button.edit") : t("button.save") }}
        </UiButton>
      </div>
    </UiForm>
  </div>
</template>

<style scoped>
.user-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.form-section {
  background: white;
  border-radius: 8px;
  /* padding: 20px; */
  /* margin-bottom: 24px; */
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.permission-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: normal;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
