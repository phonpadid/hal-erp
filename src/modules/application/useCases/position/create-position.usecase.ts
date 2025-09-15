import type { CreatePositionDTO } from "@/modules/application/dtos/position.dto";
import type { PositionRepository } from "@/modules/domain/repository/position.repository";
import type { PositionEntity } from "@/modules/domain/entities/position.entity";

export class CreatePositionUseCase {
  constructor(private readonly positionRepository: PositionRepository) {}

  async execute(positionData: CreatePositionDTO): Promise<PositionEntity> {
    const existing = await this.positionRepository.findByName(positionData.name);
    if (existing) {
      throw new Error(`Position name "${positionData.name}" already exists`);
    }
    // console.log('Proceeding to create position:', positionData);
    return await this.positionRepository.create(positionData);
  }
}
