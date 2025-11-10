import type { VendorProductEntity } from "@/modules/domain/entities/vendors/vendor_product/vendor-product.entity";
import type { VendorProductCreateInterface, VendorProductUpdateInterface } from "@/modules/interfaces/vendors/vendor_product/vendor-product.interface";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface VendorProductRepository {
  findAll(
    params?: PaginationParams,
    vendorId?: string,
    productId?: string,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<VendorProductEntity>>;

  findById(id: string): Promise<VendorProductEntity | null>;

  findByVendorId(vendorId: string): Promise<VendorProductEntity[]>;

  findByProductId(productId: string): Promise<VendorProductEntity[]>;

  findByVendorAndProduct(vendorId: string, productId: string): Promise<VendorProductEntity | null>;

  create(vendorProductData: VendorProductCreateInterface): Promise<VendorProductEntity>;

  update(id: string, vendorProductData: VendorProductUpdateInterface): Promise<VendorProductEntity>;

  delete(id: string): Promise<boolean>;

  restore(id: string): Promise<VendorProductEntity>;
}