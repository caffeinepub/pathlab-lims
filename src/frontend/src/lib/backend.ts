import type {
  Booking as BBooking,
  LabSettings,
  LabTest as BLabTest,
  OutsourceLab as BOutsourceLab,
  Patient as BPatient,
  Payment as BPayment,
  Report as BReport,
  TestResult as BTestResult,
} from "../backend";
import { getActor } from "../hooks/useActor";
import type {
  Booking,
  LabTest,
  OutsourceLab,
  Patient,
  Payment,
  Report,
  TestResult,
} from "./types";
import { isoToNanos, nanosToISO } from "./utils";

// ─── Conversion helpers ────────────────────────────────────────────────────

function patientToBackend(p: Patient): BPatient {
  return {
    id: p.id,
    name: p.name,
    age: BigInt(p.age),
    gender: p.gender,
    phone: p.phone,
    address: p.address,
    createdAt: isoToNanos(p.createdAt),
    updatedAt: isoToNanos(p.updatedAt),
  };
}

function patientFromBackend(p: BPatient): Patient {
  return {
    id: p.id,
    name: p.name,
    age: Number(p.age),
    gender: p.gender,
    phone: p.phone,
    address: p.address,
    createdAt: nanosToISO(p.createdAt),
    updatedAt: nanosToISO(p.updatedAt),
  };
}

function testToBackend(t: LabTest): BLabTest {
  return {
    id: t.id,
    name: t.name,
    category: t.category,
    price: t.price,
    parameters: t.parameters.map((param) => ({
      id: param.id,
      name: param.name,
      unit: param.unit,
      referenceRange: param.referenceRange,
      referenceMin: param.referenceMin,
      referenceMax: param.referenceMax,
    })),
    createdAt: isoToNanos(t.createdAt),
    updatedAt: isoToNanos(t.updatedAt),
  };
}

function testFromBackend(t: BLabTest): LabTest {
  return {
    id: t.id,
    name: t.name,
    category: t.category,
    price: t.price,
    parameters: t.parameters.map((param) => ({
      id: param.id,
      name: param.name,
      unit: param.unit,
      referenceRange: param.referenceRange,
      referenceMin: param.referenceMin,
      referenceMax: param.referenceMax,
    })),
    createdAt: nanosToISO(t.createdAt),
    updatedAt: nanosToISO(t.updatedAt),
  };
}

function bookingToBackend(b: Booking): BBooking {
  return {
    id: b.id,
    bookingId: b.bookingId,
    patientId: b.patientId,
    testIds: b.tests,
    totalAmount: b.totalAmount,
    status: b.status,
    sampleId: b.sampleId ?? "",
    collectedAt: b.collectedAt ? isoToNanos(b.collectedAt) : undefined,
    createdAt: isoToNanos(b.createdAt),
    updatedAt: isoToNanos(b.updatedAt),
  };
}

function bookingFromBackend(b: BBooking): Booking {
  return {
    id: b.id,
    bookingId: b.bookingId,
    patientId: b.patientId,
    tests: b.testIds,
    totalAmount: b.totalAmount,
    status: b.status as Booking["status"],
    sampleId: b.sampleId || undefined,
    collectedAt: b.collectedAt ? nanosToISO(b.collectedAt) : undefined,
    createdAt: nanosToISO(b.createdAt),
    updatedAt: nanosToISO(b.updatedAt),
  };
}

function resultToBackend(r: TestResult): BTestResult {
  return {
    id: r.id,
    bookingId: r.bookingId,
    testId: r.testId,
    parameterId: r.parameterId,
    value: r.value,
    unit: r.unit,
    referenceRange: r.referenceRange,
    isAbnormal: r.isAbnormal,
    createdAt: isoToNanos(r.createdAt),
    updatedAt: isoToNanos(r.updatedAt),
  };
}

function resultFromBackend(r: BTestResult): TestResult {
  return {
    id: r.id,
    bookingId: r.bookingId,
    testId: r.testId,
    parameterId: r.parameterId,
    value: r.value,
    unit: r.unit,
    referenceRange: r.referenceRange,
    isAbnormal: r.isAbnormal,
    createdAt: nanosToISO(r.createdAt),
    updatedAt: nanosToISO(r.updatedAt),
  };
}

