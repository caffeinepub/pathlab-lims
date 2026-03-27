import { create } from "zustand";
import {
  apiCreateBooking,
  apiCreateOutsourceLab,
  apiCreatePatient,
  apiCreatePayment,
  apiCreateReport,
  apiCreateResult,
  apiCreateTest,
  apiDeleteBooking,
  apiDeleteOutsourceLab,
  apiDeletePatient,
  apiDeleteResult,
  apiDeleteTest,
  apiGetAllBookings,
  apiGetAllOutsourceLabs,
  apiGetAllPatients,
  apiGetAllPayments,
  apiGetAllReports,
  apiGetAllTests,
  apiGetResultsByBooking,
  apiMarkSamplesCollected,
  apiUpdateBooking,
  apiUpdateOutsourceLab,
  apiUpdatePatient,
  apiUpdatePayment,
  apiUpdateReport,
  apiUpdateResult,
  apiUpdateTest,
} from "../lib/backend";
import type {
  Booking,
  LabTest,
  OutsourceLab,
  Patient,
  Payment,
  Report,
  TestResult,
} from "../lib/types";
import {
  generateBookingId,
  generateId,
  generateSampleId,
  nowISO,
} from "../lib/utils";

interface LimsStore {
  patients: Patient[];
  tests: LabTest[];
  bookings: Booking[];
  results: TestResult[];
  reports: Report[];
  payments: Payment[];
  outsourceLabs: OutsourceLab[];
  initialized: boolean;

  loadAll(): Promise<void>;

  // Patients
  addPatient(
    p: Omit<Patient, "id" | "createdAt" | "updatedAt">,
  ): Promise<Patient>;
  updatePatient(
    id: string,
    p: Partial<Omit<Patient, "id" | "createdAt" | "updatedAt">>,
  ): Promise<void>;
  deletePatient(id: string): Promise<void>;

  // Tests
  addTest(t: Omit<LabTest, "id" | "createdAt" | "updatedAt">): Promise<LabTest>;
  updateTest(
    id: string,
    t: Partial<Omit<LabTest, "id" | "createdAt" | "updatedAt">>,
  ): Promise<void>;
  deleteTest(id: string): Promise<void>;

  // Bookings
  addBooking(
    b: Omit<Booking, "id" | "bookingId" | "createdAt" | "updatedAt">,
  ): Promise<Booking>;
  updateBooking(
    id: string,
    b: Partial<Omit<Booking, "id" | "createdAt" | "updatedAt">>,
  ): Promise<void>;
  deleteBooking(id: string): Promise<void>;

  // Results
  addResult(
    r: Omit<TestResult, "id" | "createdAt" | "updatedAt">,
  ): Promise<TestResult>;
  updateResult(
    id: string,
    r: Partial<Omit<TestResult, "id" | "createdAt" | "updatedAt">>,
  ): Promise<void>;
  upsertResult(
    r: Omit<TestResult, "id" | "createdAt" | "updatedAt"> & { id?: string },
  ): Promise<TestResult>;

  // Reports
  addReport(r: Omit<Report, "id" | "createdAt" | "updatedAt">): Promise<Report>;
  updateReport(
    id: string,
    r: Partial<Omit<Report, "id" | "createdAt" | "updatedAt">>,
  ): Promise<void>;
  upsertReport(
    bookingId: string,
    data: Partial<Omit<Report, "id" | "bookingId" | "createdAt" | "updatedAt">>,
  ): Promise<Report>;

  // Payments
  addPayment(
    p: Omit<Payment, "id" | "createdAt" | "updatedAt">,
  ): Promise<Payment>;
  updatePayment(
    id: string,
    p: Partial<Omit<Payment, "id" | "createdAt" | "updatedAt">>,
  ): Promise<void>;
  upsertPayment(
    bookingId: string,
    data: Partial<
      Omit<Payment, "id" | "bookingId" | "createdAt" | "updatedAt">
    >,
  ): Promise<Payment>;

  // Outsource Labs
  addOutsourceLab(
    l: Omit<OutsourceLab, "id" | "createdAt" | "updatedAt">,
  ): Promise<OutsourceLab>;
  updateOutsourceLab(
    id: string,
    l: Partial<Omit<OutsourceLab, "id" | "createdAt" | "updatedAt">>,
  ): Promise<void>;
  deleteOutsourceLab(id: string): Promise<void>;

