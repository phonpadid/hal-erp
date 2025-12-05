<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { usePermissionStore } from "../../../stores/permission.store";
import { departmentStore } from "../../../stores/departments/department.store";
import { useRoleStore } from "../../../stores/role.store";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import PermissionSelector from "../../permission/PermissionSelector.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";
import type { Role } from "@/modules/domain/entities/role.entities";

const props = defineProps<{
  initialData?: {
    role_id?: number;
    role_name?: string;
    name?: string; // Department role name from API response
    department_id?: number;
    department_name?: string;
    permissions?: number[];
  };
  isEdit?: boolean;
}>();

const { t } = useI18n();
const emit = defineEmits<{
  (event: "submit", value: { role_id: number; department_id: number; permissions: number[] }): void;
}>();
console.log('kkkk:', props.initialData);
console.log('Initial permissions:', props.initialData?.permissions);

// Initialize stores
const dpmStore = departmentStore();
const roleStore = useRoleStore();
const permissionStore = usePermissionStore();
const { departments } = storeToRefs(dpmStore);
const { roles } = storeToRefs(roleStore);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const permissionData = ref<any[]>([]);
const loadingPermissions = ref(false);

const handlePermissionSelect = (values: (string | number)[]) => {
  formState.permissions = values;
};

interface FormState {
  role_id: number | null;
  department_id: number | null;
  permissions: (string | number)[];
}

// Form state
const formState = reactive<FormState>({
  role_id: props.initialData?.role_id ? Number(props.initialData.role_id) : null,
  department_id: props.initialData?.department_id ? Number(props.initialData.department_id) : null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permissions: props.initialData?.permissions?.map((per: any) => {
    // Extract ID from permission object or return as-is if it's already an ID
    if (typeof per === 'object' && per.id) {
      return per.id;
    }
    return per;
  }) || [],
});

// Computed options
const roleOptions = computed(() => {
  if (!roles.value || roles.value.length === 0) {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options = roles.value.map((role: any) => ({
    label: role.getDisplayname() || role.getName(),
    value: Number(role.getId()),
  }));
  return options;
});

const departmentOptions = computed(() => {
  if (!departments.value || departments.value.length === 0) {
    return [];
  }
  const options = departments.value.map((dept) => ({
    label: dept.getName(),
    value: Number(dept.getId()),
  }));
  return options;
});



// Watch for roles being loaded to update role name when editing
watch(
  [() => roles.value, () => formState.role_id, () => props.isEdit],
  () => {
    if (props.isEdit && formState.role_id && roles.value && roles.value.length > 0) {
      const selectedRole = roles.value.find((role: Role) => Number(role.getId()) === formState.role_id);
      if (selectedRole) {
        console.log("Found role for edit:", selectedRole.getDisplayname() || selectedRole.getName());
      }
    }
  },
  { immediate: true }
);

// Watch for initial data changes
watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      console.log('Initial data changed, setting permissions:', newVal.permissions);
      formState.role_id = newVal.role_id ? Number(newVal.role_id) : null;
      formState.department_id = newVal.department_id ? Number(newVal.department_id) : null;
      // Extract just the IDs from permission objects
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formState.permissions = newVal.permissions?.map((per: any) => {
        if (typeof per === 'object' && per.id) {
          return per.id;
        }
        return per;
      }) || [];
      console.log('Form state permissions after watcher:', formState.permissions);
    }
  },
  { immediate: true }
);

// Watch form state permissions for debugging
watch(
  () => formState.permissions,
  (newPermissions, oldPermissions) => {
    console.log('Form permissions changed:', {
      from: oldPermissions,
      to: newPermissions,
      length: newPermissions?.length || 0
    });
  },
  { immediate: true, deep: true }
);

// Load data on mount
onMounted(async () => {
  try {
    loadingPermissions.value = true;
    // Load departments, roles, and permissions
    await Promise.all([
      dpmStore.fetchDepartment({ page: 1, limit: 100 }),
      roleStore.fetchAllRoles({ page: 1, limit: 100 }),
      permissionStore.fetchPermission()
    ]);
    const result = await permissionStore.fetchPermission();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    permissionData.value = result.data as unknown as any[];

    if (props.initialData) {
      formState.role_id = props.initialData.role_id ? Number(props.initialData.role_id) : null;
      formState.department_id = props.initialData.department_id ? Number(props.initialData.department_id) : null;
      // Extract just the IDs from permission objects
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formState.permissions = props.initialData.permissions?.map((per:any) => {
        if (typeof per === 'object' && per.id) {
          return per.id;
        }
        return per;
      }) || [];
      // If we have initial permissions, wait a tick and verify they're set
      setTimeout(() => {
        console.log('onMounted: Form permissions after timeout:', formState.permissions);
      }, 100);
    }
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    loadingPermissions.value = false;
  }
});

// Form submission
const handleSubmit = () => {
  if (!formState.role_id || formState.role_id === 0) {
    return;
  }
  if (!formState.department_id || formState.department_id === 0) {
    return;
  }

  emit("submit", {
    role_id: Number(formState.role_id),
    department_id: Number(formState.department_id),
    permissions: formState.permissions.map(Number),
  });
};
</script>

<template>
  <div class="user-form">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="flex gap-4 mb-4 form-grid">
        <div>
          <span><span class="text-red-600">*</span>{{ t("departments.dpm_user.field.role") }}</span>
          <InputSelect
            v-model="formState.role_id"
            :options="roleOptions"
            label="Role"
            placeholder="Select role"
            required
          />
        </div>
        <div>
          <span><span class="text-red-600">*</span>{{ t("departments.dpm.field.name") }}</span>
          <InputSelect
            v-model="formState.department_id"
            :options="departmentOptions"
            label="Department"
            placeholder="Select department"
            required
          />
        </div>
      </div>
      <a-divider style="margin-bottom: 10px; margin-top: -10px" />
      <div class="form-section">
        <h2 class="section-title">
          <span class="text-red-600">*</span> {{ t("permissions.title") }}
          <!-- <span class="permission-count">
            ({{ formState.permissions.map((per) => per) }} {{ t("user.form.selected") }})
          </span> -->
        </h2>
        <a-spin :spinning="loadingPermissions">
          <PermissionSelector
            v-model="formState.permissions"
            :permissionData="permissionData"
            @update:modelValue="handlePermissionSelect"
          />
        </a-spin>
      </div>

      <div class="form-actions">
        <UiButton type="primary" colorClass="flex items-center" htmlType="submit">
          {{ props.isEdit ? t("button.edit") : t("button.save") }}
        </UiButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.user-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
}

.form-section {
  background: white;
  border-radius: 8px;
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