function reportToBackend(r: Report): BReport {
  return {
    id: r.id,
    bookingId: r.bookingId,
    status: r.status,
    approvedAt: r.approvedAt ? isoToNanos(r.approvedAt) : undefined,
    approvedBy: r.approvedBy ?? "",
    createdAt: isoToNanos(r.createdAt),
    updatedAt: isoToNanos(r.updatedAt),
  };
}

function reportFromBackend(r: BReport): Report {
  return {
    id: r.id,
    bookingId: r.bookingId,
    status: r.status as Report["status"],
    approvedAt: r.approvedAt ? nanosToISO(r.approvedAt) : undefined,
    approvedBy: r.approvedBy || undefined,
    createdAt: nanosToISO(r.createdAt),
    updatedAt: nanosToISO(r.updatedAt),
  };
}

function paymentToBackend(p: Payment): BPayment {
  return {
    id: p.id,
    bookingId: p.bookingId,
    amount: p.amount,
    status: p.status,
    method: p.method ?? "",
    partialAmount: p.partialAmount ?? 0,
    paidAt: p.paidAt ? isoToNanos(p.paidAt) : undefined,
    createdAt: isoToNanos(p.createdAt),
    updatedAt: isoToNanos(p.updatedAt),
  };
}

function paymentFromBackend(p: BPayment): Payment {
  return {
    id: p.id,
    bookingId: p.bookingId,
    amount: p.amount,
    status: p.status as Payment["status"],
    method: p.method || undefined,
    partialAmount: p.partialAmount || undefined,
    paidAt: p.paidAt ? nanosToISO(p.paidAt) : undefined,
    createdAt: nanosToISO(p.createdAt),
    updatedAt: nanosToISO(p.updatedAt),
  };
}

function outsourceLabToBackend(l: OutsourceLab): BOutsourceLab {
  return {
    id: l.id,
    name: l.name,
    contactPerson: l.contactPerson,
    phone: l.phone,
    email: l.email,
    address: l.address,
    assignedTests: l.assignedTests,
    createdAt: isoToNanos(l.createdAt),
    updatedAt: isoToNanos(l.updatedAt),
  };
}

function outsourceLabFromBackend(l: BOutsourceLab): OutsourceLab {
  return {
    id: l.id,
    name: l.name,
    contactPerson: l.contactPerson,
    phone: l.phone,
    email: l.email,
    address: l.address,
    assignedTests: l.assignedTests,
    createdAt: nanosToISO(l.createdAt),
    updatedAt: nanosToISO(l.updatedAt),
  };
}

// ─── Patients ──────────────────────────────────────────────────────────────

export async function apiGetAllPatients(): Promise<Patient[]> {
  try {
    const actor = await getActor();
    const results = await actor.getAllPatients();
    return results.map(patientFromBackend);
  } catch (e) {
    console.error("[API] getAllPatients", e);
    return [];
  }
}

export async function apiCreatePatient(p: Patient): Promise<void> {
  try {
    const actor = await getActor();
    await actor.createPatient(patientToBackend(p));
  } catch (e) {
    console.error("[API] createPatient", e);
    throw e;
  }
}

export async function apiUpdatePatient(p: Patient): Promise<void> {
  try {
    const actor = await getActor();
    await actor.updatePatient(patientToBackend(p));
  } catch (e) {
    console.error("[API] updatePatient", e);
    throw e;
  }
}

export async function apiDeletePatient(id: string): Promise<void> {
  try {
    const actor = await getActor();
    await actor.deletePatient(id);
  } catch (e) {
    console.error("[API] deletePatient", e);
    throw e;
  }
}

export async function apiSearchPatients(q: string): Promise<Patient[]> {
  try {
    const actor = await getActor();
    const results = await actor.searchPatients(q);
    return results.map(patientFromBackend);
  } catch (e) {
    console.error("[API] searchPatients", e);
    return [];
  }
}

