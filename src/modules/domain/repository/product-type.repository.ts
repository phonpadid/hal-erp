import type { ProductTypeEntity } from "../entities/product-types.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateProductTypeDTO, UpdateProductTypeDTO } from "@/modules/application/dtos/product-type.dto";

export interface ProductTypeRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<ProductTypeEntity>>;
  findById(id: string): Promise<ProductTypeEntity | null>;
  findByName(name: string): Promise<ProductTypeEntity | null>;
  create(data: CreateProductTypeDTO): Promise<ProductTypeEntity>;
  update(id: string, data: UpdateProductTypeDTO): Promise<ProductTypeEntity>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}