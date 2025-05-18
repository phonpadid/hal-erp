/**
 * ฟังก์ชัน debounce สำหรับหน่วงเวลาการทำงานของฟังก์ชัน
 * ป้องกันการเรียกฟังก์ชันบ่อยเกินไป เช่น ในกรณีของการพิมพ์ค้นหา
 *
 * @param fn ฟังก์ชันที่ต้องการหน่วงเวลา
 * @param delay เวลาในการหน่วง (มิลลิวินาที)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * ฟังก์ชันสร้าง slug จากข้อความ
 *
 * @param text ข้อความที่ต้องการแปลงเป็น slug
 * @returns slug ที่สร้างขึ้น
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // แทนที่ช่องว่างด้วย -
    .replace(/[^\w\-]+/g, "") // ลบตัวอักษรพิเศษทั้งหมด
    .replace(/\-\-+/g, "-"); // แทนที่ -- ด้วย -
}

/**
 * ฟังก์ชันตัดข้อความให้สั้นลง
 *
 * @param text ข้อความที่ต้องการตัด
 * @param maxLength ความยาวสูงสุดที่ต้องการ
 * @returns ข้อความที่ถูกตัดพร้อม ... หากเกินความยาวที่กำหนด
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
}

/**
 * ฟังก์ชันสร้างรหัสสุ่ม
 *
 * @param length ความยาวของรหัสที่ต้องการ
 * @returns รหัสสุ่มตามความยาวที่กำหนด
 */
export function generateRandomCode(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}
