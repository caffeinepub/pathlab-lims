import { Edit, FlaskConical, Plus, Search, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { generateId } from "../lib/limsUtils";
import {
  COMMON_UNITS,
  CONTAINER_TYPES,
  METHODS,
  SAMPLE_TYPES,
  SEED_TEST_META,
  TAT_OPTIONS,
  TEST_CATEGORIES,
  type TestMeta,
  deleteTestMeta,
  getTestMeta,
  saveTestMeta,
  seedTestMeta,
} from "../lib/testMasterData";
import type { LabTest, TestParameter } from "../lib/types";
import { useLimsStore } from "../store/useLimsStore";

type TestForm = {
  name: string;
  category: string;
  price: number;
  parameters: TestParameter[];
  meta: TestMeta;
};

const EMPTY_FORM: TestForm = {
  name: "",
  category: "Biochemistry",
  price: 0,
  parameters: [],
  meta: {},
};

export default function Tests() {
  const { tests, addTest, updateTest, deleteTest } = useLimsStore();
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LabTest | null>(null);
  const [form, setForm] = useState<TestForm>(EMPTY_FORM);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed meta on mount in case it was cleared
  useEffect(() => {
    seedTestMeta(SEED_TEST_META);
  }, []);

  const categories = ["All", ...TEST_CATEGORIES];

  const filtered = useMemo(() => {
    let list =
      catFilter === "All"
        ? tests
        : tests.filter((t) => t.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          (getTestMeta(t.id).shortCode ?? "").toLowerCase().includes(q) ||
          (getTestMeta(t.id).sampleType ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [tests, catFilter, search]);

  const popularTests = useMemo(
    () => tests.filter((t) => getTestMeta(t.id).isPopular),
    [tests],
  );

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
      meta: { ...getTestMeta(t.id) },
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
        await updateTest(editing.id, {
          name: form.name,
          category: form.category,
          price: form.price,
          parameters: form.parameters,
        });
        saveTestMeta(editing.id, form.meta);
        toast.success("Test updated");
      } else {
        const created = await addTest({
          name: form.name,
          category: form.category,
          price: form.price,
          parameters: form.parameters,
        });
        saveTestMeta(created.id, form.meta);
        toast.success("Test added");
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id: string) {
    await deleteTest(id);
    deleteTestMeta(id);
    toast.success("Test deleted");
    setDeleting(null);
  }

  const countByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tests) {
      map[t.category] = (map[t.category] ?? 0) + 1;
    }
    return map;
  }, [tests]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Master</h1>
          <p className="text-sm text-gray-500">
            {tests.length} tests &bull; {popularTests.length} popular
          </p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1" />
          Add Test
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code, category, sample type…"
          className="pl-9"
        />
      </div>

      {/* Category filter */}
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
            {c !== "All" && countByCategory[c] ? (
              <span
                className={`ml-1.5 text-xs ${
                  catFilter === c ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {countByCategory[c]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Popular tests strip (only when no filter active) */}
      {catFilter === "All" && !search && popularTests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-amber-700">
              Popular / Daily Routine Tests
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTests.map((t) => (
              <span
                key={t.id}
                className="px-2.5 py-1 bg-white border border-amber-200 rounded-full text-xs text-gray-700 font-medium"
              >
                {getTestMeta(t.id).shortCode ?? t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Test grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            icon={FlaskConical}
            title="No tests found"
            description={
              search
                ? `No results for "${search}"`
                : "Add your first test to get started"
            }
            action={{ label: "Add Test", onClick: openAdd }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => {
            const meta = getTestMeta(t.id);
            return (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      {meta.isPopular && (
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
                        {t.name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {t.category}
                      </span>
                      {meta.shortCode && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {meta.shortCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
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

                <div className="text-lg font-bold text-gray-900">
                  ₹{t.price.toLocaleString()}
                </div>

                {/* Meta row */}
                {(meta.sampleType || meta.tat) && (
                  <div className="flex gap-3 mt-1">
                    {meta.sampleType && (
                      <span className="text-xs text-gray-400">
                        {meta.sampleType}
                      </span>
                    )}
                    {meta.tat && (
                      <span className="text-xs text-gray-400">
                        ⏱ {meta.tat}
                      </span>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-1">
                  {t.parameters.length} parameter
                  {t.parameters.length !== 1 ? "s" : ""}
                </div>

                {t.parameters.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {t.parameters.slice(0, 3).map((p) => (
                      <div key={p.id} className="text-xs text-gray-500">
                        &bull; {p.name} {p.unit && `(${p.unit})`} &mdash;{" "}
                        {p.referenceRange}
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
            );
          })}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Test" : "Add New Test"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Core fields */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-5">
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Test Name *
                </div>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. CBC, LFT, TSH"
                  className="mt-1"
                />
              </div>
              <div className="col-span-6 md:col-span-4">
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Category
                </div>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TEST_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-6 md:col-span-3">
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
                  className="mt-1"
                />
              </div>
            </div>

            {/* Extended meta */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Lab Details (optional)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    Short Code
                  </div>
                  <Input
                    value={form.meta.shortCode ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        meta: { ...form.meta, shortCode: e.target.value },
                      })
                    }
                    placeholder="e.g. CBC"
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    Sample Type
                  </div>
                  <select
                    value={form.meta.sampleType ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        meta: { ...form.meta, sampleType: e.target.value },
                      })
                    }
                    className="mt-1 w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                  >
                    <option value="">Select…</option>
                    {SAMPLE_TYPES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    Container
                  </div>
                  <select
                    value={form.meta.container ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        meta: { ...form.meta, container: e.target.value },
                      })
                    }
                    className="mt-1 w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                  >
                    <option value="">Select…</option>
                    {CONTAINER_TYPES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    Method
                  </div>
                  <select
                    value={form.meta.method ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        meta: { ...form.meta, method: e.target.value },
                      })
                    }
                    className="mt-1 w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                  >
                    <option value="">Select…</option>
                    {METHODS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    TAT
                  </div>
                  <select
                    value={form.meta.tat ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        meta: { ...form.meta, tat: e.target.value },
                      })
                    }
                    className="mt-1 w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                  >
                    <option value="">Select…</option>
                    {TAT_OPTIONS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    Department
                  </div>
                  <Input
                    value={form.meta.department ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        meta: { ...form.meta, department: e.target.value },
                      })
                    }
                    placeholder="e.g. Biochemistry"
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.meta.isPopular ?? false}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      meta: { ...form.meta, isPopular: e.target.checked },
                    })
                  }
                  className="rounded"
                />
                Mark as Popular / Daily Routine test
              </label>
            </div>

            {/* Parameters */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-600">
                  Parameters ({form.parameters.length})
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
                    <span className="col-span-4">Parameter Name</span>
                    <span className="col-span-2">Unit</span>
                    <span className="col-span-3">Ref Range</span>
                    <span className="col-span-1">Min</span>
                    <span className="col-span-1">Max</span>
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
                      <div className="col-span-2">
                        <select
                          value={p.unit}
                          onChange={(e) =>
                            updateParam(idx, "unit", e.target.value)
                          }
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md"
                        >
                          <option value="">Unit…</option>
                          {COMMON_UNITS.map((u) => (
                            <option key={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                      <Input
                        className="col-span-3 h-8 text-xs"
                        value={p.referenceRange}
                        onChange={(e) =>
                          updateParam(idx, "referenceRange", e.target.value)
                        }
                        placeholder="e.g. 70–100"
                      />
                      <Input
                        className="col-span-1 h-8 text-xs"
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
                      <Input
                        className="col-span-1 h-8 text-xs"
                        type="number"
                        value={p.referenceMax ?? ""}
                        onChange={(e) =>
                          updateParam(
                            idx,
                            "referenceMax",
                            Number(e.target.value),
                          )
                        }
                        placeholder="Max"
                      />
                      <button
                        type="button"
                        onClick={() => removeParam(idx)}
                        className="col-span-1 text-red-400 hover:text-red-600 text-center"
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
              {saving ? "Saving…" : editing ? "Update Test" : "Add Test"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Test?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            This will permanently remove the test and all its parameters.
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
