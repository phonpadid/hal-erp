import type { VatEntity } from "../../../domain/entities/vat.entity";
import type { UpdateVatDTO } from "../../dtos/vat.dto";

export interface VatService {
  getVatById(id: string): Promise<VatEntity | null>;
  updateVat(id: string, updateVatDTO: UpdateVatDTO): Promise<VatEntity>;
  getVat(): Promise<VatEntity | null>;
}
