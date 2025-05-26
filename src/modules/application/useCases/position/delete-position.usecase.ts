import type { PositionRepository } from "@/modules/domain/repository/position.repository";

export class DeletePositionUseCase {
  constructor(private readonly positionRepository: PositionRepository) {}

  async execute(id: string): Promise<boolean> {
    const position = await this.positionRepository.findById(id);
    if (!position) {
      throw new Error(`Position with id ${id} not found`);
    }
    if (position.isDeleted()) {
      throw new Error(`Position with id ${id} is already deleted`);
    }
    return await this.positionRepository.delete(id);
  }
}
