import type {
  UserChangePasswordPayload,
  UserCreatePayload,
  UserUpdatePayload,
} from "./../../../interfaces/user.interface";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { UserEntity } from "@/modules/domain/entities/user.entities";
import type { PaginationParams } from "@/modules/shared/pagination";
import { UserServiceImpl } from "@/modules/application/services/user.service";
import { ApiUserRepository } from "@/modules/infrastructure/api-user.repository";
import type { UserInterface } from "@/modules/interfaces/user.interface";

// user service
const createUserService = () => {
  const userRepository = new ApiUserRepository();
  return new UserServiceImpl(userRepository);
};

export const useUserStore = defineStore("user", () => {
  // service
  const userService = createUserService();

  // State
  const users: Ref<UserEntity[]> = ref([]);
  const currentUser: Ref<UserEntity | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Getters
  const activeUsers = computed(() => users.value.filter((user) => !user.isDeleted()));
  const inactiveUsers = computed(() => users.value.filter((user) => user.isDeleted()));
  const totalActiveUsers = computed(() => activeUsers.value.length);
  const totalInactiveUsers = computed(() => inactiveUsers.value.length);

  // Get All Users
  const fetchUsers = async (
    params: PaginationParams = { page: 1, limit: 10 }
    // includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await userService.getAllUsers(params);
      users.value = result.data;
      pagination.value = {
        page: result.page ?? 1,
        limit: result.limit ?? 10,
        total: result.total ?? 0,
        totalPages: result.totalPages ?? 0,
      };
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get User By ID
  const fetchUserById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const user = await userService.getUserById(id);
      currentUser.value = user;
      return user ? userEntityToInterface(user) : null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (userData: UserCreatePayload) => {
    loading.value = true;
    error.value = null;

    try {
      const user = await userService.createUser(userData);
      users.value = [user, ...users.value];
      return userEntityToInterface(user);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const resetPassword = async (id: string, old_password: string, new_password: string) => {
    loading.value = true;
    error.value = null;

    try {
      const changePasswordDTO: UserChangePasswordPayload = {
        old_password: old_password,
        new_password: new_password,
      };

      const updatedUser = await userService.changePasswordUser(id, changePasswordDTO);

      // อัพเดต state
      const index = users.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }

      if (currentUser.value && currentUser.value.getId() === id) {
        currentUser.value = updatedUser;
      }

      return userEntityToInterface(updatedUser);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update User
  const updateUser = async (id: string, userData: UserUpdatePayload) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedUser = await userService.updateUser(id, userData);
      const index = users.value.findIndex((u) => u.getId() === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
      // Update current user if it's loaded
      if (currentUser.value && currentUser.value.getId() === id) {
        currentUser.value = updatedUser;
      }

      return userEntityToInterface(updatedUser);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete User
  const deleteUser = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await userService.deleteUser(id);
      if (result) {
        const index = users.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          users.value[index].delete();
        }
      }
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const userEntityToInterface = (user: UserEntity): UserInterface => {
     console.log("=== STORE DEBUG: userEntityToInterface ===");
     console.log("User Entity:", user);
     console.log("user.getUseSignature():", user.getUseSignature());

     // Priority: database signature_url > user.signature (for form updates)
     const signatureUrl = user.getUseSignature()?.signature_url;
     const signature = signatureUrl || (user as any).signature || "";

     console.log("signatureUrl:", signatureUrl);
     console.log("final signature:", signature);

     const result = {
      id: parseInt(user.getId()),
      username: user.getUsername(),
      email: user.getEmail(),
      roleIds: user.getRoleIds(),
      permissionIds: user.getPermissionIds(),
      signature: signature,
      tel: user.getTel(),
      getId: () => user.getId(),
      roles: user.getRoles(),
      getRoles: () => user.getRoles(),
      created_at: user.getCreatedAt(),
      updated_at: user.getUpdatedAt(),
      deleted_at: user.getDeletedAt(),
      user_signature: user.getUseSignature(),
     };

     console.log("Result user_signature:", result.user_signature);
     console.log("=== END STORE DEBUG ===");

     return result;
  };

  // Reset state
  const resetState = () => {
    users.value = [];
    currentUser.value = null;
    error.value = null;
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
  };

  const setPagination = (newPagination: { page: number; limit: number; total: number }) => {
    pagination.value.page = newPagination.page || 1;
    pagination.value.limit = newPagination.limit || 10;
    pagination.value.total = newPagination.total;
  };

  return {
    // State
    users,
    currentUser,
    loading,
    error,
    pagination,
    setPagination,

    // Getters
    activeUsers,
    inactiveUsers,
    totalActiveUsers,
    totalInactiveUsers,

    // Actions
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,

    resetState,
  };
});
