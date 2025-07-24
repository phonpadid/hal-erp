import type { BankRepository } from "@/modules/domain/repository/bank.repository"
import type { BankService } from "../ports/input/bank.service"
import type { Bank } from "../../domain/entities/bank.entity"
import type { CreateBankDTO, UpdateBankDTO } from "../dtos/bank.dto"
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination"

import { CreateBankUseCase } from "../useCases/bank/create-bank.usecase"
import { GetBankUseCase } from "../useCases/bank/get-bank.usecase"
import { UpdateBankUseCase } from "../useCases/bank/update-bank.usecase"
import { DeleteBankUseCase } from "../useCases/bank/delete-bank.usecase"
import { RestoreBankUseCase } from "../useCases/bank/restore-bank.usecase"

export class BankServiceImpl implements BankService {
  private readonly createBankUseCase: CreateBankUseCase
  private readonly getBankUseCase: GetBankUseCase
  private readonly updateBankUseCase: UpdateBankUseCase
  private readonly deleteBankUseCase: DeleteBankUseCase
  private readonly restoreBankUseCase: RestoreBankUseCase

  constructor(private readonly bankRepository: BankRepository) {
    this.createBankUseCase = new CreateBankUseCase(bankRepository)
    this.getBankUseCase = new GetBankUseCase(bankRepository)
    this.updateBankUseCase = new UpdateBankUseCase(bankRepository)
    this.deleteBankUseCase = new DeleteBankUseCase(bankRepository)
    this.restoreBankUseCase = new RestoreBankUseCase(bankRepository)
  }

  async createBank(createBankDTO: CreateBankDTO): Promise<Bank> {
    return await this.createBankUseCase.execute(createBankDTO)
  }

  async getBankById(id: string): Promise<Bank | null> {
    return await this.getBankUseCase.execute(id)
  }

  async getBankByName(name: string): Promise<Bank | null> {
    return await this.bankRepository.findByName(name)
  }

  async getAllBanks(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Bank>> {
    return await this.bankRepository.findAll(params, includeDeleted)
  }

  async updateBank(id: string, updateBankDTO: UpdateBankDTO): Promise<Bank> {
    return await this.updateBankUseCase.execute(id, updateBankDTO)
  }

  async deleteBank(id: string): Promise<boolean> {
    return await this.deleteBankUseCase.execute(id)
  }

  async restoreBank(id: string): Promise<boolean> {
    return await this.restoreBankUseCase.execute(id)
  }
}
