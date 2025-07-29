import type {
  CreateVendorBankAccountInterface,
  UpdateVendorBankAccountInterface,
} from "@/modules/interfaces/vendors/vendor_bank_accounts/vendor-bank-accounts.interface";
import { VendorsBankAccountEntity } from "@/modules/domain/entities/vendors/vendor_bank_accounts/vendors-bank-accounts.entities";
import type { VendorsBankAccountsRepository } from "@/modules/domain/repository/vendors/vendors_bank_accounts/vendor-bank-accounts.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiVendorsBankAccountsRepository implements VendorsBankAccountsRepository {
  private readonly baseUrl = "/vendor_bank_accounts";

  async findAll(
    vendorId: number,
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<VendorsBankAccountEntity>> {
    try {
      const response = await api.get(`${this.baseUrl}/vendor/${vendorId}`, {
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
        data: response.data.data.map((vendors: unknown) => this.toDomainModel(vendors)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch vendorss list");
    }
  }

  async findById(id: string): Promise<VendorsBankAccountEntity | null> {
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

  async findByvendorsname(bank_name: string): Promise<VendorsBankAccountEntity | null> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { bank_name, limit: 1 },
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

  async create(
    vendorsBankData: CreateVendorBankAccountInterface
  ): Promise<VendorsBankAccountEntity> {
    try {
      const response = await api.post(this.baseUrl, vendorsBankData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create vendors");
    }
  }

  async update(
    id: string,
    vendorsBankData: UpdateVendorBankAccountInterface
  ): Promise<VendorsBankAccountEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, vendorsBankData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update vendors with id ${id}`);
    }
  }

  async toggleIsSelected(id: string, isSelected: boolean): Promise<VendorsBankAccountEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/use/${id}`, {
        is_selected: isSelected,
      });
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to toggle selection for bank account with id ${id}`);
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
  private toDomainModel(vendors: any): VendorsBankAccountEntity {
    return new VendorsBankAccountEntity(
      vendors.id.toString(),
      vendors.vendor_id.toString(),
      vendors.currency_id.toString(),
      vendors.bank_name,
      vendors.account_name,
      vendors.account_number,
      vendors.is_selected || false,
      vendors.created_at || "",
      vendors.updated_at || "",
      vendors.deleted_at || null,
      vendors.vendor
        ? {
            id: vendors.vendor.id,
            name: vendors.vendor.name,
            contact_info: vendors.vendor.contact_info,
            created_at: vendors.vendor.created_at,
            updated_at: vendors.vendor.updated_at,
          }
        : undefined,
      vendors.currency
        ? {
            id: vendors.currency.id,
            code: vendors.currency.code,
            name: vendors.currency.name,
            created_at: vendors.currency.created_at,
            updated_at: vendors.currency.updated_at,
          }
        : null
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
