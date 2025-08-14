import type { BankEntity } from "@/modules/domain/entities/bank.entity";
import type { BankRepository } from "@/modules/domain/repository/bank.repository";
import type { BankCreate } from "@/modules/interfaces/bank.interface";

export class CreateBankCase {
  constructor(private readonly bankRepository: BankRepository) {}

  async execute(bankData: BankCreate): Promise<BankEntity> {
    const existingShorName = await this.bankRepository.findByShortName(bankData.short_name);
    if (existingShorName) {
      throw new Error(`short_name ${bankData.short_name} already exists`);
    }
    return await this.bankRepository.create(bankData);
  }
}
