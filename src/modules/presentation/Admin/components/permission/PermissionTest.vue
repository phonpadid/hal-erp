<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePermissions } from '@/modules/shared/utils/usePermissions';
import {
  PERMISSION_CONFIG,
  getPermissionsForRole,
  getPermissionInfo,
  getRoleInfo,
  getAllPermissions,
  getAllRoles
} from '@/modules/shared/utils/jsonPermission';

const {
  hasPermission,
  hasRole,
  isSuperAdmin,
  canCreateCompany,
  canCreateUser,
  debugPermissions
} = usePermissions();

// Test data
const testResults = ref<Array<{test: string, result: boolean, details?: string}>>([]);
const isExpanded = ref(false);

const runTests = () => {
  testResults.value = [];

  // Test 1: Permission System Loading
  try {
    const allPerms = getAllPermissions();
    const allRoles = getAllRoles();
    testResults.value.push({
      test: 'JSON Config Loading',
      result: allPerms.length > 0 && allRoles.length > 0,
      details: `Found ${allPerms.length} permissions and ${allRoles.length} roles`
    });
  } catch (error) {
    testResults.value.push({
      test: 'JSON Config Loading',
      result: false,
      details: `Error: ${error}`
    });
  }

  // Test 2: Permission Functions
  try {
    const superAdminPerms = getPermissionsForRole('super-admin');
    testResults.value.push({
      test: 'Super Admin Permissions',
      result: superAdminPerms.length > 0,
      details: `Super admin has ${superAdminPerms.length} permissions`
    });
  } catch (error) {
    testResults.value.push({
      test: 'Super Admin Permissions',
      result: false,
      details: `Error: ${error}`
    });
  }

  // Test 3: Permission Info Functions
  try {
    const permInfo = getPermissionInfo('create-company');
    const roleInfo = getRoleInfo('admin');
    testResults.value.push({
      test: 'Permission Info Functions',
      result: permInfo !== null && roleInfo !== null,
      details: `Permission info and role info functions working`
    });
  } catch (error) {
    testResults.value.push({
      test: 'Permission Info Functions',
      result: false,
      details: `Error: ${error}`
    });
  }

  // Test 4: usePermissions Composable
  try {
    const hasCreateCompany = canCreateCompany.value;
    const hasCreateUser = canCreateUser.value;
    testResults.value.push({
      test: 'usePermissions Composable',
      result: typeof hasCreateCompany === 'boolean' && typeof hasCreateUser === 'boolean',
      details: `Can create company: ${hasCreateCompany}, Can create user: ${hasCreateUser}`
    });
  } catch (error) {
    testResults.value.push({
      test: 'usePermissions Composable',
      result: false,
      details: `Error: ${error}`
    });
  }

  // Test 5: Mock Permission Checks
  try {
    const mockHasPermission = hasPermission('test-permission');
    const mockHasRole = hasRole('test-role');
    testResults.value.push({
      test: 'Mock Permission/Role Checks',
      result: typeof mockHasPermission === 'boolean' && typeof mockHasRole === 'boolean',
      details: `Has permission: ${mockHasPermission}, Has role: ${mockHasRole}`
    });
  } catch (error) {
    testResults.value.push({
      test: 'Mock Permission/Role Checks',
      result: false,
      details: `Error: ${error}`
    });
  }

  // Test 6: Type Safety
  try {
    // Test that we can access permission config without errors
    const configAccess = !!PERMISSION_CONFIG.permissions;
    testResults.value.push({
      test: 'Config Access',
      result: configAccess,
      details: `Permission config accessible`
    });
  } catch (error) {
    testResults.value.push({
      test: 'Config Access',
      result: false,
      details: `Error: ${error}`
    });
  }
};

const getTestStatus = () => {
  const passed = testResults.value.filter(t => t.result).length;
  const total = testResults.value.length;
  return { passed, total, status: passed === total ? '✅ All Passed' : '❌ Some Failed' };
};

