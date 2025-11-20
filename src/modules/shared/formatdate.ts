import dayjs from "dayjs";

export const formatDate = (dateValue: string | Date | undefined): string => {
  if (!dateValue) return "-";
  try {
    if (typeof dateValue === "string" && dateValue.includes("-") && dateValue.includes(":")) {
      return dayjs(dateValue, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss");
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
export const formatDates = (dateValue: string | Date | undefined): string => {
  if (!dateValue) return "-";

  try {
    // Handle ISO format (2025-11-19T08:52:38.844Z)
    if (typeof dateValue === "string") {
      // Try parsing as ISO format first
      const isoDate = dayjs(dateValue);
      if (isoDate.isValid()) {
        return isoDate.format("DD-MM-YYYY HH:mm:ss");
      }

      // Try other formats
      if (dateValue.includes("-") && dateValue.includes(":")) {
        const parsedDate = dayjs(dateValue, "DD-MM-YYYY HH:mm:ss");
        if (parsedDate.isValid()) {
          return parsedDate.format("DD-MM-YYYY HH:mm:ss");
        }
      }
    }

    // Handle Date object
    if (dateValue instanceof Date) {
      return dayjs(dateValue).format("DD-MM-YYYY HH:mm:ss");
    }

    // Default fallback
    const formattedDate = dayjs(dateValue).format("DD-MM-YYYY HH:mm:ss");

    if (formattedDate === "Invalid Date") {
      return "-";
    }

    return formattedDate;
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateValue);
    return "-";
  }
};

