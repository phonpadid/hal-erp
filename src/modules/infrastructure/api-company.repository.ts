import type { CompanyRepository } from "@/modules/domain/repository/company.repository";
import { CompanyEntity } from "@/modules/domain/entities/company.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { CreateCompanyDTO, UpdateCompanyDTO } from "@/modules/application/dtos/company.dto";

export class ApiCompanyRepository implements CompanyRepository {
  private readonly baseUrl = "/companies";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CompanyEntity>> {
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
        data: response.data.data.map((company: any) => this.toDomainModel(company)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch companies list");
    }
  }

  async findById(id: string): Promise<CompanyEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find company with id ${id}`);
    }
  }


  async create(companyData: CreateCompanyDTO): Promise<CompanyEntity> {
    try {
      const response = await api.post(this.baseUrl, companyData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create company");
    }
  }

  async update(id: string, updateCompanyDTO: UpdateCompanyDTO): Promise<CompanyEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, updateCompanyDTO);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update company with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete company with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/${id}/restore`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to restore company with id ${id}`);
    }
  }

  private toDomainModel(company: any): CompanyEntity {
    return new CompanyEntity(
      company.id?.toString() ?? "",
      company.name ?? "",
      company.logo ?? null,
      company.logo_url ?? null,
      company.tel ?? "",
      company.email ?? "",
      company.address ?? "",
      company.created_at ?? "",
      company.updated_at ?? "",
      company.deleted_at ?? null
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