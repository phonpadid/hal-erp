<script setup lang="ts">
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { onMounted, ref, computed, watch, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { dpmUserRules } from "../../../views/departments/deparment-user/validation/department-user.validate";
import {
  departmenUsertStore,
  dpmUserFormModel,
} from "../../../stores/departments/department-user.store";
import { departmentStore } from "../../../stores/departments/department.store";
import UploadFile from "@/common/shared/components/Upload/UploadFile.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../../../stores/user.store";
import { usePositionStore } from "../../../stores/position.store";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiInputPassword from "@/common/shared/components/Input/UiInputPassword.vue";
import { NumberOnly } from "@/modules/shared/utils/format-price";
import { usePermissionStore } from "../../../stores/permission.store";
import PermissionCard from "./PermissionCard.vue";
import { useRoleStore } from "../../../stores/role.store";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { updateDpmUserRules } from "../../../views/departments/deparment-user/validation/update-department-user.validate";
const roleStore = useRoleStore();
const userStore = useUserStore();
const positionStore = usePositionStore();
const { push } = useRouter();
const route = useRoute();
const { t } = useI18n();
const formRef = ref();
const dpmStore = departmentStore();
const dpmUserStore = departmenUsertStore();
const permissionStore = usePermissionStore();
const loading = ref(false);
const { success } = useNotification();
const selectedPermissions = computed({
  get: () => dpmUserFormModel.permissionIds,
  set: (value: number[]) => {
    dpmUserFormModel.permissionIds = value;
  },
});
const isEditMode = computed(() => !!route.params.id);
const departmentUserId = computed(() => route.params.id as string);

const positionItem = computed(() =>
  positionStore.positions.map((item) => ({
    value: item.getId(),
    label: item.getName(),
  }))
);

const departmentItem = computed(() =>
  dpmStore.departments.map((item) => ({
    value: item.getId(),
    label: item.getName(),
  }))
);

const roleItem = computed(() =>
  roleStore.roles.map((item) => ({
    value: item.getId(),
    label: item.getName(),
  }))
);

const dpmUserRoleIds = computed({
  get: () => dpmUserFormModel.roleIds.map((id) => String(id)),
  set: (val: string[]) => {
    dpmUserFormModel.roleIds = val.map((id) => Number(id));
  },
});

// Get permission groups from store
const permissionGroups = computed(() => permissionStore.permission || []);

// Add reactive reference for signature file to ensure proper binding
const signatureFile = ref(dpmUserFormModel.signature_file || null);
const existingSignatureUrl = ref<string | File | null>(null);
watch(
  signatureFile,
  (newValue) => {
    dpmUserFormModel.signature_file = newValue;
  },
  { deep: true }
);
watch(
  () => dpmUserFormModel.signature_file,
  (newValue) => {
    if (newValue !== signatureFile.value) {
      signatureFile.value = newValue;
    }
  }
);

// Watch selected permissions
watch(
  selectedPermissions,
  (newValue) => {
    console.log("Selected permissions:", newValue);
  },
  { deep: true }
);

// Load existing data for edit mode
const loadDepartmentUser = async () => {
  if (isEditMode.value && departmentUserId.value) {
    try {
      loading.value = true;
      await dpmUserStore.fetchDepartmentUserById(departmentUserId.value);
      const departmentUser = dpmUserStore.currentDpmUser;
      const userData = departmentUser?.getUser();
      const positionData = departmentUser?.getPostion();

      if (departmentUser) {
        dpmUserFormModel.userId = userData?.getId() || "";
        dpmUserFormModel.username = userData?.getUsername() || "";
        dpmUserFormModel.email = userData?.getEmail?.() || "";
        dpmUserFormModel.tel = userData?.getTel?.() || "";
        dpmUserFormModel.position_id = positionData?.getId() || "";
        dpmUserFormModel.departmentId = departmentUser.getDepartmentId();

        // Debug: Let's see what we're getting for signature file
        const signatureFileUrl = departmentUser.getSignature_file();
        if (signatureFileUrl) {
          existingSignatureUrl.value = signatureFileUrl;
          dpmUserFormModel.signature_file = signatureFileUrl;
          signatureFile.value = signatureFileUrl;
        } else {
          console.log("No signature file found");
        }

        // Load existing permissions
        selectedPermissions.value = departmentUser.getPermissionIds() || [];
        const existingRoleIds =
          departmentUser.getRoleIds?.() || departmentUser.getRoleIds?.() || [];
        dpmUserFormModel.roleIds = existingRoleIds;
      } else {
        console.error("Department user not found");
      }
    } catch (error) {
      console.error("Failed to load department user:", error);
    } finally {
      loading.value = false;
    }
  }
};

const handleSubmit = async (): Promise<void> => {
  try {
    loading.value = true;
    // Validate form first
    const isValid = await formRef.value.validate();
    if (!isValid) {
      console.log("Form validation failed");
      return;
    }

    // Double check signature_file is properly set
    if (!dpmUserFormModel.signature_file) {
      await formRef.value.validateField("signature_file");
      return;
    }

    const payload = {
      user: {
        id: dpmUserFormModel.userId,
        username: dpmUserFormModel.username,
        email: dpmUserFormModel.email,
        password: dpmUserFormModel.password,
        tel: dpmUserFormModel.tel,
      },
      position_id: dpmUserFormModel.position_id,
      signature_file: existingSignatureUrl.value ? '' : dpmUserFormModel.signature_file,
      departmentId: dpmUserFormModel.departmentId,
      permissionIds: dpmUserFormModel.permissionIds,
      roleIds: dpmUserFormModel.roleIds,
    };

    if (isEditMode.value) {
      await dpmUserStore.updateDepartmentUser({
        id: departmentUserId.value,
        ...payload,
      });
      push({ name: "department_user.index" });
      dpmUserStore.resetForm();
      success(t("departments.notify.update"));
      console.log("update");
    } else {
      await dpmUserStore.createDepartmentUser(payload);
      push({ name: "department_user.index" });
      dpmUserStore.resetForm();
      success(t("departments.notify.created"));
    }
  } catch (error) {
    console.error(
      `${isEditMode.value ? "Update" : "Create"} department user failed:`,
      error
    );
  } finally {
    loading.value = false;
  }
};

// Handle file upload change explicitly
const handleFileChange = (file: File) => {
  if (file) {
    existingSignatureUrl.value = null;
    signatureFile.value = file;
    dpmUserFormModel.signature_file = file;
  }
};

const handlerCancel = () => {
  push({ name: "department_user.index" });
  dpmUserStore.resetForm();
  existingSignatureUrl.value = null;
};

onMounted(async () => {
  await dpmStore.fetchDepartment();
  await userStore.fetchUsers();
  await positionStore.fetchPositions();
  await permissionStore.fetchPermission();
  await roleStore.fetchRoles();
  // Load existing data if in edit mode
  await loadDepartmentUser();

  // Initialize signature file if it exists in form model
  if (dpmUserFormModel.signature_file) {
    signatureFile.value = dpmUserFormModel.signature_file;
  }
});

// const props = withDefaults(
//   defineProps<{
//     visible?: boolean;
//   }>(),
//   {
//     visible: false,
//   }
// );

// watch(
//   () => props.visible,
//   (newVal, oldVal) => {
//     if (newVal && !oldVal) {
//       console.log("formRef", formRef.value);
//       // When the component becomes visible (opened)
//       dpmUserStore.resetForm();
//       existingSignatureUrl.value = null;
//       formRef.value?.resetFields?.();
//     }
//     console.log("formRef1111", formRef.value);
//   }
// );

onUnmounted(() => {
      dpmUserStore.resetForm();
      existingSignatureUrl.value = null;
      formRef.value?.resetFields?.();
})

</script>

<template>
  <div class="dpm-user-list-container p-6">
    <div class="mb-8">
      <h3>
        {{
          isEditMode
            ? $t("departments.dpm_user.header_form.edit")
            : $t("departments.dpm_user.header_form.add")
        }}
      </h3>
    </div>

    <UiForm
      ref="formRef"
      :model="dpmUserFormModel"
      :rules="isEditMode ? updateDpmUserRules(t) : dpmUserRules(t)"
    >
      <div class="flex flex-col lg:flex-row lg:gap-8">
        <!-- Left Column: User Info -->
        <div class="flex-1 space-y-4">
          <UiFormItem
            :label="t('departments.dpm_user.field.signature')"
            name="signature_file"
            required
          >
            <UploadFile
              v-model="signatureFile"
              :width="'100%'"
              :height="'200px'"
              :upload-text="isEditMode ? 'ອັບເດດລາຍເຊັນ' : 'ອັບໂຫລດລາຍເຊັນ'"
              @onFileSelect="handleFileChange"
            />
          </UiFormItem>

          <!-- Username + Email -->
          <div class="flex flex-col md:flex-row md:gap-4">
            <UiFormItem
              class="flex-1"
              :label="t('user.form.username')"
              name="username"
              required
            >
              <UiInput
                v-model="dpmUserFormModel.username"
                placeholder="Enter Username"
              />
            </UiFormItem>

            <UiFormItem
              class="flex-1"
              :label="t('user.form.email')"
              name="email"
              required
            >
              <UiInput
                v-model="dpmUserFormModel.email"
                placeholder="example@gmail.com"
              />
            </UiFormItem>
          </div>

          <!-- Telephone -->
          <div class="flex flex-col md:flex-row md:gap-4">
            <UiFormItem
              class="flex-1"
              :label="t('user.form.tel')"
              name="tel"
              required
            >
              <UiInput
                @keypress="NumberOnly"
                v-model="dpmUserFormModel.tel"
                placeholder="20xx xxx xxx"
              />
            </UiFormItem>

            <UiFormItem
              class="flex-1"
              :label="t('departments.dpm_user.field.role')"
              name="roleIds"
              required
            >
              <InputSelect
                mode="multiple"
                v-model="dpmUserRoleIds"
                :options="roleItem"
                :placeholder="t('departments.dpm_user.placeholder.role')"
              />
            </UiFormItem>
          </div>
          <div class="flex flex-col md:flex-row md:gap-4">
            <UiFormItem
              class="flex-1"
              :label="t('departments.dpm_user.field.department')"
              name="departmentId"
              required
            >
              <InputSelect
                v-model="dpmUserFormModel.departmentId"
                :options="departmentItem"
                :placeholder="t('departments.dpm_user.placeholder.dpm')"
              />
            </UiFormItem>

            <UiFormItem
              class="flex-1"
              :label="t('departments.dpm_user.field.position')"
              name="position_id"
              required
            >
              <InputSelect
                v-model="dpmUserFormModel.position_id"
                :options="positionItem"
                :placeholder="t('departments.dpm_user.placeholder.position')"
              />
            </UiFormItem>
          </div>
          <div class="flex flex-col md:flex-row md:gap-4">
            <UiFormItem
              v-if="!isEditMode"
              class="flex-1"
              :label="t('user.form.password')"
              name="password"
              required
            >
              <UiInputPassword
                v-model="dpmUserFormModel.password"
                placeholder="*************"
              />
            </UiFormItem>

            <UiFormItem
              v-if="!isEditMode"
              class="flex-1"
              :label="t('user.form.confirmPassword')"
              name="confirm_password"
              required
            >
              <UiInputPassword
                v-model="dpmUserFormModel.confirm_password"
                placeholder="*************"
              />
            </UiFormItem>
          </div>
          <div class="flex-1 mt-6 lg:mt-0">
            <PermissionCard
              :permission-groups="permissionGroups"
              v-model="selectedPermissions"
            />
          </div>
        </div>
      </div>
      <div class="flex gap-2 pt-6">
        <UiButton
          @click="handlerCancel"
          colorClass="flex items-center justify-center text-orange-400"
        >
          {{ t("button.cancel") }}
        </UiButton>
        <UiButton
          type="primary"
          @click="handleSubmit"
          :loading="loading"
          colorClass="flex items-center justify-center"
        >
          {{ isEditMode ? t("button.update") : t("button.save") }}
        </UiButton>
      </div>
    </UiForm>
  </div>
</template>
<style scoped>
.dpm-user-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
