import type { ReportCompanyRepository } from "@/modules/domain/repository/reports/report-company.repository";

export class CompaniesWithReceiptsUseCase {
  constructor(private readonly repository: ReportCompanyRepository) {}

  async execute(params?: any): Promise<any> {
    return await this.repository.getCompaniesWithReceipts(params);
  }
}