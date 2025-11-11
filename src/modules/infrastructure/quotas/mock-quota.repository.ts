import { QuotaEntity } from "../../domain/entities/quotas/quota.entity";
import type { QuotaRepository } from "@/modules/domain/repository/quotas/quota.repository";
import type { QuotaApiModel } from "@/modules/interfaces/quotas/quota.interface";

export class MockQuotaRepository implements QuotaRepository {
  private mockQuotas: QuotaApiModel[] = [
    {
      id: 1,
      company_id: 1,
      vendor_id: 1,
      product_id: 1,
      qty: 100,
      year: "2024",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      deleted_at: null,
    },
    {
      id: 2,
      company_id: 1,
      vendor_id: 2,
      product_id: 3,
      qty: 250,
      year: "2024",
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
      deleted_at: null,
    },
    {
      id: 3,
      company_id: 2,
      vendor_id: 1,
      product_id: 2,
      qty: 75,
      year: "2025",
      created_at: "2024-01-03T00:00:00Z",
      updated_at: "2024-01-03T00:00:00Z",
      deleted_at: null,
    },
    {
      id: 4,
      company_id: 1,
      vendor_id: 3,
      product_id: 1,
      qty: 150,
      year: "2025",
      created_at: "2024-01-04T00:00:00Z",
      updated_at: "2024-01-04T00:00:00Z",
      deleted_at: "2024-06-01T00:00:00Z", // Soft deleted
    },
    {
      id: 5,
      company_id: 3,
      vendor_id: 2,
      product_id: 4,
      qty: 300,
      year: "2023",
      created_at: "2024-01-05T00:00:00Z",
      updated_at: "2024-01-05T00:00:00Z",
      deleted_at: null,
    },
  ];

  private nextId: number = 6;

  private toDomainModel(apiModel: QuotaApiModel): QuotaEntity {
    return QuotaEntity.restore({
      id: apiModel.id.toString(),
      company_id: apiModel.company_id,
      vendor_id: apiModel.vendor_id,
      product_id: apiModel.product_id,
      qty: apiModel.qty,
      year: apiModel.year,
      created_at: new Date(apiModel.created_at || Date.now()),
      updated_at: new Date(apiModel.updated_at || Date.now()),
      deleted_at: apiModel.deleted_at ? new Date(apiModel.deleted_at) : null,
    });
  }

  private toApiModel(entity: QuotaEntity): Omit<QuotaApiModel, "id" | "created_at" | "updated_at" | "deleted_at"> {
    return {
      company_id: entity.getCompanyId(),
      vendor_id: entity.getVendorId(),
      product_id: entity.getProductId(),
      qty: entity.getQty(),
      year: entity.getYear(),
    };
  }

  async getAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    company_id?: number;
    vendor_id?: number;
    product_id?: number;
    year?: string;
    includeDeleted?: boolean;
  }): Promise<{
    quotas: QuotaEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const filteredQuotas = this.mockQuotas.filter(quota => {
      // Filter out deleted unless explicitly included
      if (!options?.includeDeleted && quota.deleted_at) {
        return false;
      }

      // Apply filters
      if (options?.company_id && quota.company_id !== options.company_id) {
        return false;
      }
      if (options?.vendor_id && quota.vendor_id !== options.vendor_id) {
        return false;
      }
      if (options?.product_id && quota.product_id !== options.product_id) {
        return false;
      }
      if (options?.year && quota.year !== options.year) {
        return false;
      }

      // Search functionality - search in year field (string)
      if (options?.search) {
        const searchTerm = options.search.toLowerCase();
        return (
          quota.year.toLowerCase().includes(searchTerm) ||
          quota.qty.toString().includes(searchTerm) ||
          quota.company_id.toString().includes(searchTerm) ||
          quota.vendor_id.toString().includes(searchTerm) ||
          quota.product_id.toString().includes(searchTerm)
        );
      }

      return true;
    });

    // Sort by created_at descending
    filteredQuotas.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

    // Pagination
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedQuotas = filteredQuotas.slice(startIndex, endIndex);

    return {
      quotas: paginatedQuotas.map(quota => this.toDomainModel(quota)),
      total: filteredQuotas.length,
      page,
      limit,
    };
  }

  async getById(id: string, includeDeleted?: boolean): Promise<QuotaEntity | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    const quota = this.mockQuotas.find(q => q.id.toString() === id);

    if (!quota) {
      return null;
    }

    // Don't return deleted quotas unless explicitly included
    if (quota.deleted_at && !includeDeleted) {
      return null;
    }

    return this.toDomainModel(quota);
  }

  async create(quota: QuotaEntity): Promise<QuotaEntity> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const newQuota: QuotaApiModel = {
      id: this.nextId++,
      ...this.toApiModel(quota),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    this.mockQuotas.push(newQuota);
    return this.toDomainModel(newQuota);
  }

  async update(id: string, quota: QuotaEntity): Promise<QuotaEntity> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 250));

    const index = this.mockQuotas.findIndex(q => q.id.toString() === id);

    if (index === -1) {
      throw new Error(`Quota with id ${id} not found`);
    }

    const existingQuota = this.mockQuotas[index];
    if (existingQuota.deleted_at) {
      throw new Error("Cannot update deleted quota");
    }

    this.mockQuotas[index] = {
      ...existingQuota,
      ...this.toApiModel(quota),
      updated_at: new Date().toISOString(),
    };

    return this.toDomainModel(this.mockQuotas[index]);
  }

  async delete(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const quota = this.mockQuotas.find(q => q.id.toString() === id);

    if (!quota) {
      throw new Error(`Quota with id ${id} not found`);
    }

    if (quota.deleted_at) {
      throw new Error("Quota is already deleted");
    }

    // Soft delete
    quota.deleted_at = new Date().toISOString();
    quota.updated_at = new Date().toISOString();
  }

  async restore(id: string): Promise<QuotaEntity> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const quota = this.mockQuotas.find(q => q.id.toString() === id);

    if (!quota) {
      throw new Error(`Quota with id ${id} not found`);
    }

    if (!quota.deleted_at) {
      throw new Error("Quota is not deleted");
    }

    // Restore quota
    quota.deleted_at = null;
    quota.updated_at = new Date().toISOString();

    return this.toDomainModel(quota);
  }

  async exists(company_id: number, vendor_id: number, product_id: number, year: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const exists = this.mockQuotas.some(quota =>
      quota.company_id === company_id &&
      quota.vendor_id === vendor_id &&
      quota.product_id === product_id &&
      quota.year === year &&
      !quota.deleted_at
    );

    return exists;
  }

  async getByUniqueKey(company_id: number, vendor_id: number, product_id: number, year: string): Promise<QuotaEntity | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    const quota = this.mockQuotas.find(q =>
      q.company_id === company_id &&
      q.vendor_id === vendor_id &&
      q.product_id === product_id &&
      q.year === year
    );

    if (!quota) {
      return null;
    }

    return this.toDomainModel(quota);
  }

  // Utility method for testing - clear all mock data
  clearMockData(): void {
    this.mockQuotas = [];
    this.nextId = 1;
  }

  // Utility method for testing - add custom mock data
  addMockData(quota: Omit<QuotaApiModel, "id" | "created_at" | "updated_at" | "deleted_at">): void {
    const newQuota: QuotaApiModel = {
      id: this.nextId++,
      ...quota,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    this.mockQuotas.push(newQuota);
  }
}
