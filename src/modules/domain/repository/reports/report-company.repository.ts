import type { CompanyReportData, CompanyReportOneData } from "@/modules/infrastructure/reports/report-company.repository";

export interface ReportCompanyRepository {
  getReportCompany(): Promise<CompanyReportData>;
  getOneCompanyReport(companyId: string): Promise<CompanyReportOneData>;
  getCompanyReport(companyId?: number): Promise<any>; // For /companies/report endpoint
}