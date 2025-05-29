import type { CurrencyRepository } from "@/modules/domain/repository/currency.repository";
import type { UpdateCurrencyDTO } from "../../dtos/currency.dto";
import type { CurrencyEntity } from "@/modules/domain/entities/currency.entity";

export class UpdateCurrencyUseCase {
  constructor(private readonly currencyRepo: CurrencyRepository) {}
  async execute(id: string, input: UpdateCurrencyDTO): Promise<CurrencyEntity> {
    const currency = await this.currencyRepo.findById(id);
    if (!currency) {
      throw new Error(`Unit with id ${id} not found`);
    }
    currency.updateDpm(input.name, input.code);
    return await this.currencyRepo.update(id, currency);
  }
}
