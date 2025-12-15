import type { ReportDepartmentRepository } from "@/modules/domain/repository/reports/report-department.repository";
import type { DepartmentReportData, DepartmentReportParams } from "@/modules/infrastructure/reports/report-department.repository";
import { ApiReportDepartmentRepository } from "@/modules/infrastructure/reports/report-department.repository";

export class ReportDepartmentService {
  private readonly reportDepartmentRepository: ReportDepartmentRepository;

  constructor() {
    this.reportDepartmentRepository = new ApiReportDepartmentRepository();
  }

  async getDepartmentReport(params: DepartmentReportParams): Promise<DepartmentReportData> {
    return await this.reportDepartmentRepository.getDepartmentReport(params);
  }
}