import type { CompanyRepository } from "@/modules/domain/repository/company.repository";
import type { CompanyEntity } from "../../domain/entities/company.entity";
import type { CreateCompanyDTO, UpdateCompanyDTO } from "../dtos/company.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { CreateCompanyUseCase } from "../useCases/company/create-company.usecase";
import { GetCompanyUseCase } from "../useCases/company/get-company.usecase";
import { UpdateCompanyUseCase } from "../useCases/company/update-company.usecase";
import { DeleteCompanyUseCase } from "../useCases/company/delete-company.usecase";
import { RestoreCompanyUseCase } from "../useCases/company/restore-company.usecase";
import type { CompanyService } from "../ports/input/company.service";

export class CompanyServiceImpl implements CompanyService {
  private readonly createCompanyUseCase: CreateCompanyUseCase;
  private readonly getCompanyUseCase: GetCompanyUseCase;
  private readonly updateCompanyUseCase: UpdateCompanyUseCase;
  private readonly deleteCompanyUseCase: DeleteCompanyUseCase;
  private readonly restoreCompanyUseCase: RestoreCompanyUseCase;

  constructor(private readonly companyRepository: CompanyRepository) {
    this.createCompanyUseCase = new CreateCompanyUseCase(companyRepository);
    this.getCompanyUseCase = new GetCompanyUseCase(companyRepository);
    this.updateCompanyUseCase = new UpdateCompanyUseCase(companyRepository);
    this.deleteCompanyUseCase = new DeleteCompanyUseCase(companyRepository);
    this.restoreCompanyUseCase = new RestoreCompanyUseCase(companyRepository);
  }

  async createCompany(createCompanyDTO: CreateCompanyDTO): Promise<CompanyEntity> {
    return await this.createCompanyUseCase.execute(createCompanyDTO);
  }

  async getCompanyById(id: string): Promise<CompanyEntity | null> {
    return await this.getCompanyUseCase.execute(id);
  }
  async getAllCompanies(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CompanyEntity>> {
    return await this.companyRepository.findAll(params, includeDeleted);
  }

  async updateCompany(id: string, updateCompanyDTO: UpdateCompanyDTO): Promise<CompanyEntity> {
    return await this.updateCompanyUseCase.execute(id, updateCompanyDTO);
  }

  async deleteCompany(id: string): Promise<boolean> {
    return await this.deleteCompanyUseCase.execute(id);
  }

  async restoreCompany(id: string): Promise<boolean> {
    return await this.restoreCompanyUseCase.execute(id);
  }
}