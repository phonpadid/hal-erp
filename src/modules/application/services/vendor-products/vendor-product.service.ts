import type { VendorProductRepository } from "@/modules/domain/repository/vendor-products/vendor-product.repository";
import { VendorProductEntity } from "@/modules/domain/entities/vendor-products/vendor-product.entity";
import type { CreateVendorProductDTO, UpdateVendorProductDTO } from "@/modules/application/dtos/vendor-products/vendor-product.dto";

export interface VendorProductService {
  createVendorProduct(data: CreateVendorProductDTO): Promise<VendorProductEntity>;
  getVendorProductById(id: string): Promise<VendorProductEntity | null>;
  getVendorProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    vendor_id?: number;
    product_id?: number;
    year?: string;
  }): Promise<{
    vendor_products: VendorProductEntity[];
    total: number;
    page: number;
    limit: number;
  }>;
  updateVendorProduct(id: string, data: UpdateVendorProductDTO): Promise<VendorProductEntity>;
  deleteVendorProduct(id: string): Promise<void>;
  restoreVendorProduct(id: string): Promise<VendorProductEntity>;
  checkVendorProductExists(vendor_id: number, product_id: number): Promise<boolean>;
  getVendorProductsByVendorId(vendorId: number): Promise<VendorProductEntity[]>;
  getVendorProductsByProductId(productId: number): Promise<VendorProductEntity[]>;
}

export class VendorProductServiceImpl implements VendorProductService {
  constructor(private vendorProductRepository: VendorProductRepository) {}

  async createVendorProduct(data: CreateVendorProductDTO): Promise<VendorProductEntity> {
    const vendorProduct = VendorProductEntity.create({
      vendor_id: data.vendor_id,
      product_id: data.product_id,
      product_name: data.product_name,
    });

    return await this.vendorProductRepository.create(vendorProduct);
  }

  async getVendorProductById(id: string): Promise<VendorProductEntity | null> {
    return await this.vendorProductRepository.getById(id);
  }

  async getVendorProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    vendor_id?: number;
    product_id?: number;
    year?: string;
  }): Promise<{
    vendor_products: VendorProductEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.vendorProductRepository.getAll(params);
  }

  async updateVendorProduct(id: string, data: UpdateVendorProductDTO): Promise<VendorProductEntity> {
    const existingVendorProduct = await this.vendorProductRepository.getById(id);
    if (!existingVendorProduct) {
      throw new Error("Vendor product not found");
    }

    const updatedVendorProduct = existingVendorProduct.update({
      vendor_id: data.vendor_id,
      product_id: data.product_id,
      product_name: data.product_name,
    });

    return await this.vendorProductRepository.update(id, updatedVendorProduct);
  }

  async deleteVendorProduct(id: string): Promise<void> {
    await this.vendorProductRepository.delete(id);
  }

  async restoreVendorProduct(id: string): Promise<VendorProductEntity> {
    return await this.vendorProductRepository.restore(id);
  }

  async checkVendorProductExists(vendor_id: number, product_id: number): Promise<boolean> {
    return await this.vendorProductRepository.exists(vendor_id, product_id);
  }

  async getVendorProductsByVendorId(vendorId: number): Promise<VendorProductEntity[]> {
    return await this.vendorProductRepository.getByVendorId(vendorId);
  }

  async getVendorProductsByProductId(productId: number): Promise<VendorProductEntity[]> {
    return await this.vendorProductRepository.getByProductId(productId);
  }
}