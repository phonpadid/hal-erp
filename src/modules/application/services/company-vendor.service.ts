import type { CompanyVendorRepository } from "@/modules/domain/repository/company-vendor.repository";
import type { CompanyVendorEntity } from "@/modules/domain/entities/company-vendor.entity";
import type { CompanyVendorCreate, CompanyVendorUpdate } from "@/modules/interfaces/company-vendor.interface";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface CompanyVendorServices {
  getAllCompanyVendors(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<CompanyVendorEntity>>;
  getCompanyVendorById(id: string): Promise<CompanyVendorEntity | null>;
  assignCompanyVendor(data: CompanyVendorCreate): Promise<CompanyVendorEntity>;
  updateCompanyVendor(id: string, data: CompanyVendorUpdate): Promise<CompanyVendorEntity>;
  deleteCompanyVendor(id: string): Promise<boolean>;
}

export class CompanyVendorServiceImpl implements CompanyVendorServices {
  constructor(private readonly companyVendorRepository: CompanyVendorRepository) {}

  async getAllCompanyVendors(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CompanyVendorEntity>> {
    return await this.companyVendorRepository.findAll(params, includeDeleted);
  }

  async getCompanyVendorById(id: string): Promise<CompanyVendorEntity | null> {
    return await this.companyVendorRepository.findById(id);
  }

  async assignCompanyVendor(data: CompanyVendorCreate): Promise<CompanyVendorEntity> {
    if (!data.vendor_id) {
      throw new Error("A vendor is required");
    }
    return await this.companyVendorRepository.assign(data);
  }

  async updateCompanyVendor(id: string, data: CompanyVendorUpdate): Promise<CompanyVendorEntity> {
    return await this.companyVendorRepository.update(id, data);
  }

  async deleteCompanyVendor(id: string): Promise<boolean> {
    const record = await this.companyVendorRepository.findById(id);
    if (!record) {
      throw new Error(`Company vendor with id ${id} not found`);
    }
    if (record.isDeleted()) {
      throw new Error(`Company vendor with id ${id} is already unassigned`);
    }
    return await this.companyVendorRepository.delete(id);
  }
}
