import type { ProductEntity } from "../../../domain/entities/product.entity";
import type { CreateProductDTO, UpdateProductDTO } from "../../dtos/product.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface ProductService {
  createProduct(createProductDTO: CreateProductDTO): Promise<ProductEntity>;
  getProductById(id: string): Promise<ProductEntity | null>;
  getProductByName(name: string): Promise<ProductEntity | null>;
  getProductsByProductTypeId(product_type_id: number): Promise<ProductEntity[]>;
  getAllProducts(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<ProductEntity>>;
  updateProduct(id: string, updateProductDTO: UpdateProductDTO): Promise<ProductEntity>;
  deleteProduct(id: string): Promise<boolean>;
  restoreProduct(id: string): Promise<boolean>;
}