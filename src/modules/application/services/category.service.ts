import type {CategoryRepository} from "@/modules/domain/repository/category.repository";
import type {CategoryService} from "../ports/input/category.service";
import type {Category} from "../../domain/entities/categories.entities";
import type {CreateCategoryDTO, UpdateCategoryDTO} from "../dtos/category.dto";
import type {PaginationParams, PaginatedResult} from "@/modules/shared/pagination";
import {CreateCategoryUseCase} from "../useCases/category/create-category.usecase";
import {GetCategoryUseCase} from "../useCases/category/get-category.usecase";
import {UpdateCategoryUseCase} from "../useCases/category/update-category.usecase";
import {DeleteCategoryUseCase} from "../useCases/category/delete-category.usecase";
import {RestoreCategoryUseCase} from "../useCases/category/restore-category.usecase";

 export class CategoryServiceImpl implements CategoryService {
  private readonly createCategoryUseCase: CreateCategoryUseCase;
  private readonly getCategoryUseCase: GetCategoryUseCase;
  private readonly updateCategoryUseCase: UpdateCategoryUseCase;
  private readonly deleteCategoryUseCase: DeleteCategoryUseCase;
  private readonly restoreCategoryUseCase: RestoreCategoryUseCase;

  constructor(private readonly categoryRepository: CategoryRepository) {
    this.createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
    this.getCategoryUseCase = new GetCategoryUseCase(categoryRepository);
    this.updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
    this.deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);
    this.restoreCategoryUseCase = new RestoreCategoryUseCase(categoryRepository);
  }

  async createCategory(createCategoryDTO: CreateCategoryDTO): Promise<Category> {
    return await this.createCategoryUseCase.execute(createCategoryDTO);
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return await this.getCategoryUseCase.execute(id);
  }

  async getCategoryByName(name: string): Promise<Category | null> {
    return await this.categoryRepository.findByName(name);
  }

  async getAllCategories(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Category>> {
    return await this.categoryRepository.findAll(params, includeDeleted);
  }

  async updateCategory(id: string, updateCategoryDTO: UpdateCategoryDTO): Promise<Category> {
    return await this.updateCategoryUseCase.execute(id, updateCategoryDTO);
  }

  async deleteCategory(id: string): Promise<boolean> {
    return await this.deleteCategoryUseCase.execute(id);
  }

  async restoreCategory(id: string): Promise<boolean> {
    return await this.restoreCategoryUseCase.execute(id);
  }
}
