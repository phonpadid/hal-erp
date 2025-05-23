import dayjs from "dayjs";

export const formatDate = (dateValue: string | Date | undefined): string => {
  if (!dateValue) return "-";
  try {
    if (typeof dateValue === "string" && dateValue.includes("-") && dateValue.includes(":")) {
      return dayjs(dateValue, "DD/MM/YYYY HH:mm:ss").format("DD-MM-YYYY HH:mm:ss");
    }
    const formattedDate = dayjs(dateValue).format("DD/MM/YYYY HH:mm:ss");

    if (formattedDate === "Invalid Date") {
      return "-";
    }

    return formattedDate;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
};
