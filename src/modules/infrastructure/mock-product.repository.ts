import type { CreateProductDTO, UpdateProductDTO } from "@/modules/application/dtos/product.dto";
import { ProductEntity } from "@/modules/domain/entities/product.entity";
import type { ProductRepository } from "@/modules/domain/repository/product.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class MockProductRepository implements ProductRepository {
  private products: ProductEntity[] = [];
  private nextId = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Add some sample products for testing
    const mockProducts = [
      { name: "Laptop Computer", description: "High-performance laptop for work", product_type_id: 1, status: "active" },
      { name: "Office Chair", description: "Ergonomic office chair", product_type_id: 2, status: "active" },
      { name: "Desk Phone", description: "Multi-line desk phone", product_type_id: 3, status: "active" },
      { name: "Printer", description: "Laser printer for office", product_type_id: 1, status: "active" },
      { name: "Monitor", description: "24-inch LED monitor", product_type_id: 1, status: "active" },
    ];

    mockProducts.forEach(productData => {
      const product = ProductEntity.create(
        this.nextId.toString(),
        productData.name,
        productData.description,
        productData.product_type_id,
        productData.status
      );
      this.products.push(product);
      this.nextId++;
    });
  }

  async findAll(
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ProductEntity>> {
    let filteredProducts = this.products;

    // Filter deleted items if not including deleted
    if (!includeDeleted) {
      filteredProducts = filteredProducts.filter(p => !p.isDeleted());
    }

    // Apply search filter if provided
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.getName().toLowerCase().includes(searchTerm) ||
        p.getDescription().toLowerCase().includes(searchTerm)
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

  async findById(id: string): Promise<ProductEntity | null> {
    const product = this.products.find(p => p.getId() === id);
    return product || null;
  }

  async findByName(name: string): Promise<ProductEntity | null> {
    const product = this.products.find(p => p.getName() === name && !p.isDeleted());
    return product || null;
  }

  async create(productData: CreateProductDTO): Promise<ProductEntity> {
    const product = ProductEntity.create(
      this.nextId.toString(),
      productData.name,
      productData.description,
      productData.product_type_id,
      "active" // Default status for new products
    );

    this.products.push(product);
    this.nextId++;

    return product;
  }

  async update(id: string, productData: UpdateProductDTO): Promise<ProductEntity> {
    const product = this.products.find(p => p.getId() === id);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.isDeleted()) {
      throw new Error("Cannot update deleted product");
    }

    if (productData.name !== undefined) {
      product.updateName(productData.name);
    }

    if (productData.description !== undefined) {
      product.updateDescription(productData.description);
    }

    if (productData.product_type_id !== undefined) {
      product.updateProductTypeId(productData.product_type_id);
    }

    if (productData.status !== undefined) {
      product.updateStatus(productData.status);
    }

    return product;
  }

  async delete(id: string): Promise<boolean> {
    const product = this.products.find(p => p.getId() === id);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.isDeleted()) {
      throw new Error("Product is already deleted");
    }

    product.delete();
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const product = this.products.find(p => p.getId() === id);
    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.isDeleted()) {
      throw new Error("Product is not deleted");
    }

    product.restore();
    return true;
  }

  async findByProductTypeId(productTypeId: number): Promise<ProductEntity[]> {
    return this.products.filter(p => p.getProductTypeId() === productTypeId && !p.isDeleted());
  }
}