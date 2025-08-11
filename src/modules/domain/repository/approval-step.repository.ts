// modules/approvals/domain/repository/approval-step.repository.ts
import { ApprovalStepEntity } from '../entities/approval-step.entity';

// อาจจะมี Response Entity หรือ DTO ที่เหมาะสมกว่านี้
// แต่ในที่นี้จะคืนค่าเป็น boolean เพื่อบอกว่าสำเร็จหรือไม่
export interface ApprovalStepRepository {
  /**
   * ส่งข้อมูลการอนุมัติสำหรับเอกสารที่ระบุ
   * @param documentId - ID ของเอกสาร (เช่น PR, PO) ที่กำลังถูกอนุมัติ
   * @param step - ข้อมูลการอนุมัติ
   */
  submit(documentId: string, step: ApprovalStepEntity): Promise<boolean>;
}
