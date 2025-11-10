import type { VendorProductRepository } from "@/modules/domain/repository/vendors/vendor_product/vendor-product.repository";

export class DeleteVendorProductUseCase {
  constructor(private vendorProductRepository: VendorProductRepository) {}

  async execute(id: string): Promise<boolean> {
    if (!id || id.trim() === "") {
      throw new Error("Vendor Product ID is required");
    }

    const vendorProduct = await this.vendorProductRepository.findById(id);
    if (!vendorProduct) {
      throw new Error("Vendor product not found");
    }

    if (vendorProduct.isDeleted()) {
      throw new Error("Vendor product is already deleted");
    }

    return await this.vendorProductRepository.delete(id);
  }
}