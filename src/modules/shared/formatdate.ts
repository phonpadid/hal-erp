/**
 * จัดรูปแบบวันที่ให้เป็นสตริง
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "-";

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "-";
  }

  // ตัวอย่างรูปแบบ: "2023-05-19 14:30:25"
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(dateObj)
    .replace(",", "");
}

/**
 * แปลงวันที่เป็นรูปแบบ ISO string
 */
export function toISOString(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

/**
 * คำนวณเวลาที่ผ่านไป เช่น "2 ชั่วโมงที่แล้ว", "5 นาทีที่แล้ว"
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? "1 year ago" : `${interval} years ago`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? "1 month ago" : `${interval} months ago`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? "1 day ago" : `${interval} days ago`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  }

  return seconds < 10 ? "just now" : `${Math.floor(seconds)} seconds ago`;
}
