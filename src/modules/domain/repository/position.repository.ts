import { Position } from "../entities/position.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface PositionRepository {
  create(position: Position): Promise<Position>;
  findById(id: string): Promise<Position | null>;
  findByName(name: string): Promise<Position | null>;
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Position>>;
  update(position: Position): Promise<Position>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}
