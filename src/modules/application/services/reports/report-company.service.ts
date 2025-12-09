import type { ReportCompanyRepository } from "@/modules/domain/repository/reports/report-company.repository";
import type { CompanyReportData, CompanyReportOneData } from "@/modules/infrastructure/reports/report-company.repository";
import { ApiReportCompanyRepository } from "@/modules/infrastructure/reports/report-company.repository";
import { CompanyReportUseCase } from "@/modules/application/useCases/reports/company-report.usecase";
import { CompaniesWithReceiptsUseCase } from "@/modules/application/useCases/reports/companies-with-receipts.usecase";

export class ReportCompanyService {
  private readonly reportCompanyRepository: ReportCompanyRepository;
  private readonly getCompanyReportUseCase: CompanyReportUseCase;
  private readonly getCompaniesWithReceiptsUseCase: CompaniesWithReceiptsUseCase;

  constructor() {
    this.reportCompanyRepository = new ApiReportCompanyRepository();
    this.getCompanyReportUseCase = new CompanyReportUseCase(this.reportCompanyRepository);
    this.getCompaniesWithReceiptsUseCase = new CompaniesWithReceiptsUseCase(this.reportCompanyRepository);
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

  async getCompaniesWithReceipts(params?: any): Promise<any> {
    return await this.getCompaniesWithReceiptsUseCase.execute(params);
  }
}