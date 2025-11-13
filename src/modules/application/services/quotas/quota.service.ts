import type { PaginationParams } from "@/modules/shared/pagination";
import type { IQuotaService } from "../../ports/input/quotas/quota.service";
import { CreateQuotaUseCase } from "../../useCases/quotas/create-quota.use-case";
import type { CreateQuotaDTO, UpdateQuotaDTO } from "../../dtos/quotas/quota.dto";
import type { QuotaEntity } from "@/modules/domain/entities/quotas/quota.entity";
import type { QuotaRepository } from "@/modules/domain/repository/quotas/quota.repository";
import { UpdateQuotaUseCase } from "../../useCases/quotas/update-quota.use-case";
import { DeleteQuotaUseCase } from "../../useCases/quotas/delete-quota.use-case";
import { GetOneQuotaUseCase } from "../../useCases/quotas/get-one-quota.use-case";
import { GetQuotasUseCase } from "../../useCases/quotas/get-quota.use-case";

export class QuotaServiceImpl implements IQuotaService {
  private readonly createQuotaUseCase: CreateQuotaUseCase;
  private readonly updateQuotaUseCase: UpdateQuotaUseCase;
  private readonly deleteQuotaUseCase: DeleteQuotaUseCase;
  private readonly getOneQuotaUseCase: GetOneQuotaUseCase;
  private readonly getQuotasUseCase: GetQuotasUseCase;

  constructor(private readonly quotaRepository: QuotaRepository) {
    this.createQuotaUseCase = new CreateQuotaUseCase(quotaRepository);
    this.updateQuotaUseCase = new UpdateQuotaUseCase(quotaRepository);
    this.deleteQuotaUseCase = new DeleteQuotaUseCase(quotaRepository);
    this.getOneQuotaUseCase = new GetOneQuotaUseCase(quotaRepository);
    this.getQuotasUseCase = new GetQuotasUseCase(quotaRepository);
  }

  async createQuota(input: CreateQuotaDTO): Promise<QuotaEntity> {
    return await this.createQuotaUseCase.execute(input);
  }

  async getQuotaById(id: string): Promise<QuotaEntity | null> {
    return await this.getOneQuotaUseCase.execute(id);
  }

  async getQuotas(
    params: PaginationParams & {
      company_id?: number;
      vendor_id?: number;
      product_id?: number;
      year?: string;
    }
  ): Promise<{
    quotas: QuotaEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.getQuotasUseCase.execute(params);
  }

  async updateQuota(input: UpdateQuotaDTO): Promise<QuotaEntity> {
    return await this.updateQuotaUseCase.execute(input);
  }

  async deleteQuota(id: string): Promise<void> {
    return await this.deleteQuotaUseCase.execute(id);
  }
}