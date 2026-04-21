import type { VendorProductRepository } from "@/modules/domain/repository/vendor-products/vendor-product.repository";
import type { VendorProductEntity } from "@/modules/domain/entities/vendor-products/vendor-product.entity";
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
    return await this.vendorProductRepository.create(data);
  }

  async getVendorProductById(id: string): Promise<VendorProductEntity | null> {
    return await this.vendorProductRepository.findById(id);
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
    const paginationParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
    };

    const result = await this.vendorProductRepository.findAll(
      paginationParams,
      params.vendor_id,
      params.product_id
    );

    return {
      vendor_products: result.data,
      total: result.total ?? 0,
      page: result.page ?? 1,
      limit: result.limit ?? 10,
    };
  }

  async updateVendorProduct(id: string, data: UpdateVendorProductDTO): Promise<VendorProductEntity> {
    const existingVendorProduct = await this.vendorProductRepository.findById(id);
    if (!existingVendorProduct) {
      throw new Error("Vendor product not found");
    }

    return await this.vendorProductRepository.update(id, data);
  }

  async deleteVendorProduct(id: string): Promise<void> {
    await this.vendorProductRepository.delete(id);
  }

  async restoreVendorProduct(id: string): Promise<VendorProductEntity> {
    return await this.vendorProductRepository.restore(id);
  }

  async checkVendorProductExists(vendor_id: number, product_id: number): Promise<boolean> {
    const result = await this.vendorProductRepository.findByVendorAndProduct(vendor_id, product_id);
    return result !== null;
  }

  async getVendorProductsByVendorId(vendorId: number): Promise<VendorProductEntity[]> {
    return await this.vendorProductRepository.findByVendorId(vendorId);
  }

  async getVendorProductsByProductId(productId: number): Promise<VendorProductEntity[]> {
    return await this.vendorProductRepository.findByProductId(productId);
  }
}