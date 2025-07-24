import type { Bank } from "../../../domain/entities/bank.entity"
import type { CreateBankDTO, UpdateBankDTO } from "../../dtos/bank.dto"
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination"

export interface BankService {
  createBank(createBankDTO: CreateBankDTO): Promise<Bank>
  getBankById(id: string): Promise<Bank | null>
  getBankByName(name: string): Promise<Bank | null>
  getAllBanks(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Bank>>
  updateBank(id: string, updateBankDTO: UpdateBankDTO): Promise<Bank>
  deleteBank(id: string): Promise<boolean>
  restoreBank(id: string): Promise<boolean>
}
