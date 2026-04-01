import { format, subDays } from "date-fns";
import {
  AlertTriangle,
  CalendarCheck,
  DollarSign,
  FlaskConical,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatusBadge } from "../components/StatusBadge";
import {
  formatCurrency,
  formatDate,
  isThisMonth,
  isToday,
} from "../lib/limsUtils";
import { useLimsStore } from "../store/useLimsStore";

const COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default function Dashboard() {
  const { patients, bookings, payments, tests } = useLimsStore();

  const totalPatients = patients.length;
  const todayBookings = bookings.filter((b) => isToday(b.createdAt)).length;
  const pendingApproval = bookings.filter(
    (b) => b.status === "processing",
  ).length;
  const monthlyRevenue = payments
    .filter((p) => p.status !== "pending" && isThisMonth(p.createdAt))
    .reduce((sum, p) => sum + (p.partialAmount ?? p.amount), 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "MMM d");
    const count = bookings.filter(
      (b) => format(new Date(b.createdAt), "MMM d") === dateStr,
    ).length;
    return { date: dateStr, bookings: count };
  });

  const categoryData = Object.entries(
    tests.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value }));

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 8);

  const overdueCount = bookings.filter((b) => {
    if (b.status !== "pending") return false;
    return Date.now() - new Date(b.createdAt).getTime() > 24 * 3600 * 1000;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back. Here's your lab overview.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          color="blue"
          label="Total Patients"
          value={totalPatients}
        />
        <StatCard
          icon={CalendarCheck}
          color="green"
          label="Today's Bookings"
          value={todayBookings}
        />
        <StatCard
          icon={FlaskConical}
          color="purple"
          label="Pending Approval"
          value={pendingApproval}
        />
        <StatCard
          icon={DollarSign}
          color="orange"
          label="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
        />
      </div>

      {overdueCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">
            {overdueCount} booking(s) pending sample collection for more than 24
            hours.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Bookings — Last 7 Days
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Tests by Category
          </h3>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-gray-400 text-sm">
              No tests yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">
            Recent Bookings
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50">
                {[
                  "Booking ID",
                  "Patient",
                  "Tests",
                  "Amount",
                  "Status",
                  "Date",
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
              {recentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    No bookings yet
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-gray-50 hover:bg-gray-50"
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(b.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  value: string | number;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}
