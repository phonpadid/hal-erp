import axios from "axios";
import type { CompanyUserInterface, CompanyUserListPayload, CompanyUserCreatePayload, CompanyUserUpdatePayload } from "@/modules/interfaces/company-user.interface";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ICompanyUserRepository } from "@/modules/domain/repository/company-user.repository";
import { api } from "@/common/config/axios/axios";

export class ApiCompanyUserRepository implements ICompanyUserRepository {
  private readonly baseUrl = "/company-users";

  async getAll(params: CompanyUserListPayload & PaginationParams): Promise<PaginatedResult<CompanyUserInterface>> {
    try {
     
      const response = await api.get(this.baseUrl, { params });

      const result = {
        data: response.data.data || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        totalPages: response.data.totalPages || 1,
      };

      return result;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error((error.response?.data as any)?.message || "Failed to fetch company users");
      }
      throw new Error("Failed to fetch company users");
    }
  }

  async getById(id: number): Promise<CompanyUserInterface> {
    try {
  

      const response = await api.get(`${this.baseUrl}/${id}`);
     

      return response.data.data;
    } catch (error: unknown) {
      console.error("Repository - Error fetching company user:", error);
      if (axios.isAxiosError(error)) {
        throw new Error((error.response?.data as any)?.message || "Failed to fetch company user");
      }
      throw new Error("Failed to fetch company user");
    }
  }

  async create(data: CompanyUserCreatePayload): Promise<CompanyUserInterface> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as any;
        if (errorData.errors) {
          const validationErrors = Object.values(errorData.errors).flat().join(", ");
          throw new Error(validationErrors);
        }
        throw new Error(errorData.message || "Failed to create company user");
      }
      throw new Error("Failed to create company user");
    }
  }

  async update(data: CompanyUserUpdatePayload): Promise<CompanyUserInterface> {
    try {
      const response = await api.put(`${this.baseUrl}/${data.id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as any;
        if (errorData.errors) {
          const validationErrors = Object.values(errorData.errors).flat().join(", ");
          throw new Error(validationErrors);
        }
        throw new Error(errorData.message || "Failed to update company user");
      }
      throw new Error("Failed to update company user");
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error((error.response?.data as any)?.message || "Failed to delete company user");
      }
      throw new Error("Failed to delete company user");
    }
  }

  async getAvailableRoles(): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/roles`);
      return response.data.data || [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error((error.response?.data as any)?.message || "Failed to fetch available roles");
      }
      throw new Error("Failed to fetch available roles");
    }
  }

  async getAvailablePermissions(): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/permissions`);
      return response.data.data || [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error((error.response?.data as any)?.message || "Failed to fetch available permissions");
      }
      throw new Error("Failed to fetch available permissions");
    }
  }

  async usernameExists(username: string, companyId: number, excludeId?: number): Promise<boolean> {
    try {
      const params: any = { username, company_id: companyId };
      if (excludeId) {
        params.exclude_id = excludeId;
      }
      const response = await api.get(`${this.baseUrl}/check-username`, { params });
      return response.data.exists;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error((error.response?.data as any)?.message || "Failed to check username availability");
      }
      throw new Error("Failed to check username availability");
    }
  }

  async emailExists(email: string, companyId: number, excludeId?: number): Promise<boolean> {
    try {
      const params: any = { email, company_id: companyId };
      if (excludeId) {
        params.exclude_id = excludeId;
      }
      const response = await api.get(`${this.baseUrl}/check-email`, { params });
      return response.data.exists;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error((error.response?.data as any)?.message || "Failed to check email availability");
      }
      throw new Error("Failed to check email availability");
    }
  }

  async telExists(tel: string, companyId: number, excludeId?: number): Promise<boolean> {
    try {
      const params: any = { tel, company_id: companyId };
      if (excludeId) {
        params.exclude_id = excludeId;
      }
      const response = await api.get(`${this.baseUrl}/check-tel`, { params });
      return response.data.exists;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error((error.response?.data as any)?.message || "Failed to check phone number availability");
      }
      throw new Error("Failed to check phone number availability");
    }
  }
}