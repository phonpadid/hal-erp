import type{ UpdatePositionDTO } from "../../dtos/position.dto";
import type{ PositionRepository } from "@/modules/domain/repository/position.repository";
import type{ Position } from "../../../domain/entities/position.entity";

export class UpdatePositionUseCase {
  constructor(private readonly positionRepository: PositionRepository) {}

  async execute(id: string, updatePositionDTO: UpdatePositionDTO): Promise<Position> {
    const position = await this.positionRepository.findById(id);
    if (!position) {
      throw new Error(`Position with id ${id} not found`);
    }

    if (position.getName() !== updatePositionDTO.name) {
      const existingPositionWithName = await this.positionRepository.findByName(updatePositionDTO.name);
      if (existingPositionWithName && existingPositionWithName.getId() !== id) {
        throw new Error(`Position with name ${updatePositionDTO.name} already exists`);
      }
    }
    position.updateName(updatePositionDTO.name);
    return await this.positionRepository.update(position);
  }
}
