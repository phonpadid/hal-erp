
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ExchangeRateService } from "../ports/input/exchange-rate.service";
import type { ExchangeRateRepository } from "@/modules/domain/repository/exchange-rate.repository";
import { CreateExchangeRateUseCase } from "../useCases/exchange-rates/create.use-case";
import { UpdateExchangeRateUseCase } from "../useCases/exchange-rates/update.use-case";
import { GetOneExchangeRateUseCase } from "../useCases/exchange-rates/get-one.usecase";
import { GetAllExchangeRateUseCase } from "../useCases/exchange-rates/get-all.use-case";
import type { CreateExchangeRateDTO, UpdateExchangeRateDTO } from "../dtos/exchange-rate.dto";
import type { ExchangeRateEntity } from "@/modules/domain/entities/exchange-rate.entities";
import { DeleteExchangeRateUseCase } from "../useCases/exchange-rates/delete.use-case";

export class ExchangeRateServiceImpl implements ExchangeRateService {
  private readonly created: CreateExchangeRateUseCase;
  private readonly updated: UpdateExchangeRateUseCase
  private readonly deleted: DeleteExchangeRateUseCase;
  private readonly getById: GetOneExchangeRateUseCase;
  private readonly finAll: GetAllExchangeRateUseCase;

  constructor(private readonly exchangeRateRepo: ExchangeRateRepository) {
    this.created = new CreateExchangeRateUseCase(exchangeRateRepo);
    this.updated = new UpdateExchangeRateUseCase(exchangeRateRepo);
    this.deleted = new DeleteExchangeRateUseCase(exchangeRateRepo);
    this.getById = new GetOneExchangeRateUseCase(exchangeRateRepo);
    this.finAll = new GetAllExchangeRateUseCase(exchangeRateRepo);
  }
  async create(input: CreateExchangeRateDTO[]):Promise<ExchangeRateEntity[] | ExchangeRateEntity> {
    return await this.created.execute(input);
  }

  async getOne(id: string): Promise<ExchangeRateEntity | null> {
    return await this.getById.execute(id);
  }

  async getAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ExchangeRateEntity>> {
    return await this.finAll.execute(params, includeDeleted);
  }

  async update(id: string, input: UpdateExchangeRateDTO): Promise<ExchangeRateEntity> {
    return await this.updated.execute(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.deleted.execute(id);
  }

}
