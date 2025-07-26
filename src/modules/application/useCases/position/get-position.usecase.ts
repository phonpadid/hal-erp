import type { PositionRepository } from "@/modules/domain/repository/position.repository";
import type { PositionEntity } from "../../../domain/entities/position.entity";

export class GetPositionUseCase {
  constructor(private readonly positionRepository: PositionRepository) {}

  async execute(id: string): Promise<PositionEntity> {
    const position = await this.positionRepository.findById(id);
    if (!position) {
      throw new Error(`Position with id ${id} not found`);
    }
    return position;
  }
}
