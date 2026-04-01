import { apiCreatePatient, apiCreateTest, apiGetAllPatients } from "./backend";
import { nowISO } from "./limsUtils";
import { SEED_TEST_META, getSeedTests, seedTestMeta } from "./testMasterData";
import type { Patient } from "./types";

const now = nowISO();

const SEED_PATIENTS: Patient[] = [
  {
    id: "pat-001",
    name: "Rajesh Kumar",
    age: 45,
    gender: "Male",
    phone: "9876543210",
    address: "12, MG Road, Bangalore",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "pat-002",
    name: "Priya Sharma",
    age: 32,
    gender: "Female",
    phone: "9845012345",
    address: "45, Koramangala, Bangalore",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "pat-003",
    name: "Mohammed Farooq",
    age: 58,
    gender: "Male",
    phone: "9900123456",
    address: "7, Shivaji Nagar, Pune",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "pat-004",
    name: "Sunita Reddy",
    age: 27,
    gender: "Female",
    phone: "9712345678",
    address: "22, Banjara Hills, Hyderabad",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "pat-005",
    name: "Amit Patel",
    age: 41,
    gender: "Male",
    phone: "9601234567",
    address: "3, Satellite Road, Ahmedabad",
    createdAt: now,
    updatedAt: now,
  },
];

export async function seedDefaultData(): Promise<void> {
  try {
    const existing = await apiGetAllPatients();
    if (existing.length > 0) {
      // Still seed meta even if data already seeded (safe to call multiple times)
      seedTestMeta(SEED_TEST_META);
      return;
    }

    const SEED_TESTS = getSeedTests();
    await Promise.all(SEED_TESTS.map((t) => apiCreateTest(t)));
    await Promise.all(SEED_PATIENTS.map((p) => apiCreatePatient(p)));

    // Seed extended metadata (sampleType, container, method, TAT) to localStorage
    seedTestMeta(SEED_TEST_META);

    console.log(
      `[PathLab] Seeded ${SEED_TESTS.length} tests + ${SEED_PATIENTS.length} patients`,
    );
  } catch (e) {
    console.warn("[PathLab] Seed failed", e);
  }
}
