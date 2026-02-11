import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/login";
import { DashboardPage } from "./pages/dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
]);
