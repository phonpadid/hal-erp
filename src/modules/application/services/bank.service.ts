import type { BankRepository } from "@/modules/domain/repository/bank.repository";
import type { BankEntity } from "@/modules/domain/entities/bank.entity";
import type { BankCreate, BankUpdate } from "@/modules/interfaces/bank.interface";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface BankServices {
  getAllBanks(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<BankEntity>>;
  getBankById(id: string): Promise<BankEntity | null>;
  createBank(bankData: BankCreate): Promise<BankEntity>;
  updateBank(id: string, bankData: BankUpdate): Promise<BankEntity>;
  deleteBank(id: string): Promise<boolean>;
}

export class BankServiceImpl implements BankServices {
  constructor(private readonly bankRepository: BankRepository) {}

  async getAllBanks(params: PaginationParams, includeDeleted: boolean = false): Promise<PaginatedResult<BankEntity>> {
    return await this.bankRepository.findAll(params, includeDeleted);
  }

  async getBankById(id: string): Promise<BankEntity | null> {
    return await this.bankRepository.findById(id);
  }

  async createBank(bankData: BankCreate): Promise<BankEntity> {
    return await this.bankRepository.create(bankData);
  }

  async updateBank(id: string, bankData: BankUpdate): Promise<BankEntity> {
    return await this.bankRepository.update(id, bankData);
  }

  async deleteBank(id: string): Promise<boolean> {
    const bank = await this.bankRepository.findById(id);
    if (!bank) {
      throw new Error(`Bank with id ${id} not found`);
    }
    if (bank.isDeleted()) {
      throw new Error(`Bank with id ${id} is already deleted`);
    }
    return await this.bankRepository.delete(id);
  }
}
