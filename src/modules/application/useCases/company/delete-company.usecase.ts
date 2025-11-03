import type { CompanyRepository } from "@/modules/domain/repository/company.repository";

export class DeleteCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(id: string): Promise<boolean> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new Error(`Company with id ${id} not found`);
    }
    if (company.isDeleted()) {
      throw new Error(`Company with id ${id} is already deleted`);
    }
    return await this.companyRepository.delete(id);
  }
}