import type { ReportCompanyRepository } from "@/modules/domain/repository/reports/report-company.repository";
import type { CompanyReportData, CompanyReportOneData } from "@/modules/infrastructure/reports/report-company.repository";
import { ApiReportCompanyRepository } from "@/modules/infrastructure/reports/report-company.repository";

export class ReportCompanyService {
  private readonly reportCompanyRepository: ReportCompanyRepository;

  constructor() {
    this.reportCompanyRepository = new ApiReportCompanyRepository();
  }

  async getReportCompany(): Promise<CompanyReportData> {
    return await this.reportCompanyRepository.getReportCompany();
  }

  async getOneCompanyReport(companyId: string): Promise<CompanyReportOneData> {
    return await this.reportCompanyRepository.getOneCompanyReport(companyId);
  }
}