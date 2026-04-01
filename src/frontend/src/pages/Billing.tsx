import { CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
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

const METHODS = ["Cash", "Card", "UPI", "Insurance", "Online"];

export default function Billing() {
  const { patients, tests, bookings, payments, upsertPayment } = useLimsStore();
  const [viewId, setViewId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState("Cash");
  const [partialAmt, setPartialAmt] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const totalRevenue = payments
    .filter((p) => p.status !== "pending")
    .reduce((s, p) => s + (p.partialAmount ?? p.amount), 0);
  const totalPending = bookings.reduce((s, b) => {
    const p = payments.find((x) => x.bookingId === b.id);
    if (!p || p.status === "pending") return s + b.totalAmount;
    if (p.status === "partial")
      return s + (b.totalAmount - (p.partialAmount ?? 0));
    return s;
  }, 0);

  const viewBooking = bookings.find((b) => b.id === viewId);
  const viewPatient = viewBooking
    ? patients.find((p) => p.id === viewBooking.patientId)
    : null;
  const viewPayment = viewBooking
    ? payments.find((p) => p.bookingId === viewBooking.id)
    : null;

  async function markPaid() {
    if (!viewId) return;
    setSaving(true);
    try {
      await upsertPayment(viewId, {
        status: "paid",
        paidAt: new Date().toISOString(),
        method: payMethod,
      });
      toast.success("Payment marked as paid");
      setViewId(null);
    } finally {
      setSaving(false);
    }
  }

  async function markPartial() {
    if (!viewId || !partialAmt) {
      toast.error("Enter partial amount");
      return;
    }
    setSaving(true);
    try {
      await upsertPayment(viewId, {
        status: "partial",
        paidAt: new Date().toISOString(),
        method: payMethod,
        partialAmount: Number(partialAmt),
      });
      toast.success("Partial payment recorded");
      setViewId(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500">Manage invoices and payments</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="text-xs text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="text-xs text-gray-500">Pending Amount</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">
            {formatCurrency(totalPending)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="text-xs text-gray-500">Total Bookings</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {bookings.length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {sorted.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No bookings"
            description="Create a booking to manage billing"
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50">
                {[
                  "Booking ID",
                  "Patient",
                  "Tests",
                  "Amount",
                  "Payment",
                  "Date",
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
              {sorted.map((b) => {
                const patient = patients.find((p) => p.id === b.patientId);
                const payment = payments.find((p) => p.bookingId === b.id);
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
                      {b.tests.length}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payment?.status ?? "pending"} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(b.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setViewId(b.id);
                          setPayMethod("Cash");
                          setPartialAmt("");
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!viewId} onOpenChange={() => setViewId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invoice — {viewBooking?.bookingId}</DialogTitle>
          </DialogHeader>
          {viewBooking && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium">{viewPatient?.name}</div>
                <div className="text-xs text-gray-500">
                  {viewPatient?.phone}
                </div>
              </div>
              <div className="space-y-1">
                {viewBooking.tests.map((id) => {
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
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span>{formatCurrency(viewBooking.totalAmount)}</span>
              </div>
              {viewPayment && viewPayment.status !== "pending" && (
                <div className="p-2 bg-green-50 rounded text-sm text-green-700">
                  Paid via {viewPayment.method} on{" "}
                  {formatDate(viewPayment.paidAt!)}
                  {viewPayment.status === "partial" &&
                    ` — Partial: ₹${viewPayment.partialAmount}`}
                </div>
              )}
              {(!viewPayment ||
                viewPayment.status === "pending" ||
                viewPayment.status === "partial") && (
                <div className="space-y-3 border-t pt-3">
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Payment Method
                    </div>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    >
                      {METHODS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={markPaid}
                      disabled={saving}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {saving ? "Saving..." : "Mark as Paid"}
                    </Button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      value={partialAmt}
                      onChange={(e) => setPartialAmt(e.target.value)}
                      placeholder="Partial amount (₹)"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={markPartial}
                      disabled={saving}
                    >
                      Mark Partial
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
