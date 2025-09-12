import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function zodToFieldErrors(error: ZodError) {
  const fields: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    fields[path] = issue.message;
  });

  return { fields };
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
