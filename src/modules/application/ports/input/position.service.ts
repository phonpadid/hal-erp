import type { Position } from "../../../domain/entities/position.entities";
import type { CreatePositionDTO, UpdatePositionDTO } from "../../dtos/position.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface PositionService {
  createPosition(createPositionDTO: CreatePositionDTO): Promise<Position>;
  getPositionById(id: string): Promise<Position | null>;
  getPositionByName(name: string): Promise<Position | null>;
  getAllPositions(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Position>>;
  updatePosition(id: string, updatePositionDTO: UpdatePositionDTO): Promise<Position>;
  deletePosition(id: string): Promise<boolean>;
  restorePosition(id: string): Promise<boolean>;
}
