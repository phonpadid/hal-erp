import type { BankRepository } from "@/modules/domain/repository/bank.repository"
import type { Bank } from "../../../domain/entities/bank.entity"
import type { UpdateBankDTO } from "../../dtos/bank.dto"

export class UpdateBankUseCase {
  constructor(private readonly bankRepository: BankRepository) {}

  async execute(id: string, updateBankDTO: UpdateBankDTO): Promise<Bank> {
    const bank = await this.bankRepository.findById(id)
    if (!bank) {
      throw new Error(`Bank with id ${id} not found`)
    }

    if (
      updateBankDTO.name &&
      bank.getName() !== updateBankDTO.name
    ) {
      const existingBank = await this.bankRepository.findByName(updateBankDTO.name)
      if (existingBank && existingBank.getId() !== id) {
        throw new Error(`Bank with name ${updateBankDTO.name} already exists`)
      }
      bank.updateName(updateBankDTO.name)
    }

    if (
      updateBankDTO.short_name &&
      bank.getShortName() !== updateBankDTO.short_name
    ) {
      bank.updateShortName(updateBankDTO.short_name)
    }

    if ('logo' in updateBankDTO) {
      bank.updateLogo(updateBankDTO.logo ?? null)
    }

    return await this.bankRepository.update(bank)
  }
}
