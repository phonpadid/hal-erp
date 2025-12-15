import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import { ReportBudgetAccountsService } from "@/modules/application/services/reports/report-budget-accounts.service";
import { ReportBudgetItemsService } from "@/modules/application/services/reports/report-budget-items.service";
import { ReportDepartmentService } from "@/modules/application/services/reports/report-department.service";
import type {
  BudgetAccountsReportData
} from "@/modules/infrastructure/reports/report-budget-accounts.repository";
import type {
  BudgetItemsReportData,
  BudgetItemsParams
} from "@/modules/infrastructure/reports/report-budget-items.repository";
import type {
  DepartmentReportData,
  DepartmentReportParams
} from "@/modules/infrastructure/reports/report-department.repository";

const createBudgetReportsServices = () => {
  return {
    budgetAccountsService: new ReportBudgetAccountsService(),
    budgetItemsService: new ReportBudgetItemsService(),
    departmentService: new ReportDepartmentService(),
  };
};

export const useBudgetReportsStore = defineStore("budget-reports-store", () => {
  // Services
  const { budgetAccountsService, budgetItemsService, departmentService } = createBudgetReportsServices();

  // Budget Accounts State
  const budgetAccountsReportData: Ref<BudgetAccountsReportData | null> = ref(null);
  const budgetAccountsLoading = ref<boolean>(false);
  const budgetAccountsError = ref<string | null>(null);

  // Budget Items State
  const budgetItemsReportData: Ref<BudgetItemsReportData | null> = ref(null);
  const budgetItemsLoading = ref<boolean>(false);
  const budgetItemsError = ref<string | null>(null);

  // Department Report State
  const departmentReportData: Ref<DepartmentReportData | null> = ref(null);
  const departmentLoading = ref<boolean>(false);
  const departmentError = ref<string | null>(null);

  // Actions for Budget Accounts
  const fetchBudgetAccountsReport = async (companyId: number, fiscalYear: number): Promise<void> => {
    budgetAccountsLoading.value = true;
    budgetAccountsError.value = null;

    try {
      budgetAccountsReportData.value = await budgetAccountsService.getReportToUseBudget(companyId, fiscalYear);
    } catch (err) {
      budgetAccountsError.value = err instanceof Error ? err.message : "Failed to fetch budget accounts report";
      budgetAccountsReportData.value = null;
      throw err;
    } finally {
      budgetAccountsLoading.value = false;
    }
  };

  // Actions for Budget Items
  const fetchBudgetItemsReport = async (params: BudgetItemsParams): Promise<void> => {
    budgetItemsLoading.value = true;
    budgetItemsError.value = null;

    try {
      budgetItemsReportData.value = await budgetItemsService.getBudgetItemsReport(params);
    } catch (err) {
      budgetItemsError.value = err instanceof Error ? err.message : "Failed to fetch budget items report";
      budgetItemsReportData.value = null;
      throw err;
    } finally {
      budgetItemsLoading.value = false;
    }
  };

  // Actions for Department Report
  const fetchDepartmentReport = async (params: DepartmentReportParams): Promise<void> => {
    departmentLoading.value = true;
    departmentError.value = null;

    try {
      departmentReportData.value = await departmentService.getDepartmentReport(params);
    } catch (err) {
      departmentError.value = err instanceof Error ? err.message : "Failed to fetch department report";
      departmentReportData.value = null;
      throw err;
    } finally {
      departmentLoading.value = false;
    }
  };

  // Getters for Budget Accounts
  const getBudgetAccountsReportData = () => budgetAccountsReportData.value;
  const getBudgetAccountsLoading = () => budgetAccountsLoading.value;
  const getBudgetAccountsError = () => budgetAccountsError.value;

  // Getters for Budget Items
  const getBudgetItemsReportData = () => budgetItemsReportData.value;
  const getBudgetItemsLoading = () => budgetItemsLoading.value;
  const getBudgetItemsError = () => budgetItemsError.value;

  // Getters for Department Report
  const getDepartmentReportData = () => departmentReportData.value;
  const getDepartmentLoading = () => departmentLoading.value;
  const getDepartmentError = () => departmentError.value;

  return {
    // Budget Accounts
    budgetAccountsReportData,
    budgetAccountsLoading,
    budgetAccountsError,
    fetchBudgetAccountsReport,
    getBudgetAccountsReportData,
    getBudgetAccountsLoading,
    getBudgetAccountsError,

    // Budget Items
    budgetItemsReportData,
    budgetItemsLoading,
    budgetItemsError,
    fetchBudgetItemsReport,
    getBudgetItemsReportData,
    getBudgetItemsLoading,
    getBudgetItemsError,

    // Department Report
    departmentReportData,
    departmentLoading,
    departmentError,
    fetchDepartmentReport,
    getDepartmentReportData,
    getDepartmentLoading,
    getDepartmentError,
  };
});