// ─── Tests ─────────────────────────────────────────────────────────────────

export async function apiGetAllTests(): Promise<LabTest[]> {
  try {
    const actor = await getActor();
    const results = await actor.getAllLabTests();
    return results.map(testFromBackend);
  } catch (e) {
    console.error("[API] getAllTests", e);
    return [];
  }
}

export async function apiCreateTest(t: LabTest): Promise<void> {
  try {
    const actor = await getActor();
    await actor.createLabTest(testToBackend(t));
  } catch (e) {
    console.error("[API] createTest", e);
    throw e;
  }
}

export async function apiUpdateTest(t: LabTest): Promise<void> {
  try {
    const actor = await getActor();
    await actor.updateLabTest(testToBackend(t));
  } catch (e) {
    console.error("[API] updateTest", e);
    throw e;
  }
}

export async function apiDeleteTest(id: string): Promise<void> {
  try {
    const actor = await getActor();
    await actor.deleteLabTest(id);
  } catch (e) {
    console.error("[API] deleteTest", e);
    throw e;
  }
}

// ─── Bookings ──────────────────────────────────────────────────────────────

export async function apiGetAllBookings(): Promise<Booking[]> {
  try {
    const actor = await getActor();
    const results = await actor.getAllBookings();
    return results.map(bookingFromBackend);
  } catch (e) {
    console.error("[API] getAllBookings", e);
    return [];
  }
}

export async function apiCreateBooking(b: Booking): Promise<void> {
  try {
    const actor = await getActor();
    await actor.createBooking(bookingToBackend(b));
  } catch (e) {
    console.error("[API] createBooking", e);
    throw e;
  }
}

export async function apiUpdateBooking(b: Booking): Promise<void> {
  try {
    const actor = await getActor();
    await actor.updateBooking(bookingToBackend(b));
  } catch (e) {
    console.error("[API] updateBooking", e);
    throw e;
  }
}

export async function apiDeleteBooking(id: string): Promise<void> {
  try {
    const actor = await getActor();
    await actor.deleteBooking(id);
  } catch (e) {
    console.error("[API] deleteBooking", e);
    throw e;
  }
}

export async function apiMarkSamplesCollected(ids: string[]): Promise<void> {
  try {
    const actor = await getActor();
    await actor.markSamplesCollected(ids);
  } catch (e) {
    console.error("[API] markSamplesCollected", e);
    throw e;
  }
}

// ─── Results ───────────────────────────────────────────────────────────────

export async function apiGetResultsByBooking(
  bookingId: string,
): Promise<TestResult[]> {
  try {
    const actor = await getActor();
    const results = await actor.getResultsByBooking(bookingId);
    return results.map(resultFromBackend);
  } catch (e) {
    console.error("[API] getResultsByBooking", e);
    return [];
  }
}

export async function apiCreateResult(r: TestResult): Promise<void> {
  try {
    const actor = await getActor();
    await actor.createTestResult(resultToBackend(r));
  } catch (e) {
    console.error("[API] createResult", e);
    throw e;
  }
}

export async function apiUpdateResult(r: TestResult): Promise<void> {
  try {
    const actor = await getActor();
    await actor.updateTestResult(resultToBackend(r));
  } catch (e) {
    console.error("[API] updateResult", e);
    throw e;
  }
}

export async function apiDeleteResult(id: string): Promise<void> {
  try {
    const actor = await getActor();
    await actor.deleteTestResult(id);
  } catch (e) {
    console.error("[API] deleteResult", e);
    throw e;
  }
}

// ─── Reports ───────────────────────────────────────────────────────────────

export async function apiGetReportByBooking(
  bookingId: string,
): Promise<Report | null> {
  try {
    const actor = await getActor();
    const result = await actor.getReportByBooking(bookingId);
    return result ? reportFromBackend(result) : null;
  } catch (e) {
    console.error("[API] getReportByBooking", e);
    return null;
  }
}

export async function apiGetAllReports(
  bookingIds: string[],
): Promise<Report[]> {
  try {
    const results = await Promise.all(
      bookingIds.map((id) => apiGetReportByBooking(id)),
    );
    return results.filter((r): r is Report => r !== null);
  } catch (e) {
    console.error("[API] getAllReports", e);
    return [];
  }
}

