import { nowISO } from "./limsUtils";
import type { LabTest } from "./types";

// ─── Master Constants ─────────────────────────────────────────────────────────

export const TEST_CATEGORIES = [
  "Hematology",
  "Biochemistry",
  "Serology",
  "Clinical Pathology",
  "Microbiology",
  "Immunology",
  "Hormones",
  "Profiles",
] as const;

export type TestCategory = (typeof TEST_CATEGORIES)[number];

export const SAMPLE_TYPES = [
  "Whole Blood",
  "Serum",
  "Plasma",
  "EDTA Blood",
  "Fluoride Blood",
  "Urine (Spot)",
  "Urine (24hr)",
  "Urine (Midstream)",
  "Stool",
  "Sputum",
  "Pus / Wound Swab",
  "Throat Swab",
  "Nasal Swab",
  "CSF",
  "Semen",
  "Body Fluid",
  "Tissue / Biopsy",
  "Scraping",
];

export const CONTAINER_TYPES = [
  "Plain Vial (Red)",
  "EDTA Vial (Lavender)",
  "Fluoride Vial (Grey)",
  "Citrate Vial (Blue)",
  "SST Vial (Gold)",
  "Sterile Container",
  "Urine Container",
  "Stool Container",
  "Blood Culture Bottle",
  "Sputum Cup",
  "Slide",
  "Transport Media",
];

export const COMMON_UNITS = [
  "g/dL",
  "mg/dL",
  "ng/mL",
  "pg/mL",
  "µg/dL",
  "ng/dL",
  "IU/L",
  "IU/mL",
  "U/L",
  "mIU/L",
  "µIU/mL",
  "mmol/L",
  "mEq/L",
  "nmol/L",
  "%",
  "cells/cumm",
  "10³/µL",
  "10⁶/µL",
  "Lakhs/cumm",
  "fL",
  "pg",
  "sec",
  "titre",
  "ratio",
  "/HPF",
  "/LPF",
  "mm/hr",
  "mL/min/1.73m²",
  "copies/mL",
  "Reactive / Non-reactive",
  "Positive / Negative",
];

export const METHODS = [
  "Automated Cell Counter",
  "Spectrophotometry",
  "CLIA (Chemiluminescence)",
  "ELISA",
  "ISE (Ion Selective Electrode)",
  "Immunoturbidimetry",
  "Rapid Card Test",
  "Microscopy",
  "Culture & Sensitivity",
  "PCR",
  "Westergren",
  "Flow Cytometry",
  "Nephelometry",
  "Agglutination",
  "Fluorescence",
  "Photometry",
];

export const TAT_OPTIONS = [
  "1 hour",
  "2 hours",
  "4 hours",
  "6 hours",
  "Same day",
  "24 hours",
  "48 hours",
  "72 hours",
  "5 days",
  "7 days",
];

export const DEPARTMENTS = [
  "Hematology",
  "Biochemistry",
  "Serology",
  "Microbiology",
  "Clinical Pathology",
  "Immunology",
  "Endocrinology",
  "Histopathology",
];

// ─── Test Metadata (stored locally alongside backend tests) ──────────────────
// The Motoko backend stores core LabTest fields. Extended fields (sampleType,
// container, method, tat, shortCode) are kept in localStorage.

export interface TestMeta {
  shortCode?: string;
  sampleType?: string;
  container?: string;
  method?: string;
  tat?: string;
  department?: string;
  isPopular?: boolean;
}

const META_KEY = "pathlab_test_meta";

export function getTestMeta(testId: string): TestMeta {
  try {
    const raw = localStorage.getItem(META_KEY);
    const map: Record<string, TestMeta> = raw ? JSON.parse(raw) : {};
    return map[testId] ?? {};
  } catch {
    return {};
  }
}

export function saveTestMeta(testId: string, meta: TestMeta): void {
  try {
    const raw = localStorage.getItem(META_KEY);
    const map: Record<string, TestMeta> = raw ? JSON.parse(raw) : {};
    map[testId] = { ...map[testId], ...meta };
    localStorage.setItem(META_KEY, JSON.stringify(map));
  } catch {
    // silently ignore
  }
}

export function deleteTestMeta(testId: string): void {
  try {
    const raw = localStorage.getItem(META_KEY);
    const map: Record<string, TestMeta> = raw ? JSON.parse(raw) : {};
    delete map[testId];
    localStorage.setItem(META_KEY, JSON.stringify(map));
  } catch {
    // silently ignore
  }
}

export function seedTestMeta(entries: Record<string, TestMeta>): void {
  try {
    const raw = localStorage.getItem(META_KEY);
    const existing: Record<string, TestMeta> = raw ? JSON.parse(raw) : {};
    const merged = { ...entries, ...existing }; // existing takes priority
    localStorage.setItem(META_KEY, JSON.stringify(merged));
  } catch {
    // silently ignore
  }
}

// ─── Comprehensive Seed Tests (60+ daily-use pathology tests) ─────────────────

function makeTest(
  id: string,
  name: string,
  category: string,
  price: number,
  params: Array<{
    id: string;
    name: string;
    unit: string;
    referenceRange: string;
    referenceMin?: number;
    referenceMax?: number;
  }>,
): LabTest {
  const now = nowISO();
  return {
    id,
    name,
    category,
    price,
    parameters: params,
    createdAt: now,
    updatedAt: now,
  };
}

