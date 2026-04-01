import { Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { formatDate } from "../lib/limsUtils";
import { useLimsStore } from "../store/useLimsStore";

const FILTERS = [
  "All",
  "pending",
  "collected",
  "processing",
  "completed",
] as const;
type Filter = (typeof FILTERS)[number];

export default function Worklist() {
  const { patients, tests, bookings } = useLimsStore();
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = [...bookings]
    .filter((b) => filter === "All" || b.status === filter)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Worklist</h1>
        <p className="text-sm text-gray-500">Track all lab work in progress</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No items in worklist"
            description="Bookings will appear here after creation"
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50">
                {[
                  "Booking ID",
                  "Patient",
                  "Tests",
                  "Sample ID",
                  "Date",
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
                const testNames = b.tests
                  .map((id) => tests.find((t) => t.id === id)?.name)
                  .filter(Boolean)
                  .join(", ");
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
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {testNames}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-green-700">
                      {b.sampleId || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(b.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      {b.status === "collected" && (
                        <Link
                          to="/results"
                          search={{ bookingId: b.id }}
                          data-ocid="worklist.results.link"
                        >
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-xs h-7"
                          >
                            Enter Results
                          </Button>
                        </Link>
                      )}
                      {b.status === "processing" && (
                        <Link
                          to="/results"
                          search={{ bookingId: b.id }}
                          data-ocid="worklist.results.link"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            Edit Results
                          </Button>
                        </Link>
                      )}
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
