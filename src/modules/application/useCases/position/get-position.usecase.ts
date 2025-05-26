import type { PositionRepository } from "@/modules/domain/repository/position.repository";
import type { Position } from "../../../domain/entities/position.entities";

export class GetPositionUseCase {
  constructor(private readonly positionRepository: PositionRepository) {}

  async execute(id: string): Promise<Position> {
    const position = await this.positionRepository.findById(id);
    if (!position) {
      throw new Error(`Position with id ${id} not found`);
    }
    return position;
  }
}
