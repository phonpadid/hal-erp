import type { ProductEntity } from "../entities/product.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateProductDTO, UpdateProductDTO } from "@/modules/application/dtos/product.dto";

export interface ProductRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<ProductEntity>>;
  findById(id: string): Promise<ProductEntity | null>;
  findByName(name: string): Promise<ProductEntity | null>;
  findByProductTypeId(product_type_id: number): Promise<ProductEntity[]>;
  create(data: CreateProductDTO): Promise<ProductEntity>;
  update(id: string, data: UpdateProductDTO): Promise<ProductEntity>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}