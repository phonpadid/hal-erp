export interface HalGroupBudgetItem {
  id: number;
  name: string;
  logo: string;
  allocated_amount: number;
  total: number;
}

export interface HalGroupStateData {
  totalUsers: number;
  totalReceipts: number;
  totalReceiptsPadding: number;
  allocated_amount: number;
  increase_amount: number;
  totalUsedAmount: number;
  total_budget: number;
}

export interface HalGroupStateResponse {
  status_code: number;
  message: string;
  data: HalGroupStateData;
}

export interface HalGroupBudgetData {
  amount: number;
  total: number;
  budget: HalGroupBudgetItem[];
}

export interface HalGroupReportData {
  budget_overruns: HalGroupBudgetData;
  within_budget: HalGroupBudgetData;
}

export interface HalGroupReportResponse {
  status_code: number;
  message: string;
  data: HalGroupReportData;
}

export interface HalGroupReportParams {
  company_id?: number;
  departmentId?: string;
  fiscal_year?: number;
}