import type { CompanyEntity } from "@/modules/domain/entities/company.entity";
import type { CompanyRepository } from "@/modules/domain/repository/company.repository";
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";

export class GetAllCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CompanyEntity>> {
    return await this.companyRepository.findAll(params, includeDeleted);
  }
}