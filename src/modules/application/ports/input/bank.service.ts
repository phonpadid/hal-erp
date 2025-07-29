import type { BankEntity } from "../../../domain/entities/bank.entity";
import type { CreateBankDTO, UpdateBankDTO } from "../../dtos/bank.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface BankService {
  createBank(createBank: CreateBankDTO): Promise<BankEntity>;
  getBankById(id: string): Promise<BankEntity | null>;
  getBankByName(name: string): Promise<BankEntity | null>;
  getAllBanks(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<BankEntity>>;
  updateBank(
    id: string,
    updateBank: UpdateBankDTO
  ): Promise<BankEntity>;
  deleteBank(id: string): Promise<boolean>;
}
