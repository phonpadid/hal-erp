import { computed } from 'vue';
import { useAuthStore } from '../../presentation/Admin/stores/authentication/auth.store';
import {
  PERMISSION_CONFIG,
  getPermissionsForRole,
  getPermissionInfo,
  getRoleInfo
} from './jsonPermission';

// Export permission constants for backward compatibility
export const PERMISSIONS = {
  CREATE_COMPANY: 'create-company',
  EDIT_COMPANY: 'edit-company',
  DELETE_COMPANY: 'delete-company',
  VIEW_COMPANY_LIST: 'view-company-list',
  MANAGE_COMPANY_USERS: 'manage-company-users',
  WRITE_PURCHASE_REQUEST: 'write-purchase-request',
  APPROVE_PURCHASE_REQUEST: 'approve-purchase-request',
  REJECT_PURCHASE_REQUEST: 'reject-purchase-request',
  CREATE_PAYMENT_DOCUMENT: 'create-payment-document',
  CREATE_USER: 'create-user',
  EDIT_USER: 'edit-user',
  DELETE_USER: 'delete-user',
  VIEW_USER_LIST: 'view-user-list',
  MANAGE_BUDGET: 'manage-budget',
  VIEW_BUDGET: 'view-budget',
  APPROVE_BUDGET: 'approve-budget',
  ACCESS_ADMIN_PANEL: 'access-admin-panel',
  VIEW_REPORTS: 'view-reports',
  EXPORT_DATA: 'export-data',
} as const;

// Export role constants for backward compatibility
export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  COMPANY_ADMIN: 'company-admin',
  COMPANY_USER: 'company-user',
  BUDGET_ADMIN: 'budget-admin',
  BUDGET_USER: 'budget-user',
} as const;

// Define permission type
type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Global permission checker composable
 */
export function usePermissions() {
  const authStore = useAuthStore();

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    // Special roles that see all menus
    const specialRoles = ["company-admin", "super-admin", "admin"];
    const userRoles = authStore.userRoles;

    // If user has any special role, grant all permissions
    if (userRoles.some(role => specialRoles.includes(role))) {
      return true;
    }

    // Check from store first
    if (authStore.userPermissions.includes(permission)) {
      return true;
    }

    // Check based on role permissions from JSON config
    for (const role of userRoles) {
      const rolePerms = getPermissionsForRole(role);
      if (rolePerms.includes(permission)) {
        return true;
      }
    }

    return false;
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Check if user has specific role
  const hasRole = (role: string): boolean => {
    return authStore.userRoles.includes(role);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  // Check if user has company permission (alias for hasPermission)
  const hasCompanyPermission = (permission: string): boolean => {
    return hasPermission(permission);
  };

  // Computed properties for common checks
  const isSuperAdmin = computed(() => hasRole(ROLES.SUPER_ADMIN));
  const isAdmin = computed(() => hasRole(ROLES.ADMIN));
  const isCompanyAdmin = computed(() => hasRole(ROLES.COMPANY_ADMIN));
  const isCompanyUser = computed(() => hasRole(ROLES.COMPANY_USER));
  const isBudgetAdmin = computed(() => hasRole(ROLES.BUDGET_ADMIN));
  const isBudgetUser = computed(() => hasRole(ROLES.BUDGET_USER));

  // Specific permission checks
  const canCreateCompany = computed(() => hasPermission(PERMISSIONS.CREATE_COMPANY));
  const canEditCompany = computed(() => hasPermission(PERMISSIONS.EDIT_COMPANY));
  const canDeleteCompany = computed(() => hasPermission(PERMISSIONS.DELETE_COMPANY));
  const canManageCompanyUsers = computed(() => hasPermission(PERMISSIONS.MANAGE_COMPANY_USERS));
  const canCreateUser = computed(() => hasPermission(PERMISSIONS.CREATE_USER));
  const canEditUser = computed(() => hasPermission(PERMISSIONS.EDIT_USER));
  const canDeleteUser = computed(() => hasPermission(PERMISSIONS.DELETE_USER));
  const canManageBudget = computed(() => hasPermission(PERMISSIONS.MANAGE_BUDGET));
  const canCreatePaymentDocument = computed(() => hasPermission(PERMISSIONS.CREATE_PAYMENT_DOCUMENT));
  const canApprovePurchaseRequest = computed(() => hasPermission(PERMISSIONS.APPROVE_PURCHASE_REQUEST));

  // Debug function
  const debugPermissions = () => {
    console.log('=== PERMISSION DEBUG ===');
    console.log('User Roles:', authStore.userRoles);
    console.log('User Permissions:', authStore.userPermissions);
    console.log('Is Super Admin:', isSuperAdmin.value);
    console.log('Can Create Company:', canCreateCompany.value);
    console.log('Can Create User:', canCreateUser.value);
    console.log('Can Manage Budget:', canManageBudget.value);
  };

  return {
    // Constants
    PERMISSIONS,
    ROLES,

    // Permission checkers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasCompanyPermission,

    // Computed properties
    isSuperAdmin,
    isAdmin,
    isCompanyAdmin,
    isCompanyUser,
    isBudgetAdmin,
    isBudgetUser,

    // Specific permission checks
    canCreateCompany,
    canEditCompany,
    canDeleteCompany,
    canManageCompanyUsers,
    canCreateUser,
    canEditUser,
    canDeleteUser,
    canManageBudget,
    canCreatePaymentDocument,
    canApprovePurchaseRequest,

    // Debug
    debugPermissions,
  };
}

/**
 * Permission directive for template usage
 */
export const vPermission = {
  mounted(el: HTMLElement, binding: { value: string }) {
    const { hasPermission } = usePermissions();
    const permission = binding.value;

    if (!hasPermission(permission)) {
      el.style.display = 'none';
    }
  },
  updated(el: HTMLElement, binding: { value: string }) {
    const { hasPermission } = usePermissions();
    const permission = binding.value;

    if (!hasPermission(permission)) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
    }
  },
};