import type { ProductRepository } from "@/modules/domain/repository/product.repository";
import type { ProductEntity } from "../../domain/entities/product.entity";
import type { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { CreateProductUseCase } from "../useCases/product/create-product.usecase";
import { GetProductUseCase } from "../useCases/product/get-product.usecase";
import { UpdateProductUseCase } from "../useCases/product/update-product.usecase";
import { DeleteProductUseCase } from "../useCases/product/delete-product.usecase";
import { RestoreProductUseCase } from "../useCases/product/restore-product.usecase";
import type { ProductService } from "../ports/input/product.service";

export class ProductServiceImpl implements ProductService {
  private readonly createProductUseCase: CreateProductUseCase;
  private readonly getProductUseCase: GetProductUseCase;
  private readonly updateProductUseCase: UpdateProductUseCase;
  private readonly deleteProductUseCase: DeleteProductUseCase;
  private readonly restoreProductUseCase: RestoreProductUseCase;

  constructor(private readonly productRepository: ProductRepository) {
    this.createProductUseCase = new CreateProductUseCase(productRepository);
    this.getProductUseCase = new GetProductUseCase(productRepository);
    this.updateProductUseCase = new UpdateProductUseCase(productRepository);
    this.deleteProductUseCase = new DeleteProductUseCase(productRepository);
    this.restoreProductUseCase = new RestoreProductUseCase(productRepository);
  }

  async createProduct(createProductDTO: CreateProductDTO): Promise<ProductEntity> {
    return await this.createProductUseCase.execute(createProductDTO);
  }

  async getProductById(id: string): Promise<ProductEntity | null> {
    return await this.getProductUseCase.execute(id);
  }

  async getProductByName(name: string): Promise<ProductEntity | null> {
    return await this.productRepository.findByName(name);
  }

  async getProductsByProductTypeId(product_type_id: number): Promise<ProductEntity[]> {
    return await this.productRepository.findByProductTypeId(product_type_id);
  }

  async getAllProducts(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ProductEntity>> {
    return await this.productRepository.findAll(params, includeDeleted);
  }

  async updateProduct(id: string, updateProductDTO: UpdateProductDTO): Promise<ProductEntity> {
    return await this.updateProductUseCase.execute(id, updateProductDTO);
  }

  async deleteProduct(id: string): Promise<boolean> {
    return await this.deleteProductUseCase.execute(id);
  }

  async restoreProduct(id: string): Promise<boolean> {
    return await this.restoreProductUseCase.execute(id);
  }
}