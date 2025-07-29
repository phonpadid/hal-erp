import type { VatEntity } from "../entities/vat.entity";
import type { UpdateVatDTO } from "@/modules/application/dtos/vat.dto";

export interface VatRepository {
  findById(id: string): Promise<VatEntity | null>;
  update(id: string, data: UpdateVatDTO): Promise<VatEntity>;
  findOne(): Promise<VatEntity | null>;
}
