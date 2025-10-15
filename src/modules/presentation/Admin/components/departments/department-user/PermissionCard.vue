<template>
  <div class="permission-card">
    <h4 class="text-lg font-bold mb-4">
      {{ $t("departments.dpm_user.field.permission") }}
    </h4>
    <div class="space-y-4 flex-2 flex flex-col">
  <div
    v-for="group in processedGroups"
    :key="group.id"
    class="permission-group border border-gray-200 rounded-lg p-4"
  >
    <!-- Group Header with Select All -->
    <div class="flex items-center justify-between mb-3">
      <label class="flex items-center cursor-pointer space-x-2">
        <input
          type="checkbox"
          :checked="isGroupFullySelected(group)"
          :indeterminate="isGroupPartiallySelected(group)"
          @change="onGroupCheckboxChange($event, group)"
          class="h-4 w-4 text-red-600 focus:ring-red-700 border-gray-300 rounded"
        />
        <h5 class="font-bold text-gray-800 m-0 leading-none">
          {{ group.display_name }}
        </h5>
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
          :checked="selectedPermissions.includes(permission.id)"
          @change="togglePermission(permission.id)"
          class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span class="text-sm text-gray-700">
          {{ formatPermissionName(permission.name) }}
        </span>
      </label>
    </div>
  </div>
</div>

  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoleStore } from "../../../stores/role.store";
const roleStore = useRoleStore();
interface Permission {
  id: number;
  name: string;
  group?: string; // Optional group field
}

interface PermissionGroup {
  id: number;
  name: string;
  display_name: string;
  type: string;
  permissions: Permission[];
}

const props = defineProps<{
  permissionGroups?: PermissionGroup[];
  permissions?: Permission[]; // Alternative prop for flat permission list
  modelValue: number[];
  selectedRoleIds?: number[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number[]];
}>();

// const selectedPermissions = computed({
//   get: () => props.modelValue || [],
//   set: (value: number[]) => emit("update:modelValue", value),
// });

const rolePermissions = computed(() => {
  if (!props.selectedRoleIds?.length) return [];
  
  const permissionSet = new Set<number>();
  
  props.selectedRoleIds.forEach(roleId => {
    const role = roleStore.roles.find(r => Number(r.getId()) === roleId);
    if (role) {
      const permissions = role.getPermissions?.() || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      permissions.forEach((permission: any) => {
        if (permission.id) {
          permissionSet.add(permission.id);
        }
      });
    }
  });
  
  return Array.from(permissionSet);
});

// Filter permission groups to only show permissions that exist in selected roles
const processedGroups = computed(() => {
  if (!props.permissionGroups?.length) return [];
  
  return props.permissionGroups.map(group => ({
    ...group,
    permissions: group.permissions.filter(permission => 
      rolePermissions.value.includes(permission.id)
    )
  })).filter(group => group.permissions.length > 0); // Only show groups with permissions
});

const selectedPermissions = computed({
  get: () => props.modelValue || [],
  set: (value: number[]) => {
    // Only allow selecting permissions that exist in roles
    const filteredValue = value.filter(id => rolePermissions.value.includes(id));
    emit("update:modelValue", filteredValue);
  }
});

// Toggle individual permission
const togglePermission = (permissionId: number) => {
  const currentValues = [...selectedPermissions.value];
  const index = currentValues.indexOf(permissionId);

  if (index === -1) {
    currentValues.push(permissionId);
  } else {
    currentValues.splice(index, 1);
  }

  selectedPermissions.value = currentValues;
};

// Handle change event safely to avoid TypeScript template casting
const onGroupCheckboxChange = (event: Event, group: PermissionGroup) => {
  const target = event.target as HTMLInputElement;
  toggleGroupSelection(group, target?.checked);
};

// Check if all permissions in a group are selected
const isGroupFullySelected = (group: PermissionGroup): boolean => {
  if (!group.permissions.length) return false;
  return group.permissions.every((permission) =>
    selectedPermissions.value.includes(permission.id)
  );
};

// Check if some (but not all) permissions in a group are selected
const isGroupPartiallySelected = (group: PermissionGroup): boolean => {
  const selectedCount = group.permissions.filter((permission) =>
    selectedPermissions.value.includes(permission.id)
  ).length;
  return selectedCount > 0 && selectedCount < group.permissions.length;
};

// Toggle all permissions in a group
const toggleGroupSelection = (group: PermissionGroup, isSelected: boolean) => {
  const groupPermissionIds = group.permissions.map((p) => p.id);
  let currentValues = [...selectedPermissions.value];

  if (isSelected) {
    // Add all group permissions that aren't already selected
    groupPermissionIds.forEach((id) => {
      if (!currentValues.includes(id)) {
        currentValues.push(id);
      }
    });
  } else {
    // Remove all group permissions
    currentValues = currentValues.filter(
      (id) => !groupPermissionIds.includes(id)
    );
  }

  selectedPermissions.value = currentValues;
};

// Format permission name for display
const formatPermissionName = (name: string): string => {
  return name
    .replace(/^(-|-|-|-)/, "") // Remove action prefixes
    .split("-") // Split by hyphens
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(" "); // Join with spaces
};
// Watch for changes in role permissions and update selected permissions
watch(rolePermissions, (newPermissions) => {
  // Remove any selected permissions that are no longer available in roles
  const validSelections = selectedPermissions.value.filter(id => 
    newPermissions.includes(id)
  );
  if (validSelections.length !== selectedPermissions.value.length) {
    selectedPermissions.value = validSelections;
  }
}, { immediate: true });

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
