import type {
  VendorCreateInteface,
  VendorUpdateIntrface,
} from "@/modules/interfaces/vendors/vendor/vendor.interfacce";
import type { VendorsEntity } from "@/modules/domain/entities/vendors/vendor/vendors.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface VendorsRepository {
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<VendorsEntity>>;
  findById(id: string): Promise<VendorsEntity | null>;
  create(vendorsData: VendorCreateInteface): Promise<VendorsEntity>;
  update(id: string, vendorsData: VendorUpdateIntrface): Promise<VendorsEntity>;
  delete(id: string): Promise<boolean>;
}
