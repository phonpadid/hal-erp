import type { UpdateCategoryDTO } from "../../dtos/category.dto";
import type { CategoryRepository } from "@/modules/domain/repository/category.repository";
import type { CategoryEntity } from "../../../domain/entities/categories.entity";

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) { }

  async execute(id: string, updateCategoryDTO: UpdateCategoryDTO): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    if (category.isDeleted()) {
      throw new Error(`Can not update, deleted category with id ${id}`);
    }
    if (
      updateCategoryDTO.name &&
      updateCategoryDTO.name !== category.getName()
    ) {
      const existingName = await this.categoryRepository.findByName(updateCategoryDTO.name);
      if (existingName && existingName.getId() !== id) {
        throw new Error(`Name "${updateCategoryDTO.name}" already exists`);
      }
    }
    return await this.categoryRepository.update(id, updateCategoryDTO);
  }
}
