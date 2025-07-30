import type { UnitEntity } from "../../../domain/entities/unit.entity";
import type { CreateUnitDTO, UpdateUnitDTO } from "../../dtos/unit.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface UnitService {
  createUnit(createUnitDTO: CreateUnitDTO): Promise<UnitEntity>;
  getUnitById(id: string): Promise<UnitEntity | null>;
  getUnitByName(name: string): Promise<UnitEntity | null>;
  getAllUnits(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<UnitEntity>>;
  updateUnit(id: string, updateUnitDTO: UpdateUnitDTO): Promise<UnitEntity>;
  deleteUnit(id: string): Promise<boolean>;
  restoreUnit(id: string): Promise<boolean>;
}
