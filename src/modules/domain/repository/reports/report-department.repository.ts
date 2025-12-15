import type { DepartmentReportData, DepartmentReportParams } from "@/modules/infrastructure/reports/report-department.repository";

export interface ReportDepartmentRepository {
  getDepartmentReport(params: DepartmentReportParams): Promise<DepartmentReportData>;
}