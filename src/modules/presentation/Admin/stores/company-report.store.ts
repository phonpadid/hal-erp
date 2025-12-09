import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ReportCompanyService } from "@/modules/application/services/reports/report-company.service";

export interface CompanyReportStatistics {
  total_companies: number;
  total_allocated: number;
  total_users: number;
}

export interface CompanyWithReceipts {
  id: number;
  name: string;
  logo: string;
  logo_url?: string;
  tel: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
  receipt_count: number;
  total_allocated: number;
  total_used_amount: number;
}

export const useCompanyReportStore = defineStore("companyReport", () => {
  const reportService = new ReportCompanyService();

  // State
  const statistics = ref<CompanyReportStatistics | null>(null);
  const companiesWithReceipts = ref<CompanyWithReceipts[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasData = computed(() => statistics.value !== null);
  const hasCompaniesData = computed(() => companiesWithReceipts.value.length > 0);

  // Actions
  const fetchReportStatistics = async (): Promise<CompanyReportStatistics | null> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await reportService.getCompanyReport();
      statistics.value = response.data;
      return response.data;
    } catch (err) {
      console.error("Error fetching company report statistics:", err);
      error.value = err instanceof Error ? err.message : "Failed to fetch statistics";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchCompaniesWithReceipts = async (params?: any): Promise<CompanyWithReceipts[] | null> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await reportService.getCompaniesWithReceipts(params);
      companiesWithReceipts.value = response.data;
      return response.data;
    } catch (err) {
      console.error("Error fetching companies with receipts:", err);
      error.value = err instanceof Error ? err.message : "Failed to fetch companies";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const clearData = () => {
    statistics.value = null;
    companiesWithReceipts.value = [];
    error.value = null;
  };

  return {
    // State
    statistics,
    companiesWithReceipts,
    loading,
    error,

    // Getters
    hasData,
    hasCompaniesData,

    // Actions
    fetchReportStatistics,
    fetchCompaniesWithReceipts,
    clearData
  };
});