import { getUserApv } from "./get-user.login";

/**
 * ສະຖານະການຈ່າຍ ຂອງໃບຮັບເງິນ (receipt) ໃນໜ້າ /approval-receipt
 *
 * - `await_upload`   : ຂັ້ນຕອນປັດຈຸບັນຂອງຜູ້ໃຊ້ທີ່ login ຢູ່ ຕ້ອງອັບໂຫລດສະລິບເງິນໂອນ
 * - `upload_success` : ອັບໂຫລດສະລິບເງິນໂອນແລ້ວ (ຂອງຂັ້ນຕອນ upload ນັ້ນ)
 * - `paid` / `unpaid`: ພຶດຕິກຳເດີມ (ບໍ່ມີຂັ້ນຕອນ upload ຫຼື ບໍ່ແມ່ນຜູ້ຮັບຜິດຊອບ)
 */
export type ReceiptPaymentStatus =
  | "await_upload"
  | "upload_success"
  | "paid"
  | "unpaid";

interface DocApproverLike {
  user?: { id?: string | number | null; username?: string | null } | null;
}

interface ApprovalStepLike {
  status_id?: number;
  requires_file_upload?: boolean;
  doc_approver?: DocApproverLike[] | null;
}

interface ReceiptLike {
  user_approval?: { approval_step?: ApprovalStepLike[] | null } | null;
  document_attachment?: unknown[] | null;
  user_last_approval?: string | null;
}

const PENDING_STATUS_ID = 1;

const isSameUser = (
  approver: DocApproverLike,
  user: { id?: string | number | null; username?: string | null } | null
): boolean => {
  if (!user) return false;
  const userId = user.id !== null && user.id !== undefined ? String(user.id) : null;
  const approverId =
    approver?.user?.id !== null && approver?.user?.id !== undefined
      ? String(approver.user.id)
      : null;
  if (userId && approverId && userId === approverId) return true;
  return !!user.username && approver?.user?.username === user.username;
};

/**
 * ຜູ້ໃຊ້ທີ່ login ຢູ່ ແມ່ນຜູ້ຮັບຜິດຊອບຂັ້ນຕອນ upload ນີ້ ຫຼື ບໍ່.
 * ໃຊ້ `user_last_approval` (backend ສົ່ງມາ) ເປັນຕົວຊ່ວຍ ເມື່ອ doc_approver ບໍ່ມີຂໍ້ມູນ.
 */
const isUploadStepOwner = (record: ReceiptLike, step: ApprovalStepLike): boolean => {
  const user = getUserApv();
  if (!user) return false;
  const approvers = Array.isArray(step?.doc_approver) ? step.doc_approver : [];
  if (approvers.length > 0) {
    return approvers.some((approver) => isSameUser(approver, user));
  }
  return !!record?.user_last_approval && record.user_last_approval === user.username;
};

export const getReceiptPaymentStatus = (
  record: ReceiptLike | null | undefined
): ReceiptPaymentStatus => {
  const hasAttachment = (record?.document_attachment?.length ?? 0) > 0;
  const steps = record?.user_approval?.approval_step;
  const uploadStep = Array.isArray(steps)
    ? steps.find((step) => step?.requires_file_upload === true)
    : undefined;

  // ບໍ່ມີຂັ້ນຕອນອັບໂຫລດ -> ຮັກສາພຶດຕິກຳເດີມໄວ້
  if (!uploadStep || !record) return hasAttachment ? "paid" : "unpaid";

  // ສະຖານະໃໝ່ ສະແດງສະເພາະຜູ້ຮັບຜິດຊອບຂັ້ນຕອນອັບໂຫລດເທົ່ານັ້ນ
  if (!isUploadStepOwner(record, uploadStep)) {
    return hasAttachment ? "paid" : "unpaid";
  }

  // ມີໄຟລ໌ຕິດຄັດແລ້ວ = ອັບໂຫລດສະລິບເງິນໂອນສຳເລັດ
  if (hasAttachment) return "upload_success";

  // ຍັງເປັນຄິວຂອງລາວ ແລະ ຍັງບໍ່ທັນອັບໂຫລດ
  if (uploadStep.status_id === PENDING_STATUS_ID) return "await_upload";

  return "unpaid";
};

export const getReceiptPaymentStatusColor = (status: ReceiptPaymentStatus): string => {
  switch (status) {
    case "await_upload":
      return "blue";
    case "upload_success":
    case "paid":
      return "green";
    default:
      return "orange";
  }
};

export const getReceiptPaymentStatusIcon = (status: ReceiptPaymentStatus): string => {
  switch (status) {
    case "await_upload":
      return "mdi:cloud-upload-outline";
    case "upload_success":
      return "mdi:check-circle-outline";
    default:
      return "";
  }
};

export const getReceiptPaymentStatusKey = (status: ReceiptPaymentStatus): string =>
  `disbursement.payment_status.${status}`;
