import type { CreateCompanyDTO } from "@/modules/application/dtos/company.dto";
import type { CompanyRepository } from "@/modules/domain/repository/company.repository";
import type { CompanyEntity } from "@/modules/domain/entities/company.entity";

export class CreateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(companyData: CreateCompanyDTO): Promise<CompanyEntity> {
    return await this.companyRepository.create(companyData);
  }
}