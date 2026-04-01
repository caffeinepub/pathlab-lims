import {
  CalendarDays,
  Edit,
  Eye,
  Loader2,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCircle,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { Skeleton } from "../components/ui/skeleton";
import type { Patient } from "../lib/types";
import { useLimsStore } from "../store/useLimsStore";

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalize(v: unknown): string {
  return (v ?? "").toString().toLowerCase().trim();
}

function stripPhone(v: string): string {
  return v.replace(/[\s\-().+]/g, "");
}

// ─── Types ───────────────────────────────────────────────────────────────────

type PatientForm = {
  name: string;
  age: string;
  gender: string;
  phone: string;
  address: string;
};

type FormErrors = Partial<Record<keyof PatientForm, string>>;

const EMPTY_FORM: PatientForm = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  address: "",
};

// ─── Validation ──────────────────────────────────────────────────────────────

function validateForm(form: PatientForm): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Full name is required";
  }

  if (!form.phone.trim()) {
    errors.phone = "Mobile number is required";
  } else {
    const digits = stripPhone(form.phone);
    if (!/^\d{10}$/.test(digits)) {
      errors.phone = "Enter a valid 10-digit mobile number";
    }
  }

  if (form.age !== "") {
    const n = Number(form.age);
    if (!Number.isInteger(n) || n < 1 || n > 120) {
      errors.age = "Age must be a whole number between 1 and 120";
    }
  }

  if (!form.gender) {
    errors.gender = "Gender is required";
  }

  return errors;
}

// ─── Skeleton rows ───────────────────────────────────────────────────────────

