import type { PositionEntity } from "@/modules/domain/entities/position.entity";
import type { PositionRepository } from "@/modules/domain/repository/position.repository";
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";

export class GetAllPositionUseCase{
  constructor(private readonly positionRepository: PositionRepository){}

  async execute(
    params:PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<PositionEntity>>{
    return await this.positionRepository.findAll(params, includeDeleted);
  }
}
