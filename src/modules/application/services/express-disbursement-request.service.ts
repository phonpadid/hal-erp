import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ExpressDisbursementRequestService } from "../ports/input/express-disbursement-request.service";
import type { ExpressDisbursementRequestRepository } from "@/modules/domain/repository/express-disbursement-request/express-disbursement-request.repository";
import type { ExpressDisbursementRequestEntity } from "@/modules/domain/entities/express-disbursement-request/express-disbursement-request.entity";
import type {
  CreateExpressDisbursementRequestDTO,
  UpdateExpressDisbursementRequestDTO,
} from "../dtos/express-disbursement-request/express-disbursement-request.dto";

export class ExpressDisbursementRequestServiceImpl implements ExpressDisbursementRequestService {
  constructor(
    private readonly expressDisbursementRequestRepository: ExpressDisbursementRequestRepository
  ) {}

  async create(input: CreateExpressDisbursementRequestDTO): Promise<ExpressDisbursementRequestEntity> {
    if (!input.purpose || input.purpose.trim() === "") {
      throw new Error("Purpose is required");
    }
    if (!Array.isArray(input.express_disbursement_request_items) || input.express_disbursement_request_items.length === 0) {
      throw new Error("At least one line item is required");
    }
    return await this.expressDisbursementRequestRepository.create(input);
  }

  async getById(id: string): Promise<ExpressDisbursementRequestEntity | null> {
    return await this.expressDisbursementRequestRepository.findById(id);
  }

  async getAll(params: PaginationParams): Promise<PaginatedResult<ExpressDisbursementRequestEntity>> {
    return await this.expressDisbursementRequestRepository.findAll(params);
  }

  async update(
    id: string,
    input: UpdateExpressDisbursementRequestDTO
  ): Promise<ExpressDisbursementRequestEntity> {
    const existing = await this.expressDisbursementRequestRepository.findById(id);
    if (!existing) {
      throw new Error(`Express Disbursement Request with id ${id} not found`);
    }
    if (existing.isDeleted()) {
      throw new Error(`Express Disbursement Request with id ${id} is deleted`);
    }
    return await this.expressDisbursementRequestRepository.update(id, input);
  }
}