export async function apiCreateReport(r: Report): Promise<void> {
  try {
    const actor = await getActor();
    await actor.createReport(reportToBackend(r));
  } catch (e) {
    console.error("[API] createReport", e);
    throw e;
  }
}

export async function apiUpdateReport(r: Report): Promise<void> {
  try {
    const actor = await getActor();
    await actor.updateReport(reportToBackend(r));
  } catch (e) {
    console.error("[API] updateReport", e);
    throw e;
  }
}

// ─── Payments ──────────────────────────────────────────────────────────────

export async function apiGetAllPayments(): Promise<Payment[]> {
  try {
    const actor = await getActor();
    const results = await actor.getAllPayments();
    return results.map(paymentFromBackend);
  } catch (e) {
    console.error("[API] getAllPayments", e);
    return [];
  }
}

export async function apiGetPaymentByBooking(
  bookingId: string,
): Promise<Payment | null> {
  try {
    const actor = await getActor();
    const result = await actor.getPaymentByBooking(bookingId);
    return result ? paymentFromBackend(result) : null;
  } catch (e) {
    console.error("[API] getPaymentByBooking", e);
    return null;
  }
}

export async function apiCreatePayment(p: Payment): Promise<void> {
  try {
    const actor = await getActor();
    await actor.createPayment(paymentToBackend(p));
  } catch (e) {
    console.error("[API] createPayment", e);
    throw e;
  }
}

export async function apiUpdatePayment(p: Payment): Promise<void> {
  try {
    const actor = await getActor();
    await actor.updatePayment(paymentToBackend(p));
  } catch (e) {
    console.error("[API] updatePayment", e);
    throw e;
  }
}

export async function apiMarkPaid(
  paymentId: string,
  method: string,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.markPaymentPaid(paymentId, method);
  } catch (e) {
    console.error("[API] markPaid", e);
    throw e;
  }
}

export async function apiMarkPartialPayment(
  paymentId: string,
  amount: number,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.markPartialPayment(paymentId, amount);
  } catch (e) {
    console.error("[API] markPartialPayment", e);
    throw e;
  }
}

// ─── Outsource Labs ────────────────────────────────────────────────────────

export async function apiGetAllOutsourceLabs(): Promise<OutsourceLab[]> {
  try {
    const actor = await getActor();
    const results = await actor.getAllOutsourceLabs();
    return results.map(outsourceLabFromBackend);
  } catch (e) {
    console.error("[API] getAllOutsourceLabs", e);
    return [];
  }
}

export async function apiCreateOutsourceLab(l: OutsourceLab): Promise<void> {
  try {
    const actor = await getActor();
    await actor.createOutsourceLab(outsourceLabToBackend(l));
  } catch (e) {
    console.error("[API] createOutsourceLab", e);
    throw e;
  }
}

export async function apiUpdateOutsourceLab(l: OutsourceLab): Promise<void> {
  try {
    const actor = await getActor();
    await actor.updateOutsourceLab(outsourceLabToBackend(l));
  } catch (e) {
    console.error("[API] updateOutsourceLab", e);
    throw e;
  }
}

export async function apiDeleteOutsourceLab(id: string): Promise<void> {
  try {
    const actor = await getActor();
    await actor.deleteOutsourceLab(id);
  } catch (e) {
    console.error("[API] deleteOutsourceLab", e);
    throw e;
  }
}

// ─── Settings ──────────────────────────────────────────────────────────────

export async function apiGetSettings(): Promise<LabSettings | null> {
  try {
    const actor = await getActor();
    return await actor.getSettings();
  } catch (e) {
    console.error("[API] getSettings", e);
    return null;
  }
}

export async function apiSaveSettings(s: LabSettings): Promise<void> {
  try {
    const actor = await getActor();
    await actor.saveSettings(s);
  } catch (e) {
    console.error("[API] saveSettings", e);
    throw e;
  }
}

export type { LabSettings };
