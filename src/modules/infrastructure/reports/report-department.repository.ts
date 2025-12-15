import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ReportDepartmentRepository } from "@/modules/domain/repository/reports/report-department.repository";

export interface DepartmentReportData {
  status_code: number;
  message: string;
  data: Array<{
    id: number;
    company_id: number;
    name: string;
    description: string;
    budget_accounts: Array<{
      id: number;
      code: string;
      name: string;
      fiscal_year: number;
      allocated_amount: number;
      used_amount: number;
      balance_amount: number;
    }>;
    total_budget: number;
    total_used: number;
    total_balance: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }>;
}

export interface DepartmentReportParams {
  company_id: number;
  year: number;
  month?: number;
}

export class ApiReportDepartmentRepository implements ReportDepartmentRepository {
  async getDepartmentReport(params: DepartmentReportParams): Promise<DepartmentReportData> {
    try {
      const response = await api.get('/department/report', { params });
      return response.data;
    } catch (error) {
      this.handleApiError(error, "Failed to fetch department report data");
    }
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(`${serverMessage}`);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}