const SKELETON_ROWS = ["sk1", "sk2", "sk3", "sk4", "sk5"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"];

function TableSkeletonRows() {
  return (
    <>
      {SKELETON_ROWS.map((row) => (
        <tr key={row} className="border-t border-gray-100">
          {SKELETON_COLS.map((col) => (
            <td key={col} className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Patients() {
  const {
    patients,
    bookings,
    addPatient,
    updatePatient,
    deletePatient,
    initialized,
  } = useLimsStore();

  // ── UI state ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // Add/Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState<PatientForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Detail sheet
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return patients;
    return patients.filter(
      (p) =>
        normalize(p.name).includes(q) ||
        normalize(p.phone).includes(q) ||
        normalize(p.id).includes(q),
    );
  }, [patients, search]);

  // Detail patient always reflects latest store data (reactive)
  const liveDetailPatient = useMemo(
    () =>
      detailPatient
        ? (patients.find((p) => p.id === detailPatient.id) ?? null)
        : null,
    [patients, detailPatient],
  );

  const bookingCountFor = (patientId: string) =>
    bookings.filter((b) => b.patientId === patientId).length;

  // ── Handlers ────────────────────────────────────────────────────────────────

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(p: Patient) {
    setEditing(p);
    setForm({
      name: p.name,
      age: p.age ? String(p.age) : "",
      gender: p.gender || "Male",
      phone: p.phone,
      address: p.address,
    });
    setErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setErrors({});
  }

  function setField<K extends keyof PatientForm>(
    key: K,
    value: PatientForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear individual error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSave() {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        age: form.age !== "" ? Number(form.age) : 0,
        gender: form.gender,
        phone: stripPhone(form.phone),
        address: form.address.trim(),
      };

      if (editing) {
        await updatePatient(editing.id, payload);
        toast.success(`${payload.name} updated successfully`);
      } else {
        await addPatient(payload);
        toast.success(`${payload.name} added successfully`);
      }
      setModalOpen(false);
    } catch {
      toast.error("Failed to save patient. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePatient(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted`);
      // Close detail sheet if this patient was open
      if (liveDetailPatient?.id === deleteTarget.id) setDetailPatient(null);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete patient");
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {initialized ? (
              <>
                <span className="font-medium text-gray-700">
                  {patients.length}
                </span>{" "}
                {patients.length === 1 ? "patient" : "patients"} registered
              </>
            ) : (
              "Loading..."
            )}
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700"
          data-ocid="patients.primary_button"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Patient
        </Button>
      </div>

      {/* Search toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg max-w-sm shadow-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, phone, or patient ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
          data-ocid="patients.search_input"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-gray-300 hover:text-gray-500 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1">
        {!initialized ? (
          <table className="w-full">
            <thead>
              <TableHead />
            </thead>
            <tbody>
              <TableSkeletonRows />
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "No patients found" : "No patients yet"}
            description={
              search
                ? "Try a different name, phone, or patient ID"
                : "Add your first patient to get started"
            }
            action={
              !search ? { label: "Add Patient", onClick: openAdd } : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-ocid="patients.table">
              <thead className="sticky top-0 z-10">
                <TableHead />
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-t border-gray-100 hover:bg-blue-50/40 transition-colors"
                    data-ocid={`patients.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">
                      {p.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.age || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          p.gender === "Male"
                            ? "border-blue-200 text-blue-700 bg-blue-50"
                            : p.gender === "Female"
                              ? "border-pink-200 text-pink-700 bg-pink-50"
                              : "border-purple-200 text-purple-700 bg-purple-50"
                        }
                      >
                        {p.gender}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">
                      {p.address || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="View patient"
                          onClick={() => setDetailPatient(p)}
                          className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          data-ocid={`patients.item.${i + 1}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Edit patient"
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          data-ocid={`patients.edit_button.${i + 1}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete patient"
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          data-ocid={`patients.delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent className="max-w-lg" data-ocid="patients.modal">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Patient" : "Add New Patient"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-2">
            {/* Name */}
            <div className="col-span-2 space-y-1">
              <Label htmlFor="pt-name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pt-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Rajan Mehta"
                className={errors.name ? "border-red-400" : ""}
                data-ocid="patients.input"
              />
              {errors.name && (
                <p
                  className="text-xs text-red-500"
                  data-ocid="patients.error_state"
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-1">
              <Label htmlFor="pt-age">Age</Label>
              <Input
                id="pt-age"
                type="number"
                min={1}
                max={120}
                value={form.age}
                onChange={(e) => setField("age", e.target.value)}
                placeholder="e.g. 35"
                className={errors.age ? "border-red-400" : ""}
              />
              {errors.age && (
                <p className="text-xs text-red-500">{errors.age}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <Label>
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setField("gender", v)}
              >
                <SelectTrigger
                  className={errors.gender ? "border-red-400" : ""}
                  data-ocid="patients.select"
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-red-500">{errors.gender}</p>
              )}
            </div>

            {/* Phone */}
            <div className="col-span-2 space-y-1">
              <Label htmlFor="pt-phone">
                Mobile Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pt-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="10-digit mobile number"
                className={errors.phone ? "border-red-400" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="col-span-2 space-y-1">
              <Label htmlFor="pt-address">Address</Label>
              <Input
                id="pt-address"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Street, area, city (optional)"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={saving}
              data-ocid="patients.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 min-w-[110px]"
              data-ocid="patients.submit_button"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Saving…
                </>
              ) : editing ? (
                "Update Patient"
              ) : (
                "Add Patient"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && !deleting && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="patients.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone and may affect linked bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              data-ocid="patients.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              data-ocid="patients.delete_button"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Patient Detail Sheet ─────────────────────────────────────────────── */}
      <Sheet
        open={!!liveDetailPatient}
        onOpenChange={(v) => !v && setDetailPatient(null)}
      >
        <SheetContent
          className="w-full sm:max-w-md overflow-y-auto"
          data-ocid="patients.sheet"
        >
          {liveDetailPatient && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <UserCircle className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <SheetTitle className="text-lg">
                      {liveDetailPatient.name}
                    </SheetTitle>
                    <SheetDescription className="text-xs font-mono">
                      {liveDetailPatient.id}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Demographics */}
              <section className="space-y-3 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Demographics
                </h3>
                <DetailRow
                  label="Age"
                  value={
                    liveDetailPatient.age
                      ? `${liveDetailPatient.age} years`
                      : "—"
                  }
                />
                <DetailRow
                  label="Gender"
                  value={
                    <Badge
                      variant="outline"
                      className={
                        liveDetailPatient.gender === "Male"
                          ? "border-blue-200 text-blue-700 bg-blue-50"
                          : liveDetailPatient.gender === "Female"
                            ? "border-pink-200 text-pink-700 bg-pink-50"
                            : "border-purple-200 text-purple-700 bg-purple-50"
                      }
                    >
                      {liveDetailPatient.gender}
                    </Badge>
                  }
                />
              </section>

              {/* Contact */}
              <section className="space-y-3 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Contact
                </h3>
                <DetailRow
                  label="Mobile"
                  value={
                    liveDetailPatient.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {liveDetailPatient.phone}
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailRow
                  label="Address"
                  value={liveDetailPatient.address || "—"}
                />
              </section>

              {/* Bookings */}
              <section className="space-y-3 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Activity
                </h3>
                <DetailRow
                  label="Total Bookings"
                  value={
                    <Badge variant="secondary">
                      {bookingCountFor(liveDetailPatient.id)}
                    </Badge>
                  }
                />
              </section>

              {/* Timestamps */}
              <section className="space-y-3 mb-8">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Dates
                </h3>
                <DetailRow
                  label="Registered"
                  value={
                    <span className="flex items-center gap-1 text-gray-600">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(liveDetailPatient.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  }
                />
                <DetailRow
                  label="Last Updated"
                  value={new Date(
                    liveDetailPatient.updatedAt,
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                />
              </section>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDetailPatient(null);
                    openEdit(liveDetailPatient);
                  }}
                  data-ocid="patients.edit_button"
                >
                  <Edit className="w-4 h-4 mr-1.5" />
                  Edit Patient
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 border-red-200"
                  onClick={() => {
                    setDetailPatient(null);
                    setDeleteTarget(liveDetailPatient);
                  }}
                  data-ocid="patients.delete_button"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TableHead() {
  return (
    <tr className="bg-gray-50 border-b border-gray-200">
      {[
        "Patient ID",
        "Name",
        "Age",
        "Gender",
        "Phone",
        "Address",
        "Actions",
      ].map((h) => (
        <th
          key={h}
          className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
        >
          {h}
        </th>
      ))}
    </tr>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-gray-500 shrink-0 w-28">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value}</span>
    </div>
  );
}