export const SEED_TEST_META: Record<string, TestMeta> = {
  "test-cbc": {
    shortCode: "CBC",
    sampleType: "EDTA Blood",
    container: "EDTA Vial (Lavender)",
    method: "Automated Cell Counter",
    tat: "2 hours",
    department: "Hematology",
    isPopular: true,
  },
  "test-hb": {
    shortCode: "Hb",
    sampleType: "EDTA Blood",
    container: "EDTA Vial (Lavender)",
    method: "Automated Cell Counter",
    tat: "1 hour",
    department: "Hematology",
    isPopular: true,
  },
  "test-esr": {
    shortCode: "ESR",
    sampleType: "EDTA Blood",
    container: "EDTA Vial (Lavender)",
    method: "Westergren",
    tat: "2 hours",
    department: "Hematology",
  },
  "test-bt-ct": {
    shortCode: "BT/CT",
    sampleType: "Whole Blood",
    container: "Plain Vial (Red)",
    method: "Manual",
    tat: "1 hour",
    department: "Hematology",
  },
  "test-pt-inr": {
    shortCode: "PT-INR",
    sampleType: "Plasma",
    container: "Citrate Vial (Blue)",
    method: "Automated",
    tat: "2 hours",
    department: "Hematology",
  },
  "test-aptt": {
    shortCode: "APTT",
    sampleType: "Plasma",
    container: "Citrate Vial (Blue)",
    method: "Automated",
    tat: "2 hours",
    department: "Hematology",
  },
  "test-bloodgroup": {
    shortCode: "BG&Rh",
    sampleType: "EDTA Blood",
    container: "EDTA Vial (Lavender)",
    method: "Agglutination",
    tat: "1 hour",
    department: "Hematology",
    isPopular: true,
  },
  "test-pbs": {
    shortCode: "PBS",
    sampleType: "EDTA Blood",
    container: "Slide",
    method: "Microscopy",
    tat: "4 hours",
    department: "Hematology",
  },
  "test-reti": {
    shortCode: "RETIC",
    sampleType: "EDTA Blood",
    container: "EDTA Vial (Lavender)",
    method: "Automated Cell Counter",
    tat: "4 hours",
    department: "Hematology",
  },
  "test-bsf": {
    shortCode: "FBS",
    sampleType: "Fluoride Blood",
    container: "Fluoride Vial (Grey)",
    method: "Spectrophotometry",
    tat: "1 hour",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-bspp": {
    shortCode: "PPBS",
    sampleType: "Fluoride Blood",
    container: "Fluoride Vial (Grey)",
    method: "Spectrophotometry",
    tat: "1 hour",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-rbs": {
    shortCode: "RBS",
    sampleType: "Fluoride Blood",
    container: "Fluoride Vial (Grey)",
    method: "Spectrophotometry",
    tat: "1 hour",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-hba1c": {
    shortCode: "HbA1c",
    sampleType: "EDTA Blood",
    container: "EDTA Vial (Lavender)",
    method: "CLIA (Chemiluminescence)",
    tat: "4 hours",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-urea": {
    shortCode: "UREA",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Spectrophotometry",
    tat: "2 hours",
    department: "Biochemistry",
  },
  "test-creatinine": {
    shortCode: "CREAT",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Spectrophotometry",
    tat: "2 hours",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-uricacid": {
    shortCode: "UA",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Spectrophotometry",
    tat: "2 hours",
    department: "Biochemistry",
  },
  "test-vitd": {
    shortCode: "VitD",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-vitb12": {
    shortCode: "B12",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-calcium": {
    shortCode: "Ca",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Spectrophotometry",
    tat: "2 hours",
    department: "Biochemistry",
  },
  "test-sodium": {
    shortCode: "Na",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "ISE (Ion Selective Electrode)",
    tat: "2 hours",
    department: "Biochemistry",
  },
  "test-potassium": {
    shortCode: "K",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "ISE (Ion Selective Electrode)",
    tat: "2 hours",
    department: "Biochemistry",
  },
  "test-lft": {
    shortCode: "LFT",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Spectrophotometry",
    tat: "4 hours",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-kft": {
    shortCode: "KFT",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Spectrophotometry",
    tat: "4 hours",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-lipid": {
    shortCode: "LIPID",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Spectrophotometry",
    tat: "4 hours",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-tft": {
    shortCode: "TFT",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-tsh": {
    shortCode: "TSH",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "4 hours",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-crp": {
    shortCode: "CRP",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Immunoturbidimetry",
    tat: "4 hours",
    department: "Immunology",
    isPopular: true,
  },
  "test-ra": {
    shortCode: "RA",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Immunoturbidimetry",
    tat: "4 hours",
    department: "Immunology",
    isPopular: true,
  },
  "test-aso": {
    shortCode: "ASO",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Immunoturbidimetry",
    tat: "4 hours",
    department: "Immunology",
  },
  "test-dengue": {
    shortCode: "DENGUE",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Rapid Card Test",
    tat: "2 hours",
    department: "Serology",
    isPopular: true,
  },
  "test-malaria": {
    shortCode: "MAL",
    sampleType: "Whole Blood",
    container: "EDTA Vial (Lavender)",
    method: "Rapid Card Test",
    tat: "1 hour",
    department: "Serology",
    isPopular: true,
  },
  "test-widal": {
    shortCode: "WIDAL",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Agglutination",
    tat: "4 hours",
    department: "Serology",
    isPopular: true,
  },
  "test-hiv": {
    shortCode: "HIV",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "ELISA",
    tat: "Same day",
    department: "Serology",
    isPopular: true,
  },
  "test-hbsag": {
    shortCode: "HBsAg",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "ELISA",
    tat: "Same day",
    department: "Serology",
    isPopular: true,
  },
  "test-hcv": {
    shortCode: "HCV",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "ELISA",
    tat: "Same day",
    department: "Serology",
    isPopular: true,
  },
  "test-vdrl": {
    shortCode: "VDRL",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Agglutination",
    tat: "Same day",
    department: "Serology",
  },
  "test-typhidot": {
    shortCode: "TYPHIDOT",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Rapid Card Test",
    tat: "2 hours",
    department: "Serology",
  },
  "test-urine": {
    shortCode: "URE",
    sampleType: "Urine (Midstream)",
    container: "Urine Container",
    method: "Microscopy",
    tat: "2 hours",
    department: "Clinical Pathology",
    isPopular: true,
  },
  "test-urine-culture": {
    shortCode: "UC",
    sampleType: "Urine (Midstream)",
    container: "Sterile Container",
    method: "Culture & Sensitivity",
    tat: "48 hours",
    department: "Microbiology",
  },
  "test-stool": {
    shortCode: "STOOL",
    sampleType: "Stool",
    container: "Stool Container",
    method: "Microscopy",
    tat: "2 hours",
    department: "Clinical Pathology",
    isPopular: true,
  },
  "test-stool-culture": {
    shortCode: "SC",
    sampleType: "Stool",
    container: "Stool Container",
    method: "Culture & Sensitivity",
    tat: "48 hours",
    department: "Microbiology",
  },
  "test-occult": {
    shortCode: "FOB",
    sampleType: "Stool",
    container: "Stool Container",
    method: "Rapid Card Test",
    tat: "2 hours",
    department: "Clinical Pathology",
  },
  "test-blood-culture": {
    shortCode: "BC",
    sampleType: "Whole Blood",
    container: "Blood Culture Bottle",
    method: "Culture & Sensitivity",
    tat: "5 days",
    department: "Microbiology",
  },
  "test-pus-culture": {
    shortCode: "PUS-C",
    sampleType: "Pus / Wound Swab",
    container: "Transport Media",
    method: "Culture & Sensitivity",
    tat: "48 hours",
    department: "Microbiology",
  },
  "test-sputum-afb": {
    shortCode: "AFB",
    sampleType: "Sputum",
    container: "Sputum Cup",
    method: "Microscopy",
    tat: "24 hours",
    department: "Microbiology",
  },
  "test-gram-stain": {
    shortCode: "GRAM",
    sampleType: "Pus / Wound Swab",
    container: "Slide",
    method: "Microscopy",
    tat: "4 hours",
    department: "Microbiology",
  },
  "test-pregnancy": {
    shortCode: "UPT",
    sampleType: "Urine (Spot)",
    container: "Urine Container",
    method: "Rapid Card Test",
    tat: "1 hour",
    department: "Clinical Pathology",
    isPopular: true,
  },
  "test-tsh-single": {
    shortCode: "TSH",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "4 hours",
    department: "Hormones",
    isPopular: true,
  },
  "test-fsh": {
    shortCode: "FSH",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Hormones",
  },
  "test-lh": {
    shortCode: "LH",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Hormones",
  },
  "test-prolactin": {
    shortCode: "PRL",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Hormones",
  },
  "test-testosterone": {
    shortCode: "TEST",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Hormones",
  },
  "test-cortisol": {
    shortCode: "CORT",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Hormones",
  },
  "test-bhcg": {
    shortCode: "β-hCG",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "4 hours",
    department: "Hormones",
    isPopular: true,
  },
  "test-insulin": {
    shortCode: "INS",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Hormones",
  },
  "test-fever-profile": {
    shortCode: "FP",
    sampleType: "Whole Blood / Serum",
    container: "EDTA Vial (Lavender)",
    method: "Multiple",
    tat: "Same day",
    department: "Serology",
    isPopular: true,
  },
  "test-diabetes-profile": {
    shortCode: "DP",
    sampleType: "Fluoride Blood / Serum",
    container: "Fluoride Vial (Grey)",
    method: "Multiple",
    tat: "4 hours",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-thyroid-profile": {
    shortCode: "TP",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-health-basic": {
    shortCode: "HCB",
    sampleType: "Multiple",
    container: "Multiple",
    method: "Multiple",
    tat: "Same day",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-health-adv": {
    shortCode: "HCA",
    sampleType: "Multiple",
    container: "Multiple",
    method: "Multiple",
    tat: "Same day",
    department: "Biochemistry",
  },
  "test-liver-profile": {
    shortCode: "LP",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Spectrophotometry",
    tat: "4 hours",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-kidney-profile": {
    shortCode: "KP",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Spectrophotometry",
    tat: "4 hours",
    department: "Biochemistry",
    isPopular: true,
  },
  "test-cardiac-profile": {
    shortCode: "CP",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Biochemistry",
  },
  "test-iron-studies": {
    shortCode: "IRON",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "Spectrophotometry",
    tat: "4 hours",
    department: "Biochemistry",
  },
  "test-ferritin": {
    shortCode: "FERR",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Biochemistry",
  },
  "test-folate": {
    shortCode: "FOL",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Biochemistry",
  },
  "test-psa": {
    shortCode: "PSA",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "CLIA (Chemiluminescence)",
    tat: "Same day",
    department: "Immunology",
  },
  "test-ana": {
    shortCode: "ANA",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "ELISA",
    tat: "48 hours",
    department: "Immunology",
  },
  "test-anti-ccp": {
    shortCode: "AntiCCP",
    sampleType: "Serum",
    container: "Plain Vial (Red)",
    method: "ELISA",
    tat: "48 hours",
    department: "Immunology",
  },
};

