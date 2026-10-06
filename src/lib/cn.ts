import { clsx, type ClassValue } from "clsx";

/** className joiner (clsx). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
