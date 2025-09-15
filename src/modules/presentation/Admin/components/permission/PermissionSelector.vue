<script setup lang="ts">
import { computed } from "vue";
import CheckboxGroup from "@/common/shared/components/Input/CheckboxGroup.vue";

export interface Permission {
  id: number;
  display_name: string;
}

export interface PermissionGroup {
  id: number;
  name: string;
  display_name: string;
  type: string;
  permissions: Permission[];
}

const props = defineProps<{
  permissionData: PermissionGroup[];
  modelValue: (string | number)[];
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: (string | number)[]): void;
}>();

const checkboxOptions = computed(() => {
  const options: { label: string; value: number; group: string }[] = [];

  if (!props.permissionData || !Array.isArray(props.permissionData)) {
    return options;
  }

  props.permissionData.forEach((group) => {
    group.permissions?.forEach((perm) => {
      options.push({
        label: perm.display_name,
        value: perm.id,
        group: group.display_name,
      });
    });
  });

  return options;
});

const selectedPermissions = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<template>
  <div class="permission-selector">
    <CheckboxGroup v-model="selectedPermissions" :options="checkboxOptions" groupBy="group" />
  </div>
</template>
