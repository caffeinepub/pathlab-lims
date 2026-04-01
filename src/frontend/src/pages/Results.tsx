import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FlaskConical,
  Loader2,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { formatDate } from "../lib/limsUtils";
import type { Booking, Patient, TestParameter } from "../lib/types";
import { useLimsStore } from "../store/useLimsStore";

// ─── Result Type Engine ──────────────────────────────────────────────────────

type ResultType =
  | "quantitative"
  | "qualitative"
  | "titre"
  | "descriptive"
  | "text";

type FlagVariant =
  | "normal"
  | "high"
  | "low"
  | "critical"
  | "positive"
  | "negative"
  | "abnormal"
  | "pending"
  | "none";

type FlagLabel =
  | "Normal"
  | "High"
  | "Low"
  | "Critical"
  | "Positive"
  | "Negative"
  | "Reactive"
  | "Non-Reactive"
  | "Abnormal"
  | "Pending"
  | "";

interface FlagResult {
  label: FlagLabel;
  variant: FlagVariant;
  isAbnormal: boolean;
}

const QUALITATIVE_OPTIONS_MAP: Record<string, string[]> = {
  "hiv 1&2": ["Non-Reactive", "Reactive"],
  hbsag: ["Non-Reactive", "Reactive"],
  "anti-hcv": ["Non-Reactive", "Reactive"],
  "dengue ns1": ["Positive", "Negative"],
  "dengue igg": ["Positive", "Negative"],
  "dengue igm": ["Positive", "Negative"],
  "malaria antigen": ["Positive", "Negative"],
  "malaria antibody": ["Positive", "Negative"],
  vdrl: ["Reactive", "Non-Reactive"],
  ana: ["Negative", "Positive", "Borderline"],
  "ana screen": ["Negative", "Positive", "Borderline"],
  "weil felix": ["Positive", "Negative"],
  typhidot: ["Positive", "Negative"],
  "leptospira igm": ["Positive", "Negative"],
  "scrub typhus igm": ["Positive", "Negative"],
  "covid antigen": ["Positive", "Negative"],
  "covid igg": ["Positive", "Negative"],
  "covid igm": ["Positive", "Negative"],
  hbeag: ["Reactive", "Non-Reactive"],
  "hbcab total": ["Reactive", "Non-Reactive"],
  "hav igm": ["Reactive", "Non-Reactive"],
  "hev igm": ["Reactive", "Non-Reactive"],
  "rubella igg": ["Positive", "Negative"],
  "rubella igm": ["Positive", "Negative"],
  "toxoplasma igg": ["Positive", "Negative"],
  "toxoplasma igm": ["Positive", "Negative"],
  "cmv igg": ["Positive", "Negative"],
  "cmv igm": ["Positive", "Negative"],
  "hsv1 igg": ["Positive", "Negative"],
  "hsv1 igm": ["Positive", "Negative"],
  "hsv2 igg": ["Positive", "Negative"],
  "hsv2 igm": ["Positive", "Negative"],
  "chikungunya igm": ["Positive", "Negative"],
  "je igm": ["Positive", "Negative"],
  "tb gold": ["Positive", "Negative", "Indeterminate"],
  "h. pylori igg": ["Positive", "Negative"],
  "h. pylori igm": ["Positive", "Negative"],
  anca: ["Positive", "Negative"],
  "ena profile": ["Positive", "Negative"],
  ama: ["Positive", "Negative"],
  asma: ["Positive", "Negative"],
  "hla-b27": ["Positive", "Negative"],
  "sickling test": ["Positive", "Negative"],
  "direct coombs test": ["Positive", "Negative"],
  "indirect coombs test": ["Positive", "Negative"],
  "urine pregnancy test": ["Positive", "Negative"],
  "pregnancy test": ["Positive", "Negative"],
  "occult blood": ["Negative", "Positive"],
  "abo group": ["A", "B", "AB", "O"],
  "rh type": ["Positive", "Negative"],
  "malarial parasite smear": ["Positive", "Negative"],
  "fnac report": [
    "Benign",
    "Suspicious",
    "Malignant",
    "Inflammatory",
    "Inadequate",
  ],
  "biopsy report": ["Benign", "Malignant", "Inflammatory", "Other"],
  growth: ["No Growth", "Growth Present", "Significant Growth", "Mixed Growth"],
  "blood culture": ["No Growth", "Growth Present"],
  "urine culture": ["No Growth", "Growth Present"],
  "pus culture": ["No Growth", "Growth Present"],
  "stool culture": ["No Growth", "Pathogen Isolated"],
  "ra panel": ["Positive", "Negative"],
  "ns1 antigen": ["Positive", "Negative"],
  "igm antibody": ["Positive", "Negative"],
  "igg antibody": ["Positive", "Negative"],
  "if titre": ["Negative", "Positive"],
};

