// UpdatePurchaseRequestUseCase.ts

import type { PurchaseRequestRepository } from "@/modules/domain/repository/purchase-requests/purchase-request.repository";
import { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";

export class UpdatePurchaseRequestUseCase {
  constructor(private readonly repository: PurchaseRequestRepository) {}

  async execute(id: string ): Promise<PurchaseRequestEntity> {
    const existingRequest = await this.repository.findById(id);
    if (!existingRequest) {
      throw new Error(`Purchase request with id ${id} not found`);
    }

    return await this.repository.update(id, existingRequest);
  }
}
