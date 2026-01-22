<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import CheckboxGroup from "@/common/shared/components/Input/CheckboxGroup.vue";

export interface Permission {
  id: number;
  display_name: string;
  display_name_lo?: string | null;
}

export interface PermissionGroup {
  id: number;
  name: string;
  display_name: string;
  display_name_lo?: string | null;
  type: string;
  permissions: Permission[];
}

const props = defineProps<{
  permissionData: PermissionGroup[];
  modelValue: (string | number)[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: (string | number)[]): void;
}>();

const { locale } = useI18n();

// Helper function to get display name based on locale
const getDisplayName = (item: Permission | PermissionGroup): string => {
  if (locale.value === 'la' && item.display_name_lo) {
    return item.display_name_lo;
  }
  return item.display_name;
};

const checkboxOptions = computed(() => {
  // Add locale as dependency to ensure reactivity when language changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentLocale = locale.value;
  const options: { label: string; value: number; group: string }[] = [];

  if (!props.permissionData || !Array.isArray(props.permissionData)) {
    return options;
  }

  props.permissionData.forEach((group) => {
    group.permissions?.forEach((perm) => {
      options.push({
        label: getDisplayName(perm),
        value: perm.id,
        group: getDisplayName(group),
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
    <CheckboxGroup
      v-model="selectedPermissions"
      :options="checkboxOptions"
      groupBy="group"
      :disabled="disabled"
    />
  </div>
</template>
