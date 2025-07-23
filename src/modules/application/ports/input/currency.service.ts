import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateCurrencyDTO, UpdateCurrencyDTO } from "../../dtos/currency.dto";
import type { CurrencyEntity } from "@/modules/domain/entities/currency.entity";

export interface CurrencyService {
  create(input: CreateCurrencyDTO[]): Promise<CurrencyEntity[] | CurrencyEntity>;
  getOne(id: string): Promise<CurrencyEntity | null>;
  getAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<CurrencyEntity>>;
  update(id: string, input: UpdateCurrencyDTO): Promise<CurrencyEntity>;
  delete(id: string): Promise<boolean>;
}
