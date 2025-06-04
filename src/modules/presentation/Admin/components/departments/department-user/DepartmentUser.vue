<script setup lang="ts">
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { onMounted, ref, computed, watch } from "vue";
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

// Import the Permission Card component
import PermissionCard from "./PermissionCard.vue";

const userStore = useUserStore();
const positionStore = usePositionStore();
const { push } = useRouter();
const route = useRoute();
const { t } = useI18n();
const formRef = ref();
const dpmStore = departmentStore();
const dpmUserStore = departmenUsertStore();
const permissionStore = usePermissionStore()
const loading = ref(false);

// Use permissions directly from form model
const selectedPermissions = computed({
  get: () => dpmUserFormModel.permissions,
  set: (value: number[]) => {
    dpmUserFormModel.permissions = value;
  }
});

// Determine if we're in edit mode based on route params
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

// Get permission groups from store
const permissionGroups = computed(() => permissionStore.permission || []);

// Add reactive reference for signature file to ensure proper binding
const signatureFile = ref(dpmUserFormModel.signature_file || null);

// Watch for changes in signature file and update the form model
watch(
  signatureFile,
  (newValue) => {
    console.log("Signature file changed:", newValue);
    dpmUserFormModel.signature_file = newValue;
  },
  { deep: true }
);

// Also watch the form model to keep them in sync
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

const demo = {
  user_id: "1",
  position_id: "1",
  department_id: "2",
};

// Load existing data for edit mode
const loadDepartmentUser = async () => {
  if (isEditMode.value && departmentUserId.value) {
    try {
      loading.value = true;
      // await dpmUserStore.fetchDepartmentUserById(departmentUserId.value);
      // const departmentUser = dpmUserStore.currentDpmUser;

      // // Check if departmentUser exists before accessing its properties
      // if (departmentUser) {
      //   // Populate form with existing data
      //   dpmUserFormModel.user_id = departmentUser.getUser_id();
      //   dpmUserFormModel.position_id = departmentUser.getPosition_id();
      //   dpmUserFormModel.department_id = departmentUser.getdepartment_id();
      //   dpmUserFormModel.signature_file = departmentUser.getSignature_file();
      //   signatureFile.value = departmentUser.getSignature_file();
      //   // Load existing permissions
      //   selectedPermissions.value = departmentUser.getPermissions() || [];
      // } else {
      //   console.error("Department user not found");
      // }

      console.log("Department user data loaded for edit:", demo);
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
      console.error("Signature file is required but not set");
      // Manually trigger validation for signature_file
      await formRef.value.validateField("signature_file");
      return;
    }
    const payload = {
      user: {
        id: dpmUserFormModel.id,
        username: dpmUserFormModel.username,
        email: dpmUserFormModel.email,
        password: dpmUserFormModel.password,
        tel: dpmUserFormModel.tel,
      },
      position_id: dpmUserFormModel.position_id,
      // department_id: dpmUserFormModel.department_id,
      signature_file: dpmUserFormModel.signature_file,
      permissions: dpmUserFormModel.permissions,
    };

    if (isEditMode.value) {
      await dpmUserStore.updateDepartmentUser({
        id: departmentUserId.value,
        ...payload,
      });
    } else {
      await dpmUserStore.createDepartmentUser(payload);
    }

    // Navigate back to list
    push({ name: "department_user.index" });
    dpmUserStore.resetForm();
    // selectedPermissions will be reset when form model is reset
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleFileChange = (fileOrEvent: any) => {
  let actualFile = null;

  // Check if it's an Event object (DOM event)
  if (fileOrEvent && fileOrEvent.target && fileOrEvent.target.files) {
    actualFile = fileOrEvent.target.files[0] || null;
  } else if (
    fileOrEvent &&
    fileOrEvent.constructor &&
    fileOrEvent.constructor.name === "File"
  ) {
    actualFile = fileOrEvent;
  } else if (fileOrEvent && typeof fileOrEvent === "string") {
    actualFile = fileOrEvent;
  } else {
    actualFile = fileOrEvent;
  }

  signatureFile.value = actualFile;
  dpmUserFormModel.signature_file = actualFile;
};

const handlerCancel = () => {
  push({ name: "department_user.index" });
  dpmUserStore.resetForm();
  // selectedPermissions will be reset when form model is reset
};

onMounted(async () => {
  await dpmStore.fetchDepartment();
  await userStore.fetchUsers();
  await positionStore.fetchPositions();
  await permissionStore.fetchPermission();
  // Load existing data if in edit mode
  await loadDepartmentUser();

  // Initialize signature file if it exists in form model
  if (dpmUserFormModel.signature_file) {
    signatureFile.value = dpmUserFormModel.signature_file;
  }

  // Initialize permissions if they exist in the loaded data
  // selectedPermissions will automatically reflect dpmUserFormModel.permissions
});

const props = defineProps<{
  visible: boolean;
}>();

watch(
  () => props.visible,
  (newVal, oldVal) => {
    if (!newVal && oldVal) {
      dpmUserStore.resetForm();
      // selectedPermissions will be reset when form model is reset
      formRef.value?.resetFields?.(); // Also reset UIForm if it supports it
    }
  }
);
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

    <UiForm ref="formRef" :model="dpmUserFormModel" :rules="dpmUserRules(t)">
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
              upload-text="ອັບໂຫລດລາຍເຊັນ"
              @update:modelValue="handleFileChange"
              @change="handleFileChange"
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
          <UiFormItem
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

          <!-- Department + Position -->
          <div class="flex flex-col md:flex-row md:gap-4">
            <UiFormItem
              class="flex-1"
              :label="t('departments.dpm_user.field.department')"
              name="department_id"
              required
            >
              <InputSelect
                v-model="dpmUserFormModel.position_id"
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

          <!-- Password + Confirm -->
          <div class="flex flex-col md:flex-row md:gap-4">
            <UiFormItem
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
          <!-- Right Column: Permissions -->
        <div class="flex-1 mt-6 lg:mt-0">
          <PermissionCard
            :permission-groups="permissionGroups"
            v-model="selectedPermissions"
          />
        </div>
        </div>
      </div>

      <!-- Buttons -->
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
