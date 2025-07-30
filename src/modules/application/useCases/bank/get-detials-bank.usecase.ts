import type { BankRepository } from "@/modules/domain/repository/bank.repository";
import type { BankEntity } from "@/modules/domain/entities/bank.entity";

export class GetBankByIdUseCase {
  constructor(private readonly bankRepository: BankRepository) {}

  async execute(id: string): Promise<BankEntity | null> {
    return await this.bankRepository.findById(id);
  }
}
