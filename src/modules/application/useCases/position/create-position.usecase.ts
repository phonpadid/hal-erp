import {v4 as uuidv4} from 'uuid';
import {Position} from '../../../domain/entities/position.entities';
import type {PositionRepository} from '@/modules/domain/repository/position.repository';
import type { CreatePositionDTO } from '../../dtos/position.dto';

export class CreatePositionUseCase {
  constructor(private readonly positionRepository: PositionRepository) {}

  async execute(createPositionDTO: CreatePositionDTO): Promise<Position> {
    const existingPosition = await this.positionRepository.findByName(createPositionDTO.name);
    if (existingPosition) {
      throw new Error(`Position with name ${createPositionDTO.name} already exists`);
    }
    const position = Position.create(uuidv4(), createPositionDTO.name);
    return await this.positionRepository.create(position);
  }
}
