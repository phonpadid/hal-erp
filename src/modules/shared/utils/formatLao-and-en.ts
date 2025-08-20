export const convertToLaoWords = (number: number): string => {
  const units = ["", "ໜຶ່ງ", "ສອງ", "ສາມ", "ສີ່", "ຫ້າ", "ຫົກ", "ເຈັດ", "ແປດ", "ເກົ້າ"];
  const groups = ["", "ພັນ", "ລ້ານ", "ຕື້"];

  if (number === 0) return "ສູນກີບ";

  // แบ่งกลุ่มตัวเลข
  const convertGroup = (n: number): string => {
    let text = "";

    // หลักร้อย
    const hundreds = Math.floor(n / 100);
    if (hundreds > 0) {
      text += units[hundreds] + "ຮ້ອຍ";
    }

    // หลักสิบ
    const tens = Math.floor((n % 100) / 10);
    const ones = n % 10;

    if (tens > 0) {
      if (tens === 1) {
        text += "ສິບ";
      } else if (tens === 2) {
        text += "ຊາວ";
      } else {
        text += units[tens] + "ສິບ";
      }
    }

    // หลักหน่วย
    if (ones > 0) {
      if (!(tens === 2 && ones === 1)) {
        text += ones === 1 ? "ເອັດ" : units[ones];
      }
    }

    return text;
  };

  // แบ่งตัวเลขเป็นชุดละ 3 หลัก
  const digits = Math.floor(number).toString().split("").map(Number);
  const chunks: number[][] = [];
  while (digits.length > 0) {
    chunks.unshift(digits.splice(Math.max(0, digits.length - 3), 3));
  }

  let result = "";

  // แปลงแต่ละชุด
  chunks.forEach((chunk, groupIndex) => {
    const value = parseInt(chunk.join(""));
    if (value > 0) {
      const groupText = convertGroup(value);
      const groupSuffix = groups[chunks.length - 1 - groupIndex];
      result += groupText + groupSuffix;
    }
  });

  return result + "ກີບ";
};
