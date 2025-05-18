import type { UnitRepository } from "@/modules/domain/repository/UnitRepository";
import type { UnitService } from "../../ports/input/Unitservice";
import type { Unit } from "../../../domain/entities/Unit";
import type { CreateUnitDTO, UpdateUnitDTO } from "../../dtos/UnitDTO";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/paagination";
import { CreateUnitUseCase } from "../unit/CreateUnitUseCase";
import { GetUnitUseCase } from "../unit/GetUnitUseCase";
import { UpdateUnitUseCase } from "../unit/UpdateUnitUseCase";
import { DeleteUnitUseCase } from "../unit/DeleteUnitUseCase";
import { RestoreUnitUseCase } from "../unit/RestoreUnitUseCase";

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
