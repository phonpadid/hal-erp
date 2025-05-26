import type { CategoryRepository } from "@/modules/domain/repository/category.repository";

export class RestoreCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<boolean> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    if (!category.isDeleted()) {
      throw new Error(`Category with id ${id} is not deleted`);
    }
    return await this.categoryRepository.restore(id);
  }
}
