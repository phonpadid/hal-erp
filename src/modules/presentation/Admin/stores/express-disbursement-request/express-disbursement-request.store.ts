/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { PaginationParams } from "@/modules/shared/pagination";
import { ExpressDisbursementRequestEntity } from "@/modules/domain/entities/express-disbursement-request/express-disbursement-request.entity";
import type {
  CreateExpressDisbursementRequestDTO,
  UpdateExpressDisbursementRequestDTO,
} from "@/modules/application/dtos/express-disbursement-request/express-disbursement-request.dto";
import { ApiExpressDisbursementRequestRepository } from "@/modules/infrastructure/express-disbursement-request/api-express-disbursement-request.repository";
import { ExpressDisbursementRequestServiceImpl } from "@/modules/application/services/express-disbursement-request.service";
import { useApprovalStepStore } from "@/modules/presentation/Admin/stores/approval-step.store";
import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface";

const createExpressDisbursementRequestService = () => {
  const repository = new ApiExpressDisbursementRequestRepository();
  return new ExpressDisbursementRequestServiceImpl(repository);
};

// Client-side line item shape used by the create form.
export interface ExpressItemFormModel {
  title: string;
  quantity: number;
  unit_id: number | string;
  price: number;
  remark: string;
  file_name: string | null;
  file_name_url: string | null;
  fileType: "image" | "pdf" | "";
}

const emptyItem = (): ExpressItemFormModel => ({
  title: "",
  quantity: 1,
  unit_id: "",
  price: 0,
  remark: "",
  file_name: null,
  file_name_url: null,
  fileType: "",
});

// Payload for approving a single express step. Budget selection reuses the
// existing purchase_order_items shape ([{ id, budget_item_id }]) so no change
// to the shared approve-step machinery is needed beyond the "ex" type.
export interface ExpressApprovalInput {
  statusId: number;
  approvalStepId: number;
  approval_id?: number;
  is_otp?: boolean;
  remark?: string;
  otp?: string;
  budgetItems?: Array<{ id: number; budget_item_id: number }>;
  account_code?: string;
  files?: Array<{ file_name: string }>;
}

export const useExpressDisbursementRequestStore = defineStore(
  "expressDisbursementRequest",
  () => {
    const service = createExpressDisbursementRequestService();

    // --- Data state ---
    const requests = ref<ExpressDisbursementRequestEntity[]>([]);
    const requestDetail = ref<ExpressDisbursementRequestEntity | null>(null);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);
    const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const statusSummary = ref<any[]>([]);

    // --- UI state ---
    const formModel = ref<{ purpose: string; items: ExpressItemFormModel[] }>({
      purpose: "",
      items: [emptyItem()],
    });
    const isCreating = ref<boolean>(false);
    const newlyCreatedDocumentId = ref<string | null>(null);
    const selectedId = ref<string | null>(null);

    const totalAmount = computed(() =>
      formModel.value.items.reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
        0
      )
    );

    // --- CRUD ---
    async function fetchAll(params: PaginationParams = { page: 1, limit: 10 }) {
      loading.value = true;
      error.value = null;
      try {
        const result: any = await service.getAll(params);
        if (result) {
          requests.value = result.data;
          pagination.value = {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          };
          statusSummary.value = result.status || [];
        }
        return result;
      } catch (err: any) {
        error.value = err.message || "Failed to fetch express disbursement requests.";
      } finally {
        loading.value = false;
      }
    }

    async function fetchById(id: string): Promise<ExpressDisbursementRequestEntity | null> {
      loading.value = true;
      error.value = null;
      try {
        const result = await service.getById(id);
        requestDetail.value = result;
        return result;
      } catch (err: any) {
        error.value = err.message || `Failed to fetch express disbursement request ${id}.`;
        return null;
      } finally {
        loading.value = false;
      }
    }

    async function create(): Promise<ExpressDisbursementRequestEntity | null> {
      // Double-submit guard (matches PR create behaviour).
      if (isCreating.value || newlyCreatedDocumentId.value) return null;
      isCreating.value = true;
      loading.value = true;
      error.value = null;
      try {
        const dto: CreateExpressDisbursementRequestDTO = {
          purpose: formModel.value.purpose,
          total: totalAmount.value,
          express_disbursement_request_items: formModel.value.items.map((it) => ({
            title: it.title,
            file_name: it.file_name,
            file_name_url: it.file_name_url,
            quantity: Number(it.quantity),
            unit_id: it.unit_id,
            price: Number(it.price),
            total_price: Number(it.price) * Number(it.quantity),
            remark: it.remark || "",
          })),
        };
        const entity = await service.create(dto);
        newlyCreatedDocumentId.value = entity.getId();
        return entity;
      } catch (err: any) {
        error.value = err.message || "Failed to create express disbursement request.";
        return null;
      } finally {
        isCreating.value = false;
        loading.value = false;
      }
    }

    async function update(
      id: string,
      data: UpdateExpressDisbursementRequestDTO
    ): Promise<ExpressDisbursementRequestEntity | null> {
      loading.value = true;
      error.value = null;
      try {
        return await service.update(id, data);
      } catch (err: any) {
        error.value = err.message || "Failed to update express disbursement request.";
        return null;
      } finally {
        loading.value = false;
      }
    }

    // --- Approval (delegates to the shared approve-step store with type "ex") ---
    async function submitExpressApproval(documentId: string, input: ExpressApprovalInput) {
      const approvalStepStore = useApprovalStepStore();
      const payload: SubmitApprovalStepInterface = {
        type: "ex",
        statusId: input.statusId,
        approvalStepId: input.approvalStepId,
        approval_id: input.approval_id,
        is_otp: input.is_otp ?? false,
        remark: input.remark,
        otp: input.otp,
        purchase_order_items: input.budgetItems,
        account_code: input.account_code,
        files: input.files,
      };
      return await approvalStepStore.submitApproval(documentId, payload);
    }

    // --- Resets ---
    function resetForm() {
      formModel.value = { purpose: "", items: [emptyItem()] };
      isCreating.value = false;
      newlyCreatedDocumentId.value = null;
    }

    function addItem() {
      formModel.value.items.push(emptyItem());
    }

    function removeItem(index: number) {
      if (formModel.value.items.length > 1) {
        formModel.value.items.splice(index, 1);
      }
    }

    function resetState() {
      requests.value = [];
      requestDetail.value = null;
      loading.value = false;
      error.value = null;
      pagination.value = { page: 1, limit: 10, total: 0, totalPages: 1 };
      statusSummary.value = [];
      selectedId.value = null;
      resetForm();
    }

    return {
      // state
      requests,
      requestDetail,
      loading,
      error,
      pagination,
      statusSummary,
      formModel,
      isCreating,
      newlyCreatedDocumentId,
      selectedId,
      totalAmount,
      // actions
      fetchAll,
      fetchById,
      create,
      update,
      submitExpressApproval,
      addItem,
      removeItem,
      resetForm,
      resetState,
    };
  }
);
