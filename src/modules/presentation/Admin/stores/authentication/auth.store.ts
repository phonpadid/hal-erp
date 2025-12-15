// src/modules/presentation/Admin/stores/auth.store.ts
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Ref } from "vue";
import { AuthServiceImpl } from "@/modules/application/services/auth/auth.service";
import { ApiAuthRepository } from "@/modules/infrastructure/auth/api-auth.repository";
import { AuthEntity } from "@/modules/domain/entities/auth/auth.entity";
import type { LoginDTO } from "@/modules/application/dtos/auth/auth.dto";
import { useRouter } from "vue-router";
import { useNotification } from "@/modules/shared/utils/useNotification";

const createAuthService = () => {
  const authRepository = new ApiAuthRepository();
  return new AuthServiceImpl(authRepository);
};

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();
  const { success } = useNotification();
  const authService = createAuthService();

  const user: Ref<AuthEntity | null> = ref(null);
  const userPermissions: Ref<string[]> = ref([]);
  const userRoles: Ref<string[]> = ref([]);
  const userType: Ref<string[]> = ref([]);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);

  const login = async (credentials: LoginDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await authService.login(credentials);
      user.value = result;
      userPermissions.value = result.getPermissions() || [];

      userRoles.value = result.getRoles() || [];
      userType.value = result.getUserType() || [];

      // Add default permission for purchase request
      const createPurchaseRequestPermission = "write-purchase-request";
      if (!userPermissions.value.includes(createPurchaseRequestPermission)) {
        userPermissions.value.push(createPurchaseRequestPermission);
      }

      // Add permissions based on user roles from JSON config
      // For now, we'll use the existing hardcoded permissions
      // This will be updated to use JSON config in a separate migration step

      localStorage.setItem("accessToken", result.getAccessToken());
      localStorage.setItem("userPermissions", JSON.stringify(userPermissions.value));
      localStorage.setItem("userRoles", JSON.stringify(userRoles.value));
      localStorage.setItem("userType", JSON.stringify(userType.value));

      // Store user data
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: result.getId(),
          username: result.getUsername(),
          email: result.getEmail(),
          tel: result.getTel(),
          department_name: result.getDepartmentName(),
          signature: result.getSignature(),
          user_type: result.getUserType(),
          company: result.getCompany(),
        })
      );

      // Store company data separately
      if (result.getCompany()) {
        localStorage.setItem("userCompany", JSON.stringify(result.getCompany()));
      }

      success("ສຳເລັດ", "ເຂົ້າສູ່ລະບົບສຳເລັດແລ້ວ");
      router.push("/dashboard");
    } catch (err) {
      error.value = err as Error;
      // showError("ຜິດພາດ", (err as Error).message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    error.value = null;

    try {
      await authService.logout();
      user.value = null;
      userPermissions.value = [];
      userRoles.value = [];
      userType.value = [];

      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("userCompany");
      localStorage.removeItem("userPermissions");
      localStorage.removeItem("userRoles");
      localStorage.removeItem("userType");

      router.push("/login");
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const initializeUser = () => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("userData");
    const userCompany = localStorage.getItem("userCompany");
    const storedPermissions = localStorage.getItem("userPermissions");
    const storedRoles = localStorage.getItem("userRoles");
    const storedUserType = localStorage.getItem("userType");

        if (token && userData && storedPermissions && storedRoles) {
    // userType is optional for backward compatibility
      const parsedUser = JSON.parse(userData);
      const companyData = userCompany ? JSON.parse(userCompany) : null;
      const permissions = JSON.parse(storedPermissions);
      const roles = JSON.parse(storedRoles);
      const user_type = storedUserType ? JSON.parse(storedUserType) : [];

      user.value = new AuthEntity(
        parsedUser.id,
        parsedUser.username,
        parsedUser.email,
        parsedUser.tel,
        parsedUser.department_name,
        parsedUser.signature,
        roles,
        permissions,
        parsedUser.user_type, // Assuming user_type exists in your data
        parsedUser.created_at,
        parsedUser.updated_at,
        parsedUser.deleted_at,
        token,
        companyData
      );
      userPermissions.value = permissions;
      userRoles.value = roles;
      userType.value = user_type;

          }
  };

  const checkSession = () => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  };
  const isSuperAdmin = computed(() => userRoles.value.includes("super-admin"));
  const isAdmin = computed(() => userRoles.value.includes("admin"));

  const isUserTypeCompanyAdmin = computed(() => userType.value.includes("company_user"));
  const isCompanyAdmin = computed(() => userRoles.value.includes("company-admin"));
  const isCompanyUser = computed(() => userRoles.value.includes("company-user"));

  // Get company data from localStorage
  const getCompanyData = () => {
    const userCompany = localStorage.getItem("userCompany");
    return userCompany ? JSON.parse(userCompany) : null;
  };

  const userCompany = computed(() => getCompanyData());

  const getCompanyId = computed(() => {
  const id = userCompany.value?.id || null;
  console.log("🔑 AuthStore.getCompanyId computed:", id);
  return id;
});

  const getCompanyName = computed(() => {
  const name = userCompany.value?.name || '';
  console.log("🔑 AuthStore.getCompanyName computed:", name);
  return name;
  });

  initializeUser();

  return {
    user,
    userPermissions,
    userRoles,
    userType,
    userCompany,
    getCompanyId,
    getCompanyName,
    loading,
    error,
    login,
    logout,
    checkSession,
    isSuperAdmin,
    isAdmin,
    isCompanyAdmin,
    isCompanyUser,
    isUserTypeCompanyAdmin
  };
});
