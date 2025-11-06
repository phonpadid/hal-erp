import type { VendorProductRepository } from "@/modules/domain/repository/vendors/vendor_product/vendor-product.repository";
import type { VendorProductCreateInterface, VendorProductUpdateInterface } from "@/modules/interfaces/vendors/vendor_product/vendor-product.interface";
import type { VendorProductEntity } from "@/modules/domain/entities/vendors/vendor_product/vendor-product.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class VendorProductServiceImpl {
  constructor(private vendorProductRepository: VendorProductRepository) {}

  async getAllVendorProducts(
    params: PaginationParams,
    vendorId?: string,
    productId?: string
  ): Promise<PaginatedResult<VendorProductEntity>> {
    return await this.vendorProductRepository.findAll(params, vendorId, productId);
  }

  async getVendorProductById(id: string): Promise<VendorProductEntity | null> {
    return await this.vendorProductRepository.findById(id);
  }

  async getVendorProductsByVendorId(vendorId: string): Promise<VendorProductEntity[]> {
    return await this.vendorProductRepository.findByVendorId(vendorId);
  }

  async getVendorProductsByProductId(productId: string): Promise<VendorProductEntity[]> {
    return await this.vendorProductRepository.findByProductId(productId);
  }

  async getVendorProductByVendorAndProduct(
    vendorId: string,
    productId: string
  ): Promise<VendorProductEntity | null> {
    return await this.vendorProductRepository.findByVendorAndProduct(vendorId, productId);
  }

  async createVendorProduct(vendorProductData: VendorProductCreateInterface): Promise<VendorProductEntity> {
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

  async updateVendorProduct(id: string, vendorProductData: VendorProductUpdateInterface): Promise<VendorProductEntity> {
    const existingVendorProduct = await this.vendorProductRepository.findById(id);
    if (!existingVendorProduct) {
      throw new Error("Vendor product not found");
    }

    if (existingVendorProduct.isDeleted()) {
      throw new Error("Cannot update deleted vendor product");
    }

    return await this.vendorProductRepository.update(id, vendorProductData);
  }

  async deleteVendorProduct(id: string): Promise<boolean> {
    const vendorProduct = await this.vendorProductRepository.findById(id);
    if (!vendorProduct) {
      throw new Error("Vendor product not found");
    }

    if (vendorProduct.isDeleted()) {
      throw new Error("Vendor product is already deleted");
    }

    return await this.vendorProductRepository.delete(id);
  }

  async restoreVendorProduct(id: string): Promise<VendorProductEntity> {
    const vendorProduct = await this.vendorProductRepository.findById(id);
    if (!vendorProduct) {
      throw new Error("Vendor product not found");
    }

    if (!vendorProduct.isDeleted()) {
      throw new Error("Vendor product is not deleted");
    }

    return await this.vendorProductRepository.restore(id);
  }
}