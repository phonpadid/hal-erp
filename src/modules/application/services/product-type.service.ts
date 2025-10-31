import type { ProductTypeRepository } from "@/modules/domain/repository/product-type.repository";
import type { ProductTypeEntity } from "../../domain/entities/product-types.entity";
import type { CreateProductTypeDTO, UpdateProductTypeDTO } from "../dtos/product-type.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { CreateProductTypeUseCase } from "../useCases/product-type/create-product-type.usecase";
import { GetProductTypeUseCase } from "../useCases/product-type/get-product-type.usecase";
import { UpdateProductTypeUseCase } from "../useCases/product-type/update-product-type.usecase";
import { DeleteProductTypeUseCase } from "../useCases/product-type/delete-product-type.usecase";
import { RestoreProductTypeUseCase } from "../useCases/product-type/restore-product-type.usecase";
import type { ProductTypeService } from "../ports/input/product-type.service";

export class ProductTypeServiceImpl implements ProductTypeService {
  private readonly createProductTypeUseCase: CreateProductTypeUseCase;
  private readonly getProductTypeUseCase: GetProductTypeUseCase;
  private readonly updateProductTypeUseCase: UpdateProductTypeUseCase;
  private readonly deleteProductTypeUseCase: DeleteProductTypeUseCase;
  private readonly restoreProductTypeUseCase: RestoreProductTypeUseCase;

  constructor(private readonly productTypeRepository: ProductTypeRepository) {
    this.createProductTypeUseCase = new CreateProductTypeUseCase(productTypeRepository);
    this.getProductTypeUseCase = new GetProductTypeUseCase(productTypeRepository);
    this.updateProductTypeUseCase = new UpdateProductTypeUseCase(productTypeRepository);
    this.deleteProductTypeUseCase = new DeleteProductTypeUseCase(productTypeRepository);
    this.restoreProductTypeUseCase = new RestoreProductTypeUseCase(productTypeRepository);
  }

  async createProductType(createProductTypeDTO: CreateProductTypeDTO): Promise<ProductTypeEntity> {
    return await this.createProductTypeUseCase.execute(createProductTypeDTO);
  }

  async getProductTypeById(id: string): Promise<ProductTypeEntity | null> {
    return await this.getProductTypeUseCase.execute(id);
  }

  async getProductTypeByName(name: string): Promise<ProductTypeEntity | null> {
    return await this.productTypeRepository.findByName(name);
  }

  async getAllProductTypes(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ProductTypeEntity>> {
    return await this.productTypeRepository.findAll(params, includeDeleted);
  }

  async updateProductType(id: string, updateProductTypeDTO: UpdateProductTypeDTO): Promise<ProductTypeEntity> {
    return await this.updateProductTypeUseCase.execute(id, updateProductTypeDTO);
  }

  async deleteProductType(id: string): Promise<boolean> {
    return await this.deleteProductTypeUseCase.execute(id);
  }

  async restoreProductType(id: string): Promise<boolean> {
    return await this.restoreProductTypeUseCase.execute(id);
  }
}