
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import type { PurchaseRequestRepository } from "@/modules/domain/repository/purchase-requests/purchase-request.repository";

export class GetOnePurchaseRequestUseCase {
  constructor(private readonly repository: PurchaseRequestRepository) { }

  async execute(
    id: string
  ): Promise<PurchaseRequestEntity | null> {
    return await this.repository.findById(id);
  }
}
