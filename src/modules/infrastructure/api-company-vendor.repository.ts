import type { CompanyVendorRepository } from "@/modules/domain/repository/company-vendor.repository";
import { CompanyVendorEntity } from "@/modules/domain/entities/company-vendor.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { CompanyVendorCreate, CompanyVendorUpdate } from "@/modules/interfaces/company-vendor.interface";

interface ApiResponseCompanyVendor {
  id: string | number;
  company_id: string | number;
  vendor_id: string | number;
  status: string;
  credit_term_days?: string | number | null;
  credit_limit?: string | number | null;
  payment_term?: string | null;
  vendor?: { id: string | number; name?: string } | null;
  company?: { id: string | number; name?: string } | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

interface ApiResponseData {
  data: ApiResponseCompanyVendor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export class ApiCompanyVendorRepository implements CompanyVendorRepository {
  private readonly baseUrl = "/company-vendors";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CompanyVendorEntity>> {
    try {
      const response = await api.get(this.baseUrl, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          company_id: params.company_id,
          vendor_id: params.filter?.vendor_id,
          status: params.status_id,
          include_deleted: includeDeleted,
        },
      });

      const apiResponse = response.data as ApiResponseData;
      return {
        data: apiResponse.data.map((row) => this.toDomainModel(row)),
        total: apiResponse.pagination.total,
        page: apiResponse.pagination.page,
        limit: apiResponse.pagination.limit,
        totalPages: apiResponse.pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch company vendors list");
    }
  }

  async findById(id: string): Promise<CompanyVendorEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find company vendor with id ${id}`);
    }
  }

  async assign(data: CompanyVendorCreate): Promise<CompanyVendorEntity> {
    try {
      const response = await api.post(this.baseUrl, {
        vendor_id: data.vendor_id,
        status: data.status,
        credit_term_days: data.credit_term_days,
        credit_limit: data.credit_limit,
        payment_term: data.payment_term,
        company_id: data.company_id,
      });
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to assign vendor to company");
    }
  }

  async update(id: string, data: CompanyVendorUpdate): Promise<CompanyVendorEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update company vendor with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to unassign company vendor with id ${id}`);
    }
  }

  private toDomainModel(row: ApiResponseCompanyVendor): CompanyVendorEntity {
    return new CompanyVendorEntity(
      row.id?.toString() ?? "",
      row.company_id?.toString() ?? "",
      row.vendor_id?.toString() ?? "",
      row.vendor?.name ?? "",
      row.company?.name ?? "",
      row.status ?? "active",
      Number(row.credit_term_days ?? 0),
      Number(row.credit_limit ?? 0),
      row.payment_term ?? null,
      row.created_at ?? "",
      row.updated_at ?? "",
      row.deleted_at ?? null
    );
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(serverMessage);
    } else if (axiosError.request) {
      throw new Error(
        "Network Error: The request was made but no response was received. Please check your connection."
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
