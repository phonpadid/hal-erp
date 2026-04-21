import type { VendorProductEntity } from "@/modules/domain/entities/vendor-products/vendor-product.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface VendorProductRepository {
  findAll(
    params?: PaginationParams,
    vendorId?: number,
    productId?: number,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<VendorProductEntity>>;

  findById(id: string): Promise<VendorProductEntity | null>;

  findByVendorId(vendorId: number): Promise<VendorProductEntity[]>;

  findByProductId(productId: number): Promise<VendorProductEntity[]>;

  findByVendorAndProduct(vendorId: number, productId: number): Promise<VendorProductEntity | null>;

  create(vendorProductData: {
    vendor_id: number;
    product_id: number;
    product_name?: string;
    vendor_name?: string;
    price: number;
    currency_id?: number;
  }): Promise<VendorProductEntity>;

  update(id: string, vendorProductData: {
    vendor_id?: number;
    product_id?: number;
    product_name?: string;
    vendor_name?: string;
    price?: number;
    currency_id?: number;
  }): Promise<VendorProductEntity>;

  delete(id: string): Promise<boolean>;

  restore(id: string): Promise<VendorProductEntity>;
}