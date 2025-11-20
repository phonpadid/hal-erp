import { VendorProductEntity } from "@/modules/domain/entities/vendor-products/vendor-product.entity";

export interface VendorProductRepository {
  getAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    vendor_id?: number;
    product_id?: number;
    includeDeleted?: boolean;
  }): Promise<{
    vendor_products: VendorProductEntity[];
    total: number;
    page: number;
    limit: number;
  }>;

  getById(id: string, includeDeleted?: boolean): Promise<VendorProductEntity | null>;

  create(vendorProduct: VendorProductEntity): Promise<VendorProductEntity>;

  update(id: string, vendorProduct: VendorProductEntity): Promise<VendorProductEntity>;

  delete(id: string): Promise<void>;

  restore(id: string): Promise<VendorProductEntity>;

  exists(vendor_id: number, product_id: number): Promise<boolean>;

  getByVendorId(vendorId: number): Promise<VendorProductEntity[]>;

  getByProductId(productId: number): Promise<VendorProductEntity[]>;
}