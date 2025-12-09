import type { ReportCompanyRepository } from "@/modules/domain/repository/reports/report-company.repository";

export class CompanyReportUseCase {
  constructor(private readonly repository: ReportCompanyRepository) {}

  async execute(companyId?: number): Promise<any> {
    return await this.repository.getCompanyReport(companyId);
  }
}