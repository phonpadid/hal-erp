import type { VendorProductUpdateInterface } from "@/modules/interfaces/vendors/vendor_product/vendor-product.interface";
import type { VendorProductEntity } from "@/modules/domain/entities/vendors/vendor_product/vendor-product.entity";
import type { VendorProductRepository } from "@/modules/domain/repository/vendors/vendor_product/vendor-product.repository";

export class UpdateVendorProductUseCase {
  constructor(private vendorProductRepository: VendorProductRepository) {}

  async execute(id: string, vendorProductData: VendorProductUpdateInterface): Promise<VendorProductEntity> {
    if (!id || id.trim() === "") {
      throw new Error("Vendor Product ID is required");
    }

    // Check if vendor product exists
    const existingVendorProduct = await this.vendorProductRepository.findById(id);
    if (!existingVendorProduct) {
      throw new Error("Vendor product not found");
    }

    if (existingVendorProduct.isDeleted()) {
      throw new Error("Cannot update deleted vendor product");
    }

    // Validate price if provided
    if (vendorProductData.price !== undefined && vendorProductData.price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    return await this.vendorProductRepository.update(id, vendorProductData);
  }
}