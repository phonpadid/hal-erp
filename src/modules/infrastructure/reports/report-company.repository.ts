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

export interface CompanyReportOneData {
  status_code: number;
  message: string;
  data: {
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
    budget_accounts: Array<{
      id: number;
      code: string;
      name: string;
      fiscal_year: number;
      company_id: number;
      department_id: string;
      type: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      increase_budgets: Array<{
        id: string;
        budget_account_id: number;
        allocated_amount: string | null;
        description: string;
        import_date: string;
        created_by: number;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      budget_items: Array<{
        id: number;
        budget_account_id: number;
        name: string;
        description: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        increase_budget_detail: Array<{
          id: string;
          budget_item_id: number;
          increase_budget_id: string;
          allocated_amount: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        }>;
        document_transactions: Array<{
          id: number;
          transaction_number: string;
          document_id: string;
          budget_item_id: number;
          amount: string;
          transaction_type: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        }>;
      }>;
    }>;
    documents: Array<{
      id: string;
      document_number: string;
      title: string | null;
      description: string | null;
      total_amount: string | null;
      document_type_id: string;
      department_id: string;
      requester_id: number;
      company_id: number;
      status: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    }>;
    approvalWorkflowCount: number;
    budgetRuleCount: number;
    userCount: number;
    allocated_amount: number;
    increase_amount: number;
    totalUsedAmount: number;
    total_budget: number;
    balance_amount: number;
  };
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

  async getOneCompanyReport(companyId: string): Promise<CompanyReportOneData> {
    try {
      const response = await api.get(`/companies/report/${companyId}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error, `Failed to fetch company report data for company ${companyId}`);
    }
  }

  async getCompanyReport(companyId?: number): Promise<any> {
    try {
      const url = companyId ? `/companies/report?company_id=${companyId}` : '/companies/report';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      this.handleApiError(error, `Failed to fetch company report data${companyId ? ` for company ${companyId}` : ''}`);
    }
  }

  async getCompaniesWithReceipts(params?: any): Promise<any> {
    try {
      const response = await api.get('/companies/report/receipt', { params });
      return response.data;
    } catch (error) {
      this.handleApiError(error, "Failed to fetch companies with receipts data");
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