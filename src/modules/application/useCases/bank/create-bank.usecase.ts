import { v4 as uuidv4 } from "uuid"
import { Bank } from "../../../domain/entities/bank.entity"
import type { BankRepository } from "@/modules/domain/repository/bank.repository"
import type { CreateBankDTO } from "../../dtos/bank.dto"

export class CreateBankUseCase {
  constructor(private readonly bankRepository: BankRepository) {}

  async execute(createBankDTO: CreateBankDTO): Promise<Bank> {
    const bank = Bank.create(
      uuidv4(),
      createBankDTO.name,
      createBankDTO.short_name,
      createBankDTO.logo ?? null
    )
    return await this.bankRepository.create(bank)
  }
}
