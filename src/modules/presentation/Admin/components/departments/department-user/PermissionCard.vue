<template>
  <div class="permission-card">
    <h4 class="text-lg font-semibold mb-4">{{ $t('departments.dpm_user.field.permissions') }}</h4>
pp:{{ props }}
    <div class="space-y-4">
      <div
        v-for="group in props.permissionGroups"
        :key="group.id"
        class="permission-group border border-gray-200 rounded-lg p-4"
      >
        <!-- Group Header with Select All -->
        <div class="flex items-center justify-between mb-3">
          <h5 class="font-medium text-gray-800">{{ group.display_name }}</h5>
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="isGroupFullySelected(group)"
              :indeterminate="isGroupPartiallySelected(group)"
              @change="onGroupCheckboxChange($event, group)"
              class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm text-gray-600">Select All</span>
          </label>
        </div>

        <!-- Individual Permissions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="permission in group.permissions"
            :key="permission.id"
            class="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded"
          >
            <input
              type="checkbox"
              :value="permission.id"
              v-model="selectedPermissions"
              class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm text-gray-700">{{ formatPermissionName(permission.name) }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Permission {
  id: number;
  name: string;
}

interface PermissionGroup {
  id: number;
  name: string;
  display_name: string;
  type: string;
  permissions: Permission[];
}

const props = defineProps<{
  permissionGroups: PermissionGroup[];
  modelValue: number[];
}>();
console.log('per:', props.permissionGroups);

const emit = defineEmits<{
  'update:modelValue': [value: number[]];
}>();

const selectedPermissions = computed({
  get: () => props.modelValue || [],
  set: (value: number[]) => emit('update:modelValue', value),
});

// Handle change event safely to avoid TypeScript template casting
const onGroupCheckboxChange = (event: Event, group: PermissionGroup) => {
  const target = event.target as HTMLInputElement;
  toggleGroupSelection(group, target?.checked);
};

// Check if all permissions in a group are selected
const isGroupFullySelected = (group: PermissionGroup): boolean => {
  if (!group.permissions.length) return false;
  return group.permissions.every(permission =>
    selectedPermissions.value.includes(permission.id)
  );
};

// Check if some (but not all) permissions in a group are selected
const isGroupPartiallySelected = (group: PermissionGroup): boolean => {
  const selectedCount = group.permissions.filter(permission =>
    selectedPermissions.value.includes(permission.id)
  ).length;
  return selectedCount > 0 && selectedCount < group.permissions.length;
};

// Toggle all permissions in a group
const toggleGroupSelection = (group: PermissionGroup, isSelected: boolean) => {
  const groupPermissionIds = group.permissions.map(p => p.id);

  if (isSelected) {
    const newPermissions = [
      ...selectedPermissions.value,
      ...groupPermissionIds.filter(id => !selectedPermissions.value.includes(id)),
    ];
    selectedPermissions.value = newPermissions;
  } else {
    selectedPermissions.value = selectedPermissions.value.filter(
      id => !groupPermissionIds.includes(id)
    );
  }
};

// Format permission name for display
const formatPermissionName = (name: string): string => {
  return name
    .replace(/^(read-|write-|update-|delete-)/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
</script>

<style scoped>
.permission-group {
  transition: all 0.2s ease;
}
.permission-group:hover {
  border-color: #d1d5db;
}

/* Indeterminate checkbox state style */
input[type="checkbox"]:indeterminate {
  background-color: #3b82f6;
  border-color: #3b82f6;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M4 8h8'/%3e%3c/svg%3e");
}
</style>
