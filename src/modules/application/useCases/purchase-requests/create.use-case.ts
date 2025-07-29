import type { PurchaseRequestRepository } from "@/modules/domain/repository/purchase-requests/purchase-request.repository";
import type { CreatePurchaseRequestDTO } from "../../dtos/purchase-requests/purchase-request.dto";
import { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";

export class CreatePurchaseRequestUseCase {
  constructor(private readonly repository: PurchaseRequestRepository) {}

  async execute(input: CreatePurchaseRequestDTO): Promise<PurchaseRequestEntity> {
    const purchaseRequest = PurchaseRequestEntity.createPurchaseRequestWithItems(
      input.document.documentTypeId,
      input.document.description,
      input.expired_date,
      input.purposes,
      input.purchase_request_items.map(item => ({
        title: item.title,
        fileName: item.file_name,
        quantity: item.quantity,
        unitId: item.unit_id,
        price: item.price,
        remark: item.remark
      }))
    );

    return await this.repository.create(purchaseRequest);
  }
}
