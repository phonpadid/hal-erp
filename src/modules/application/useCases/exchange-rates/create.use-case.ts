import type { ExchangeRateRepository } from "@/modules/domain/repository/exchange-rate.repository";
import type { CreateExchangeRateDTO } from "../../dtos/exchange-rate.dto";
import { ExchangeRateEntity } from "@/modules/domain/entities/exchange-rate.entities";

export class CreateExchangeRateUseCase {
  constructor(private readonly repo: ExchangeRateRepository) { }

  async execute(
    inputs: CreateExchangeRateDTO[]
  ): Promise<ExchangeRateEntity[] | ExchangeRateEntity> {
    const data = inputs.map((input) =>
      ExchangeRateEntity.create(
        input.from_currency_id,
        input.to_currency_id,
        input.rate,
      )
    );
    return await this.repo.create(data); // make sure repo method is also updated
  }
}
