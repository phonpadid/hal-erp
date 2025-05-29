
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CurrencyService } from "../ports/input/currency.service";
import { CreateCurrencyUseCase } from "../useCases/currencies/create.use-case";
import { GetOneCurrencyUseCase } from "../useCases/currencies/get-one.usecase";
import { UpdateCurrencyUseCase } from "../useCases/currencies/update.use-case";
import { DeleteCurrencyUseCase } from "../useCases/currencies/delete.use-case";
import { GetAllCurrencyUseCase } from "../useCases/currencies/get-all.use-case";
import type { CurrencyRepository } from "@/modules/domain/repository/currency.repository";
import type { CreateCurrencyDTO, UpdateCurrencyDTO } from "../dtos/currency.dto";
import type { CurrencyEntity } from "@/modules/domain/entities/currency.entity";

export class CurrencyServiceImpl implements CurrencyService {
  private readonly createCurrencyUseCase: CreateCurrencyUseCase;
  private readonly updateCurrencyUseCase: UpdateCurrencyUseCase
  private readonly deleteCurrencyUseCase: DeleteCurrencyUseCase;
  private readonly getOneCurrencyUseCase: GetOneCurrencyUseCase;
  private readonly getAllCurrencyUseCase: GetAllCurrencyUseCase;

  constructor(private readonly currencyRepo: CurrencyRepository) {
    this.createCurrencyUseCase = new CreateCurrencyUseCase(currencyRepo);
    this.updateCurrencyUseCase = new UpdateCurrencyUseCase(currencyRepo);
    this.deleteCurrencyUseCase = new DeleteCurrencyUseCase(currencyRepo);
    this.getOneCurrencyUseCase = new GetOneCurrencyUseCase(currencyRepo);
    this.getAllCurrencyUseCase = new GetAllCurrencyUseCase(currencyRepo);
  }
  async create(input: CreateCurrencyDTO[]):Promise<CurrencyEntity[] | CurrencyEntity> {
    return await this.createCurrencyUseCase.execute(input);
  }

  async getOne(id: string): Promise<CurrencyEntity | null> {
    return await this.getOneCurrencyUseCase.execute(id);
  }

  async getAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CurrencyEntity>> {
    return await this.getAllCurrencyUseCase.execute(params, includeDeleted);
  }

  async update(id: string, input: UpdateCurrencyDTO): Promise<CurrencyEntity> {
    return await this.updateCurrencyUseCase.execute(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.deleteCurrencyUseCase.execute(id);
  }

}
