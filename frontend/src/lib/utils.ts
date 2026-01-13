import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function isBooleanLike(value: unknown) {
  return (
    typeof value === "boolean" ||
    value === "true" ||
    value === "false" ||
    value === 1 ||
    value === 0
  );
}
export function getColumnLetter(index: number): string {
  let result = "";

  while (index >= 0) {
    const remainder = index % 26;
    result = String.fromCharCode(65 + remainder) + result;
    index = Math.floor(index / 26) - 1;
  }

  return result;
}

export function csvEscape(value: unknown) {
  if (value == null) return "";

  const str = String(value);

  // If it contains comma, quote, or newline → wrap in quotes
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}
