export const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "warning";
    case "COMPLETED":
      return "success";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "ant-design:clock-circle-outlined";
    case "COMPLETED":
      return "ant-design:check-circle-outlined";
    case "REJECTED":
      return "ant-design:close-circle-outlined";
    default:
      return "";
  }
};

export const getStatusText = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "ກຳລັງດຳເນີນການ";
    case "COMPLETED":
      return "ສຳເລັດ";
    case "REJECTED":
      return "ປະຕິເສດ";
    default:
      return status || "N/A";
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDocumentStatus = (record: any) => {
  return record.user_approval?.document_status?.name || "N/A";
};
