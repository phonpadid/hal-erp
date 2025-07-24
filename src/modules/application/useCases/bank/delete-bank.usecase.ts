import type { BankRepository } from "@/modules/domain/repository/bank.repository"

export class DeleteBankUseCase {
  constructor(private readonly bankRepository: BankRepository) {}

  async execute(id: string): Promise<boolean> {
    const bank = await this.bankRepository.findById(id)
    if (!bank) {
      throw new Error(`Bank with id ${id} not found`)
    }
    if (bank.isDeleted()) {
      throw new Error(`Bank with id ${id} is already deleted`)
    }
    return await this.bankRepository.delete(id)
  }
}
