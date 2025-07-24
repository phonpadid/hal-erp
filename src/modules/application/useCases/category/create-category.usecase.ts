import {v4 as uuidv4} from 'uuid';
import {CategoryEntity} from '../../../domain/entities/categories.entity';
import type {CategoryRepository} from '@/modules/domain/repository/category.repository';
import type { CreateCategoryDTO } from '../../dtos/category.dto';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(createCategoryDTO: CreateCategoryDTO): Promise<CategoryEntity> {
    const category = CategoryEntity.create(uuidv4(), createCategoryDTO.name);
    return await this.categoryRepository.create(category);
  }
}
