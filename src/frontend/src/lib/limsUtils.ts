/**
 * LIMS-specific utility functions.
 * These complement the base cn() utility in lib/utils.ts.
 */

// ─── ID generators ────────────────────────────────────────────────────────────

export function generateId(prefix?: string): string {
  const id = crypto.randomUUID();
  return prefix ? `${prefix}-${id}` : id;
}

export function generateBookingId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `BK-${ts}-${rand}`;
}

export function generateSampleId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `SP-${ts}-${rand}`;
}

// ─── Date/time ────────────────────────────────────────────────────────────────

export function nowISO(): string {
  return new Date().toISOString();
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

export function isToday(iso: string | undefined | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isThisMonth(iso: string | undefined | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── ICP nanosecond helpers ────────────────────────────────────────────────────

export function isoToNanos(iso: string): bigint {
  return BigInt(new Date(iso).getTime()) * BigInt(1_000_000);
}

export function nanosToISO(ns: bigint): string {
  return new Date(Number(ns / BigInt(1_000_000))).toISOString();
}
