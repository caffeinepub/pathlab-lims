import { CheckCircle, TestTube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { formatDate, formatDateTime, generateSampleId } from "../lib/limsUtils";
import { useLimsStore } from "../store/useLimsStore";

type FilterStatus =
  | "all"
  | "pending"
  | "collected"
  | "processing"
  | "completed";

export default function Samples() {
  const { patients, tests, bookings, updateBooking } = useLimsStore();
  const [filter, setFilter] = useState<FilterStatus>("all");

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const filtered =
    filter === "all" ? sorted : sorted.filter((b) => b.status === filter);

  async function markCollected(id: string) {
    const sampleId = generateSampleId();
    await updateBooking(id, {
      status: "collected",
      sampleId,
      collectedAt: new Date().toISOString(),
    });
    toast.success(`Sample collected — ID: ${sampleId}`);
  }

  const filters: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Collected", value: "collected" },
    { label: "Processing", value: "processing" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sample Collection</h1>
        <p className="text-sm text-gray-500">
          {bookings.filter((b) => b.status === "pending").length} pending
          collection
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
            }`}
            data-ocid="samples.tab"
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {sorted.length === 0 ? (
          <EmptyState
            icon={TestTube}
            title="No bookings yet"
            description="Create a booking first"
          />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No bookings with status "{filter}"
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50">
                {[
                  "Booking ID",
                  "Patient",
                  "Tests",
                  "Date",
                  "Sample ID",
                  "Status",
                  "Action",
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
              {filtered.map((b) => {
                const patient = patients.find((p) => p.id === b.patientId);
                return (
                  <tr
                    key={b.id}
                    className="border-t border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-xs font-mono text-blue-600">
                      {b.bookingId}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {patient?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {b.tests
                        .map((id) => tests.find((t) => t.id === id)?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(b.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-green-700">
                      {b.sampleId || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      {b.status === "pending" ? (
                        <Button
                          size="sm"
                          onClick={() => markCollected(b.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
                          data-ocid="samples.primary_button"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Mark Collected
                        </Button>
                      ) : b.collectedAt ? (
                        <span className="text-xs text-gray-400">
                          {formatDateTime(b.collectedAt)}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
