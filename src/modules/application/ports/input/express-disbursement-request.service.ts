import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type {
  CreateExpressDisbursementRequestDTO,
  UpdateExpressDisbursementRequestDTO,
} from "../../dtos/express-disbursement-request/express-disbursement-request.dto";
import type { ExpressDisbursementRequestEntity } from "@/modules/domain/entities/express-disbursement-request/express-disbursement-request.entity";

export interface ExpressDisbursementRequestService {
  create(input: CreateExpressDisbursementRequestDTO): Promise<ExpressDisbursementRequestEntity>;
  getById(id: string): Promise<ExpressDisbursementRequestEntity | null>;
  getAll(params: PaginationParams): Promise<PaginatedResult<ExpressDisbursementRequestEntity>>;
  update(id: string, input: UpdateExpressDisbursementRequestDTO): Promise<ExpressDisbursementRequestEntity>;
}
