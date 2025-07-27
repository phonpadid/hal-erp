import type { CategoryRepository } from "@/modules/domain/repository/category.repository";

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<boolean> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    if (category.isDeleted()) {
      throw new Error(`Category with id ${id} is already deleted`);
    }
    return await this.categoryRepository.delete(id);
  }
}
