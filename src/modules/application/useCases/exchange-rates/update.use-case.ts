import type { ExchangeRateRepository } from "@/modules/domain/repository/exchange-rate.repository";
import type { UpdateExchangeRateDTO } from "../../dtos/exchange-rate.dto";
import type { ExchangeRateEntity } from "@/modules/domain/entities/exchange-rate.entities";

export class UpdateExchangeRateUseCase {
  constructor(private readonly repo: ExchangeRateRepository) { }
  async execute(id: string, input: UpdateExchangeRateDTO): Promise<ExchangeRateEntity> {

    const existing = await this.repo.findById(id); // <-- assume this exists
    if (!existing) {
      throw new Error(`with id ${id} not found`);
    }
    // Use the entity method to update the internal state
    existing?.updateData(
      input.from_currency_id,
      input.to_currency_id,
      input.rate,
      input.is_active === "true" ? true : false
    );

    return await this.repo.update(id, existing);
  }
}
