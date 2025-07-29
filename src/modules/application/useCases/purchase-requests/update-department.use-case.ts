import type { PurchaseRequestRepository } from "@/modules/domain/repository/purchase-requests/purchase-request.repository";
import type { UpdatePurchaseRequestDTO } from "../../dtos/purchase-requests/purchase-request.dto";
import { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";
import { PurchaseRequestItemEntity } from "@/modules/domain/entities/purchase-requests/purchase-request-item.entity";

export class UpdatePurchaseRequestUseCase {
  constructor(private readonly repository: PurchaseRequestRepository) {}

  async execute(id: string, input: UpdatePurchaseRequestDTO): Promise<PurchaseRequestEntity> {
    const existingRequest = await this.repository.findById(id);
    if (!existingRequest) {
      throw new Error(`Purchase request with id ${id} not found`);
    }

    existingRequest.update(
      input.document.documentTypeId,
      input.document.description,
      input.expired_date,
      input.purposes,
      input.purchase_request_items?.map((item) =>
        PurchaseRequestItemEntity.create(
          item.title,
          item.file_name,
          item.quantity,
          item.unit_id.toString(),
          item.price,
          item.quantity * item.price,
          item.remark || ""
        )
      )
    );

    return await this.repository.update(existingRequest);
  }
}
