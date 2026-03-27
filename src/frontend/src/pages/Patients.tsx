import { Edit, Plus, Search, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import type { Patient } from "../lib/types";
import { useLimsStore } from "../store/useLimsStore";

type PatientForm = Omit<Patient, "id" | "createdAt" | "updatedAt">;
const EMPTY: PatientForm = {
  name: "",
  age: 0,
  gender: "Male",
  phone: "",
  address: "",
};

export default function Patients() {
  const { patients, addPatient, updatePatient, deletePatient } = useLimsStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState<PatientForm>(EMPTY);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search),
  );

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }
  function openEdit(p: Patient) {
    setEditing(p);
    setForm({
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      address: p.address,
    });
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Phone is required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updatePatient(editing.id, form);
        toast.success("Patient updated");
      } else {
        await addPatient(form);
        toast.success("Patient added");
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id: string) {
    await deletePatient(id);
    toast.success("Patient deleted");
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500">
            {patients.length} total patients
          </p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1" /> Add Patient
        </Button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg max-w-sm">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "No patients found" : "No patients yet"}
            description={
              search ? "Try a different search" : "Add your first patient"
            }
            action={
              !search ? { label: "Add Patient", onClick: openAdd } : undefined
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50">
                {["Name", "Age", "Gender", "Phone", "Address", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-600"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.age}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {p.gender}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {p.address || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Patient" : "Add New Patient"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="col-span-2">
              <div className="text-xs font-medium text-gray-600 mb-1">
                Full Name *
              </div>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Patient name"
                onKeyDown={(e) => e.key === "Enter" && save()}
              />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Age</div>
              <Input
                type="number"
                value={form.age || ""}
                onChange={(e) =>
                  setForm({ ...form, age: Number(e.target.value) || 0 })
                }
                placeholder="Age"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Gender
              </div>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <div className="text-xs font-medium text-gray-600 mb-1">
                Phone *
              </div>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="col-span-2">
              <div className="text-xs font-medium text-gray-600 mb-1">
                Address
              </div>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Address"
                onKeyDown={(e) => e.key === "Enter" && save()}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Saving..." : editing ? "Update" : "Add Patient"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Patient?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
          <div className="flex gap-2 justify-end mt-3">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => deleting && doDelete(deleting)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
