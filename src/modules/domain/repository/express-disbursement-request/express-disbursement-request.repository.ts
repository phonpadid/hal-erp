import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ExpressDisbursementRequestEntity } from "@/modules/domain/entities/express-disbursement-request/express-disbursement-request.entity";
import type {
  ExpressDisbursementRequestCreate,
  ExpressDisbursementRequestUpdate,
} from "@/modules/interfaces/express-disbursement-request/express-disbursement-request.interface";

export interface ExpressDisbursementRequestRepository {
  findAll(
    params: PaginationParams
  ): Promise<PaginatedResult<ExpressDisbursementRequestEntity>>;
  findById(id: string): Promise<ExpressDisbursementRequestEntity | null>;
  create(
    data: ExpressDisbursementRequestCreate
  ): Promise<ExpressDisbursementRequestEntity>;
  update(
    id: string,
    data: ExpressDisbursementRequestUpdate
  ): Promise<ExpressDisbursementRequestEntity>;
}
