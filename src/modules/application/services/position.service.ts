import type { PositionRepository } from "@/modules/domain/repository/position.repository";
import type{ Position } from "../../domain/entities/position.entities";
import type { CreatePositionDTO } from "../dtos/position.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import {CreatePositionUseCase} from "../useCases/position/create-position.usecase";
import {GetPositionUseCase} from "../useCases/position/get-position.usecase";
import {UpdatePositionUseCase} from "../useCases/position/update-position.usecase";
import {DeletePositionUseCase} from "../useCases/position/delete-position.usecase";
import {RestorePositionUseCase} from "../useCases/position/restore-position.usecase";
import type { PositionService } from "../ports/input/position.service";

export class PositionServiceImpl implements PositionService {
  private readonly createPositionUseCase: CreatePositionUseCase;
  private readonly getPositionUseCase: GetPositionUseCase;
  private readonly updatePositionUseCase: UpdatePositionUseCase;
  private readonly deletePositionUseCase: DeletePositionUseCase;
  private readonly restorePositionUseCase: RestorePositionUseCase;

  constructor(private readonly positionRepository: PositionRepository) {
    this.createPositionUseCase = new CreatePositionUseCase(positionRepository);
    this.getPositionUseCase = new GetPositionUseCase(positionRepository);
    this.updatePositionUseCase = new UpdatePositionUseCase(positionRepository);
    this.deletePositionUseCase = new DeletePositionUseCase(positionRepository);
    this.restorePositionUseCase = new RestorePositionUseCase(positionRepository);
  }

  async createPosition(createPositionDTO: CreatePositionDTO): Promise<Position> {
    return await this.createPositionUseCase.execute(createPositionDTO);
  }

  async getPositionById(id: string): Promise<Position | null> {
    return await this.getPositionUseCase.execute(id);
  }

  async getPositionByName(name: string): Promise<Position | null> {
    return await this.positionRepository.findByName(name);
  }

  async getAllPositions(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Position>> {
    return await this.positionRepository.findAll(params, includeDeleted);
  }

  async updatePosition(id: string, updatePositionDTO: CreatePositionDTO): Promise<Position> {
    return await this.updatePositionUseCase.execute(id, updatePositionDTO);
  }

  async deletePosition(id: string): Promise<boolean> {
    return await this.deletePositionUseCase.execute(id);
  }

  async restorePosition(id: string): Promise<boolean> {
    return await this.restorePositionUseCase.execute(id);
  }
}
