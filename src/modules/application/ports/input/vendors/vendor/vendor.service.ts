import type {
  CreateVendorDto,
  UpdateVendorDto,
} from "@/modules/application/dtos/vendors/vendor/vendor.dto";
import type { VendorsEntity } from "@/modules/domain/entities/vendors/vendor/vendors.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface VendorService {
  createVendors(createVendorsDTO: CreateVendorDto): Promise<VendorsEntity>;
  getVendorsById(id: string): Promise<VendorsEntity | null>;
  getAllVendors(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<VendorsEntity>>;
  updateVendors(id: string, updateVendorsDTO: UpdateVendorDto): Promise<VendorsEntity>;
  deleteVendors(id: string): Promise<boolean>;
}
