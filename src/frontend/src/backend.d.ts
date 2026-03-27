import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OutsourceLab {
    id: string;
    assignedTests: Array<string>;
    name: string;
    createdAt: bigint;
    contactPerson: string;
    email: string;
    updatedAt: bigint;
    address: string;
    phone: string;
}
export interface TestResult {
    id: string;
    bookingId: string;
    value: string;
    isAbnormal: boolean;
    createdAt: bigint;
    unit: string;
    updatedAt: bigint;
    referenceRange: string;
    testId: string;
    parameterId: string;
}
export interface LabSettings {
    labEmail: string;
    reportFooter: string;
    reportHeader: string;
    labAddress: string;
    labPhone: string;
    currency: string;
    labName: string;
}
export interface DashboardStats {
    pendingBookings: bigint;
    totalTests: bigint;
    totalPatients: bigint;
    totalBookings: bigint;
    currentTime: bigint;
    totalRevenue: number;
    monthlyRevenue: number;
}
export interface Booking {
    id: string;
    status: string;
    bookingId: string;
    patientId: string;
    createdAt: bigint;
    collectedAt?: bigint;
    updatedAt: bigint;
    totalAmount: number;
    testIds: Array<string>;
    sampleId: string;
}
export interface TestParameter {
    id: string;
    referenceMax?: number;
    referenceMin?: number;
    name: string;
    unit: string;
    referenceRange: string;
}
export interface LabTest {
    id: string;
    name: string;
    createdAt: bigint;
    parameters: Array<TestParameter>;
    updatedAt: bigint;
    category: string;
    price: number;
}
export interface Report {
    id: string;
    status: string;
    bookingId: string;
    approvedAt?: bigint;
    approvedBy: string;
    createdAt: bigint;
    updatedAt: bigint;
}
export interface Payment {
    id: string;
    status: string;
    method: string;
    bookingId: string;
    createdAt: bigint;
    updatedAt: bigint;
    partialAmount: number;
    amount: number;
    paidAt?: bigint;
}
export interface Patient {
    id: string;
    age: bigint;
    name: string;
    createdAt: bigint;
    updatedAt: bigint;
    address: string;
    gender: string;
    phone: string;
}
export interface backendInterface {
    approveReport(reportId: string, approvedBy: string): Promise<void>;
    approveTestResult(resultId: string, approvedBy: string): Promise<void>;
    createBooking(booking: Booking): Promise<void>;
    createLabTest(test: LabTest): Promise<void>;
    createOutsourceLab(lab: OutsourceLab): Promise<void>;
    createPatient(patient: Patient): Promise<void>;
    createPayment(payment: Payment): Promise<void>;
    createReport(report: Report): Promise<void>;
    createTestParameter(param: TestParameter): Promise<void>;
    createTestResult(result: TestResult): Promise<void>;
    deleteBooking(id: string): Promise<void>;
    deleteLabTest(id: string): Promise<void>;
    deleteOutsourceLab(id: string): Promise<void>;
    deletePatient(id: string): Promise<void>;
    deletePayment(id: string): Promise<void>;
    deleteReport(id: string): Promise<void>;
    deleteTestParameter(id: string): Promise<void>;
    deleteTestResult(id: string): Promise<void>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllLabTests(): Promise<Array<LabTest>>;
    getAllOutsourceLabs(): Promise<Array<OutsourceLab>>;
    getAllPatients(): Promise<Array<Patient>>;
    getAllPayments(): Promise<Array<Payment>>;
    getAllTestParameters(): Promise<Array<TestParameter>>;
    getBooking(id: string): Promise<Booking>;
    getBookingsByPatient(patientId: string): Promise<Array<Booking>>;
    getBookingsByStatus(status: string): Promise<Array<Booking>>;
    getDashboardStats(): Promise<DashboardStats>;
    getLabTest(id: string): Promise<LabTest>;
    getOutsourceLab(id: string): Promise<OutsourceLab>;
    getPatient(id: string): Promise<Patient>;
    getPayment(id: string): Promise<Payment>;
    getPaymentByBooking(bookingId: string): Promise<Payment | null>;
    getReport(id: string): Promise<Report>;
    getReportByBooking(bookingId: string): Promise<Report | null>;
    getResultsByBooking(bookingId: string): Promise<Array<TestResult>>;
    getSettings(): Promise<LabSettings | null>;
    getTestParameter(id: string): Promise<TestParameter>;
    getTestResult(id: string): Promise<TestResult>;
    markPartialPayment(paymentId: string, amount: number): Promise<void>;
    markPaymentPaid(paymentId: string, method: string): Promise<void>;
    markReportDelivered(reportId: string): Promise<void>;
    markSamplesCollected(bookingIds: Array<string>): Promise<void>;
    saveSettings(settings: LabSettings): Promise<void>;
    searchPatients(searchQuery: string): Promise<Array<Patient>>;
    updateBooking(booking: Booking): Promise<void>;
    updateLabTest(test: LabTest): Promise<void>;
    updateOutsourceLab(lab: OutsourceLab): Promise<void>;
    updatePatient(patient: Patient): Promise<void>;
    updatePayment(payment: Payment): Promise<void>;
    updateReport(report: Report): Promise<void>;
    updateTestParameter(param: TestParameter): Promise<void>;
    updateTestResult(result: TestResult): Promise<void>;
}
