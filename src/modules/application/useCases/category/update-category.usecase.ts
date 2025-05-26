import type { UpdateCategoryDTO } from "../../dtos/category.dto";
import type { CategoryRepository } from "@/modules/domain/repository/category.repository";
import type { Category } from "../../../domain/entities/categories.entities";

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) { }
  async execute(id: string, updateCategoryDTO: UpdateCategoryDTO): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }

    if (category.getName() !== updateCategoryDTO.name) {
      const existingCategoryWithName = await this.categoryRepository.findByName(updateCategoryDTO.name);
      if (existingCategoryWithName && existingCategoryWithName.getId() !== id) {
        throw new Error(`Category with name ${updateCategoryDTO.name} already exists`);
      }
    }
    category.updateName(updateCategoryDTO.name);
    return await this.categoryRepository.update(category);
  }
}
