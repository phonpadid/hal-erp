import {v4 as uuidv4} from 'uuid';
import {Category} from '../../../domain/entities/categories.entities';
import type {CategoryRepository} from '@/modules/domain/repository/category.repository';
import type { CreateCategoryDTO } from '../../dtos/category.dto';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(createCategoryDTO: CreateCategoryDTO): Promise<Category> {
    const existingCategory = await this.categoryRepository.findByName(createCategoryDTO.name);
    if (existingCategory) {
      throw new Error(`Category with name ${createCategoryDTO.name} already exists`);
    }
    const category = Category.create(uuidv4(), createCategoryDTO.name);
    return await this.categoryRepository.create(category);
  }
}
