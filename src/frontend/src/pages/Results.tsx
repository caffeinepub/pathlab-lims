import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SmartDropdown } from "../components/SmartDropdown";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatDate } from "../lib/utils";
import { useLimsStore } from "../store/useLimsStore";

export default function Results() {
  const { patients, tests, bookings, results, updateBooking, upsertResult } =
    useLimsStore();
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const collectableBookings = bookings.filter(
    (b) => b.status === "collected" || b.status === "processing",
  );
  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const selectedPatient = selectedBooking
    ? patients.find((p) => p.id === selectedBooking.patientId)
    : null;

  useEffect(() => {
    if (!selectedBookingId) return;
    const existing: Record<string, string> = {};
    for (const r of results.filter((r) => r.bookingId === selectedBookingId)) {
      existing[`${r.testId}__${r.parameterId}`] = r.value;
    }
    setValues(existing);
  }, [selectedBookingId, results]);

  function isAbnormal(
    value: string,
    refMin?: number,
    refMax?: number,
  ): boolean {
    const num = Number.parseFloat(value);
    if (Number.isNaN(num)) return false;
    if (refMin !== undefined && num < refMin) return true;
    if (refMax !== undefined && num > refMax) return true;
    return false;
  }

  async function saveResults() {
    if (!selectedBooking) return;
    setSaving(true);
    try {
      for (const testId of selectedBooking.tests) {
        const test = tests.find((t) => t.id === testId);
        if (!test) continue;
        for (const param of test.parameters) {
          const key = `${testId}__${param.id}`;
          const value = values[key] ?? "";
          if (!value) continue;
          const abnormal = isAbnormal(
            value,
            param.referenceMin,
            param.referenceMax,
          );
          await upsertResult({
            bookingId: selectedBookingId,
            testId,
            parameterId: param.id,
            value,
            unit: param.unit,
            referenceRange: param.referenceRange,
            isAbnormal: abnormal,
          });
        }
      }
      await updateBooking(selectedBookingId, { status: "processing" });
      toast.success("Results saved successfully");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Result Entry</h1>
        <p className="text-sm text-gray-500">
          Enter test results for collected samples
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm max-w-sm">
        <div className="text-xs font-medium text-gray-600 mb-2">
          Select Booking
        </div>
        <SmartDropdown
          options={collectableBookings.map((b) => ({
            value: b.id,
            label: `${b.bookingId} — ${patients.find((p) => p.id === b.patientId)?.name ?? "Unknown"} (${formatDate(b.createdAt)})`,
          }))}
          value={selectedBookingId}
          onChange={setSelectedBookingId}
          placeholder="Select collected booking..."
        />
      </div>

      {selectedBooking && (
        <>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="text-sm font-medium text-gray-800">
              {selectedPatient?.name} — {selectedBooking.bookingId}
            </div>
            <div className="text-xs text-gray-500">
              {selectedPatient?.age}y • {selectedPatient?.gender} • Sample:{" "}
              {selectedBooking.sampleId}
            </div>
          </div>

          {selectedBooking.tests.map((testId) => {
            const test = tests.find((t) => t.id === testId);
            if (!test) return null;
            return (
              <div
                key={testId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <span className="font-semibold text-gray-800">
                    {test.name}
                  </span>
                  <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {test.category}
                  </span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-50">
                      {[
                        "Parameter",
                        "Unit",
                        "Reference Range",
                        "Value",
                        "Flag",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-2 text-xs font-semibold text-gray-600"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {test.parameters.map((param) => {
                      const key = `${testId}__${param.id}`;
                      const val = values[key] ?? "";
                      const abnormal = val
                        ? isAbnormal(
                            val,
                            param.referenceMin,
                            param.referenceMax,
                          )
                        : false;
                      return (
                        <tr
                          key={param.id}
                          className={`border-t border-gray-50 ${abnormal ? "bg-red-50" : ""}`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {param.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {param.unit}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {param.referenceRange}
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              className={`h-8 w-28 text-sm ${abnormal ? "border-red-400 bg-red-50 text-red-700 font-semibold" : ""}`}
                              value={val}
                              onChange={(e) =>
                                setValues((v) => ({
                                  ...v,
                                  [key]: e.target.value,
                                }))
                              }
                              placeholder="Enter value"
                            />
                          </td>
                          <td className="px-4 py-2">
                            {abnormal && (
                              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                ⚠ Abnormal
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}

          <Button
            onClick={saveResults}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? "Saving..." : "Save All Results"}
          </Button>
        </>
      )}

      {collectableBookings.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
          No collected samples available. Mark samples as collected in the
          Samples module first.
        </div>
      )}
    </div>
  );
}
