import { LoginPayload } from "@/types/auth";
import { SeeuDate } from "@/types/calculadora/seeuReports";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const seeuDateConverter = {
  toDate(dateString: string): Date | null {
    const parts = dateString.split("-");
    if (parts.length !== 3) return null;

    const [year, month, day] = parts.map(Number);
    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }

    const date = new Date(year, month - 1, day, 0, 0, 0);
    return date;
  },

  toSeeuDate(date: Date): SeeuDate {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
};

export const authPayloadIsLoginWithPassword = (
  payload: Record<string, unknown>
): payload is Extract<LoginPayload, { email: string; password: string }> => {
  return (
    payload &&
    typeof payload === "object" &&
    typeof payload.email === "string" &&
    typeof payload.password === "string"
  );
};

export const daysToYearsMonthsDays = (totalDays: number) => {
  const years = Math.floor(totalDays / 365);
  const remainingDaysAfterYears = totalDays % 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears % 30;

  return { years, months, days };
};

export const yearsMonthsDaysToHumanReadable = ({
  date,
  t,
}: {
  date: {
    years: number;
    months: number;
    days: number;
  };
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) => {
  const { years, months, days } = date;

  const parts: string[] = [];

  if (years > 0) {
    parts.push(t("common.duration.years", { count: years }));
  }

  if (months > 0) {
    parts.push(t("common.duration.months", { count: months }));
  }

  if (days > 0) {
    parts.push(t("common.duration.days", { count: days }));
  }

  if (parts.length === 0) {
    return t("common.duration.days", { count: 0 });
  }

  const intlListFormat = new Intl.ListFormat("pt-BR", {
    style: "long",
    type: "conjunction",
  });

  return intlListFormat.format(parts);
};

export const parseDispositivo = (rawDispositivo: string) => {
  const dispositivo = rawDispositivo ? rawDispositivo.trim() : "";
  const parts = dispositivo ? dispositivo.split(":") : [];

  if (parts.length > 1) {
    const otherParts = [...parts.slice(1)];
    return {
      codigo: parts[0].trim(),
      descricao: otherParts
        .map((part) => part.trim())
        .filter(Boolean)
        .join(":")
        .trim(),
    };
  }

  const partsWithDash = dispositivo ? dispositivo.split("-") : [];

  if (partsWithDash.length > 1) {
    const otherParts = [...partsWithDash.slice(1)];
    return {
      codigo: partsWithDash[0].trim(),
      descricao: otherParts
        .map((part) => part.trim())
        .filter(Boolean)
        .join("-")
        .trim(),
    };
  }

  return {
    codigo: "",
    descricao: dispositivo || "",
  };
};
