import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {isKVCond, type KVValue} from "s2-gameinfo";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKVValueToString(value: KVValue): string {
  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number") {
    return value.toString()
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0"
  }

  if (isKVCond(value)) {
    return `${value[0]} ${value[1]}`
  }

  // Not yet dealing with KVDuplicate
  return ""
}