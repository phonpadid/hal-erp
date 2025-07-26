import type { PositionEntity } from "../entities/position.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreatePositionDTO, UpdatePositionDTO } from "@/modules/application/dtos/position.dto";

export interface PositionRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<PositionEntity>>;
  findById(id: string): Promise<PositionEntity | null>;
  findByName(name: string): Promise<PositionEntity | null>;
  create(data: CreatePositionDTO): Promise<PositionEntity>;
  update(id: string, data: UpdatePositionDTO): Promise<PositionEntity>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}
