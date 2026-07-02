import type { CompanyProductRepository } from "@/modules/domain/repository/company-product.repository";
import { CompanyProductEntity } from "@/modules/domain/entities/company-product.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { CompanyProductCreate, CompanyProductUpdate } from "@/modules/interfaces/company-product.interface";

interface ApiResponseCompanyProduct {
  id: string | number;
  company_id: string | number;
  product_id: string | number;
  status: string;
  product?: { id: string | number; name?: string } | null;
  company?: { id: string | number; name?: string } | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

interface ApiResponseData {
  data: ApiResponseCompanyProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export class ApiCompanyProductRepository implements CompanyProductRepository {
  private readonly baseUrl = "/company-products";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CompanyProductEntity>> {
    try {
      const response = await api.get(this.baseUrl, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          company_id: params.company_id,
          product_id: params.filter?.product_id,
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
      return this.handleApiError(error, "Failed to fetch company products list");
    }
  }

  async findById(id: string): Promise<CompanyProductEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find company product with id ${id}`);
    }
  }

  async assign(data: CompanyProductCreate): Promise<CompanyProductEntity[]> {
    try {
      const response = await api.post(this.baseUrl, {
        product_ids: data.product_ids,
        status: data.status,
        company_id: data.company_id,
      });
      const created = response.data?.data;
      if (!Array.isArray(created)) {
        return created ? [this.toDomainModel(created)] : [];
      }
      return created.map((row: ApiResponseCompanyProduct) => this.toDomainModel(row));
    } catch (error) {
      return this.handleApiError(error, "Failed to assign products to company");
    }
  }

  async update(id: string, data: CompanyProductUpdate): Promise<CompanyProductEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update company product with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to unassign company product with id ${id}`);
    }
  }

  private toDomainModel(row: ApiResponseCompanyProduct): CompanyProductEntity {
    return new CompanyProductEntity(
      row.id?.toString() ?? "",
      row.company_id?.toString() ?? "",
      row.product_id?.toString() ?? "",
      row.product?.name ?? "",
      row.company?.name ?? "",
      row.status ?? "active",
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
