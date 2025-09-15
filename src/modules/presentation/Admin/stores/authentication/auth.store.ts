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
  const { success, error: showError } = useNotification();
  const authService = createAuthService();

  const user: Ref<AuthEntity | null> = ref(null);
  const userPermissions: Ref<string[]> = ref([]);
  const userRoles: Ref<string[]> = ref([]); 
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
      const createPurchaseRequestPermission = 'write-purchase-request';
      if (!userPermissions.value.includes(createPurchaseRequestPermission)) {
        userPermissions.value.push(createPurchaseRequestPermission);
      }

      localStorage.setItem("accessToken", result.getAccessToken());
      localStorage.setItem("userPermissions", JSON.stringify(userPermissions.value));
      localStorage.setItem("userRoles", JSON.stringify(userRoles.value));

      // Store user data
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: result.getId(),
          username: result.getUsername(),
          email: result.getEmail(),
          tel: result.getTel(),
        })
      );

      success("ສຳເລັດ", "ເຂົ້າສູ່ລະບົບສຳເລັດແລ້ວ");
      router.push("/dashboard");
    } catch (err) {
      error.value = err as Error;
      showError("ຜິດພາດ", (err as Error).message);
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

      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("userPermissions");
      localStorage.removeItem("userRoles");

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
    const storedPermissions = localStorage.getItem("userPermissions");
    const storedRoles = localStorage.getItem("userRoles");

    if (token && userData && storedPermissions && storedRoles) {
      const parsedUser = JSON.parse(userData);
      const permissions = JSON.parse(storedPermissions);
      const roles = JSON.parse(storedRoles);

      user.value = new AuthEntity(
        parsedUser.id,
        parsedUser.username,
        parsedUser.email,
        parsedUser.tel,
        roles,
        permissions,
        parsedUser.user_type, // Assuming user_type exists in your data
        parsedUser.created_at,
        parsedUser.updated_at,
        parsedUser.deleted_at,
        token
      );
      userPermissions.value = permissions;
      userRoles.value = roles;
    }
  };

  const checkSession = () => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  };
  const isSuperAdmin = computed(() => userRoles.value.includes('super-admin'));
  const isAdmin = computed(() => userRoles.value.includes('admin'));

  initializeUser();

  return {
    user,
    userPermissions,
    userRoles,
    loading,
    error,
    login,
    logout,
    checkSession,
    isSuperAdmin,
    isAdmin,
  };
});
