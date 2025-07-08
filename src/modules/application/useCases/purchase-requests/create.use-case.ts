import type { PurchaseRequestRepository } from "@/modules/domain/repository/purchase-requests/purchase-request.repository";
import type { CreatePurchaseRequestDTO } from "../../dtos/purchase-requests/purchase-request.dto";
import { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";

export class CreatePurchaseRequestUseCase {
  constructor(private readonly repository: PurchaseRequestRepository) {}

  async execute(input: CreatePurchaseRequestDTO): Promise<PurchaseRequestEntity> {
    const result = PurchaseRequestEntity.createPurchaseRequestWithItems(
      input.documentTypeId,
      input.expiredDate,
      input.purposes,
      input.purchaseItem || []
    );
    return await this.repository.create(result);
  }
}
