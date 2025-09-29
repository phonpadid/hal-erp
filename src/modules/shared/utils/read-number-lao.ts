// utils/numberToLaoWords.ts
export type LaoOptions = {
  /** append currency suffix (default 'ກີບ'); set false to disable */
  currencySuffix?: string | false;
};

export function numberToLaoWords(input: number | string, opts?: LaoOptions): string {
  const raw =
    typeof input === "string" ? input.replace(/[, ]+/g, "") : String(input);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return "";

  const currency =
    opts?.currencySuffix === false
      ? ""
      : typeof opts?.currencySuffix === "string"
      ? opts.currencySuffix
      : "ກີບ";

  const negative = parsed < 0;
  const num = Math.abs(Math.floor(parsed));

  const units = [
    "ສູນ",
    "ໜຶ່ງ",
    "ສອງ",
    "ສາມ",
    "ສີ່",
    "ຫ້າ",
    "ຫົກ",
    "ເຈັດ",
    "ແປດ",
    "ເກົ້າ",
  ];

  if (num === 0) return (negative ? "ລົບ" : "") + "ສູນ" + currency;

  const convertHundreds = (n: number): string => {
    const parts: string[] = [];
    const hundreds = Math.floor(n / 100);
    const rem = n % 100;

    if (hundreds > 0) {
      parts.push(units[hundreds] + "ຮ້ອຍ");
    }
    if (rem > 0) {
      parts.push(convertTens(rem));
    }
    return parts.join("");
  };

  const convertTens = (n: number): string => {
    if (n < 10) return units[n];

    if (n < 20) {
      if (n === 10) return "ສິບ";
      const unit = n % 10;
      return "ສິບ" + (unit === 1 ? "ເອັດ" : units[unit]);
    }

    const ten = Math.floor(n / 10);
    const unit = n % 10;
    let tenPart = "";

    if (ten === 2) {
      tenPart = "ຊາວ";
    } else {
      tenPart = units[ten] + "ສິບ";
    }

    if (unit === 0) return tenPart;
    return tenPart + (unit === 1 ? "ເອັດ" : units[unit]);
  };

  const parts: string[] = [];

  // break into groups
  const trillions = Math.floor(num / 1_000_000_000_000);
  const billions = Math.floor((num % 1_000_000_000_000) / 1_000_000_000);
  const millions = Math.floor((num % 1_000_000_000) / 1_000_000);
  const hundredThousands = Math.floor((num % 1_000_000) / 100_000);
  const tenThousands = Math.floor((num % 100_000) / 10_000);
  const thousands = Math.floor((num % 10_000) / 1_000);
  const remainder = num % 1000;

  if (trillions > 0) {
    parts.push(convertHundreds(trillions) + "ຕື້");
  }
  if (billions > 0) {
    parts.push(convertHundreds(billions) + "ພັນລ້ານ");
  }
  if (millions > 0) {
    parts.push(convertHundreds(millions) + "ລ້ານ");
  }
  if (hundredThousands > 0) {
    if (hundredThousands === 1) {
      parts.push("ໜຶ່ງແສນ");
    } else {
      parts.push(units[hundredThousands] + "ແສນ");
    }
  }
  if (tenThousands > 0) {
    if (tenThousands === 1) {
      parts.push("ສິບພັນ"); // 10,000
    } else if (tenThousands === 2) {
      parts.push("ຊາວພັນ"); // 20,000
    } else {
      parts.push(units[tenThousands] + "ໝື່ນ");
    }
  }
  if (thousands > 0) {
    parts.push(units[thousands] + "ພັນ");
  }
  if (remainder > 0) {
    parts.push(convertHundreds(remainder));
  }

  let result = parts.join("");
  if (negative) result = "ລົບ" + result;
  if (currency) result += currency;

  return result;
}
