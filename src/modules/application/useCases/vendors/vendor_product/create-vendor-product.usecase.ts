import type { VendorProductCreateInterface } from "@/modules/interfaces/vendors/vendor_product/vendor-product.interface";
import type { VendorProductEntity } from "@/modules/domain/entities/vendors/vendor_product/vendor-product.entity";
import type { VendorProductRepository } from "@/modules/domain/repository/vendors/vendor_product/vendor-product.repository";

export class CreateVendorProductUseCase {
  constructor(private vendorProductRepository: VendorProductRepository) {}

  async execute(vendorProductData: VendorProductCreateInterface): Promise<VendorProductEntity> {
    // Validate input data
    if (!vendorProductData.vendor_id || vendorProductData.vendor_id.trim() === "") {
      throw new Error("Vendor ID is required");
    }

    if (!vendorProductData.product_id || vendorProductData.product_id.trim() === "") {
      throw new Error("Product ID is required");
    }

    if (!vendorProductData.price || vendorProductData.price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    // Check if vendor-product combination already exists
    const existing = await this.vendorProductRepository.findByVendorAndProduct(
      vendorProductData.vendor_id,
      vendorProductData.product_id
    );

    if (existing && !existing.isDeleted()) {
      throw new Error("Vendor product relationship already exists");
    }

    return await this.vendorProductRepository.create(vendorProductData);
  }
}