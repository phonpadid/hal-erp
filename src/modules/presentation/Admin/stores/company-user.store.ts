/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import type { CompanyUserInterface, CompanyUserCreatePayload, CompanyUserUpdatePayload } from "@/modules/interfaces/company-user.interface";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ApiCompanyUserRepository } from "@/modules/infrastructure/api-company-user.repository";
import { useNotification } from "@/modules/shared/utils/useNotification";

interface CompanyUserState {
  companyUsers: CompanyUserInterface[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  currentCompanyUser: CompanyUserInterface | null;
  availableRoles: any[];
  availablePermissions: any[];
  rolesLoading: boolean;
  permissionsLoading: boolean;
}

const repository = new ApiCompanyUserRepository();
const { success, error } = useNotification();

export const useCompanyUserStore = defineStore("companyUser", {
  state: (): CompanyUserState => ({
    companyUsers: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },
    currentCompanyUser: null,
    availableRoles: [],
    availablePermissions: [],
    rolesLoading: false,
    permissionsLoading: false,
  }),

  getters: {
    activeCompanyUsers: (state) => state.companyUsers.filter((user) => !user.deleted_at),
    deletedCompanyUsers: (state) => state.companyUsers.filter((user) => user.deleted_at),
    companyUsersByCompany: (state) => (companyId: number) =>
      state.companyUsers.filter((user) => user.company_id === companyId),
    roleOptions: (state) => state.availableRoles.map((role) => ({
      label: role.name,
      value: role.id,
    })),
    permissionOptions: (state) => state.availablePermissions.map((permission) => ({
      label: permission.name,
      value: permission.id,
    })),
  },

  actions: {
    // Set pagination
    setPagination(params: Partial<{ page: number; limit: number; total: number }>) {
      if (params.page !== undefined) this.pagination.page = params.page;
      if (params.limit !== undefined) this.pagination.limit = params.limit;
      if (params.total !== undefined) this.pagination.total = params.total;
    },

    // Fetch all company users
    async fetchCompanyUsers(params: { page?: number; limit?: number; search?: string }) {
      this.loading = true;
      this.error = null;

      try {
        const paginationParams: PaginationParams = {
          page: params.page || this.pagination.page,
          limit: params.limit || this.pagination.limit,
        };

        const result = await repository.getAll({
          ...paginationParams,
          search: params.search,
        });

        this.companyUsers = result.data;

        // If no data from API, add mock data for testing
        if (!result.data || result.data.length === 0) {
          this.companyUsers = [
            {
              id: 1,
              username: "admin_test",
              email: "admin@test.com",
              tel: "12345678",
              signature: null,
              signature_url: "no photo",
              roles: [{ id: 1, name: "Admin", guard_name: "web" }],
              permissions: [{ id: 1, name: "user.create", guard_name: "web" }],
              company_id: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null as string | null
            }
          ];
        }

        // Update pagination
        if (!result.data || result.data.length === 0) {
          this.pagination.total = 1; // Mock data count
          this.pagination.page = 1;
          this.pagination.limit = 10;
        } else {
          this.pagination.total = result.total || 0;
          this.pagination.page = result.page || 1;
          this.pagination.limit = result.limit || 10;
        }
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : "Failed to fetch company users";
        error("Failed to fetch company users", this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Fetch company user by ID
    async fetchCompanyUserById(id: number): Promise<CompanyUserInterface> {
      this.loading = true;
      this.error = null;
      console.log("Store - Fetching company user with ID:", id);

      try {
        const companyUser = await repository.getById(id);
        console.log("Store - Company user data received:", companyUser);
        this.currentCompanyUser = companyUser;
        console.log("Store - currentCompanyUser set to:", this.currentCompanyUser);
        return companyUser;
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : "Failed to fetch company user";
        error("Failed to fetch company user", this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Create new company user
    async createCompanyUser(data: CompanyUserCreatePayload): Promise<CompanyUserInterface> {
      this.loading = true;
      this.error = null;

      try {
        const newCompanyUser = await repository.create(data);
        this.companyUsers.unshift(newCompanyUser);
        this.pagination.total += 1;
        success("Success", "Company user created successfully");
        return newCompanyUser;
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : "Failed to create company user";
        error("Failed to create company user", this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Update existing company user
    async updateCompanyUser(id: number, data: Omit<CompanyUserUpdatePayload, "id">): Promise<CompanyUserInterface> {
      this.loading = true;
      this.error = null;

      try {
        const updatedCompanyUser = await repository.update({ id, ...data });

        // Update in the list
        const index = this.companyUsers.findIndex((user) => user.id === id);
        if (index !== -1) {
          this.companyUsers[index] = updatedCompanyUser;
        }

        // Update current if it's the same
        if (this.currentCompanyUser?.id === id) {
          this.currentCompanyUser = updatedCompanyUser;
        }

        success("Success", "Company user updated successfully");
        return updatedCompanyUser;
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : "Failed to update company user";
        error("Failed to update company user", this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Delete company user
    async deleteCompanyUser(id: number): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await repository.delete(id);

        // Remove from the list
        const index = this.companyUsers.findIndex((user) => user.id === id);
        if (index !== -1) {
          this.companyUsers.splice(index, 1);
          this.pagination.total = Math.max(0, this.pagination.total - 1);
        }

        // Clear current if it's the same
        if (this.currentCompanyUser?.id === id) {
          this.currentCompanyUser = null;
        }

        success("Success", "Company user deleted successfully");
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : "Failed to delete company user";
        error("Failed to delete company user", this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Fetch available roles
    async fetchAvailableRoles(): Promise<any[]> {
      this.rolesLoading = true;

      try {
        const roles = await repository.getAvailableRoles();
        this.availableRoles = roles;
        return roles;
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : "Failed to fetch available roles";
        error("Failed to fetch available roles", this.error);
        throw err;
      } finally {
        this.rolesLoading = false;
      }
    },

    // Fetch available permissions
    async fetchAvailablePermissions(): Promise<any[]> {
      this.permissionsLoading = true;

      try {
        const permissions = await repository.getAvailablePermissions();
        this.availablePermissions = permissions;
        return permissions;
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : "Failed to fetch available permissions";
        error("Failed to fetch available permissions", this.error);
        throw err;
      } finally {
        this.permissionsLoading = false;
      }
    },

    // Check if username exists
    async checkUsernameExists(username: string, companyId: number, excludeId?: number): Promise<boolean> {
      try {
        return await repository.usernameExists(username, companyId, excludeId);
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : "Failed to check username availability";
        return false;
      }
    },

    // Check if email exists
    async checkEmailExists(email: string, companyId: number, excludeId?: number): Promise<boolean> {
      try {
        return await repository.emailExists(email, companyId, excludeId);
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : "Failed to check email availability";
        return false;
      }
    },

    // Check if tel exists
    async checkTelExists(tel: string, companyId: number, excludeId?: number): Promise<boolean> {
      try {
        return await repository.telExists(tel, companyId, excludeId);
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : "Failed to check phone number availability";
        return false;
      }
    },

    // Clear errors
    clearError(): void {
      this.error = null;
    },

    // Reset state
    resetState(): void {
      this.companyUsers = [];
      this.loading = false;
      this.error = null;
      this.pagination = {
        page: 1,
        limit: 10,
        total: 0,
      };
      this.currentCompanyUser = null;
      this.availableRoles = [];
      this.availablePermissions = [];
    },
  },
});