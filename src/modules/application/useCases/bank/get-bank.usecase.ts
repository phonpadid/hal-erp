import type { BankRepository } from "@/modules/domain/repository/bank.repository"
import type { Bank } from "../../../domain/entities/bank.entity"

export class GetBankUseCase {
  constructor(private readonly bankRepository: BankRepository) {}

  async execute(id: string): Promise<Bank | null> {
    return await this.bankRepository.findById(id)
  }
}
