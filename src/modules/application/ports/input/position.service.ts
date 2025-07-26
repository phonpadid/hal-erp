import type { PositionEntity } from "../../../domain/entities/position.entity";
import type { CreatePositionDTO, UpdatePositionDTO } from "../../dtos/position.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface PositionService {
  createPosition(createPositionDTO: CreatePositionDTO): Promise<PositionEntity>;
  getPositionById(id: string): Promise<PositionEntity | null>;
  getPositionByName(name: string): Promise<PositionEntity | null>;
  getAllPositions(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<PositionEntity>>;
  updatePosition(id: string, updatePositionDTO: UpdatePositionDTO): Promise<PositionEntity>;
  deletePosition(id: string): Promise<boolean>;
  restorePosition(id: string): Promise<boolean>;
}
