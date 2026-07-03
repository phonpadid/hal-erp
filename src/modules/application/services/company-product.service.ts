import type { CompanyProductRepository } from "@/modules/domain/repository/company-product.repository";
import type { CompanyProductEntity } from "@/modules/domain/entities/company-product.entity";
import type { CompanyProductCreate, CompanyProductUpdate } from "@/modules/interfaces/company-product.interface";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface CompanyProductServices {
  getAllCompanyProducts(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<CompanyProductEntity>>;
  getCompanyProductById(id: string): Promise<CompanyProductEntity | null>;
  assignCompanyProducts(data: CompanyProductCreate): Promise<CompanyProductEntity[]>;
  updateCompanyProduct(id: string, data: CompanyProductUpdate): Promise<CompanyProductEntity>;
  deleteCompanyProduct(id: string): Promise<boolean>;
}

export class CompanyProductServiceImpl implements CompanyProductServices {
  constructor(private readonly companyProductRepository: CompanyProductRepository) {}

  async getAllCompanyProducts(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CompanyProductEntity>> {
    return await this.companyProductRepository.findAll(params, includeDeleted);
  }

  async getCompanyProductById(id: string): Promise<CompanyProductEntity | null> {
    return await this.companyProductRepository.findById(id);
  }

  async assignCompanyProducts(data: CompanyProductCreate): Promise<CompanyProductEntity[]> {
    if (!data.product_ids || data.product_ids.length === 0) {
      throw new Error("At least one product is required");
    }
    return await this.companyProductRepository.assign(data);
  }

  async updateCompanyProduct(id: string, data: CompanyProductUpdate): Promise<CompanyProductEntity> {
    return await this.companyProductRepository.update(id, data);
  }

  async deleteCompanyProduct(id: string): Promise<boolean> {
    const record = await this.companyProductRepository.findById(id);
    if (!record) {
      throw new Error(`Company product with id ${id} not found`);
    }
    if (record.isDeleted()) {
      throw new Error(`Company product with id ${id} is already unassigned`);
    }
    return await this.companyProductRepository.delete(id);
  }
}