const copyTestResults = () => {
  const results = JSON.stringify(testResults.value, null, 2);
  navigator.clipboard.writeText(results);
  console.log('Test results copied to clipboard');
};

onMounted(() => {
  runTests();
});
</script>

<template>
  <div class="permission-test p-6 bg-gray-50 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Permission System Tests</h1>
        <p class="text-gray-600">Run comprehensive tests on the permission system</p>
      </div>

      <!-- Test Summary -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Test Summary</h2>
          <button
            @click="isExpanded = !isExpanded"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {{ isExpanded ? 'Hide Details' : 'Show Details' }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ getTestStatus().total }}</div>
            <div class="text-sm text-gray-500">Total Tests</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ getTestStatus().passed }}</div>
            <div class="text-sm text-gray-500">Passed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold" :class="getTestStatus().passed === getTestStatus().total ? 'text-green-600' : 'text-red-600'">
              {{ getTestStatus().status }}
            </div>
            <div class="text-sm text-gray-500">Status</div>
          </div>
        </div>

        <div class="flex gap-4">
          <button
            @click="runTests"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            🔄 Run Tests
          </button>
          <button
            @click="copyTestResults"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📋 Copy Results
          </button>
          <button
            @click="debugPermissions()"
            class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            🐛 Debug Permissions
          </button>
        </div>
      </div>

      <!-- Test Results -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 class="text-xl font-semibold">Test Results</h2>
        </div>
        <div class="divide-y divide-gray-200">
          <div
            v-for="(test, index) in testResults"
            :key="index"
            class="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span
                  :class="[
                    'text-sm font-medium px-2 py-1 rounded',
                    test.result
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ test.result ? '✅' : '❌' }}
                </span>
                <span class="font-medium text-gray-900">{{ test.test }}</span>
              </div>
              <div class="text-sm text-gray-600">
                {{ test.details }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expanded Details -->
      <div v-if="isExpanded" class="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h3 class="text-lg font-semibold mb-4">Detailed Information</h3>

        <!-- Permission Count -->
        <div class="mb-6">
          <h4 class="font-medium text-gray-900 mb-2">System Statistics</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 p-3 rounded">
              <div class="text-lg font-semibold text-blue-900">{{ getAllPermissions().length }}</div>
              <div class="text-sm text-blue-600">Total Permissions</div>
            </div>
            <div class="bg-green-50 p-3 rounded">
              <div class="text-lg font-semibold text-green-900">{{ getAllRoles().length }}</div>
              <div class="text-sm text-green-600">Total Roles</div>
            </div>
            <div class="bg-purple-50 p-3 rounded">
              <div class="text-lg font-semibold text-purple-900">{{ Object.keys(PERMISSION_CONFIG.categories).length }}</div>
              <div class="text-sm text-purple-600">Categories</div>
            </div>
            <div class="bg-orange-50 p-3 rounded">
              <div class="text-lg font-semibold text-orange-900">{{ Object.keys(PERMISSION_CONFIG.modules).length }}</div>
              <div class="text-sm text-orange-600">Modules</div>
            </div>
          </div>
        </div>

        <!-- Role Permissions -->
        <div>
          <h4 class="font-medium text-gray-900 mb-2">Role Permissions Sample</h4>
          <div class="space-y-2">
            <div
              v-for="role in getAllRoles().slice(0, 5)"
              :key="role"
              class="bg-gray-50 p-3 rounded border-l-4 border-blue-500"
            >
              <div class="font-medium text-gray-900">{{ getRoleInfo(role)?.name || role }}</div>
              <div class="text-sm text-gray-600 mt-1">
                {{ getPermissionsForRole(role).slice(0, 3).join(', ') }}
                <span v-if="getPermissionsForRole(role).length > 3">
                  +{{ getPermissionsForRole(role).length - 3 }} more
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.permission-test {
  font-family: system-ui, -apple-system, sans-serif;
}
</style>