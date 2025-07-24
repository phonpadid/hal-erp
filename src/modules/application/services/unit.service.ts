import type { UnitRepository } from "@/modules/domain/repository/unit.repository";
import type { UnitService } from "../ports/input/unit.service";
import type { Unit } from "../../domain/entities/unit.entity";
import type { CreateUnitDTO, UpdateUnitDTO } from "../dtos/unit.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { CreateUnitUseCase } from "../useCases/unit/create-unit.usecase";
import { GetUnitUseCase } from "../useCases/unit/get-unit.usecase";
import { UpdateUnitUseCase } from "../useCases/unit/update-unit.usecase";
import { DeleteUnitUseCase } from "../useCases/unit/delete-unit.usecase";
import { RestoreUnitUseCase } from "../useCases/unit/restore-unit.usecase";

export class UnitServiceImpl implements UnitService {
  private readonly createUnitUseCase: CreateUnitUseCase;
  private readonly getUnitUseCase: GetUnitUseCase;
  private readonly updateUnitUseCase: UpdateUnitUseCase;
  private readonly deleteUnitUseCase: DeleteUnitUseCase;
  private readonly restoreUnitUseCase: RestoreUnitUseCase;

  constructor(private readonly unitRepository: UnitRepository) {
    this.createUnitUseCase = new CreateUnitUseCase(unitRepository);
    this.getUnitUseCase = new GetUnitUseCase(unitRepository);
    this.updateUnitUseCase = new UpdateUnitUseCase(unitRepository);
    this.deleteUnitUseCase = new DeleteUnitUseCase(unitRepository);
    this.restoreUnitUseCase = new RestoreUnitUseCase(unitRepository);
  }

  async createUnit(createUnitDTO: CreateUnitDTO): Promise<Unit> {
    return await this.createUnitUseCase.execute(createUnitDTO);
  }

  async getUnitById(id: string): Promise<Unit | null> {
    return await this.getUnitUseCase.execute(id);
  }

  async getUnitByName(name: string): Promise<Unit | null> {
    return await this.unitRepository.findByName(name);
  }

  async getAllUnits(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Unit>> {
    return await this.unitRepository.findAll(params, includeDeleted);
  }

  async updateUnit(id: string, updateUnitDTO: UpdateUnitDTO): Promise<Unit> {
    return await this.updateUnitUseCase.execute(id, updateUnitDTO);
  }

  async deleteUnit(id: string): Promise<boolean> {
    return await this.deleteUnitUseCase.execute(id);
  }

  async restoreUnit(id: string): Promise<boolean> {
    return await this.restoreUnitUseCase.execute(id);
  }
}
