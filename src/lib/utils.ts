import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// React + Tailwind에서 동적 클래스 조합을 안전하게 하고, Tailwind 충돌을 방지하기 위한 유틸 함수