export function getSeedTests(): LabTest[] {
  return [
    // ── HEMATOLOGY ──────────────────────────────────────────────────────────
    makeTest("test-cbc", "CBC (Complete Blood Count)", "Hematology", 350, [
      {
        id: "p-cbc-1",
        name: "Hemoglobin",
        unit: "g/dL",
        referenceRange: "12.0–17.5",
        referenceMin: 12,
        referenceMax: 17.5,
      },
      {
        id: "p-cbc-2",
        name: "WBC Count",
        unit: "10³/µL",
        referenceRange: "4.5–11.0",
        referenceMin: 4.5,
        referenceMax: 11,
      },
      {
        id: "p-cbc-3",
        name: "Platelet Count",
        unit: "10³/µL",
        referenceRange: "150–400",
        referenceMin: 150,
        referenceMax: 400,
      },
      {
        id: "p-cbc-4",
        name: "RBC Count",
        unit: "10⁶/µL",
        referenceRange: "4.2–5.4",
        referenceMin: 4.2,
        referenceMax: 5.4,
      },
      {
        id: "p-cbc-5",
        name: "Hematocrit (PCV)",
        unit: "%",
        referenceRange: "36–52",
        referenceMin: 36,
        referenceMax: 52,
      },
      {
        id: "p-cbc-6",
        name: "MCV",
        unit: "fL",
        referenceRange: "80–100",
        referenceMin: 80,
        referenceMax: 100,
      },
      {
        id: "p-cbc-7",
        name: "MCH",
        unit: "pg",
        referenceRange: "27–33",
        referenceMin: 27,
        referenceMax: 33,
      },
      {
        id: "p-cbc-8",
        name: "MCHC",
        unit: "g/dL",
        referenceRange: "32–36",
        referenceMin: 32,
        referenceMax: 36,
      },
      {
        id: "p-cbc-9",
        name: "RDW-CV",
        unit: "%",
        referenceRange: "11.5–14.5",
        referenceMin: 11.5,
        referenceMax: 14.5,
      },
      {
        id: "p-cbc-10",
        name: "Neutrophils",
        unit: "%",
        referenceRange: "40–70",
        referenceMin: 40,
        referenceMax: 70,
      },
      {
        id: "p-cbc-11",
        name: "Lymphocytes",
        unit: "%",
        referenceRange: "20–45",
        referenceMin: 20,
        referenceMax: 45,
      },
      {
        id: "p-cbc-12",
        name: "Monocytes",
        unit: "%",
        referenceRange: "2–10",
        referenceMin: 2,
        referenceMax: 10,
      },
      {
        id: "p-cbc-13",
        name: "Eosinophils",
        unit: "%",
        referenceRange: "1–6",
        referenceMin: 1,
        referenceMax: 6,
      },
      {
        id: "p-cbc-14",
        name: "Basophils",
        unit: "%",
        referenceRange: "0–1",
        referenceMin: 0,
        referenceMax: 1,
      },
    ]),

    makeTest("test-hb", "Hemoglobin", "Hematology", 80, [
      {
        id: "p-hb-1",
        name: "Hemoglobin",
        unit: "g/dL",
        referenceRange: "M: 13.0–17.5 / F: 12.0–15.5",
        referenceMin: 12,
        referenceMax: 17.5,
      },
    ]),

    makeTest(
      "test-esr",
      "ESR (Erythrocyte Sedimentation Rate)",
      "Hematology",
      100,
      [
        {
          id: "p-esr-1",
          name: "ESR",
          unit: "mm/hr",
          referenceRange: "M: 0–15 / F: 0–20",
          referenceMin: 0,
          referenceMax: 20,
        },
      ],
    ),

    makeTest("test-bt-ct", "Bleeding Time & Clotting Time", "Hematology", 120, [
      {
        id: "p-btct-1",
        name: "Bleeding Time",
        unit: "min",
        referenceRange: "1–3",
        referenceMin: 1,
        referenceMax: 3,
      },
      {
        id: "p-btct-2",
        name: "Clotting Time",
        unit: "min",
        referenceRange: "2–6",
        referenceMin: 2,
        referenceMax: 6,
      },
    ]),

    makeTest("test-pt-inr", "Prothrombin Time (PT/INR)", "Hematology", 300, [
      {
        id: "p-ptinr-1",
        name: "PT (Patient)",
        unit: "sec",
        referenceRange: "11–13.5",
        referenceMin: 11,
        referenceMax: 13.5,
      },
      {
        id: "p-ptinr-2",
        name: "PT (Control)",
        unit: "sec",
        referenceRange: "11–13.5",
        referenceMin: 11,
        referenceMax: 13.5,
      },
      {
        id: "p-ptinr-3",
        name: "INR",
        unit: "ratio",
        referenceRange: "0.8–1.2",
        referenceMin: 0.8,
        referenceMax: 1.2,
      },
    ]),

    makeTest(
      "test-aptt",
      "APTT (Activated Partial Thromboplastin Time)",
      "Hematology",
      280,
      [
        {
          id: "p-aptt-1",
          name: "APTT (Patient)",
          unit: "sec",
          referenceRange: "25–35",
          referenceMin: 25,
          referenceMax: 35,
        },
        {
          id: "p-aptt-2",
          name: "APTT (Control)",
          unit: "sec",
          referenceRange: "25–35",
          referenceMin: 25,
          referenceMax: 35,
        },
      ],
    ),

    makeTest("test-bloodgroup", "Blood Group & Rh Typing", "Hematology", 120, [
      {
        id: "p-bg-1",
        name: "ABO Blood Group",
        unit: "",
        referenceRange: "A / B / AB / O",
      },
      {
        id: "p-bg-2",
        name: "Rh Factor",
        unit: "",
        referenceRange: "Positive / Negative",
      },
    ]),

    makeTest("test-pbs", "Peripheral Blood Smear", "Hematology", 200, [
      {
        id: "p-pbs-1",
        name: "RBC Morphology",
        unit: "",
        referenceRange: "Normocytic Normochromic",
      },
      {
        id: "p-pbs-2",
        name: "WBC Morphology",
        unit: "",
        referenceRange: "Normal",
      },
      {
        id: "p-pbs-3",
        name: "Platelet Morphology",
        unit: "",
        referenceRange: "Adequate",
      },
      {
        id: "p-pbs-4",
        name: "Malarial Parasite",
        unit: "",
        referenceRange: "Not Seen",
      },
    ]),

    makeTest("test-reti", "Reticulocyte Count", "Hematology", 150, [
      {
        id: "p-reti-1",
        name: "Reticulocyte Count",
        unit: "%",
        referenceRange: "0.5–2.0",
        referenceMin: 0.5,
        referenceMax: 2,
      },
    ]),

    // ── BIOCHEMISTRY ────────────────────────────────────────────────────────
    makeTest("test-bsf", "Blood Sugar Fasting (BSF)", "Biochemistry", 80, [
      {
        id: "p-bsf-1",
        name: "Fasting Blood Glucose",
        unit: "mg/dL",
        referenceRange: "70–100",
        referenceMin: 70,
        referenceMax: 100,
      },
    ]),

    makeTest(
      "test-bspp",
      "Blood Sugar Post Prandial (BSPP)",
      "Biochemistry",
      80,
      [
        {
          id: "p-bspp-1",
          name: "Post Prandial Blood Glucose",
          unit: "mg/dL",
          referenceRange: "<140",
          referenceMax: 140,
        },
      ],
    ),

    makeTest("test-rbs", "Random Blood Sugar (RBS)", "Biochemistry", 80, [
      {
        id: "p-rbs-1",
        name: "Random Blood Glucose",
        unit: "mg/dL",
        referenceRange: "70–140",
        referenceMin: 70,
        referenceMax: 140,
      },
    ]),

    makeTest(
      "test-hba1c",
      "HbA1c (Glycated Haemoglobin)",
      "Biochemistry",
      650,
      [
        {
          id: "p-hba-1",
          name: "HbA1c",
          unit: "%",
          referenceRange:
            "<5.7 (Normal), 5.7–6.4 (Pre-diabetic), ≥6.5 (Diabetic)",
          referenceMax: 5.7,
        },
        {
          id: "p-hba-2",
          name: "Estimated Average Glucose (eAG)",
          unit: "mg/dL",
          referenceRange: "<117",
          referenceMax: 117,
        },
      ],
    ),

    makeTest("test-urea", "Blood Urea", "Biochemistry", 120, [
      {
        id: "p-urea-1",
        name: "Blood Urea",
        unit: "mg/dL",
        referenceRange: "15–45",
        referenceMin: 15,
        referenceMax: 45,
      },
    ]),

    makeTest("test-creatinine", "Serum Creatinine", "Biochemistry", 130, [
      {
        id: "p-creat-1",
        name: "Serum Creatinine",
        unit: "mg/dL",
        referenceRange: "M: 0.7–1.2 / F: 0.5–1.0",
        referenceMin: 0.5,
        referenceMax: 1.2,
      },
    ]),

    makeTest("test-uricacid", "Serum Uric Acid", "Biochemistry", 150, [
      {
        id: "p-ua-1",
        name: "Uric Acid",
        unit: "mg/dL",
        referenceRange: "M: 3.5–7.2 / F: 2.6–6.0",
        referenceMin: 2.6,
        referenceMax: 7.2,
      },
    ]),

    makeTest("test-calcium", "Serum Calcium", "Biochemistry", 150, [
      {
        id: "p-ca-1",
        name: "Total Calcium",
        unit: "mg/dL",
        referenceRange: "8.5–10.5",
        referenceMin: 8.5,
        referenceMax: 10.5,
      },
    ]),

    makeTest("test-sodium", "Serum Sodium", "Biochemistry", 130, [
      {
        id: "p-na-1",
        name: "Sodium",
        unit: "mEq/L",
        referenceRange: "136–145",
        referenceMin: 136,
        referenceMax: 145,
      },
    ]),

    makeTest("test-potassium", "Serum Potassium", "Biochemistry", 130, [
      {
        id: "p-k-1",
        name: "Potassium",
        unit: "mEq/L",
        referenceRange: "3.5–5.0",
        referenceMin: 3.5,
        referenceMax: 5,
      },
    ]),

    makeTest("test-vitd", "Vitamin D (25-OH)", "Biochemistry", 1400, [
      {
        id: "p-vitd-1",
        name: "25-OH Vitamin D",
        unit: "ng/mL",
        referenceRange: "30–100 (Optimal: >50)",
        referenceMin: 30,
        referenceMax: 100,
      },
    ]),

    makeTest("test-vitb12", "Vitamin B12 (Cobalamin)", "Biochemistry", 1200, [
      {
        id: "p-vitb-1",
        name: "Vitamin B12",
        unit: "pg/mL",
        referenceRange: "200–900",
        referenceMin: 200,
        referenceMax: 900,
      },
    ]),

    makeTest("test-iron-studies", "Iron Studies", "Biochemistry", 600, [
      {
        id: "p-iron-1",
        name: "Serum Iron",
        unit: "µg/dL",
        referenceRange: "60–170",
        referenceMin: 60,
        referenceMax: 170,
      },
      {
        id: "p-iron-2",
        name: "TIBC",
        unit: "µg/dL",
        referenceRange: "250–370",
        referenceMin: 250,
        referenceMax: 370,
      },
      {
        id: "p-iron-3",
        name: "Transferrin Saturation",
        unit: "%",
        referenceRange: "20–50",
        referenceMin: 20,
        referenceMax: 50,
      },
    ]),

    makeTest("test-ferritin", "Serum Ferritin", "Biochemistry", 900, [
      {
        id: "p-ferr-1",
        name: "Ferritin",
        unit: "ng/mL",
        referenceRange: "M: 24–336 / F: 11–307",
        referenceMin: 11,
        referenceMax: 336,
      },
    ]),

    makeTest("test-folate", "Serum Folate", "Biochemistry", 900, [
      {
        id: "p-fol-1",
        name: "Folate (Folic Acid)",
        unit: "ng/mL",
        referenceRange: ">5.4",
        referenceMin: 5.4,
      },
    ]),

    makeTest("test-lft", "Liver Function Test (LFT)", "Biochemistry", 900, [
      {
        id: "p-lft-1",
        name: "Total Bilirubin",
        unit: "mg/dL",
        referenceRange: "0.2–1.2",
        referenceMin: 0.2,
        referenceMax: 1.2,
      },
      {
        id: "p-lft-2",
        name: "Direct Bilirubin",
        unit: "mg/dL",
        referenceRange: "0.0–0.3",
        referenceMin: 0,
        referenceMax: 0.3,
      },
      {
        id: "p-lft-3",
        name: "Indirect Bilirubin",
        unit: "mg/dL",
        referenceRange: "0.1–0.9",
        referenceMin: 0.1,
        referenceMax: 0.9,
      },
      {
        id: "p-lft-4",
        name: "SGOT (AST)",
        unit: "U/L",
        referenceRange: "10–40",
        referenceMin: 10,
        referenceMax: 40,
      },
      {
        id: "p-lft-5",
        name: "SGPT (ALT)",
        unit: "U/L",
        referenceRange: "7–56",
        referenceMin: 7,
        referenceMax: 56,
      },
      {
        id: "p-lft-6",
        name: "Alkaline Phosphatase (ALP)",
        unit: "U/L",
        referenceRange: "44–147",
        referenceMin: 44,
        referenceMax: 147,
      },
      {
        id: "p-lft-7",
        name: "GGT",
        unit: "U/L",
        referenceRange: "M: 8–61 / F: 5–36",
        referenceMin: 5,
        referenceMax: 61,
      },
      {
        id: "p-lft-8",
        name: "Total Protein",
        unit: "g/dL",
        referenceRange: "6.0–8.3",
        referenceMin: 6,
        referenceMax: 8.3,
      },
      {
        id: "p-lft-9",
        name: "Albumin",
        unit: "g/dL",
        referenceRange: "3.5–5.0",
        referenceMin: 3.5,
        referenceMax: 5,
      },
      {
        id: "p-lft-10",
        name: "Globulin",
        unit: "g/dL",
        referenceRange: "2.0–3.5",
        referenceMin: 2,
        referenceMax: 3.5,
      },
      {
        id: "p-lft-11",
        name: "A/G Ratio",
        unit: "ratio",
        referenceRange: "1.2–2.2",
        referenceMin: 1.2,
        referenceMax: 2.2,
      },
    ]),

    makeTest("test-kft", "Kidney Function Test (KFT)", "Biochemistry", 800, [
      {
        id: "p-kft-1",
        name: "Blood Urea",
        unit: "mg/dL",
        referenceRange: "15–45",
        referenceMin: 15,
        referenceMax: 45,
      },
      {
        id: "p-kft-2",
        name: "Serum Creatinine",
        unit: "mg/dL",
        referenceRange: "0.6–1.2",
        referenceMin: 0.6,
        referenceMax: 1.2,
      },
      {
        id: "p-kft-3",
        name: "Uric Acid",
        unit: "mg/dL",
        referenceRange: "3.5–7.2",
        referenceMin: 3.5,
        referenceMax: 7.2,
      },
      {
        id: "p-kft-4",
        name: "Sodium",
        unit: "mEq/L",
        referenceRange: "136–145",
        referenceMin: 136,
        referenceMax: 145,
      },
      {
        id: "p-kft-5",
        name: "Potassium",
        unit: "mEq/L",
        referenceRange: "3.5–5.0",
        referenceMin: 3.5,
        referenceMax: 5,
      },
      {
        id: "p-kft-6",
        name: "Chloride",
        unit: "mEq/L",
        referenceRange: "98–107",
        referenceMin: 98,
        referenceMax: 107,
      },
      {
        id: "p-kft-7",
        name: "eGFR",
        unit: "mL/min/1.73m²",
        referenceRange: ">60",
        referenceMin: 60,
      },
    ]),

    makeTest("test-lipid", "Lipid Profile", "Biochemistry", 750, [
      {
        id: "p-lip-1",
        name: "Total Cholesterol",
        unit: "mg/dL",
        referenceRange: "<200",
        referenceMax: 200,
      },
      {
        id: "p-lip-2",
        name: "Triglycerides",
        unit: "mg/dL",
        referenceRange: "<150",
        referenceMax: 150,
      },
      {
        id: "p-lip-3",
        name: "HDL Cholesterol",
        unit: "mg/dL",
        referenceRange: "M: >40 / F: >50",
        referenceMin: 40,
      },
      {
        id: "p-lip-4",
        name: "LDL Cholesterol",
        unit: "mg/dL",
        referenceRange: "<100",
        referenceMax: 100,
      },
      {
        id: "p-lip-5",
        name: "VLDL Cholesterol",
        unit: "mg/dL",
        referenceRange: "5–40",
        referenceMin: 5,
        referenceMax: 40,
      },
      {
        id: "p-lip-6",
        name: "TC/HDL Ratio",
        unit: "ratio",
        referenceRange: "<4.5",
        referenceMax: 4.5,
      },
      {
        id: "p-lip-7",
        name: "Non-HDL Cholesterol",
        unit: "mg/dL",
        referenceRange: "<130",
        referenceMax: 130,
      },
    ]),

    makeTest(
      "test-tft",
      "Thyroid Function Test (T3, T4, TSH)",
      "Biochemistry",
      1100,
      [
        {
          id: "p-tft-1",
          name: "T3 (Total)",
          unit: "ng/dL",
          referenceRange: "80–200",
          referenceMin: 80,
          referenceMax: 200,
        },
        {
          id: "p-tft-2",
          name: "T4 (Total)",
          unit: "µg/dL",
          referenceRange: "5.0–12.0",
          referenceMin: 5,
          referenceMax: 12,
        },
        {
          id: "p-tft-3",
          name: "TSH",
          unit: "µIU/mL",
          referenceRange: "0.4–4.0",
          referenceMin: 0.4,
          referenceMax: 4,
        },
      ],
    ),

    makeTest(
      "test-tsh",
      "TSH (Thyroid Stimulating Hormone)",
      "Biochemistry",
      450,
      [
        {
          id: "p-tsh-1",
          name: "TSH",
          unit: "µIU/mL",
          referenceRange: "0.4–4.0",
          referenceMin: 0.4,
          referenceMax: 4,
        },
      ],
    ),

    // ── SEROLOGY ────────────────────────────────────────────────────────────
    makeTest("test-dengue", "Dengue (NS1 + IgM + IgG)", "Serology", 900, [
      {
        id: "p-den-1",
        name: "NS1 Antigen",
        unit: "",
        referenceRange: "Negative",
      },
      {
        id: "p-den-2",
        name: "IgM Antibody",
        unit: "",
        referenceRange: "Negative",
      },
      {
        id: "p-den-3",
        name: "IgG Antibody",
        unit: "",
        referenceRange: "Negative",
      },
    ]),

    makeTest("test-malaria", "Malaria Antigen Test (Rapid)", "Serology", 400, [
      {
        id: "p-mal-1",
        name: "P. falciparum (HRP-II)",
        unit: "",
        referenceRange: "Negative",
      },
      {
        id: "p-mal-2",
        name: "P. vivax Antigen",
        unit: "",
        referenceRange: "Negative",
      },
    ]),

    makeTest("test-widal", "Widal Test", "Serology", 250, [
      {
        id: "p-wid-1",
        name: "S. Typhi O",
        unit: "titre",
        referenceRange: "<1:80",
      },
      {
        id: "p-wid-2",
        name: "S. Typhi H",
        unit: "titre",
        referenceRange: "<1:80",
      },
      {
        id: "p-wid-3",
        name: "S. Paratyphi AO",
        unit: "titre",
        referenceRange: "<1:80",
      },
      {
        id: "p-wid-4",
        name: "S. Paratyphi BH",
        unit: "titre",
        referenceRange: "<1:80",
      },
    ]),

    makeTest("test-hiv", "HIV 1 & 2 Antibody (ELISA)", "Serology", 500, [
      {
        id: "p-hiv-1",
        name: "HIV 1 Antibody",
        unit: "",
        referenceRange: "Non-Reactive",
      },
      {
        id: "p-hiv-2",
        name: "HIV 2 Antibody",
        unit: "",
        referenceRange: "Non-Reactive",
      },
    ]),

    makeTest(
      "test-hbsag",
      "HBsAg (Hepatitis B Surface Antigen)",
      "Serology",
      350,
      [
        {
          id: "p-hbsag-1",
          name: "HBsAg",
          unit: "",
          referenceRange: "Non-Reactive",
        },
      ],
    ),

    makeTest("test-hcv", "HCV Antibody (Hepatitis C)", "Serology", 450, [
      {
        id: "p-hcv-1",
        name: "Anti-HCV",
        unit: "",
        referenceRange: "Non-Reactive",
      },
    ]),

    makeTest("test-vdrl", "VDRL (Syphilis Screening)", "Serology", 200, [
      {
        id: "p-vdrl-1",
        name: "VDRL",
        unit: "",
        referenceRange: "Non-Reactive",
      },
    ]),

    makeTest("test-typhidot", "Typhidot (IgM + IgG)", "Serology", 450, [
      {
        id: "p-typhidot-1",
        name: "IgM (Acute)",
        unit: "",
        referenceRange: "Negative",
      },
      {
        id: "p-typhidot-2",
        name: "IgG (Past)",
        unit: "",
        referenceRange: "Negative",
      },
    ]),

    // ── CLINICAL PATHOLOGY ───────────────────────────────────────────────────
    makeTest(
      "test-urine",
      "Urine Routine & Microscopy",
      "Clinical Pathology",
      200,
      [
        {
          id: "p-uri-1",
          name: "Colour",
          unit: "",
          referenceRange: "Pale Yellow",
        },
        {
          id: "p-uri-2",
          name: "Appearance",
          unit: "",
          referenceRange: "Clear",
        },
        {
          id: "p-uri-3",
          name: "Specific Gravity",
          unit: "",
          referenceRange: "1.005–1.030",
          referenceMin: 1.005,
          referenceMax: 1.03,
        },
        {
          id: "p-uri-4",
          name: "pH",
          unit: "",
          referenceRange: "4.5–8.0",
          referenceMin: 4.5,
          referenceMax: 8,
        },
        {
          id: "p-uri-5",
          name: "Protein",
          unit: "",
          referenceRange: "Negative",
        },
        {
          id: "p-uri-6",
          name: "Sugar (Glucose)",
          unit: "",
          referenceRange: "Negative",
        },
        { id: "p-uri-7", name: "Ketone", unit: "", referenceRange: "Negative" },
        { id: "p-uri-8", name: "Blood", unit: "", referenceRange: "Negative" },
        {
          id: "p-uri-9",
          name: "Urobilinogen",
          unit: "",
          referenceRange: "Normal",
        },
        {
          id: "p-uri-10",
          name: "Pus Cells (WBC)",
          unit: "/HPF",
          referenceRange: "0–5",
          referenceMin: 0,
          referenceMax: 5,
        },
        {
          id: "p-uri-11",
          name: "RBC",
          unit: "/HPF",
          referenceRange: "0–2",
          referenceMin: 0,
          referenceMax: 2,
        },
        {
          id: "p-uri-12",
          name: "Epithelial Cells",
          unit: "/HPF",
          referenceRange: "0–5",
          referenceMin: 0,
          referenceMax: 5,
        },
        { id: "p-uri-13", name: "Casts", unit: "/LPF", referenceRange: "Nil" },
        {
          id: "p-uri-14",
          name: "Crystals",
          unit: "",
          referenceRange: "Absent",
        },
        {
          id: "p-uri-15",
          name: "Bacteria",
          unit: "",
          referenceRange: "Absent",
        },
      ],
    ),

    makeTest(
      "test-stool",
      "Stool Routine & Microscopy",
      "Clinical Pathology",
      150,
      [
        { id: "p-st-1", name: "Colour", unit: "", referenceRange: "Brown" },
        {
          id: "p-st-2",
          name: "Consistency",
          unit: "",
          referenceRange: "Formed",
        },
        {
          id: "p-st-3",
          name: "Reaction (pH)",
          unit: "",
          referenceRange: "Neutral / Alkaline",
        },
        { id: "p-st-4", name: "Mucus", unit: "", referenceRange: "Absent" },
        { id: "p-st-5", name: "Blood", unit: "", referenceRange: "Absent" },
        {
          id: "p-st-6",
          name: "Pus Cells",
          unit: "/HPF",
          referenceRange: "0–2",
          referenceMin: 0,
          referenceMax: 2,
        },
        {
          id: "p-st-7",
          name: "RBC",
          unit: "/HPF",
          referenceRange: "0–1",
          referenceMin: 0,
          referenceMax: 1,
        },
        {
          id: "p-st-8",
          name: "Ova / Cyst / Parasite",
          unit: "",
          referenceRange: "Not Seen",
        },
        {
          id: "p-st-9",
          name: "Bacteria",
          unit: "",
          referenceRange: "Normal Flora",
        },
      ],
    ),

    makeTest("test-occult", "Stool Occult Blood", "Clinical Pathology", 150, [
      {
        id: "p-fob-1",
        name: "Occult Blood",
        unit: "",
        referenceRange: "Negative",
      },
    ]),

    makeTest(
      "test-pregnancy",
      "Urine Pregnancy Test (UPT)",
      "Clinical Pathology",
      120,
      [
        {
          id: "p-preg-1",
          name: "Urine hCG",
          unit: "",
          referenceRange: "Negative (Non-pregnant)",
        },
      ],
    ),

    // ── MICROBIOLOGY ────────────────────────────────────────────────────────
    makeTest(
      "test-urine-culture",
      "Urine Culture & Sensitivity",
      "Microbiology",
      600,
      [
        {
          id: "p-uc-1",
          name: "Colony Count",
          unit: "CFU/mL",
          referenceRange: "<10,000",
        },
        {
          id: "p-uc-2",
          name: "Organism Isolated",
          unit: "",
          referenceRange: "No Growth",
        },
        {
          id: "p-uc-3",
          name: "Sensitivity Pattern",
          unit: "",
          referenceRange: "N/A",
        },
      ],
    ),

    makeTest(
      "test-blood-culture",
      "Blood Culture & Sensitivity",
      "Microbiology",
      900,
      [
        {
          id: "p-bc-1",
          name: "Growth",
          unit: "",
          referenceRange: "No Growth at 5 days",
        },
        {
          id: "p-bc-2",
          name: "Organism Identified",
          unit: "",
          referenceRange: "Sterile",
        },
        {
          id: "p-bc-3",
          name: "Antibiotic Sensitivity",
          unit: "",
          referenceRange: "N/A",
        },
      ],
    ),

    makeTest(
      "test-pus-culture",
      "Pus Culture & Sensitivity",
      "Microbiology",
      600,
      [
        {
          id: "p-pc-1",
          name: "Organism Isolated",
          unit: "",
          referenceRange: "No Growth",
        },
        {
          id: "p-pc-2",
          name: "Gram Stain",
          unit: "",
          referenceRange: "No organisms seen",
        },
        {
          id: "p-pc-3",
          name: "Antibiotic Sensitivity",
          unit: "",
          referenceRange: "N/A",
        },
      ],
    ),

    makeTest(
      "test-sputum-afb",
      "Sputum for AFB (Acid Fast Bacilli)",
      "Microbiology",
      250,
      [
        {
          id: "p-afb-1",
          name: "AFB Smear",
          unit: "",
          referenceRange: "Not Seen",
        },
        {
          id: "p-afb-2",
          name: "Grading",
          unit: "",
          referenceRange: "Negative",
        },
      ],
    ),

    makeTest("test-gram-stain", "Gram Stain", "Microbiology", 200, [
      {
        id: "p-gram-1",
        name: "Gram Stain Result",
        unit: "",
        referenceRange: "No organisms seen",
      },
      {
        id: "p-gram-2",
        name: "Pus Cells",
        unit: "/HPF",
        referenceRange: "0–2",
        referenceMin: 0,
        referenceMax: 2,
      },
    ]),

    makeTest(
      "test-stool-culture",
      "Stool Culture & Sensitivity",
      "Microbiology",
      500,
      [
        {
          id: "p-sc-1",
          name: "Organism Isolated",
          unit: "",
          referenceRange: "No Pathogen Isolated",
        },
        {
          id: "p-sc-2",
          name: "Antibiotic Sensitivity",
          unit: "",
          referenceRange: "N/A",
        },
      ],
    ),

    // ── IMMUNOLOGY ──────────────────────────────────────────────────────────
    makeTest("test-crp", "C-Reactive Protein (CRP)", "Immunology", 450, [
      {
        id: "p-crp-1",
        name: "CRP (Quantitative)",
        unit: "mg/L",
        referenceRange: "<5",
        referenceMax: 5,
      },
    ]),

    makeTest("test-ra", "Rheumatoid Arthritis (RA) Factor", "Immunology", 350, [
      {
        id: "p-ra-1",
        name: "RA Factor",
        unit: "IU/mL",
        referenceRange: "<20",
        referenceMax: 20,
      },
    ]),

    makeTest("test-aso", "ASO Titre (Anti-Streptolysin O)", "Immunology", 350, [
      {
        id: "p-aso-1",
        name: "ASO Titre",
        unit: "IU/mL",
        referenceRange: "<200",
        referenceMax: 200,
      },
    ]),

    makeTest("test-ana", "ANA (Anti-Nuclear Antibody)", "Immunology", 1200, [
      {
        id: "p-ana-1",
        name: "ANA Screen",
        unit: "",
        referenceRange: "Negative",
      },
      {
        id: "p-ana-2",
        name: "IF Titre (if positive)",
        unit: "titre",
        referenceRange: "<1:40",
      },
    ]),

    makeTest(
      "test-anti-ccp",
      "Anti-CCP (Anti-Cyclic Citrullinated Peptide)",
      "Immunology",
      1400,
      [
        {
          id: "p-accp-1",
          name: "Anti-CCP",
          unit: "U/mL",
          referenceRange: "<7 (Negative)",
          referenceMax: 7,
        },
      ],
    ),

    makeTest("test-psa", "PSA (Prostate Specific Antigen)", "Immunology", 900, [
      {
        id: "p-psa-1",
        name: "Total PSA",
        unit: "ng/mL",
        referenceRange: "<4.0",
        referenceMax: 4,
      },
      { id: "p-psa-2", name: "Free PSA", unit: "ng/mL", referenceRange: "N/A" },
    ]),

    // ── HORMONES ────────────────────────────────────────────────────────────
    makeTest("test-tsh-single", "TSH (Serum)", "Hormones", 450, [
      {
        id: "p-tshs-1",
        name: "TSH",
        unit: "µIU/mL",
        referenceRange: "0.4–4.0",
        referenceMin: 0.4,
        referenceMax: 4,
      },
    ]),

    makeTest(
      "test-fsh",
      "FSH (Follicle Stimulating Hormone)",
      "Hormones",
      600,
      [
        {
          id: "p-fsh-1",
          name: "FSH",
          unit: "mIU/mL",
          referenceRange: "M: 1.5–12.4 / F(follicular): 3.5–12.5",
        },
      ],
    ),

    makeTest("test-lh", "LH (Luteinizing Hormone)", "Hormones", 600, [
      {
        id: "p-lh-1",
        name: "LH",
        unit: "mIU/mL",
        referenceRange: "M: 1.7–8.6 / F(follicular): 2.4–12.6",
      },
    ]),

    makeTest("test-prolactin", "Prolactin (PRL)", "Hormones", 700, [
      {
        id: "p-prl-1",
        name: "Prolactin",
        unit: "ng/mL",
        referenceRange: "M: 2–18 / F: 2–29",
        referenceMin: 2,
        referenceMax: 29,
      },
    ]),

    makeTest("test-testosterone", "Testosterone (Total)", "Hormones", 900, [
      {
        id: "p-test-1",
        name: "Total Testosterone",
        unit: "ng/dL",
        referenceRange: "M: 300–1000 / F: 15–70",
      },
    ]),

    makeTest("test-cortisol", "Cortisol (Morning)", "Hormones", 900, [
      {
        id: "p-cort-1",
        name: "Cortisol (8 AM)",
        unit: "µg/dL",
        referenceRange: "6.2–19.4",
        referenceMin: 6.2,
        referenceMax: 19.4,
      },
    ]),

    makeTest("test-bhcg", "Beta hCG (Quantitative)", "Hormones", 900, [
      {
        id: "p-bhcg-1",
        name: "Beta hCG",
        unit: "mIU/mL",
        referenceRange: "Non-pregnant: <5",
      },
    ]),

    makeTest("test-insulin", "Fasting Insulin", "Hormones", 900, [
      {
        id: "p-ins-1",
        name: "Fasting Insulin",
        unit: "µIU/mL",
        referenceRange: "2.6–24.9",
        referenceMin: 2.6,
        referenceMax: 24.9,
      },
      {
        id: "p-ins-2",
        name: "HOMA-IR",
        unit: "",
        referenceRange: "<2.5",
        referenceMax: 2.5,
      },
    ]),

    // ── PROFILES ────────────────────────────────────────────────────────────
    makeTest("test-fever-profile", "Fever Profile", "Profiles", 1200, [
      {
        id: "p-fp-1",
        name: "CBC (WBC)",
        unit: "10³/µL",
        referenceRange: "4.5–11.0",
        referenceMin: 4.5,
        referenceMax: 11,
      },
      {
        id: "p-fp-2",
        name: "Dengue NS1 Antigen",
        unit: "",
        referenceRange: "Negative",
      },
      {
        id: "p-fp-3",
        name: "Malaria Antigen",
        unit: "",
        referenceRange: "Negative",
      },
      {
        id: "p-fp-4",
        name: "Widal – S. Typhi O",
        unit: "titre",
        referenceRange: "<1:80",
      },
      {
        id: "p-fp-5",
        name: "Widal – S. Typhi H",
        unit: "titre",
        referenceRange: "<1:80",
      },
      {
        id: "p-fp-6",
        name: "CRP",
        unit: "mg/L",
        referenceRange: "<5",
        referenceMax: 5,
      },
      {
        id: "p-fp-7",
        name: "ESR",
        unit: "mm/hr",
        referenceRange: "0–20",
        referenceMax: 20,
      },
    ]),

    makeTest("test-diabetes-profile", "Diabetes Profile", "Profiles", 1400, [
      {
        id: "p-dp-1",
        name: "Fasting Blood Sugar",
        unit: "mg/dL",
        referenceRange: "70–100",
        referenceMin: 70,
        referenceMax: 100,
      },
      {
        id: "p-dp-2",
        name: "Post Prandial Blood Sugar",
        unit: "mg/dL",
        referenceRange: "<140",
        referenceMax: 140,
      },
      {
        id: "p-dp-3",
        name: "HbA1c",
        unit: "%",
        referenceRange: "<5.7",
        referenceMax: 5.7,
      },
      {
        id: "p-dp-4",
        name: "Serum Creatinine",
        unit: "mg/dL",
        referenceRange: "0.6–1.2",
        referenceMin: 0.6,
        referenceMax: 1.2,
      },
      {
        id: "p-dp-5",
        name: "Urine Microalbumin",
        unit: "mg/L",
        referenceRange: "<30",
        referenceMax: 30,
      },
      {
        id: "p-dp-6",
        name: "Lipid Profile – Total Cholesterol",
        unit: "mg/dL",
        referenceRange: "<200",
        referenceMax: 200,
      },
    ]),

    makeTest(
      "test-thyroid-profile",
      "Thyroid Profile (T3, T4, TSH, Free T3, Free T4)",
      "Profiles",
      1500,
      [
        {
          id: "p-tp-1",
          name: "T3 (Total)",
          unit: "ng/dL",
          referenceRange: "80–200",
          referenceMin: 80,
          referenceMax: 200,
        },
        {
          id: "p-tp-2",
          name: "T4 (Total)",
          unit: "µg/dL",
          referenceRange: "5.0–12.0",
          referenceMin: 5,
          referenceMax: 12,
        },
        {
          id: "p-tp-3",
          name: "TSH",
          unit: "µIU/mL",
          referenceRange: "0.4–4.0",
          referenceMin: 0.4,
          referenceMax: 4,
        },
        {
          id: "p-tp-4",
          name: "Free T3",
          unit: "pg/mL",
          referenceRange: "2.3–4.2",
          referenceMin: 2.3,
          referenceMax: 4.2,
        },
        {
          id: "p-tp-5",
          name: "Free T4",
          unit: "ng/dL",
          referenceRange: "0.89–1.76",
          referenceMin: 0.89,
          referenceMax: 1.76,
        },
      ],
    ),

    makeTest("test-health-basic", "Health Checkup (Basic)", "Profiles", 1800, [
      {
        id: "p-hcb-1",
        name: "Hemoglobin",
        unit: "g/dL",
        referenceRange: "12.0–17.5",
        referenceMin: 12,
        referenceMax: 17.5,
      },
      {
        id: "p-hcb-2",
        name: "Blood Sugar Fasting",
        unit: "mg/dL",
        referenceRange: "70–100",
        referenceMin: 70,
        referenceMax: 100,
      },
      {
        id: "p-hcb-3",
        name: "Serum Creatinine",
        unit: "mg/dL",
        referenceRange: "0.6–1.2",
        referenceMin: 0.6,
        referenceMax: 1.2,
      },
      {
        id: "p-hcb-4",
        name: "Total Cholesterol",
        unit: "mg/dL",
        referenceRange: "<200",
        referenceMax: 200,
      },
      {
        id: "p-hcb-5",
        name: "SGPT (ALT)",
        unit: "U/L",
        referenceRange: "7–56",
        referenceMin: 7,
        referenceMax: 56,
      },
      {
        id: "p-hcb-6",
        name: "TSH",
        unit: "µIU/mL",
        referenceRange: "0.4–4.0",
        referenceMin: 0.4,
        referenceMax: 4,
      },
      {
        id: "p-hcb-7",
        name: "Urine Routine",
        unit: "",
        referenceRange: "Normal",
      },
    ]),

    makeTest("test-health-adv", "Health Checkup (Advanced)", "Profiles", 3500, [
      { id: "p-hca-1", name: "CBC", unit: "", referenceRange: "Normal" },
      {
        id: "p-hca-2",
        name: "Blood Sugar Fasting",
        unit: "mg/dL",
        referenceRange: "70–100",
        referenceMin: 70,
        referenceMax: 100,
      },
      {
        id: "p-hca-3",
        name: "HbA1c",
        unit: "%",
        referenceRange: "<5.7",
        referenceMax: 5.7,
      },
      {
        id: "p-hca-4",
        name: "Lipid Profile",
        unit: "",
        referenceRange: "Normal",
      },
      {
        id: "p-hca-5",
        name: "Liver Function (SGOT/SGPT/ALP)",
        unit: "U/L",
        referenceRange: "Normal",
      },
      {
        id: "p-hca-6",
        name: "Kidney Function (Urea/Creatinine)",
        unit: "",
        referenceRange: "Normal",
      },
      {
        id: "p-hca-7",
        name: "Thyroid (TSH)",
        unit: "µIU/mL",
        referenceRange: "0.4–4.0",
        referenceMin: 0.4,
        referenceMax: 4,
      },
      {
        id: "p-hca-8",
        name: "Vitamin D",
        unit: "ng/mL",
        referenceRange: ">30",
        referenceMin: 30,
      },
      {
        id: "p-hca-9",
        name: "Vitamin B12",
        unit: "pg/mL",
        referenceRange: "200–900",
        referenceMin: 200,
        referenceMax: 900,
      },
      {
        id: "p-hca-10",
        name: "Urine Routine",
        unit: "",
        referenceRange: "Normal",
      },
    ]),

    makeTest(
      "test-liver-profile",
      "Liver Function Test (Complete)",
      "Profiles",
      1100,
      [
        {
          id: "p-lfp-1",
          name: "Total Bilirubin",
          unit: "mg/dL",
          referenceRange: "0.2–1.2",
          referenceMin: 0.2,
          referenceMax: 1.2,
        },
        {
          id: "p-lfp-2",
          name: "Direct Bilirubin",
          unit: "mg/dL",
          referenceRange: "0.0–0.3",
          referenceMin: 0,
          referenceMax: 0.3,
        },
        {
          id: "p-lfp-3",
          name: "Indirect Bilirubin",
          unit: "mg/dL",
          referenceRange: "0.1–0.9",
          referenceMin: 0.1,
          referenceMax: 0.9,
        },
        {
          id: "p-lfp-4",
          name: "SGOT (AST)",
          unit: "U/L",
          referenceRange: "10–40",
          referenceMin: 10,
          referenceMax: 40,
        },
        {
          id: "p-lfp-5",
          name: "SGPT (ALT)",
          unit: "U/L",
          referenceRange: "7–56",
          referenceMin: 7,
          referenceMax: 56,
        },
        {
          id: "p-lfp-6",
          name: "ALP",
          unit: "U/L",
          referenceRange: "44–147",
          referenceMin: 44,
          referenceMax: 147,
        },
        {
          id: "p-lfp-7",
          name: "GGT",
          unit: "U/L",
          referenceRange: "8–61",
          referenceMin: 8,
          referenceMax: 61,
        },
        {
          id: "p-lfp-8",
          name: "Total Protein",
          unit: "g/dL",
          referenceRange: "6.0–8.3",
          referenceMin: 6,
          referenceMax: 8.3,
        },
        {
          id: "p-lfp-9",
          name: "Albumin",
          unit: "g/dL",
          referenceRange: "3.5–5.0",
          referenceMin: 3.5,
          referenceMax: 5,
        },
        {
          id: "p-lfp-10",
          name: "Globulin",
          unit: "g/dL",
          referenceRange: "2.0–3.5",
          referenceMin: 2,
          referenceMax: 3.5,
        },
        {
          id: "p-lfp-11",
          name: "A/G Ratio",
          unit: "ratio",
          referenceRange: "1.2–2.2",
          referenceMin: 1.2,
          referenceMax: 2.2,
        },
      ],
    ),

    makeTest(
      "test-kidney-profile",
      "Kidney / Renal Function Test (Complete)",
      "Profiles",
      1000,
      [
        {
          id: "p-kfp-1",
          name: "Blood Urea",
          unit: "mg/dL",
          referenceRange: "15–45",
          referenceMin: 15,
          referenceMax: 45,
        },
        {
          id: "p-kfp-2",
          name: "Serum Creatinine",
          unit: "mg/dL",
          referenceRange: "0.6–1.2",
          referenceMin: 0.6,
          referenceMax: 1.2,
        },
        {
          id: "p-kfp-3",
          name: "BUN",
          unit: "mg/dL",
          referenceRange: "7–20",
          referenceMin: 7,
          referenceMax: 20,
        },
        {
          id: "p-kfp-4",
          name: "Uric Acid",
          unit: "mg/dL",
          referenceRange: "3.5–7.2",
          referenceMin: 3.5,
          referenceMax: 7.2,
        },
        {
          id: "p-kfp-5",
          name: "Sodium",
          unit: "mEq/L",
          referenceRange: "136–145",
          referenceMin: 136,
          referenceMax: 145,
        },
        {
          id: "p-kfp-6",
          name: "Potassium",
          unit: "mEq/L",
          referenceRange: "3.5–5.0",
          referenceMin: 3.5,
          referenceMax: 5,
        },
        {
          id: "p-kfp-7",
          name: "Chloride",
          unit: "mEq/L",
          referenceRange: "98–107",
          referenceMin: 98,
          referenceMax: 107,
        },
        {
          id: "p-kfp-8",
          name: "Calcium",
          unit: "mg/dL",
          referenceRange: "8.5–10.5",
          referenceMin: 8.5,
          referenceMax: 10.5,
        },
        {
          id: "p-kfp-9",
          name: "Phosphorus",
          unit: "mg/dL",
          referenceRange: "2.5–4.5",
          referenceMin: 2.5,
          referenceMax: 4.5,
        },
        {
          id: "p-kfp-10",
          name: "eGFR",
          unit: "mL/min/1.73m²",
          referenceRange: ">60",
          referenceMin: 60,
        },
      ],
    ),

    makeTest("test-cardiac-profile", "Cardiac Risk Profile", "Profiles", 2500, [
      {
        id: "p-cp-1",
        name: "Total Cholesterol",
        unit: "mg/dL",
        referenceRange: "<200",
        referenceMax: 200,
      },
      {
        id: "p-cp-2",
        name: "Triglycerides",
        unit: "mg/dL",
        referenceRange: "<150",
        referenceMax: 150,
      },
      {
        id: "p-cp-3",
        name: "HDL",
        unit: "mg/dL",
        referenceRange: ">40",
        referenceMin: 40,
      },
      {
        id: "p-cp-4",
        name: "LDL",
        unit: "mg/dL",
        referenceRange: "<100",
        referenceMax: 100,
      },
      {
        id: "p-cp-5",
        name: "VLDL",
        unit: "mg/dL",
        referenceRange: "5–40",
        referenceMin: 5,
        referenceMax: 40,
      },
      {
        id: "p-cp-6",
        name: "hs-CRP",
        unit: "mg/L",
        referenceRange: "<3",
        referenceMax: 3,
      },
      {
        id: "p-cp-7",
        name: "Homocysteine",
        unit: "µmol/L",
        referenceRange: "5–15",
        referenceMin: 5,
        referenceMax: 15,
      },
      {
        id: "p-cp-8",
        name: "Lipoprotein (a)",
        unit: "mg/dL",
        referenceRange: "<30",
        referenceMax: 30,
      },
    ]),
  ];
}
