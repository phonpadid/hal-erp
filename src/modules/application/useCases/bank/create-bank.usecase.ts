import type { BankCreate } from "@/modules/interfaces/bank.interface";
import type { BankRepository } from "@/modules/domain/repository/bank.repository";
import type { BankEntity } from "@/modules/domain/entities/bank.entity";

export class CreateBankUseCase {
  constructor(private readonly bankRepository: BankRepository) {}

  async execute(bankData: BankCreate): Promise<BankEntity> {
    const existingShortName = await this.bankRepository.findByShortName(bankData.short_name);
    if (existingShortName) {
      throw new Error(`short_name ${bankData.short_name} already exists`);
    }
    return await this.bankRepository.create(bankData);
  }
}
