import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SmartDropdown } from "../components/SmartDropdown";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { formatCurrency, formatDate } from "../lib/limsUtils";
import { useLimsStore } from "../store/useLimsStore";

export default function Bookings() {
  const { patients, tests, bookings, addBooking, addPatient, deleteBooking } =
    useLimsStore();
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(0);
  const [patientId, setPatientId] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [testSearch, setTestSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewBooking, setViewBooking] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const total = selectedTests.reduce(
    (sum, id) => sum + (tests.find((t) => t.id === id)?.price ?? 0),
    0,
  );

  function openNewBooking() {
    setStep(0);
    setPatientId("");
    setSelectedTests([]);
    setTestSearch("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setStep(0);
    setPatientId("");
    setSelectedTests([]);
    setTestSearch("");
  }

  function toggleTest(id: string) {
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleAddPatient(name: string): Promise<string> {
    const p = await addPatient({
      name: name || "New Patient",
      age: 0,
      gender: "Male",
      phone: "",
      address: "",
    });
    toast.success("Patient added");
    return p.id;
  }

  async function saveBooking() {
    if (!patientId) {
      toast.error("Select a patient");
      return;
    }
    if (selectedTests.length === 0) {
      toast.error("Select at least one test");
      return;
    }
    setSaving(true);
    try {
      await addBooking({
        patientId,
        tests: selectedTests,
        totalAmount: total,
        status: "pending",
      });
      toast.success("Booking created successfully");
      setShowForm(false);
      setStep(0);
      setPatientId("");
      setSelectedTests([]);
    } finally {
      setSaving(false);
    }
  }

  const filteredTests = tests.filter(
    (t) =>
      t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(testSearch.toLowerCase()),
  );
  const detailBooking = bookings.find((b) => b.id === viewBooking);
  const detailPatient = detailBooking
    ? patients.find((p) => p.id === detailBooking.patientId)
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500">
            {bookings.length} total bookings
          </p>
        </div>
        <Button
          onClick={openNewBooking}
          className="bg-blue-600 hover:bg-blue-700"
          data-ocid="booking.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Booking
        </Button>
      </div>

      {/* New Booking Form — only shown when showForm is true */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Steps header */}
          <div className="flex border-b border-gray-100 relative">
            {["Select Patient", "Select Tests", "Confirm & Save"].map(
              (s, i) => (
                <div
                  key={s}
                  className={`flex-1 flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors ${
                    i === step
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : i < step
                        ? "text-green-600"
                        : "text-gray-400"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < step
                        ? "bg-green-100 text-green-600"
                        : i === step
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i < step ? <Check className="w-3 h-3" /> : i + 1}
                  </span>
                  {s}
                </div>
              ),
            )}
            <button
              type="button"
              onClick={cancelForm}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Cancel"
              data-ocid="booking.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            {step === 0 && (
              <div className="max-w-md">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Step 1: Select Patient
                </h3>
                <SmartDropdown
                  options={patients.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.phone || "No phone"})`,
                  }))}
                  value={patientId}
                  onChange={setPatientId}
                  placeholder="Search or select patient..."
                  onAddNew={handleAddPatient}
                  addNewLabel="Add Patient"
                />
                {patientId && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    {(() => {
                      const p = patients.find((x) => x.id === patientId);
                      return p ? (
                        <div className="text-sm">
                          <span className="font-medium text-gray-800">
                            {p.name}
                          </span>
                          <span className="text-gray-500 ml-2">
                            {p.age}y • {p.gender}
                          </span>
                          {p.phone && (
                            <span className="text-gray-500 ml-2">
                              {p.phone}
                            </span>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() =>
                      step === 0 && patientId
                        ? setStep(1)
                        : toast.error("Select a patient")
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                    data-ocid="booking.primary_button"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Step 2: Select Tests
                </h3>
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg mb-3 max-w-sm">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    className="flex-1 text-sm outline-none"
                    data-ocid="booking.search_input"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {filteredTests.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTest(t.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                        selectedTests.includes(t.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {t.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {t.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{t.price}
                        </div>
                        {selectedTests.includes(t.id) && (
                          <Check className="w-4 h-4 text-blue-500 ml-auto mt-0.5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {selectedTests.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {selectedTests.length} test(s) selected
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(total)}
                    </span>
                  </div>
                )}
                <div className="mt-4 flex gap-2 justify-between">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button
                    onClick={() =>
                      selectedTests.length > 0
                        ? setStep(2)
                        : toast.error("Select at least one test")
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                    data-ocid="booking.primary_button"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Step 3: Confirm Booking
                </h3>
                {(() => {
                  const p = patients.find((x) => x.id === patientId);
                  return p ? (
                    <div className="p-3 bg-blue-50 rounded-lg mb-3">
                      <div className="text-sm font-medium text-gray-800">
                        {p.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.age}y • {p.gender}
                        {p.phone && ` • ${p.phone}`}
                      </div>
                    </div>
                  ) : null;
                })()}
                <div className="space-y-2 mb-3">
                  {selectedTests.map((id) => {
                    const t = tests.find((x) => x.id === id);
                    return t ? (
                      <div
                        key={id}
                        className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">{t.name}</span>
                        <span className="text-sm font-medium">₹{t.price}</span>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900 text-white rounded-lg">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(total)}
                  </span>
                </div>
                <div className="mt-4 flex gap-2 justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button
                    onClick={saveBooking}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                    data-ocid="booking.submit_button"
                  >
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">All Bookings</h3>
        </div>
        {sortedBookings.length === 0 ? (
          <div
            className="p-8 text-center text-sm text-gray-400"
            data-ocid="booking.empty_state"
          >
            No bookings yet. Click "New Booking" to create your first booking.
          </div>
        ) : (
          <table className="w-full" data-ocid="booking.table">
            <thead>
              <tr className="bg-blue-50">
                {[
                  "Booking ID",
                  "Patient",
                  "Tests",
                  "Amount",
                  "Status",
                  "Date",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedBookings.map((b, idx) => (
                <tr
                  key={b.id}
                  className="border-t border-gray-50 hover:bg-gray-50"
                  data-ocid={`booking.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 text-xs font-mono text-blue-600">
                    {b.bookingId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {patients.find((p) => p.id === b.patientId)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {b.tests.length} test(s)
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {formatCurrency(b.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(b.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setViewBooking(b.id)}
                        className="text-xs text-blue-600 hover:underline"
                        data-ocid={`booking.edit_button.${idx + 1}`}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(b.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        data-ocid={`booking.delete_button.${idx + 1}`}
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

      {/* Detail Dialog */}
      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent className="max-w-lg" data-ocid="booking.dialog">
          <DialogHeader>
            <DialogTitle>
              Booking Details — {detailBooking?.bookingId}
            </DialogTitle>
          </DialogHeader>
          {detailBooking && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium">{detailPatient?.name}</div>
                <div className="text-xs text-gray-500">
                  {detailPatient?.phone} • {detailPatient?.gender}
                </div>
              </div>
              <div className="space-y-1">
                {detailBooking.tests.map((id) => {
                  const t = tests.find((x) => x.id === id);
                  return t ? (
                    <div
                      key={id}
                      className="flex justify-between text-sm py-1.5 border-b border-gray-50"
                    >
                      <span>{t.name}</span>
                      <span className="font-medium">₹{t.price}</span>
                    </div>
                  ) : null;
                })}
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1">
                <span>Total</span>
                <span>{formatCurrency(detailBooking.totalAmount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <StatusBadge status={detailBooking.status} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm" data-ocid="booking.modal">
          <DialogHeader>
            <DialogTitle>Delete Booking?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">This cannot be undone.</p>
          <div className="flex gap-2 justify-end mt-3">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="booking.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (deleteId) {
                  await deleteBooking(deleteId);
                  toast.success("Booking deleted");
                  setDeleteId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              data-ocid="booking.delete_button"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
