import type {
  VendorProductCreateInterface,
  VendorProductUpdateInterface,
} from "@/modules/interfaces/vendors/vendor_product/vendor-product.interface";
import { VendorProductEntity } from "@/modules/domain/entities/vendor-products/vendor-product.entity";
import type { VendorProductRepository } from "@/modules/domain/repository/vendors/vendor_product/vendor-product.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class MockVendorProductRepository implements VendorProductRepository {
  private vendorProducts: VendorProductEntity[] = [];
  private nextId = 1;

  constructor() {
    // Initialize with some mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Add some sample vendor products for testing
    const mockData = [
      { vendor_id: 1, product_id: 1, price: 1500000 },
      { vendor_id: 1, product_id: 2, price: 2500000 },
      { vendor_id: 2, product_id: 1, price: 1200000 },
    ];

    mockData.forEach(data => {
      const vendorProduct = VendorProductEntity.create({
        vendor_id: data.vendor_id,
        product_id: data.product_id,
        product_name: `Product ${data.product_id}`,
        vendor_name: `Vendor ${data.vendor_id}`,
        price: data.price,
      });
      this.vendorProducts.push(vendorProduct);
      this.nextId++;
    });
  }

  async findAll(
    params: PaginationParams = { page: 1, limit: 10 },
    vendorId?: number,
    productId?: number,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<VendorProductEntity>> {
    let filteredProducts = this.vendorProducts;

    // Filter by vendor_id if provided
    if (vendorId) {
      filteredProducts = filteredProducts.filter(vp => vp.getVendorId() === vendorId);
    }

    // Filter by product_id if provided
    if (productId) {
      filteredProducts = filteredProducts.filter(vp => vp.getProductId() === productId);
    }

    // Filter deleted items if not including deleted
    if (!includeDeleted) {
      filteredProducts = filteredProducts.filter(vp => !vp.isDeleted());
    }

    // Apply search filter if provided
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(vp =>
        vp.getVendorId().toString().toLowerCase().includes(searchTerm) ||
        vp.getProductId().toString().toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<VendorProductEntity | null> {
    const vendorProduct = this.vendorProducts.find(vp => vp.getId() === id);
    return vendorProduct || null;
  }

  async findByVendorId(vendorId: number): Promise<VendorProductEntity[]> {
    return this.vendorProducts.filter(vp => vp.getVendorId() === vendorId && !vp.isDeleted());
  }

  async findByProductId(productId: number): Promise<VendorProductEntity[]> {
    return this.vendorProducts.filter(vp => vp.getProductId() === productId && !vp.isDeleted());
  }

  async findByVendorAndProduct(vendorId: number, productId: number): Promise<VendorProductEntity | null> {
    const vendorProduct = this.vendorProducts.find(
      vp => vp.getVendorId() === vendorId &&
             vp.getProductId() === productId &&
             !vp.isDeleted()
    );
    return vendorProduct || null;
  }

  async create(vendorProductData: VendorProductCreateInterface): Promise<VendorProductEntity> {
    // Check if vendor-product combination already exists
    const existing = await this.findByVendorAndProduct(vendorProductData.vendor_id, vendorProductData.product_id);
    if (existing) {
      throw new Error("Vendor product relationship already exists");
    }

    const vendorProduct = VendorProductEntity.create({
      vendor_id: vendorProductData.vendor_id,
      product_id: vendorProductData.product_id,
      product_name: `Product ${vendorProductData.product_id}`,
      vendor_name: `Vendor ${vendorProductData.vendor_id}`,
      price: vendorProductData.price,
      currency_id: vendorProductData.currency_id,
    });

    this.vendorProducts.push(vendorProduct);
    this.nextId++;

    return vendorProduct;
  }

  async update(id: string, vendorProductData: VendorProductUpdateInterface): Promise<VendorProductEntity> {
    const vendorProduct = this.vendorProducts.find(vp => vp.getId() === id);
    if (!vendorProduct) {
      throw new Error("Vendor product not found");
    }

    if (vendorProduct.isDeleted()) {
      throw new Error("Cannot update deleted vendor product");
    }

    // Create updated version using the update method
    const updatedProduct = vendorProduct.update(vendorProductData);

    // Replace in array
    const index = this.vendorProducts.findIndex(vp => vp.getId() === id);
    if (index !== -1) {
      this.vendorProducts[index] = updatedProduct;
    }

    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    const vendorProduct = this.vendorProducts.find(vp => vp.getId() === id);
    if (!vendorProduct) {
      throw new Error("Vendor product not found");
    }

    if (vendorProduct.isDeleted()) {
      throw new Error("Vendor product is already deleted");
    }

    // Create deleted version using softDelete method
    const deletedProduct = vendorProduct.softDelete();

    // Replace in array
    const index = this.vendorProducts.findIndex(vp => vp.getId() === id);
    if (index !== -1) {
      this.vendorProducts[index] = deletedProduct;
    }

    return true;
  }

  async restore(id: string): Promise<VendorProductEntity> {
    const vendorProduct = this.vendorProducts.find(vp => vp.getId() === id);
    if (!vendorProduct) {
      throw new Error("Vendor product not found");
    }

    if (!vendorProduct.isDeleted()) {
      throw new Error("Vendor product is not deleted");
    }

    // Create restored version using restore method
    const restoredProduct = vendorProduct.restore();

    // Replace in array
    const index = this.vendorProducts.findIndex(vp => vp.getId() === id);
    if (index !== -1) {
      this.vendorProducts[index] = restoredProduct;
    }

    return restoredProduct;
  }
}