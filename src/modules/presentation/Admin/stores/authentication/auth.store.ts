// src/modules/presentation/Admin/stores/auth.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";
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

  // Service
  const authService = createAuthService();

  // State
  const user: Ref<AuthEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);

  // Actions
  const login = async (credentials: LoginDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await authService.login(credentials);
      user.value = result;

      // Store token
      localStorage.setItem("accessToken", result.getAccessToken());
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

      // Clear storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");

      router.push("/login");
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Initialize user from localStorage if exists
  const initializeUser = () => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      user.value = new AuthEntity(
        parsedUser.id,
        parsedUser.username,
        parsedUser.email,
        parsedUser.tel,
        "", // created_at not stored
        "", // updated_at not stored
        null, // deleted_at not stored
        token
      );
    }
  };
  const checkSession = () => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  };

  // Call initialize on store creation
  initializeUser();

  return {
    user,
    loading,
    error,
    login,
    logout,
    checkSession,
  };
});
