import type { UnitEntity } from "@/modules/domain/entities/unit.entity";
import type { UnitRepository } from "@/modules/domain/repository/unit.repository";
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";

export class GetAllUnitUseCase {
  constructor(private readonly unitRepository: UnitRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<UnitEntity>> {
    return await this.unitRepository.findAll(params, includeDeleted);
  }
}
