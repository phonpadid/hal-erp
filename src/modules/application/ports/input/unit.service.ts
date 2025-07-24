import type { Unit } from "../../../domain/entities/unit.entity";
import type { CreateUnitDTO, UpdateUnitDTO } from "../../dtos/unit.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface UnitService {
  createUnit(createUnitDTO: CreateUnitDTO): Promise<Unit>;
  getUnitById(id: string): Promise<Unit | null>;
  getUnitByName(name: string): Promise<Unit | null>;
  getAllUnits(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Unit>>;
  updateUnit(id: string, updateUnitDTO: UpdateUnitDTO): Promise<Unit>;
  deleteUnit(id: string): Promise<boolean>;
  restoreUnit(id: string): Promise<boolean>;
}
