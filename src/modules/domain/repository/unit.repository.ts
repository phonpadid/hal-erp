import type { UnitEntity } from "../entities/unit.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateUnitDTO, UpdateUnitDTO } from "@/modules/application/dtos/unit.dto";

export interface UnitRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<UnitEntity>>;
  findById(id: string): Promise<UnitEntity | null>;
  findByName(name: string): Promise<UnitEntity | null>;
  create(data: CreateUnitDTO): Promise<UnitEntity>;
  update(id: string, data: UpdateUnitDTO): Promise<UnitEntity>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}
