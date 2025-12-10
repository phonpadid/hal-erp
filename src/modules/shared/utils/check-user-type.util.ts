import { useAuthStore } from "@/modules/presentation/Admin/stores/authentication/auth.store";

export function canAccessAll() {
  // Use auth store instead of localStorage for reactive state
  const authStore = useAuthStore();
  const userType = authStore.userType || [];

  // Check for admin, company-user (dash) and company-admin
  return userType.includes("admin") || userType.includes("company_user") || userType.includes("company_admin");
}

// Check if a user object has company_admin role (for edit restrictions)
export function isUserCompanyAdmin(user: any): boolean {
  if (!user) {
    console.log('❌ isUserCompanyAdmin: No user provided');
    return false;
  }

  // Handle different user structures
  const roles = user.roles || user.user?.roles || [];

  console.log('🔍 Checking company_admin role for user:', {
    userId: user.id,
    username: user.username,
    roles: roles,
    rolesCount: roles.length
  });

  // Check if user has company_admin role (both dash and underscore formats)
  const hasCompanyAdmin = roles.some((role: any) => {
    const match = role.name === 'company_admin' ||  // underscore format
                 role.name === 'company-admin' ||  // dash format
                 role.display_name === 'company_admin' ||
                 role.display_name === 'company-admin' ||
                 role.id === 'company_admin' ||
                 role.id === 'company-admin' ||
                 role.role_name === 'company_admin' ||
                 role.role_name === 'company-admin';

    if (match) {
      console.log('✅ Found company_admin role:', role);
    }

    return match;
  });

  console.log('🎯 Company Admin Check Result:', hasCompanyAdmin);
  return hasCompanyAdmin;
}