  // Data management
  resetAll(): Promise<void>;
  importData(
    data: Partial<LimsExport>,
    mode: "replace" | "merge",
  ): Promise<void>;
}

export interface LimsExport {
  patients: Patient[];
  tests: LabTest[];
  bookings: Booking[];
  results: TestResult[];
  reports: Report[];
  payments: Payment[];
  outsourceLabs: OutsourceLab[];
}

export const useLimsStore = create<LimsStore>((set, get) => ({
  patients: [],
  tests: [],
  bookings: [],
  results: [],
  reports: [],
  payments: [],
  outsourceLabs: [],
  initialized: false,

  async loadAll() {
    try {
      const [patients, tests, bookings, payments, outsourceLabs] =
        await Promise.all([
          apiGetAllPatients(),
          apiGetAllTests(),
          apiGetAllBookings(),
          apiGetAllPayments(),
          apiGetAllOutsourceLabs(),
        ]);

      const resultArrays = await Promise.all(
        bookings.map((b) => apiGetResultsByBooking(b.id)),
      );
      const results = resultArrays.flat();

      const reports = await apiGetAllReports(bookings.map((b) => b.id));

      set({
        patients,
        tests,
        bookings,
        results,
        reports,
        payments,
        outsourceLabs,
        initialized: true,
      });
    } catch (e) {
      console.error("[Store] loadAll failed", e);
      set({ initialized: true });
    }
  },

  async addPatient(p) {
    const record: Patient = {
      ...p,
      id: generateId("P"),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await apiCreatePatient(record);
    set((s) => ({ patients: [...s.patients, record] }));
    return record;
  },
  async updatePatient(id, p) {
    const existing = get().patients.find((x) => x.id === id);
    if (!existing) return;
    const updated = { ...existing, ...p, updatedAt: nowISO() };
    await apiUpdatePatient(updated);
    set((s) => ({
      patients: s.patients.map((x) => (x.id === id ? updated : x)),
    }));
  },
  async deletePatient(id) {
    await apiDeletePatient(id);
    set((s) => ({ patients: s.patients.filter((x) => x.id !== id) }));
  },

  async addTest(t) {
    const record: LabTest = {
      ...t,
      id: generateId("T"),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await apiCreateTest(record);
    set((s) => ({ tests: [...s.tests, record] }));
    return record;
  },
  async updateTest(id, t) {
    const existing = get().tests.find((x) => x.id === id);
    if (!existing) return;
    const updated = { ...existing, ...t, updatedAt: nowISO() };
    await apiUpdateTest(updated);
    set((s) => ({ tests: s.tests.map((x) => (x.id === id ? updated : x)) }));
  },
  async deleteTest(id) {
    await apiDeleteTest(id);
    set((s) => ({ tests: s.tests.filter((x) => x.id !== id) }));
  },

  async addBooking(b) {
    const record: Booking = {
      ...b,
      id: generateId("BK"),
      bookingId: generateBookingId(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await apiCreateBooking(record);
    set((s) => ({ bookings: [...s.bookings, record] }));
    return record;
  },
  async updateBooking(id, b) {
    const existing = get().bookings.find((x) => x.id === id);
    if (!existing) return;
    const updated = { ...existing, ...b, updatedAt: nowISO() };
    await apiUpdateBooking(updated);
    set((s) => ({
      bookings: s.bookings.map((x) => (x.id === id ? updated : x)),
    }));
  },
  async deleteBooking(id) {
    await apiDeleteBooking(id);
    set((s) => ({ bookings: s.bookings.filter((x) => x.id !== id) }));
  },

  async addResult(r) {
    const record: TestResult = {
      ...r,
      id: generateId("R"),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await apiCreateResult(record);
    set((s) => ({ results: [...s.results, record] }));
    return record;
  },
  async updateResult(id, r) {
    const existing = get().results.find((x) => x.id === id);
    if (!existing) return;
    const updated = { ...existing, ...r, updatedAt: nowISO() };
    await apiUpdateResult(updated);
    set((s) => ({
      results: s.results.map((x) => (x.id === id ? updated : x)),
    }));
  },
  async upsertResult(r) {
    const existing = r.id
      ? get().results.find((x) => x.id === r.id)
      : get().results.find(
          (x) =>
            x.bookingId === r.bookingId &&
            x.testId === r.testId &&
            x.parameterId === r.parameterId,
        );
    if (existing) {
      await get().updateResult(existing.id, r);
      return { ...existing, ...r, updatedAt: nowISO() };
    }
    return get().addResult(r);
  },

  async addReport(r) {
    const record: Report = {
      ...r,
      id: generateId("RPT"),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await apiCreateReport(record);
    set((s) => ({ reports: [...s.reports, record] }));
    return record;
  },
  async updateReport(id, r) {
    const existing = get().reports.find((x) => x.id === id);
    if (!existing) return;
    const updated = { ...existing, ...r, updatedAt: nowISO() };
    await apiUpdateReport(updated);
    set((s) => ({
      reports: s.reports.map((x) => (x.id === id ? updated : x)),
    }));
  },
  async upsertReport(bookingId, data) {
    const existing = get().reports.find((x) => x.bookingId === bookingId);
    if (existing) {
      await get().updateReport(existing.id, data);
      return { ...existing, ...data, updatedAt: nowISO() };
    }
    return get().addReport({ bookingId, status: "draft", ...data });
  },

  async addPayment(p) {
    const record: Payment = {
      ...p,
      id: generateId("PAY"),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await apiCreatePayment(record);
    set((s) => ({ payments: [...s.payments, record] }));
    return record;
  },
  async updatePayment(id, p) {
    const existing = get().payments.find((x) => x.id === id);
    if (!existing) return;
    const updated = { ...existing, ...p, updatedAt: nowISO() };
    await apiUpdatePayment(updated);
    set((s) => ({
      payments: s.payments.map((x) => (x.id === id ? updated : x)),
    }));
  },
  async upsertPayment(bookingId, data) {
    const existing = get().payments.find((x) => x.bookingId === bookingId);
    if (existing) {
      await get().updatePayment(existing.id, data);
      return { ...existing, ...data, updatedAt: nowISO() };
    }
    const booking = get().bookings.find((x) => x.id === bookingId);
    return get().addPayment({
      bookingId,
      amount: booking?.totalAmount ?? 0,
      status: "pending",
      ...data,
    });
  },

  async addOutsourceLab(l) {
    const record: OutsourceLab = {
      ...l,
      id: generateId("LAB"),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await apiCreateOutsourceLab(record);
    set((s) => ({ outsourceLabs: [...s.outsourceLabs, record] }));
    return record;
  },
  async updateOutsourceLab(id, l) {
    const existing = get().outsourceLabs.find((x) => x.id === id);
    if (!existing) return;
    const updated = { ...existing, ...l, updatedAt: nowISO() };
    await apiUpdateOutsourceLab(updated);
    set((s) => ({
      outsourceLabs: s.outsourceLabs.map((x) => (x.id === id ? updated : x)),
    }));
  },
  async deleteOutsourceLab(id) {
    await apiDeleteOutsourceLab(id);
    set((s) => ({ outsourceLabs: s.outsourceLabs.filter((x) => x.id !== id) }));
  },

  async resetAll() {
    set({
      patients: [],
      tests: [],
      bookings: [],
      results: [],
      reports: [],
      payments: [],
      outsourceLabs: [],
    });
  },

  async importData(data, mode) {
    if (mode === "replace") {
      set({
        patients: [],
        tests: [],
        bookings: [],
        results: [],
        reports: [],
        payments: [],
        outsourceLabs: [],
      });
    }

    const allTasks: Promise<void>[] = [];
    for (const record of data.patients ?? [])
      allTasks.push(apiCreatePatient(record));
    for (const record of data.tests ?? []) allTasks.push(apiCreateTest(record));
    for (const record of data.bookings ?? [])
      allTasks.push(apiCreateBooking(record));
    for (const record of data.results ?? [])
      allTasks.push(apiCreateResult(record));
    for (const record of data.reports ?? [])
      allTasks.push(apiCreateReport(record));
    for (const record of data.payments ?? [])
      allTasks.push(apiCreatePayment(record));
    for (const record of data.outsourceLabs ?? [])
      allTasks.push(apiCreateOutsourceLab(record));

    await Promise.all(allTasks);
    await get().loadAll();
  },
}));

// Re-export for backward compatibility
export { apiMarkSamplesCollected, apiDeleteResult, generateSampleId };
