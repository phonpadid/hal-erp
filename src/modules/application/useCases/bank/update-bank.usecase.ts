import type { BankRepository } from "@/modules/domain/repository/bank.repository";
import type { BankEntity } from "@/modules/domain/entities/bank.entity";
import type { BankUpdate } from "@/modules/interfaces/bank.interface";

export class UpdateBankUseCase {
  constructor(private readonly bankRepository: BankRepository) {}

  async execute(id: string, bankData: BankUpdate): Promise<BankEntity> {
    const bank = await this.bankRepository.findById(id);
    if (!bank) {
      throw new Error(`Bank with id ${id} not found`);
    }
    if (bank.isDeleted()) {
      throw new Error(`Cannot update deleted bank with id ${id}`);
    }
    if (bankData.short_name && bankData.short_name !== bank.getShortName()) {
      const existingShortName = await this.bankRepository.findByShortName(bankData.short_name);
      if (existingShortName && existingShortName.getId() !== id) {
        throw new Error(`short_name ${bankData.short_name} already exists`);
      }
    }
    return await this.bankRepository.update(id, bankData);
  }
}
