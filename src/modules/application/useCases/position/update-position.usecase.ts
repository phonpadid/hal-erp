import type { UpdatePositionDTO } from "../../dtos/position.dto";
import type { PositionRepository } from "@/modules/domain/repository/position.repository";
import type { PositionEntity } from "../../../domain/entities/position.entity";

export class UpdatePositionUseCase {
  constructor(private readonly positionRepository: PositionRepository) { }

  async execute(id: string, updatePositionDTO: UpdatePositionDTO): Promise<PositionEntity> {
    const position = await this.positionRepository.findById(id);
    if (!position) {
      throw new Error(`Position with id ${id} not found`);
    }
    if (position.isDeleted()) {
      throw new Error(`Can not update, deleted position with id ${id}`);
    }
    if (
      updatePositionDTO.name &&
      updatePositionDTO.name !== position.getName()
    ) {
      const existingName = await this.positionRepository.findByName(updatePositionDTO.name);
      if (existingName && existingName.getId() !== id) {
        throw new Error(`Name "${updatePositionDTO.name}" already exists`);
      }
    }
    return await this.positionRepository.update(id, updatePositionDTO);
  }
}
