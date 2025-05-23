import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { UserEntity } from "@/modules/domain/entities/user.entities";
import type { PaginationParams } from "@/modules/shared/pagination";
import { UserServiceImpl } from "@/modules/application/services/user.service";
import { ApiUserRepository } from "@/modules/infrastructure/api-user.repository";
import type { UserInterface } from "@/modules/interfaces/user.interface";

// สร้าง user service
const createUserService = () => {
  const userRepository = new ApiUserRepository();
  return new UserServiceImpl(userRepository);
};

export const useUserStore = defineStore("user", () => {
  // สร้าง service
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
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await userService.getAllUsers(params, includeDeleted);
      users.value = result.data;
      pagination.value = {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      };

      // แปลงข้อมูลสำหรับส่งกลับไปให้ component
      return {
        data: result.data.map(userEntityToInterface),
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
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

  // Create User
  const createUser = async (userData: {
    username: string;
    email: string;
    password: string;
    tel?: string;
  }) => {
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
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {

      const existingUser = users.value.find(
        (user) => user.getUsername().toLowerCase() === username.toLowerCase()
      );

      if (existingUser) {
        return false; // มีผู้ใช้นี้แล้ว
      }

      const userRepo = new ApiUserRepository();
      const user = await userRepo.findByUsername(username);
      return !user; // ถ้าไม่พบ user จะ return true (สามารถใช้ได้)
    } catch (err) {
      error.value = err as Error;
      console.error("Error checking username:", err);
      return false; // กรณีเกิดข้อผิดพลาดให้ถือว่าใช้ไม่ได้เพื่อความปลอดภัย
    } finally {
      loading.value = false;
    }
  };

  // Update User
  const updateUser = async (
    id: string,
    userData: { username?: string; email?: string; password?: string; tel?: string }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedUser = await userService.updateUser(id, userData);

      // Update users list if it's loaded
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
        // Update users list if it's loaded
        const index = users.value.findIndex((u) => u.getId() === id);
        if (index !== -1) {
          // เรียกใช้เมธอด delete ในอ็อบเจกต์ UserEntity
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
    return {
      id: parseInt(user.getId()),
      username: user.getUsername(),
      email: user.getEmail(),
      tel: user.getTel(),
      created_at: user.getCreatedAt(),
      updated_at: user.getUpdatedAt(),
      deleted_at: user.getDeletedAt(),
    };
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

  return {
    // State
    users,
    currentUser,
    loading,
    error,
    pagination,
    checkUsernameAvailability,

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

    resetState,
  };
});
