import type { BankCreate, BankUpdate } from "@/modules/interfaces/bank.interface";
import { BankEntity } from "@/modules/domain/entities/bank.entity";
import type { BankRepository } from "@/modules/domain/repository/bank.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiBankRepository implements BankRepository {
  private readonly baseUrl = "/banks";

  async findAll(params: PaginationParams, includeDeleted: boolean = false): Promise<PaginatedResult<BankEntity>> {
    try {
      const response = await api.get(this.baseUrl, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          sort_by: params.sortBy,
          sortDirection: params.sortDirection,
          include_deleted: includeDeleted,
        },
      });
      return {
        data: response.data.data.map((bank: unknown) => this.toDomainModel(bank)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch banks list");
    }
  }

  async findById(id: string): Promise<BankEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find bank with id ${id}`);
    }
  }

  async findByName(name: string): Promise<BankEntity | null> {
    try {
      const response = await api.get(this.baseUrl, { params: { name, limit: 1 } });
      if (response.data.data.length === 0) return null;
      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      console.error(`Error finding bank by name '${name}':`, error);
      return null;
    }
  }

  async findByShortName(short_name: string): Promise<BankEntity | null> {
    try {
      const response = await api.get(this.baseUrl, { params: { short_name, limit: 1 } });
      if (response.data.data.length === 0) return null;
      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      console.error(`Error finding bank by short_name '${short_name}':`, error);
      return null;
    }
  }

  async create(bankData: BankCreate): Promise<BankEntity> {
    try {
      const formData = new FormData();
      formData.append("name", bankData.name || "");
      formData.append("short_name", bankData.short_name || "");
      if (typeof File !== "undefined" && bankData.logo instanceof File) {
        formData.append("logo", bankData.logo);
      } else if (typeof bankData.logo === "string" && bankData.logo.trim() !== "") {
        formData.append("logo", bankData.logo);
      }
      const response = await api.post(this.baseUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create bank");
    }
  }

  async update(id: string, bankData: BankUpdate): Promise<BankEntity> {
    try {
      const formData = new FormData();
      if (bankData.name !== undefined) formData.append("name", bankData.name);
      if (bankData.short_name !== undefined) formData.append("short_name", bankData.short_name);
      if (typeof File !== "undefined" && bankData.logo instanceof File) {
        formData.append("logo", bankData.logo);
      } else if (typeof bankData.logo === "string" && bankData.logo.trim() !== "") {
        formData.append("logo", bankData.logo);
      }
      const response = await api.put(`${this.baseUrl}/${id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update bank with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete bank with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/${id}/restore`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to restore bank with id ${id}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomainModel(bank: any): BankEntity {
    return new BankEntity(
      bank.id.toString(),
      bank.name,
      bank.short_name,
      bank.logo || null,
      bank.logoUrl || null,
      bank.created_at || "",
      bank.updated_at || "",
      bank.deleted_at || null
    );
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(`${serverMessage}`);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
