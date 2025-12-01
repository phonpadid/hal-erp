import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ReportCompanyRepository } from "@/modules/domain/repository/reports/report-company.repository";

export interface CompanyReportData {
  status_code: number;
  message: string;
  data: Array<{
    id: number;
    name: string;
    logo: string;
    tel: string;
    email: string;
    address: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    company_users: Array<{
      id: number;
      username: string;
      email: string;
      tel: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    }>;
    budget_accounts: Array<any>;
    approvalWorkflowCount: number;
    budgetRuleCount: number;
    userCount: number;
    allocated_amount: number;
    increase_amount: number;
    totalUsedAmount: number;
    total_budget: number;
    balance_amount: number;
  }>;
}

export class ApiReportCompanyRepository implements ReportCompanyRepository {
  async getReportCompany(): Promise<CompanyReportData> {
    try {
      const response = await api.get('/report-company');
      return response.data;
    } catch (error) {
      this.handleApiError(error, "Failed to fetch company report data");
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