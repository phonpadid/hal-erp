import type { ReportCompanyRepository } from "@/modules/domain/repository/reports/report-company.repository";
import type { CompanyReportData, CompanyReportOneData } from "@/modules/infrastructure/reports/report-company.repository";
import { ApiReportCompanyRepository } from "@/modules/infrastructure/reports/report-company.repository";
import { CompanyReportUseCase } from "@/modules/application/useCases/reports/company-report.usecase";

export class ReportCompanyService {
  private readonly reportCompanyRepository: ReportCompanyRepository;
  private readonly getCompanyReportUseCase: CompanyReportUseCase;

  constructor() {
    this.reportCompanyRepository = new ApiReportCompanyRepository();
    this.getCompanyReportUseCase = new CompanyReportUseCase(this.reportCompanyRepository);
  }

  async getReportCompany(): Promise<CompanyReportData> {
    return await this.reportCompanyRepository.getReportCompany();
  }

  async getOneCompanyReport(companyId: string): Promise<CompanyReportOneData> {
    return await this.reportCompanyRepository.getOneCompanyReport(companyId);
  }

  async getCompanyReport(companyId?: number): Promise<any> {
    return await this.getCompanyReportUseCase.execute(companyId);
  }
}