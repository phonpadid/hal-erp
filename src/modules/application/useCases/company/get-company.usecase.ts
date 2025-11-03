import type { CompanyRepository } from "@/modules/domain/repository/company.repository";
import type { CompanyEntity } from "../../../domain/entities/company.entity";

export class GetCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(id: string): Promise<CompanyEntity> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new Error(`Company with id ${id} not found`);
    }
    return company;
  }
}