const TITRE_OPTIONS = [
  "Negative",
  "Positive",
  "<1:40",
  "1:40",
  "1:80",
  "1:160",
  "1:320",
  "1:640",
];

const DESCRIPTIVE_SNIPPETS: Record<string, string[]> = {
  urine: [
    "Pus cells: 2-4/HPF, RBC: Nil, Epithelial cells: 1-2/HPF",
    "Pus cells: 8-10/HPF, RBC: 2-4/HPF, Epithelial cells: 2-4/HPF",
    "Pus cells: Nil, RBC: Nil, Epithelial cells: Few",
  ],
  stool: [
    "No ova/cyst/parasite seen",
    "Giardia cysts seen",
    "Entamoeba histolytica cysts seen",
  ],
  smear: [
    "Normocytic normochromic picture",
    "Microcytic hypochromic picture suggestive of iron deficiency anaemia",
    "Macrocytic picture suggestive of megaloblastic anaemia",
    "Target cells and sickle cells seen",
  ],
  general: [
    "No significant abnormality detected",
    "Within normal limits",
    "Further clinical correlation advised",
  ],
};

function getQualitativeOptions(param: TestParameter): string[] {
  return (
    param.qualitativeValues ??
    QUALITATIVE_OPTIONS_MAP[param.name.toLowerCase()] ??
    []
  );
}

function inferResultType(param: TestParameter): ResultType {
  const opts = getQualitativeOptions(param);
  if (opts.length > 0) return "qualitative";
  if (
    param.unit === "titre" ||
    /widal|titre|aso titre|if titre/i.test(param.name)
  )
    return "titre";
  if (param.referenceMin !== undefined || param.referenceMax !== undefined)
    return "quantitative";
  if (
    /smear|microscopy|cytology|histopath|fnac|biopsy|pap|culture|sensitivity|organism|finding|appearance|color|colour|consistency|morphology|comment/i.test(
      param.name,
    )
  )
    return "descriptive";
  return "text";
}

function computeFlag(
  value: string,
  param: TestParameter,
  resultType: ResultType,
): FlagResult {
  if (!value.trim()) {
    return { label: "Pending", variant: "pending", isAbnormal: false };
  }
  if (resultType === "quantitative") {
    const num = Number.parseFloat(value);
    if (Number.isNaN(num)) {
      return { label: "", variant: "none", isAbnormal: false };
    }
    const { referenceMin: min, referenceMax: max } = param;
    if (max !== undefined && num > max * 2) {
      return { label: "Critical", variant: "critical", isAbnormal: true };
    }
    if (min !== undefined && num < min * 0.5 && min > 0) {
      return { label: "Critical", variant: "critical", isAbnormal: true };
    }
    if (max !== undefined && num > max) {
      return { label: "High", variant: "high", isAbnormal: true };
    }
    if (min !== undefined && num < min) {
      return { label: "Low", variant: "low", isAbnormal: true };
    }
    return { label: "Normal", variant: "normal", isAbnormal: false };
  }
  if (resultType === "qualitative") {
    const v = value.toLowerCase();
    if (v === "positive" || v === "reactive") {
      return { label: "Positive", variant: "positive", isAbnormal: true };
    }
    if (v === "negative" || v === "non-reactive" || v === "no growth") {
      return { label: "Negative", variant: "negative", isAbnormal: false };
    }
    if (v === "borderline" || v === "equivocal" || v === "indeterminate") {
      return { label: "Abnormal", variant: "abnormal", isAbnormal: true };
    }
    return { label: "Normal", variant: "normal", isAbnormal: false };
  }
  if (resultType === "titre") {
    if (value === "Negative") {
      return { label: "Negative", variant: "negative", isAbnormal: false };
    }
    if (value.startsWith("1:") || value === "Positive" || value === "<1:40") {
      return { label: "Positive", variant: "positive", isAbnormal: true };
    }
    return { label: "Normal", variant: "normal", isAbnormal: false };
  }
  return { label: "", variant: "none", isAbnormal: false };
}

