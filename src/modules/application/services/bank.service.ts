import type { BankEntity } from "@/modules/domain/entities/bank.entity";
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { BankRepository } from "@/modules/domain/repository/bank.repository";
import { CreateBankCase } from "../useCases/bank/create-bank.usecase";
import type { BankService } from "../ports/input/bank.service";
import { GetAllBankUseCase } from "../useCases/bank/get-all-bank.usecase";
import { GetBankByIdUseCase } from "../useCases/bank/get-detials-bank.usecase";
import { UpdateBankUseCase } from "../useCases/bank/update-bank.usecase";
import { DeleteBankUseCase } from "../useCases/bank/delete-bank.usecase";
import type { CreateBankDTO, UpdateBankDTO } from "../dtos/bank.dto";

export class BankServiceImpl implements BankService {
  private readonly createBankUseCase: CreateBankCase;
  private readonly getAllBankUseCase: GetAllBankUseCase;
  private readonly getDetailBankUseCase: GetBankByIdUseCase;
  private readonly updateBankUseCase: UpdateBankUseCase;
  private readonly deleteBankUseCase: DeleteBankUseCase;

  constructor(private readonly bankRepository: BankRepository) {
    this.createBankUseCase = new CreateBankCase(bankRepository);
    this.getAllBankUseCase = new GetAllBankUseCase(bankRepository);
    this.getDetailBankUseCase = new GetBankByIdUseCase(bankRepository);
    this.updateBankUseCase = new UpdateBankUseCase(bankRepository);
    this.deleteBankUseCase = new DeleteBankUseCase(bankRepository);
  }

  async createBank(createBankDTO: CreateBankDTO): Promise<BankEntity> {
    return await this.createBankUseCase.execute(createBankDTO);
  }

  async getBankById(id: string): Promise<BankEntity | null> {
    return await this.getDetailBankUseCase.execute(id);
  }

  async getBankName(name: string): Promise<BankEntity | null> {
    // Using getAllBankUseCase to search by name
    const result = await this.getAllBankUseCase.execute({ page: 1, limit: 1, search: name }, false);
    return result.data.length > 0 ? result.data[0] : null;
  }

  async getAllBanks(
    params: PaginationParams,
    includeDeleted = false
  ): Promise<PaginatedResult<BankEntity>> {
    return await this.getAllBankUseCase.execute(params, includeDeleted);
  }

  async updateBank(id: string, updateBankDTO: UpdateBankDTO): Promise<BankEntity> {
    return await this.updateBankUseCase.execute(id, updateBankDTO);
  }

  async deleteBank(id: string): Promise<boolean> {
    return await this.deleteBankUseCase.execute(id);
  }
}
