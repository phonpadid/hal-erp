import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { PurchaseOrderService } from "../ports/input/purchase-order.service";
import { CreatePurchaseOrderUseCase } from "../useCases/purchase-order/create-usecase";
import { UpdatePurchaseOrderUseCase } from "../useCases/purchase-order/delete-usecase";
import { DeletePurchaseOrderUseCase } from "../useCases/purchase-order/update-usecase";
import { GetOnePurchaseOrderUseCase } from "../useCases/purchase-order/get-one-usecase";
import { GetAllPurchaseOrderUseCase } from "../useCases/purchase-order/get-all-usecase";
import type { PurchaseOrderRepository } from "@/modules/domain/repository/purchase-order/purchase-order.repository";
import type {
  CreatePurchaseOrderDTO,
  UpdatePurchaseOrderDTO,
} from "../dtos/purchase-order/purchase-order.dto";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";

export class PurchaseOrderServiceImpl implements PurchaseOrderService {
  private readonly createUseCase: CreatePurchaseOrderUseCase;
  private readonly updateUseCase: UpdatePurchaseOrderUseCase;
  private readonly deleteUseCase: DeletePurchaseOrderUseCase;
  private readonly getOneUseCase: GetOnePurchaseOrderUseCase;
  private readonly getAllUseCase: GetAllPurchaseOrderUseCase;

  constructor(private readonly purchaseOrderRepo: PurchaseOrderRepository) {
    this.createUseCase = new CreatePurchaseOrderUseCase(purchaseOrderRepo);
    this.updateUseCase = new UpdatePurchaseOrderUseCase(purchaseOrderRepo);
    this.deleteUseCase = new DeletePurchaseOrderUseCase(purchaseOrderRepo);
    this.getOneUseCase = new GetOnePurchaseOrderUseCase(purchaseOrderRepo);
    this.getAllUseCase = new GetAllPurchaseOrderUseCase(purchaseOrderRepo);
  }

  async create(input: CreatePurchaseOrderDTO): Promise<PurchaseOrderEntity> {
    return await this.createUseCase.execute(input);
  }

  async getById(id: number): Promise<PurchaseOrderEntity | null> {
    return await this.getOneUseCase.execute(id);
  }

  async getAll(params: PaginationParams): Promise<PaginatedResult<PurchaseOrderEntity>> {
    return await this.getAllUseCase.execute(params);
  }

  async update(id: number, input: UpdatePurchaseOrderDTO): Promise<PurchaseOrderEntity> {
    return await this.updateUseCase.execute(id, input);
  }

  async delete(id: number): Promise<boolean> {
    return await this.deleteUseCase.execute(id);
  }
}
