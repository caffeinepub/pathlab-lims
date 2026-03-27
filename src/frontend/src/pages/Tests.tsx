import { Edit, FlaskConical, Plus, Trash2 } from "lucide-react";
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
import type { LabTest, TestParameter } from "../lib/types";
import { generateId } from "../lib/utils";
import { useLimsStore } from "../store/useLimsStore";

const CATEGORIES = [
  "Hematology",
  "Biochemistry",
  "Serology",
  "Pathology",
  "Endocrinology",
  "Immunology",
  "Microbiology",
  "Radiology",
  "Other",
];

type TestForm = {
  name: string;
  category: string;
  price: number;
  parameters: TestParameter[];
};
const EMPTY_FORM: TestForm = {
  name: "",
  category: "Biochemistry",
  price: 0,
  parameters: [],
};

export default function Tests() {
  const { tests, addTest, updateTest, deleteTest } = useLimsStore();
  const [catFilter, setCatFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LabTest | null>(null);
  const [form, setForm] = useState<TestForm>(EMPTY_FORM);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = [
    "All",
    ...Array.from(new Set(tests.map((t) => t.category))),
  ];
  const filtered =
    catFilter === "All" ? tests : tests.filter((t) => t.category === catFilter);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }
  function openEdit(t: LabTest) {
    setEditing(t);
    setForm({
      name: t.name,
      category: t.category,
      price: t.price,
      parameters: [...t.parameters],
    });
    setOpen(true);
  }

  function addParam() {
    setForm((f) => ({
      ...f,
      parameters: [
        ...f.parameters,
        { id: generateId("PM"), name: "", unit: "", referenceRange: "" },
      ],
    }));
  }
  function updateParam(
    idx: number,
    field: keyof TestParameter,
    value: string | number,
  ) {
    setForm((f) => {
      const params = [...f.parameters];
      params[idx] = { ...params[idx], [field]: value };
      return { ...f, parameters: params };
    });
  }
  function removeParam(idx: number) {
    setForm((f) => ({
      ...f,
      parameters: f.parameters.filter((_, i) => i !== idx),
    }));
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error("Test name is required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateTest(editing.id, form);
        toast.success("Test updated");
      } else {
        await addTest(form);
        toast.success("Test added");
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id: string) {
    await deleteTest(id);
    toast.success("Test deleted");
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Master</h1>
          <p className="text-sm text-gray-500">
            {tests.length} tests configured
          </p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1" />
          Add Test
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              catFilter === c
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            icon={FlaskConical}
            title="No tests found"
            description="Add your first test to get started"
            action={{ label: "Add Test", onClick: openAdd }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {t.name}
                  </h3>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {t.category}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(t.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900">₹{t.price}</div>
              <div className="text-xs text-gray-400 mt-1">
                {t.parameters.length} parameter
                {t.parameters.length !== 1 ? "s" : ""}
              </div>
              {t.parameters.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {t.parameters.slice(0, 3).map((p) => (
                    <div key={p.id} className="text-xs text-gray-500">
                      • {p.name} {p.unit && `(${p.unit})`} — {p.referenceRange}
                    </div>
                  ))}
                  {t.parameters.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{t.parameters.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Test" : "Add New Test"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 md:col-span-1">
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Test Name *
                </div>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. CBC"
                />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Category
                </div>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Price (₹) *
                </div>
                <Input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-600">
                  Parameters
                </div>
                <button
                  type="button"
                  onClick={addParam}
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Add Parameter
                </button>
              </div>
              {form.parameters.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center text-sm text-gray-400">
                  No parameters yet.{" "}
                  <button
                    type="button"
                    onClick={addParam}
                    className="text-blue-600 hover:underline"
                  >
                    Add one
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                    <span className="col-span-4">Name</span>
                    <span className="col-span-2">Unit</span>
                    <span className="col-span-3">Ref Range</span>
                    <span className="col-span-2">Min/Max</span>
                    <span className="col-span-1" />
                  </div>
                  {form.parameters.map((p, idx) => (
                    <div
                      key={p.id}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <Input
                        className="col-span-4 h-8 text-xs"
                        value={p.name}
                        onChange={(e) =>
                          updateParam(idx, "name", e.target.value)
                        }
                        placeholder="Name"
                      />
                      <Input
                        className="col-span-2 h-8 text-xs"
                        value={p.unit}
                        onChange={(e) =>
                          updateParam(idx, "unit", e.target.value)
                        }
                        placeholder="Unit"
                      />
                      <Input
                        className="col-span-3 h-8 text-xs"
                        value={p.referenceRange}
                        onChange={(e) =>
                          updateParam(idx, "referenceRange", e.target.value)
                        }
                        placeholder="e.g. 70-100"
                      />
                      <Input
                        className="col-span-2 h-8 text-xs"
                        type="number"
                        value={p.referenceMin ?? ""}
                        onChange={(e) =>
                          updateParam(
                            idx,
                            "referenceMin",
                            Number(e.target.value),
                          )
                        }
                        placeholder="Min"
                      />
                      <button
                        type="button"
                        onClick={() => removeParam(idx)}
                        className="col-span-1 text-red-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              {saving ? "Saving..." : editing ? "Update" : "Add Test"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Test?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            This will remove the test permanently.
          </p>
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
