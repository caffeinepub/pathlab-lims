import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { seedDefaultData } from "./lib/seedData";
import Approval from "./pages/Approval";
import Billing from "./pages/Billing";
import Bookings from "./pages/Bookings";
import Dashboard from "./pages/Dashboard";
import Outsource from "./pages/Outsource";
import Patients from "./pages/Patients";
import Reports from "./pages/Reports";
import Results from "./pages/Results";
import Samples from "./pages/Samples";
import Settings from "./pages/Settings";
import Tests from "./pages/Tests";
import Worklist from "./pages/Worklist";
import { useLimsStore } from "./store/useLimsStore";

function RootLayout() {
  const loadAll = useLimsStore((s) => s.loadAll);
  const initialized = useLimsStore((s) => s.initialized);

  useEffect(() => {
    const init = async () => {
      await seedDefaultData();
      await loadAll();
    };
    init();
  }, [loadAll]);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7FB]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-gray-500">Loading PathLab LIMS...</div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});
const patientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patients",
  component: Patients,
});
const testsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tests",
  component: Tests,
});
const bookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bookings",
  component: Bookings,
});
const samplesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/samples",
  component: Samples,
});
const worklistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worklist",
  component: Worklist,
});
const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/results",
  component: Results,
  validateSearch: (search: Record<string, unknown>) => ({
    bookingId:
      typeof search.bookingId === "string" ? search.bookingId : undefined,
  }),
});
const approvalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/approval",
  component: Approval,
});
const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: Reports,
});
const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/billing",
  component: Billing,
});
const outsourceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/outsource",
  component: Outsource,
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  patientsRoute,
  testsRoute,
  bookingsRoute,
  samplesRoute,
  worklistRoute,
  resultsRoute,
  approvalRoute,
  reportsRoute,
  billingRoute,
  outsourceRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
