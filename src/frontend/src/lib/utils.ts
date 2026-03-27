import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── ID Generation ─────────────────────────────────────────────────────────

export function generateId(prefix = "ID"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateBookingId(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BK${year}${month}${day}-${rand}`;
}

export function generateSampleId(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900);
  return `SMP${year}${month}${day}-${rand}`;
}

// ─── Date/Time ─────────────────────────────────────────────────────────────

export function nowISO(): string {
  return new Date().toISOString();
}

export function bigintNow(): bigint {
  return BigInt(Date.now()) * BigInt(1_000_000);
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function isToday(iso: string): boolean {
  const today = new Date();
  const d = new Date(iso);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function isThisMonth(iso: string): boolean {
  const now = new Date();
  const d = new Date(iso);
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
}

// ─── Currency ──────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── BigInt / Nanosecond conversions for ICP backend ───────────────────────

export function isoToNanos(iso: string): bigint {
  try {
    return BigInt(new Date(iso).getTime()) * BigInt(1_000_000);
  } catch {
    return BigInt(0);
  }
}

export function nanosToISO(nanos: bigint): string {
  try {
    return new Date(Number(nanos / BigInt(1_000_000))).toISOString();
  } catch {
    return new Date().toISOString();
  }
}
