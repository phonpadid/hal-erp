import type { CompanyReportData } from "@/modules/infrastructure/reports/report-company.repository";

export interface ReportCompanyRepository {
  getReportCompany(): Promise<CompanyReportData>;
}