<script setup lang="ts">
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import { positionItem } from "@/modules/shared/utils/data.department";
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
const userStore = useUserStore();
const { push } = useRouter();
const route = useRoute();
const { t } = useI18n();
const formRef = ref();
const dpmStore = departmentStore();
const dpmUserStore = departmenUsertStore();
const loading = ref(false);
export interface UpdateDepartmentUserDTO {
  id: string;
  user_id: string | null;
  position_id: string | null;
  department_id: string | null;
  signature_file?: string | File | null;
}

// Determine if we're in edit mode based on route params
const isEditMode = computed(() => !!route.params.id);
const departmentUserId = computed(() => route.params.id as string);

// ✅ computed dropdown list based on store data
const departmentItem = computed(() =>
  dpmStore.departments.map((item) => ({
    value: item.getId(),
    label: item.getName(),
  }))
);
const userItem = computed(() =>
  userStore.users.map((item) => ({
    value: item.getId(),
    label: item.getUsername(),
  }))
);

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
      // } else {
      //   console.error("Department user not found");
      //   // Optionally redirect back to list or show error message
      //   // push({ name: 'department_user.index' });
      // }
      dpmUserFormModel.user_id = demo.user_id;
      dpmUserFormModel.position_id = demo.position_id;
      dpmUserFormModel.department_id = demo.department_id;
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

    if (isEditMode.value) {
      // Update existing department user - include ID in formData
      const updateData = {
        id: departmentUserId.value,
        user_id: dpmUserFormModel.user_id,
        position_id: dpmUserFormModel.position_id,
        department_id: dpmUserFormModel.department_id,
        signature_file: dpmUserFormModel.signature_file,
      };
      await dpmUserStore.updateDepartmentUser(updateData);
    } else {
      // Create new department user - no ID needed
      const createData = {
        user_id: dpmUserFormModel.user_id,
        position_id: dpmUserFormModel.position_id,
        department_id: dpmUserFormModel.department_id,
        signature_file: dpmUserFormModel.signature_file,
      };
      await dpmUserStore.createDepartmentUser(createData);
      console.log("Department user created successfully");
    }

    // Navigate back to list
    push({ name: "department_user.index" });
    dpmUserStore.resetForm();
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
};

onMounted(async () => {
  await dpmStore.fetchDepartment();
  await userStore.fetchUsers();
  // Load existing data if in edit mode
  await loadDepartmentUser();

  // Initialize signature file if it exists in form model
  if (dpmUserFormModel.signature_file) {
    signatureFile.value = dpmUserFormModel.signature_file;
  }
});
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
      <div class="flex flex-col md:flex-row md:gap-8">
        <!-- Input Section -->
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
              placeholder="upload"
              @update:modelValue="handleFileChange"
              @change="handleFileChange"
            />
          </UiFormItem>

          <UiFormItem
            :label="t('departments.dpm_user.field.user')"
            name="user_id"
            required
          >
            <InputSelect
              v-model="dpmUserFormModel.user_id"
              :options="userItem"
              :width="'50%'"
              :placeholder="t('departments.dpm_user.placeholder.user')"
            />
          </UiFormItem>

          <UiFormItem
            :label="t('departments.dpm_user.field.position')"
            name="position_id"
            required
          >
            <InputSelect
              v-model="dpmUserFormModel.position_id"
              :options="positionItem"
              :width="'50%'"
              :placeholder="t('departments.dpm_user.placeholder.position')"
            />
          </UiFormItem>

          <UiFormItem
            :label="t('departments.dpm_user.field.department')"
            name="department_id"
            required
          >
            <InputSelect
              v-model="dpmUserFormModel.department_id"
              :options="departmentItem"
              :width="'50%'"
              :placeholder="t('departments.dpm_user.placeholder.dpm')"
            />
          </UiFormItem>

          <div class="flex gap-2">
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
        </div>
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
