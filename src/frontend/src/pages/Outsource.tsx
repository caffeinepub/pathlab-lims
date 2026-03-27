import { Building2, Edit, Plus, Trash2 } from "lucide-react";
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
import type { OutsourceLab } from "../lib/types";
import { useLimsStore } from "../store/useLimsStore";

type LabForm = Omit<OutsourceLab, "id" | "createdAt" | "updatedAt">;
const EMPTY: LabForm = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  assignedTests: [],
};

export default function Outsource() {
  const {
    outsourceLabs,
    tests,
    addOutsourceLab,
    updateOutsourceLab,
    deleteOutsourceLab,
  } = useLimsStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OutsourceLab | null>(null);
  const [form, setForm] = useState<LabForm>(EMPTY);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }
  function openEdit(l: OutsourceLab) {
    setEditing(l);
    setForm({
      name: l.name,
      contactPerson: l.contactPerson,
      phone: l.phone,
      email: l.email,
      address: l.address,
      assignedTests: l.assignedTests,
    });
    setOpen(true);
  }

  function toggleTest(id: string) {
    setForm((f) => ({
      ...f,
      assignedTests: f.assignedTests.includes(id)
        ? f.assignedTests.filter((x) => x !== id)
        : [...f.assignedTests, id],
    }));
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error("Lab name is required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateOutsourceLab(editing.id, form);
        toast.success("Lab updated");
      } else {
        await addOutsourceLab(form);
        toast.success("Lab added");
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outsource Labs</h1>
          <p className="text-sm text-gray-500">
            {outsourceLabs.length} external labs
          </p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1" />
          Add Lab
        </Button>
      </div>

      {outsourceLabs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            icon={Building2}
            title="No outsource labs"
            description="Add external labs to assign tests"
            action={{ label: "Add Lab", onClick: openAdd }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outsourceLabs.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{l.name}</h3>
                  <p className="text-sm text-gray-500">{l.contactPerson}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(l)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(l.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                {l.phone && <div>📞 {l.phone}</div>}
                {l.email && <div>✉️ {l.email}</div>}
                {l.address && <div>📍 {l.address}</div>}
              </div>
              {l.assignedTests.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Assigned Tests ({l.assignedTests.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {l.assignedTests.slice(0, 4).map((id) => {
                      const t = tests.find((x) => x.id === id);
                      return t ? (
                        <span
                          key={id}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                        >
                          {t.name}
                        </span>
                      ) : null;
                    })}
                    {l.assignedTests.length > 4 && (
                      <span className="text-xs text-gray-400">
                        +{l.assignedTests.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Lab" : "Add Outsource Lab"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Lab Name *
              </div>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Lab name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Contact Person
                </div>
                <Input
                  value={form.contactPerson}
                  onChange={(e) =>
                    setForm({ ...form, contactPerson: e.target.value })
                  }
                  placeholder="Name"
                />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Phone
                </div>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone"
                />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Email
              </div>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Address
              </div>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Address"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-2">
                Assign Tests
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                {tests.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.assignedTests.includes(t.id)}
                      onChange={() => toggleTest(t.id)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{t.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {t.category}
                    </span>
                  </label>
                ))}
              </div>
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
              {saving ? "Saving..." : editing ? "Update" : "Add Lab"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Lab?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">This cannot be undone.</p>
          <div className="flex gap-2 justify-end mt-3">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (deleting) {
                  await deleteOutsourceLab(deleting);
                  toast.success("Lab deleted");
                  setDeleting(null);
                }
              }}
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
