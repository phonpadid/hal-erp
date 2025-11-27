<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePermissions } from '@/modules/shared/utils/usePermissions';
import { PERMISSION_CONFIG, getPermissionByCategory, getPermissionsForRole, getPermissionInfo, getRoleInfo } from '@/modules/shared/utils/jsonPermission';
import { useNotification } from '@/modules/shared/utils/useNotification';

const { hasPermission, hasRole, isSuperAdmin } = usePermissions();
const { success, error } = useNotification();

// State
const activeTab = ref('overview');
const selectedRole = ref('super-admin');
const selectedCategory = ref('company');

// Computed properties
const categories = computed(() => Object.entries(PERMISSION_CONFIG.categories));
const roles = computed(() => Object.entries(PERMISSION_CONFIG.roles));
const permissions = computed(() => Object.entries(PERMISSION_CONFIG.permissions));

// Get permissions for selected role
const selectedRolePermissions = computed(() => {
  return getPermissionsForRole(selectedRole.value);
});

// Get permissions for selected category
const selectedCategoryPermissions = computed(() => {
  const categoryPerms = getPermissionByCategory(selectedCategory.value);
  return Object.entries(categoryPerms);
});

// Copy to clipboard
const copyPermissions = (text: string) => {
  navigator.clipboard.writeText(text);
  success('Copied!', 'Permissions copied to clipboard');
};

// Export configuration
const exportConfig = () => {
  const config = JSON.stringify(PERMISSION_CONFIG, null, 2);
  const blob = new Blob([config], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'permission-config.json';
  a.click();
  URL.revokeObjectURL(url);
  success('Exported!', 'Permission configuration exported successfully');
};

// Debug current user permissions
const debugUserPermissions = () => {
  console.log('=== USER PERMISSION DEBUG ===');
  console.log('Is Super Admin:', isSuperAdmin.value);
  console.log('Current User Roles:', localStorage.getItem('userRoles'));
  console.log('Current User Permissions:', localStorage.getItem('userPermissions'));
  success('Debug Complete!', 'Check console for permission details');
};
</script>

<template>
  <div class="permission-manager p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Permission Manager</h1>
        <p class="text-gray-600">Manage and view system permissions and roles</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4 mb-6">
        <button
          @click="exportConfig"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          📤 Export Config
        </button>
        <button
          @click="debugUserPermissions"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🐛 Debug User Permissions
        </button>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-sm mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              v-for="tab in ['overview', 'permissions', 'roles', 'categories']"
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'py-4 px-6 border-b-2 font-medium text-sm capitalize',
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-blue-50 p-4 rounded-lg">
                <h3 class="font-semibold text-blue-900 mb-2">Total Permissions</h3>
                <p class="text-3xl font-bold text-blue-600">{{ Object.keys(PERMISSION_CONFIG.permissions).length }}</p>
              </div>
              <div class="bg-green-50 p-4 rounded-lg">
                <h3 class="font-semibold text-green-900 mb-2">Total Roles</h3>
                <p class="text-3xl font-bold text-green-600">{{ Object.keys(PERMISSION_CONFIG.roles).length }}</p>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg">
                <h3 class="font-semibold text-purple-900 mb-2">Categories</h3>
                <p class="text-3xl font-bold text-purple-600">{{ Object.keys(PERMISSION_CONFIG.categories).length }}</p>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-4">Permission Distribution</h3>
              <div class="space-y-2">
                <div v-for="[categoryKey, category] in categories" :key="categoryKey" class="flex items-center justify-between">
                  <span class="text-gray-700">{{ category.name }}</span>
                  <span class="bg-gray-200 px-2 py-1 rounded text-sm">
                    {{ Object.values(PERMISSION_CONFIG.permissions).filter(p => p.category === categoryKey).length }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Permissions Tab -->
          <div v-if="activeTab === 'permissions'" class="space-y-4">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select v-model="selectedCategory" class="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-auto">
                <option value="">All Categories</option>
                <option v-for="[key, category] in categories" :key="key" :value="key">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="[permissionKey, permission] in Object.entries(PERMISSION_CONFIG.permissions)"
                :key="permissionKey"
                :class="[
                  'border rounded-lg p-4 hover:shadow-md transition-shadow',
                  selectedCategory && permission.category !== selectedCategory ? 'opacity-50' : ''
                ]"
              >
                <h4 class="font-semibold text-gray-900 mb-1">{{ permission.name }}</h4>
                <p class="text-sm text-gray-600 mb-2">{{ permission.description }}</p>
                <div class="flex items-center justify-between text-xs">
                  <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">{{ permission.category }}</span>
                  <button
                    @click="copyPermissions(permissionKey)"
                    class="text-gray-500 hover:text-gray-700"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Roles Tab -->
          <div v-if="activeTab === 'roles'" class="space-y-6">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
              <select v-model="selectedRole" class="border border-gray-300 rounded-lg px-3 py-2">
                <option v-for="[key, role] in roles" :key="key" :value="key">
                  {{ role.name }} (Level {{ role.level }})
                </option>
              </select>
            </div>

            <!-- Role Details -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold mb-4">
                {{ PERMISSION_CONFIG.roles[selectedRole]?.name }}
              </h3>
              <p class="text-gray-600 mb-4">{{ PERMISSION_CONFIG.roles[selectedRole]?.description }}</p>
              <div class="mb-4">
                <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  Level {{ getRoleInfo(selectedRole)?.level }}
                </span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Permissions ({{ selectedRolePermissions.length }})</h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="permission in selectedRolePermissions"
                    :key="permission"
                    class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                  >
                    {{ getPermissionInfo(permission)?.name || permission }}
                  </span>
                </div>
              </div>
            </div>

            <!-- All Roles -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">All Roles</h3>
              <div v-for="[key, role] in roles" :key="key" class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold text-gray-900">{{ role.name }}</h4>
                  <span class="text-sm text-gray-500">Level {{ role.level }}</span>
                </div>
                <p class="text-gray-600 text-sm mb-2">{{ role.description }}</p>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="perm in getPermissionsForRole(key).slice(0, 3)"
                    :key="perm"
                    class="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs"
                  >
                    {{ getPermissionInfo(perm)?.name || perm }}
                  </span>
                  <span
                    v-if="getPermissionsForRole(key).length > 3"
                    class="text-gray-500 text-xs"
                  >
                    +{{ getPermissionsForRole(key).length - 3 }} more
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Categories Tab -->
          <div v-if="activeTab === 'categories'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="[key, category] in categories"
              :key="key"
              class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-blue-600 text-lg">{{ category.icon }}</span>
                </div>
                <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
              </div>
              <p class="text-gray-600 mb-4">{{ category.description }}</p>
              <div class="text-sm text-gray-500">
                <strong>Permissions:</strong>
                {{ Object.values(PERMISSION_CONFIG.permissions).filter(p => p.category === key).length }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.permission-manager {
  font-family: system-ui, -apple-system, sans-serif;
}
</style>