// ─── Flag Badge ──────────────────────────────────────────────────────────────

function FlagBadge({ flag }: { flag: FlagResult }) {
  if (flag.variant === "none" || !flag.label) return null;
  const styles: Record<FlagVariant, string> = {
    normal: "bg-green-50 text-green-700 border-green-200",
    high: "bg-red-50 text-red-700 border-red-200 font-bold",
    low: "bg-blue-50 text-blue-700 border-blue-200 font-bold",
    critical: "bg-red-100 text-red-800 border-red-400 font-bold animate-pulse",
    positive: "bg-amber-50 text-amber-700 border-amber-200",
    negative: "bg-green-50 text-green-700 border-green-200",
    abnormal: "bg-orange-50 text-orange-700 border-orange-200",
    pending: "bg-gray-50 text-gray-400 border-gray-200",
    none: "hidden",
  };
  const display: Record<FlagVariant, string> = {
    high: "▲ High",
    low: "▼ Low",
    critical: "!! Critical",
    normal: "✓ Normal",
    positive: "Positive",
    negative: "Negative",
    abnormal: "Abnormal",
    pending: "Pending",
    none: "",
  };
  return (
    <span
      className={cn(
        "text-xs px-2 py-0.5 rounded-full border whitespace-nowrap",
        styles[flag.variant],
      )}
    >
      {display[flag.variant]}
    </span>
  );
}

// ─── Test Completion Status ──────────────────────────────────────────────────

type TestStatus = "not-started" | "in-progress" | "completed";

function getTestStatus(
  testId: string,
  parameters: TestParameter[],
  values: Record<string, string>,
): TestStatus {
  const relevant = parameters.filter(
    (p) =>
      p.referenceMin !== undefined ||
      p.referenceMax !== undefined ||
      getQualitativeOptions(p).length > 0,
  );
  if (relevant.length === 0) {
    const filled = parameters.filter((p) => {
      const key = `${testId}__${p.id}`;
      return (values[key] ?? "").trim() !== "";
    });
    if (filled.length === 0) return "not-started";
    if (filled.length < parameters.length) return "in-progress";
    return "completed";
  }
  const filled = relevant.filter((p) => {
    const key = `${testId}__${p.id}`;
    return (values[key] ?? "").trim() !== "";
  });
  if (filled.length === 0) return "not-started";
  if (filled.length < relevant.length) return "in-progress";
  return "completed";
}

function TestStatusBadge({ status }: { status: TestStatus }) {
  if (status === "completed")
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
        ✓ Completed
      </span>
    );
  if (status === "in-progress")
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
        ◑ In Progress
      </span>
    );
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 font-medium">
      ○ Not Started
    </span>
  );
}

// ─── Descriptive Snippets ────────────────────────────────────────────────────

function getSnippets(paramName: string): string[] {
  const lower = paramName.toLowerCase();
  if (lower.includes("urine") || lower.includes("microscopy"))
    return DESCRIPTIVE_SNIPPETS.urine;
  if (lower.includes("stool") || lower.includes("faec"))
    return DESCRIPTIVE_SNIPPETS.stool;
  if (lower.includes("smear") || lower.includes("peripheral"))
    return DESCRIPTIVE_SNIPPETS.smear;
  return DESCRIPTIVE_SNIPPETS.general;
}

