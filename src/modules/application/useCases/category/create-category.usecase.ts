import type { CreateCategoryDTO } from "@/modules/application/dtos/category.dto";
import type { CategoryRepository } from "@/modules/domain/repository/category.repository";
import type { CategoryEntity } from "@/modules/domain/entities/categories.entity";

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(categoryData: CreateCategoryDTO): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findByName(categoryData.name);
    if (existing) {
      throw new Error(`Category name "${categoryData.name}" already exists`);
    }
    console.log('Proceeding to create category:', categoryData);
    return await this.categoryRepository.create(categoryData);
  }
}
