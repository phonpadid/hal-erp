import type { UpdateCompanyDTO } from "../../dtos/company.dto";
import type { CompanyRepository } from "@/modules/domain/repository/company.repository";
import type { CompanyEntity } from "../../../domain/entities/company.entity";

export class UpdateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) { }
  async execute(id: string, updateCompanyDTO: UpdateCompanyDTO): Promise<CompanyEntity> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new Error(`Company with id ${id} not found`);
    }
    if (company.isDeleted()) {
      throw new Error(`Can not update, deleted company with id ${id}`);
    }
    return await this.companyRepository.update(id, updateCompanyDTO);
  }
}