export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestParameter {
  id: string;
  name: string;
  unit: string;
  referenceRange: string;
  referenceMin?: number;
  referenceMax?: number;
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  parameters: TestParameter[];
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | "pending"
  | "collected"
  | "processing"
  | "completed";

export interface Booking {
  id: string;
  bookingId: string;
  patientId: string;
  tests: string[];
  totalAmount: number;
  status: BookingStatus;
  sampleId?: string;
  collectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: string;
  bookingId: string;
  testId: string;
  parameterId: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReportStatus = "draft" | "pending_approval" | "approved";

export interface Report {
  id: string;
  bookingId: string;
  status: ReportStatus;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = "pending" | "paid" | "partial";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  method?: string;
  partialAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OutsourceLab {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  assignedTests: string[];
  createdAt: string;
  updatedAt: string;
}
