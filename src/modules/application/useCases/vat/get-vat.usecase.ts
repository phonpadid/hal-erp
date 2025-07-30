import type { VatEntity } from "@/modules/domain/entities/vat.entity";
import type { VatRepository } from "@/modules/domain/repository/vat.repository";

export class GetVatUseCase {
  constructor(private readonly vatRepository: VatRepository) {}

  async execute(id: string): Promise<VatEntity> {
    const vat = await this.vatRepository.findById(id);
    if (!vat) {
      throw new Error(`VAT with id ${id} not found`);
    }
    return vat;
  }
}
