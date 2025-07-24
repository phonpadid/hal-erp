import type{ CategoryRepository } from "@/modules/domain/repository/category.repository";
import type { Category } from "../../../domain/entities/categories.entity";

export class GetCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    return category;
  }
}
