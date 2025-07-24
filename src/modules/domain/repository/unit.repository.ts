import { Unit } from "../entities/unit.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface UnitRepository {
  create(unit: Unit): Promise<Unit>;
  findById(id: string): Promise<Unit | null>;
  findByName(name: string): Promise<Unit | null>;
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Unit>>;
  update(unit: Unit): Promise<Unit>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}