// ─── Booking Selector ────────────────────────────────────────────────────────

function BookingSelector({
  bookings,
  patients,
  onSelect,
}: {
  bookings: Booking[];
  patients: Patient[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Select a Booking to Enter Results
        </h2>
        <p className="text-sm text-gray-500">
          Showing samples ready for result entry (Collected / In Progress)
        </p>
      </div>
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <FlaskConical className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">
            No collected samples available
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Mark samples as collected in the Samples module first.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => {
            const patient = patients.find((p) => p.id === b.patientId);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelect(b.id)}
                data-ocid="results.booking.item"
                className="w-full text-left bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-blue-400 hover:bg-blue-50/40 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {patient?.name ?? "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {patient?.age}y • {patient?.gender}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono text-xs text-blue-600">
                        {b.bookingId}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(b.createdAt)}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full border font-medium",
                        b.status === "collected"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-blue-50 text-blue-700 border-blue-200",
                      )}
                    >
                      {b.status === "collected" ? "Collected" : "In Progress"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Results() {
  const { patients, tests, bookings, results, updateBooking, upsertResult } =
    useLimsStore();
  const navigate = useNavigate();
  const search = useSearch({ from: "/results" });
  const searchBookingId = (search as { bookingId?: string }).bookingId;

  // State
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    searchBookingId ?? "",
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [testRemarks, setTestRemarks] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [remarkOpen, setRemarkOpen] = useState<Set<string>>(new Set());
  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>(
    {},
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const booking = bookings.find((b) => b.id === selectedBookingId) ?? null;
  const patient = booking
    ? (patients.find((p) => p.id === booking.patientId) ?? null)
    : null;

  const collectableBookings = bookings.filter(
    (b) => b.status === "collected" || b.status === "processing",
  );

  // Load existing results when booking changes
  useEffect(() => {
    if (!selectedBookingId) return;
    const existing: Record<string, string> = {};
    for (const r of results.filter((r) => r.bookingId === selectedBookingId)) {
      existing[`${r.testId}__${r.parameterId}`] = r.value;
    }
    setValues(existing);
    setSavedSnapshot(existing);
    setLastSaved(null);
  }, [selectedBookingId, results]);

  // Auto-select booking from search param
  useEffect(() => {
    if (searchBookingId) {
      setSelectedBookingId(searchBookingId);
    }
  }, [searchBookingId]);

  const isDirty = JSON.stringify(values) !== JSON.stringify(savedSnapshot);

  // Stats
  const stats = useMemo(() => {
    if (!booking) return null;
    const bookingTests = booking.tests
      .map((id) => tests.find((t) => t.id === id))
      .filter(Boolean) as (typeof tests)[0][];
    let completedCount = 0;
    let abnormalCount = 0;
    for (const t of bookingTests) {
      const status = getTestStatus(t.id, t.parameters, values);
      if (status === "completed") completedCount++;
      for (const p of t.parameters) {
        const key = `${t.id}__${p.id}`;
        const val = values[key] ?? "";
        const rt = inferResultType(p);
        const flag = computeFlag(val, p, rt);
        if (flag.isAbnormal) abnormalCount++;
      }
    }
    return {
      total: bookingTests.length,
      completed: completedCount,
      pending: bookingTests.length - completedCount,
      abnormal: abnormalCount,
    };
  }, [booking, tests, values]);

  // Save Draft
  async function saveDraft() {
    if (!booking) return;
    setSaving(true);
    try {
      for (const testId of booking.tests) {
        const test = tests.find((t) => t.id === testId);
        if (!test) continue;
        for (const param of test.parameters) {
          const key = `${testId}__${param.id}`;
          const value = values[key] ?? "";
          if (!value) continue;
          const rt = inferResultType(param);
          const flag = computeFlag(value, param, rt);
          await upsertResult({
            bookingId: booking.id,
            testId,
            parameterId: param.id,
            value,
            unit: param.unit,
            referenceRange: param.referenceRange,
            isAbnormal: flag.isAbnormal,
          });
        }
      }
      setSavedSnapshot({ ...values });
      setLastSaved(new Date());
      toast.success("Draft saved successfully");
    } catch {
      toast.error("Failed to save draft");
    } finally {
      setSaving(false);
    }
  }

  // Submit for Approval
  async function submitForApproval() {
    if (!booking) return;
    const hasValues = Object.values(values).some((v) => v.trim() !== "");
    if (!hasValues) {
      toast.error("Please enter at least one result before submitting");
      return;
    }
    setSaving(true);
    try {
      // Save all results first
      for (const testId of booking.tests) {
        const test = tests.find((t) => t.id === testId);
        if (!test) continue;
        for (const param of test.parameters) {
          const key = `${testId}__${param.id}`;
          const value = values[key] ?? "";
          if (!value) continue;
          const rt = inferResultType(param);
          const flag = computeFlag(value, param, rt);
          await upsertResult({
            bookingId: booking.id,
            testId,
            parameterId: param.id,
            value,
            unit: param.unit,
            referenceRange: param.referenceRange,
            isAbnormal: flag.isAbnormal,
          });
        }
      }
      await updateBooking(booking.id, { status: "processing" });
      setSavedSnapshot({ ...values });
      setLastSaved(new Date());
      toast.success("Results submitted for approval");
      navigate({ to: "/approval" });
    } catch {
      toast.error("Failed to submit results");
    } finally {
      setSaving(false);
      setShowSubmitConfirm(false);
    }
  }

  // Mark test normal
  function markTestNormal(testId: string) {
    const test = tests.find((t) => t.id === testId);
    if (!test) return;
    const newVals = { ...values };
    for (const param of test.parameters) {
      const key = `${testId}__${param.id}`;
      const rt = inferResultType(param);
      if (rt === "quantitative") {
        const { referenceMin: min, referenceMax: max } = param;
        if (min !== undefined && max !== undefined) {
          newVals[key] = String(((min + max) / 2).toFixed(2));
        }
      } else if (rt === "qualitative") {
        const opts = getQualitativeOptions(param);
        const normalOpt = opts.find((o) =>
          /negative|normal|non-reactive|no growth/i.test(o),
        );
        if (normalOpt) newVals[key] = normalOpt;
      }
    }
    setValues(newVals);
    toast.success(`${test.name} values set to normal range`);
  }

  // Reset unsaved changes
  function resetChanges() {
    setValues({ ...savedSnapshot });
    toast.success("Changes reset to last saved state");
  }

  // Keyboard navigation
  const handleKeyNav = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
      const inputs = Array.from(
        document.querySelectorAll<HTMLElement>("[data-param-input]"),
      );
      const idx = inputs.indexOf(e.currentTarget as HTMLElement);
      if (idx >= 0 && idx < inputs.length - 1) {
        e.preventDefault();
        inputs[idx + 1].focus();
      }
    }
  };

  // Format last saved time
  function formatLastSaved(d: Date | null): string {
    if (!d) return "";
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return formatDate(d.toISOString());
  }

  const toggleCollapse = (testId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(testId)) next.delete(testId);
      else next.add(testId);
      return next;
    });
  };

  const toggleRemark = (key: string) => {
    setRemarkOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () => {
    if (!booking) return;
    setCollapsed(new Set(booking.tests));
  };

  // ─── Booking selector view ───────────────────────────────────────────────
  if (!booking) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Result Entry</h1>
          <p className="text-sm text-gray-500">
            Enter test results for collected samples
          </p>
        </div>
        <BookingSelector
          bookings={collectableBookings}
          patients={patients}
          onSelect={setSelectedBookingId}
        />
      </div>
    );
  }

  const bookingTests = booking.tests
    .map((id) => tests.find((t) => t.id === id))
    .filter(Boolean) as (typeof tests)[0][];

  const completionPct = stats
    ? stats.total === 0
      ? 0
      : Math.round((stats.completed / stats.total) * 100)
    : 0;

  // ─── Main result entry view ──────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="pb-24 space-y-4">
        {/* ── Patient / Booking Header ── */}
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <div className="bg-slate-800 text-white px-6 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    {patient?.name ?? "Unknown Patient"}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full font-medium border",
                      booking.status === "collected"
                        ? "bg-purple-500/20 text-purple-200 border-purple-400/30"
                        : "bg-blue-500/20 text-blue-200 border-blue-400/30",
                    )}
                  >
                    {booking.status === "collected"
                      ? "Ready for Entry"
                      : "In Progress"}
                  </span>
                </div>
                <div className="flex gap-3 mt-1 text-sm text-slate-300">
                  <span>
                    {patient?.age}y • {patient?.gender}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span>ID: {patient?.id?.slice(0, 8) ?? "—"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Booking ID</div>
                  <div className="font-mono text-blue-300">
                    {booking.bookingId}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Sample ID</div>
                  <div className="font-mono text-green-300">
                    {booking.sampleId || "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Collection</div>
                  <div className="text-white text-xs">
                    {booking.collectedAt
                      ? formatDate(booking.collectedAt)
                      : formatDate(booking.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="bg-white px-6 py-3 border-t border-gray-100 flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-1.5 text-sm">
              <FlaskConical className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-medium text-gray-700">
                {stats?.total ?? 0}
              </span>
              <span className="text-gray-400">Tests</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="font-medium text-gray-700">
                {stats?.completed ?? 0}
              </span>
              <span className="text-gray-400">Completed</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-medium text-gray-700">
                {stats?.pending ?? 0}
              </span>
              <span className="text-gray-400">Pending</span>
            </div>
            {(stats?.abnormal ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="font-medium text-red-700">
                  {stats?.abnormal}
                </span>
                <span className="text-gray-400">Abnormal</span>
              </div>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-32">
                <Progress value={completionPct} className="h-1.5" />
              </div>
              <span className="text-xs text-gray-500">{completionPct}%</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7 px-2"
                onClick={expandAll}
              >
                <ChevronDown className="w-3 h-3 mr-1" />
                Expand All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7 px-2"
                onClick={collapseAll}
              >
                <ChevronUp className="w-3 h-3 mr-1" />
                Collapse
              </Button>
            </div>
          </div>
        </div>

        {/* ── Test Cards ── */}
        {bookingTests.map((test) => {
          const isCollapsed = collapsed.has(test.id);
          const testStatus = getTestStatus(test.id, test.parameters, values);
          const abnormalCount = test.parameters.filter((p) => {
            const flag = computeFlag(
              values[`${test.id}__${p.id}`] ?? "",
              p,
              inferResultType(p),
            );
            return flag.isAbnormal;
          }).length;

          return (
            <div
              key={test.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              data-ocid="results.test.card"
            >
              {/* Test Header */}
              <button
                type="button"
                onClick={() => toggleCollapse(test.id)}
                className="w-full text-left px-5 py-3.5 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-gray-900">
                      {test.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {test.category}
                    </Badge>
                    {abnormalCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-medium">
                        {abnormalCount} Abnormal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <TestStatusBadge status={testStatus} />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            markTestNormal(test.id);
                          }}
                          data-ocid="results.mark_normal.button"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Normal
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Set all quantitative values to midpoint of reference
                          range
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Parameters Table */}
              {!isCollapsed && (
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-50/60">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 w-44">
                          Parameter
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 min-w-[180px]">
                          Result
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 w-20">
                          Unit
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 w-36">
                          Reference Range
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 w-28">
                          Flag
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {test.parameters.map((param, paramIdx) => {
                        const key = `${test.id}__${param.id}`;
                        const val = values[key] ?? "";
                        const rt = inferResultType(param);
                        const flag = computeFlag(val, param, rt);
                        const isRemarkOpen = remarkOpen.has(key);

                        return (
                          <>
                            <tr
                              key={param.id}
                              className={cn(
                                "border-t border-gray-50 transition-colors",
                                paramIdx % 2 === 1
                                  ? "bg-gray-50/40"
                                  : "bg-white",
                                flag.isAbnormal ? "bg-red-50/30" : "",
                              )}
                            >
                              {/* Parameter Name */}
                              <td className="px-4 py-2">
                                <span className="text-sm font-medium text-gray-800">
                                  {param.name}
                                </span>
                              </td>

                              {/* Input Control */}
                              <td className="px-4 py-2">
                                {rt === "quantitative" && (
                                  <Input
                                    type="number"
                                    step="any"
                                    value={val}
                                    onChange={(e) =>
                                      setValues((v) => ({
                                        ...v,
                                        [key]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={handleKeyNav}
                                    data-param-input
                                    data-ocid="results.input"
                                    placeholder="Enter value"
                                    className={cn(
                                      "h-8 w-32 text-sm",
                                      flag.isAbnormal && val
                                        ? "border-red-400 bg-red-50 text-red-700 font-semibold"
                                        : "",
                                    )}
                                  />
                                )}

                                {rt === "qualitative" && (
                                  <div
                                    className="flex flex-wrap gap-1"
                                    data-ocid="results.qualitative.input"
                                  >
                                    {getQualitativeOptions(param).map((opt) => (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() =>
                                          setValues((v) => ({
                                            ...v,
                                            [key]: opt,
                                          }))
                                        }
                                        className={cn(
                                          "px-2.5 py-1 text-xs rounded-full border font-medium transition-colors",
                                          val === opt
                                            ? opt === "Positive" ||
                                              opt === "Reactive"
                                              ? "bg-amber-500 text-white border-amber-500"
                                              : opt === "Negative" ||
                                                  opt === "Non-Reactive"
                                                ? "bg-green-600 text-white border-green-600"
                                                : "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-400",
                                        )}
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {rt === "titre" && (
                                  <Select
                                    value={val || ""}
                                    onValueChange={(v) =>
                                      setValues((prev) => ({
                                        ...prev,
                                        [key]: v,
                                      }))
                                    }
                                  >
                                    <SelectTrigger
                                      className="h-8 w-36 text-sm"
                                      data-ocid="results.titre.select"
                                    >
                                      <SelectValue placeholder="Select titre" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TITRE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {rt === "descriptive" && (
                                  <div className="space-y-1.5">
                                    <Textarea
                                      rows={2}
                                      value={val}
                                      onChange={(e) =>
                                        setValues((v) => ({
                                          ...v,
                                          [key]: e.target.value,
                                        }))
                                      }
                                      onKeyDown={handleKeyNav}
                                      data-param-input
                                      data-ocid="results.descriptive.input"
                                      placeholder="Enter descriptive result..."
                                      className="text-sm min-w-[240px] resize-none"
                                    />
                                    <div className="flex flex-wrap gap-1">
                                      {getSnippets(param.name).map((s) => (
                                        <button
                                          key={s}
                                          type="button"
                                          onClick={() =>
                                            setValues((v) => ({
                                              ...v,
                                              [key]: s,
                                            }))
                                          }
                                          className="text-xs px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                                        >
                                          {s.length > 28
                                            ? `${s.slice(0, 28)}…`
                                            : s}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {rt === "text" && (
                                  <Input
                                    value={val}
                                    onChange={(e) =>
                                      setValues((v) => ({
                                        ...v,
                                        [key]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={handleKeyNav}
                                    data-param-input
                                    data-ocid="results.text.input"
                                    placeholder="Enter result"
                                    className="h-8 w-40 text-sm"
                                  />
                                )}
                              </td>

                              {/* Unit */}
                              <td className="px-4 py-2 text-xs text-gray-500">
                                {param.unit || "—"}
                              </td>

                              {/* Reference Range */}
                              <td className="px-4 py-2 text-xs text-gray-500">
                                {param.referenceRange ||
                                  (param.referenceMin !== undefined &&
                                  param.referenceMax !== undefined
                                    ? `${param.referenceMin} – ${param.referenceMax}`
                                    : "—")}
                              </td>

                              {/* Flag */}
                              <td className="px-4 py-2">
                                <FlagBadge flag={flag} />
                              </td>

                              {/* Remarks toggle */}
                              <td className="px-2 py-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => toggleRemark(key)}
                                      className={cn(
                                        "w-6 h-6 rounded flex items-center justify-center transition-colors",
                                        isRemarkOpen
                                          ? "text-blue-600 bg-blue-50"
                                          : "text-gray-300 hover:text-gray-500 hover:bg-gray-100",
                                      )}
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Add remark</p>
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                            </tr>

                            {/* Inline remark row */}
                            {isRemarkOpen && (
                              <tr
                                key={`${param.id}-remark`}
                                className="border-t border-blue-50 bg-blue-50/20"
                              >
                                <td colSpan={6} className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-blue-600 font-medium w-20 flex-shrink-0">
                                      Remark:
                                    </span>
                                    <Input
                                      value={remarks[key] ?? ""}
                                      onChange={(e) =>
                                        setRemarks((r) => ({
                                          ...r,
                                          [key]: e.target.value,
                                        }))
                                      }
                                      placeholder="Add remark for this parameter..."
                                      className="h-7 text-xs border-blue-200"
                                      data-ocid="results.remark.input"
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Test-level remarks */}
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label
                          htmlFor={`test-remark-${test.id}`}
                          className="text-xs font-medium text-gray-500 block mb-1"
                        >
                          Test Remarks / Interpretation
                        </label>
                        <Textarea
                          rows={1}
                          value={testRemarks[test.id] ?? ""}
                          onChange={(e) =>
                            setTestRemarks((r) => ({
                              ...r,
                              [test.id]: e.target.value,
                            }))
                          }
                          placeholder="Optional interpretation or test-level remark..."
                          className="text-xs resize-none border-gray-200"
                          id={`test-remark-${test.id}`}
                          data-ocid="results.test_remark.textarea"
                        />
                      </div>
                      {lastSaved && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-5">
                          <Save className="w-3 h-3" />
                          Last saved {formatLastSaved(lastSaved)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Submit Confirmation Dialog ── */}
        <AlertDialog
          open={showSubmitConfirm}
          onOpenChange={setShowSubmitConfirm}
        >
          <AlertDialogContent data-ocid="results.submit.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Results for Approval?</AlertDialogTitle>
              <AlertDialogDescription>
                This will submit all entered results for{" "}
                <strong>{patient?.name}</strong> (Booking: {booking.bookingId})
                to the approval queue. The booking status will change to{" "}
                <strong>Processing</strong>.
                {stats && stats.pending > 0 && (
                  <span className="block mt-2 text-amber-600 font-medium">
                    ⚠ {stats.pending} test{stats.pending !== 1 ? "s" : ""} still
                    pending. You can still submit with partial results.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="results.submit.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={submitForApproval}
                data-ocid="results.submit.confirm_button"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit for Approval
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Sticky Footer ── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBookingId("")}
              data-ocid="results.back.button"
              className="text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Separator orientation="vertical" className="h-5" />

            <Button
              variant="ghost"
              size="sm"
              onClick={resetChanges}
              disabled={!isDirty}
              data-ocid="results.reset.button"
              className="text-gray-500"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>

            {isDirty && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Unsaved changes
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveDraft}
                disabled={saving || !isDirty}
                data-ocid="results.save_draft.button"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1.5" />
                )}
                Save Draft
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  const hasValues = Object.values(values).some(
                    (v) => v.trim() !== "",
                  );
                  if (!hasValues) {
                    toast.error(
                      "Please enter at least one result before submitting",
                    );
                    return;
                  }
                  setShowSubmitConfirm(true);
                }}
                disabled={saving}
                data-ocid="results.submit_approval.button"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-1.5" />
                Submit for Approval
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
