import type { CurrencyRepository } from "@/modules/domain/repository/currency.repository";

export class DeleteCurrencyUseCase {
  constructor(private readonly dpmUserRepository: CurrencyRepository) {}

  async execute(id: string): Promise<boolean> {
    const currency = await this.dpmUserRepository.findById(id);
    if (!currency) {
      throw new Error(`currency with id ${id} not found`);
    }
    if (currency.isDeleted()) {
      throw new Error(`currency with id ${id} is already deleted`);
    }
    return await this.dpmUserRepository.delete(id);
  }
}
