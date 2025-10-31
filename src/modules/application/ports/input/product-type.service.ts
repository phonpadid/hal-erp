import type { ProductTypeEntity } from "../../../domain/entities/product-types.entity";
import type { CreateProductTypeDTO, UpdateProductTypeDTO } from "../../dtos/product-type.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface ProductTypeService {
  createProductType(createProductTypeDTO: CreateProductTypeDTO): Promise<ProductTypeEntity>;
  getProductTypeById(id: string): Promise<ProductTypeEntity | null>;
  getProductTypeByName(name: string): Promise<ProductTypeEntity | null>;
  getAllProductTypes(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<ProductTypeEntity>>;
  updateProductType(id: string, updateProductTypeDTO: UpdateProductTypeDTO): Promise<ProductTypeEntity>;
  deleteProductType(id: string): Promise<boolean>;
  restoreProductType(id: string): Promise<boolean>;
}