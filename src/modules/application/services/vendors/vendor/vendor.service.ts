import type {
  VendorCreateInteface,
  VendorUpdateIntrface,
} from "@/modules/interfaces/vendors/vendor/vendor.interfacce";
import type { VendorsRepository } from "@/modules/domain/repository/vendors/vendor/vendor.repisitory";
import type { VendorsEntity } from "@/modules/domain/entities/vendors/vendor/vendors.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface VendorServices {
  getAllVendors(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<VendorsEntity>>;
  getVendorsById(id: string): Promise<VendorsEntity | null>;

  createVendors(vendorData: VendorCreateInteface): Promise<VendorsEntity>;
  updateVendors(id: string, vendorData: VendorUpdateIntrface): Promise<VendorsEntity>;

  deleteVendors(id: string): Promise<boolean>;
}

export class VendorServiceImpl implements VendorServices {
  constructor(private readonly vendorRepository: VendorsRepository) {}


  async getAllVendors(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<VendorsEntity>> {
    return await this.vendorRepository.findAll(params, includeDeleted);
  }

  async getVendorsById(id: string): Promise<VendorsEntity | null> {
    return await this.vendorRepository.findById(id);
  }

  async createVendors(vendorData: VendorCreateInteface): Promise<VendorsEntity> {
    return await this.vendorRepository.create(vendorData);
  }

  async updateVendors(id: string, vendorData: VendorUpdateIntrface): Promise<VendorsEntity> {
    const vendors = await this.vendorRepository.findById(id);
    if (!vendors) {
      throw new Error(`Vendors with id ${id} not found`);
    }
    return await this.vendorRepository.update(id, vendorData);
  }

  async deleteVendors(id: string): Promise<boolean> {
    const Vendors = await this.vendorRepository.findById(id);
    if (!Vendors) {
      throw new Error(`Vendors with id ${id} not found`);
    }
    if (Vendors.isDeleted()) {
      throw new Error(`Vendors with id ${id} is already deleted`);
    }

    return await this.vendorRepository.delete(id);
  }
}
