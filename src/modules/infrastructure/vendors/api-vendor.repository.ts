import type {
  VendorCreateInteface,
  VendorUpdateIntrface,
} from "@/modules/interfaces/vendors/vendor/vendor.interfacce";
import { VendorsEntity } from "@/modules/domain/entities/vendors/vendor/vendors.entities";
import type { VendorsRepository } from "@/modules/domain/repository/vendors/vendor/vendor.repisitory";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiVendorsRepository implements VendorsRepository {
  private readonly baseUrl = "/vendors";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<VendorsEntity>> {
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

      // ກວ່າການຕອບກັບ API ມີຮູບແບບທີ່ຄາດເວັ້ນ
      if (!response.data || !response.data.data || !response.data.pagination) {
        throw new Error("Invalid response format from API");
      }

      return {
        data: response.data.data.map((vendor: unknown) => this.toDomainModel(vendor)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch vendors list");
    }
  }

  async findById(id: string): Promise<VendorsEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find vendors with id ${id}`);
    }
  }

  async findByvendorsname(name: string): Promise<VendorsEntity | null> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { name, limit: 1 },
      });

      if (response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      console.error(`Error finding vendors by vendorsname '${name}':`, error);
      return null;
    }
  }

  async create(vendorsData: VendorCreateInteface): Promise<VendorsEntity> {
    try {
      const response = await api.post(this.baseUrl, vendorsData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create vendors");
    }
  }

  async update(id: string, vendorsData: VendorUpdateIntrface): Promise<VendorsEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, vendorsData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update vendors with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete vendors with id ${id}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomainModel(vendors: any): VendorsEntity {
    return new VendorsEntity(
      vendors.id.toString(),
      vendors.name,
      vendors.contact_info,
      vendors.vendor_bank_account || [],
      vendors.created_at || "",
      vendors.updated_at || "",
      vendors.deleted_at || null
    );
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{
      message?: string;
      status_code?: number;
    }>;

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(serverMessage);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
