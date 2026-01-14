import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { CompanyReportOneData } from "@/modules/infrastructure/reports/report-company.repository";
import { ReportCompanyService } from "@/modules/application/services/reports/report-company.service";

const createReportCompanyService = () => {
  return new ReportCompanyService();
};

// Interface for pending documents (matches ItemDetail interface in ApproveProposal.vue)
interface PendingDocument {
  id: string;
  requestNumber: string;
  title: string;
  company: string;
  amount: number;
  items: number;
  deliveryPoint: string;
  urgency: string;
  requestDate: string;
  requester: string;
  department: string;
  status: "pending" | "approved" | "rejected";
  documentId: string;
  companyId: number;
}

export const useCompanyReportsStore = defineStore("companyReports", () => {
  const reportCompanyService = createReportCompanyService();

  // State
  const companiesData = ref<CompanyReportOneData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastLoaded = ref<Date | null>(null);

  // Getters
  const hasData = computed(() => companiesData.value.length > 0);

  const getCompanyById = (id: string | number) => {
    return companiesData.value.find(company => company.data.id === Number(id));
  };

  const getPendingDocuments = computed<PendingDocument[]>(() => {
    const allPending: PendingDocument[] = [];

    companiesData.value.forEach(company => {
      company.data.documents.forEach(doc => {
        if (doc.status === 'pending') {
          const user = company.data.company_users.find(u => u.id === doc.requester_id);

          allPending.push({
            id: doc.document_number,
            requestNumber: doc.document_number,
            title: doc.description || 'ບໍ່ມີຫົວຂໍ້',
            company: company.data.name,
            amount: doc.total_amount ? Number(doc.total_amount) : 0,
            items: 1,
            deliveryPoint: 'ສານະສຳນັກງານ',
            urgency: 'normal',
            requestDate: doc.created_at,
            requester: user?.username || 'ບໍ່ຮູ້ຊື່',
            department: `ພະແນກ ${doc.department_id}`,
            status: doc.status as "pending" | "approved" | "rejected",
            documentId: doc.id,
            companyId: company.data.id
          });
        }
      });
    });

    return allPending;
  });

  // Actions
  const loadCompanyReports = async () => {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      // Get all companies first
      const reportData = await reportCompanyService.getReportCompany();

      // Get detailed data for each company
      const companyDetails = await Promise.all(
        reportData.data.map(async (company) => {
          const detail = await reportCompanyService.getOneCompanyReport(company.companyId.toString());
          return detail;
        })
      );

      companiesData.value = companyDetails;
      lastLoaded.value = new Date();

    } catch (err) {
      console.error("Error loading company reports:", err);
      error.value = err instanceof Error ? err.message : "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນບໍລິສັດ";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadCompanyReport = async (companyId: string) => {
    try {
      const detail = await reportCompanyService.getOneCompanyReport(companyId);

      // Update or add to existing data
      const existingIndex = companiesData.value.findIndex(
        company => company.data.id === Number(companyId)
      );

      if (existingIndex !== -1) {
        companiesData.value[existingIndex] = detail;
      } else {
        companiesData.value.push(detail);
      }

      return detail;
    } catch (err) {
      console.error(`Error loading company report ${companyId}:`, err);
      error.value = err instanceof Error ? err.message : `ບໍ່ສາມາດໂຫຼດຂໍ້ມູນບໍລິສັດ ${companyId}`;
      throw err;
    }
  };

  const clearData = () => {
    companiesData.value = [];
    error.value = null;
    lastLoaded.value = null;
  };

  const refreshCompany = async (companyId: string) => {
    const updatedData = await reportCompanyService.getOneCompanyReport(companyId);
    const index = companiesData.value.findIndex(c => c.data.id === Number(companyId));

    if (index !== -1) {
      companiesData.value[index] = updatedData;
    } else {
      companiesData.value.push(updatedData);
    }

    return updatedData;
  };

  return {
    // State
    companiesData,
    loading,
    error,
    lastLoaded,

    // Getters
    hasData,
    getCompanyById,
    getPendingDocuments,

    // Actions
    loadCompanyReports,
    loadCompanyReport,
    clearData,
    refreshCompany
  };
});