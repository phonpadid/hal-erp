<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import type { PermissionGroup } from "@/modules/interfaces/permission.interface";
import { departmentStore } from "../../stores/departments/department.store";
import { useI18n } from "vue-i18n";
import { usePermissionStore } from "../../stores/permission.store";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import InputSelect from "@/common/shared/components/Input/InputSelect.vue";
import PermissionSelector from "../permission/PermissionSelector.vue";
import UiButton from "@/common/shared/components/button/UiButton.vue";

const props = defineProps<{
  initialData?: {
    department_id?: number;
    department_name?: string;
    name?: string;
    permissions?: number[];
  };
  isEdit?: boolean;
}>();
const { t } = useI18n();
const emit = defineEmits<{
  (event: "submit", value: { department_id?: number; name: string; permissions: number[] }): void;
}>();

// Initialize department store
const dpmStore = departmentStore();
const { departments } = storeToRefs(dpmStore);
const permissionData = ref<PermissionGroup[]>([]);
const loadingPermissions = ref(false);
const permissionStore = usePermissionStore();
const handlePermissionSelect = (values: (string | number)[]) => {
  formState.permissions = values;
};

interface FormState {
  department_id: number[];
  name: string;
  permissions: (string | number)[];
}

//  formState
const formState = reactive<FormState>({
  department_id: props.initialData?.department_id ? [Number(props.initialData.department_id)] : [],
  name: props.initialData?.name || "",
  permissions: props.initialData?.permissions || [],
});

//  departmentOptions
const departmentOptions = computed(() => {
  return departments.value.map((dept) => ({
    label: dept.getName(),
    value: Number(dept.getId()),
  }));
});

// watch
watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      formState.department_id = newVal.department_id ? [Number(newVal.department_id)] : [];
      formState.name = newVal.name || "";
      formState.permissions = newVal.permissions || [];
    }
  },
  { immediate: true }
);

//  onMounted
onMounted(async () => {
  try {
    loadingPermissions.value = true;
    const result = await permissionStore.fetchPermission();
    permissionData.value = result.data as unknown as PermissionGroup[];
    if (props.initialData) {
      formState.department_id = props.initialData.department_id
        ? [Number(props.initialData.department_id)]
        : [];
      formState.name = props.initialData.name || "";
      formState.permissions = props.initialData.permissions || [];
    }
  } catch (error) {
    console.error("Error loading roles and permissions:", error);
  } finally {
    loadingPermissions.value = false;
  }
});

// Form submission
const handleSubmit = () => {
  emit("submit", {
    department_id: Number(formState.department_id),
    name: formState.name,
    permissions: formState.permissions.map(Number),
  });
};

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      formState.department_id = newVal.department_id ? [Number(newVal.department_id)] : [];
      formState.name = newVal.name || "";
      formState.permissions = newVal.permissions || [];
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="user-form">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="flex gap-4 mb-4 form-grid">
        <div>
          <span> <span class="text-red-600">*</span>{{ t("role.form.department") }}</span>
          <InputSelect
            v-model="formState.department_id"
            :options="departmentOptions"
            label="Department"
            placeholder="Select department"
            required
          />
        </div>
        <div>
          <span><span class="text-red-600">*</span>{{ t("role.form.name") }}</span>
          <UiInput
            v-model="formState.name"
            label="Role Name"
            placeholder="Enter role name"
            required
          />
        </div>
      </div>
      <a-divider style="margin-bottom: 10px; margin-top: -10px" />
      <div class="form-section">
        <h2 class="section-title">
         <span class="text-red-600">*</span> {{ t("user.form.permissions") }}
          <span class="permission-count">
            ({{ formState.permissions.length }} {{ t("user.form.selected") }})
          </span>
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
          {{ props.isEdit ? t("role.form.update") : t("role.form.create") }}
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
