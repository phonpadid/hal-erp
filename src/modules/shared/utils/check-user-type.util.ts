import { useAuthStore } from "@/modules/presentation/Admin/stores/authentication/auth.store";

export function canAccessAll() {
  // Use auth store instead of localStorage for reactive state
  const authStore = useAuthStore();
  const userType = authStore.userType || [];

  // Check for admin, company-user (dash) and company-admin
  return userType.includes("admin") || userType.includes("company_user") || userType.includes("company_admin");
}
