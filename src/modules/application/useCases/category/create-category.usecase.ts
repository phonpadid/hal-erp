import {v4 as uuidv4} from 'uuid';
import {Category} from '../../../domain/entities/categories.entity';
import type {CategoryRepository} from '@/modules/domain/repository/category.repository';
import type { CreateCategoryDTO } from '../../dtos/category.dto';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(createCategoryDTO: CreateCategoryDTO): Promise<Category> {
    const category = Category.create(uuidv4(), createCategoryDTO.name);
    return await this.categoryRepository.create(category);
  }
}
