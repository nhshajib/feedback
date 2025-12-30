import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("create-account", "routes/create-account.tsx"),
  route("login", "routes/login.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("submit-feedback", "routes/submit-feedback.tsx"),
  route("view-feedback", "routes/view-feedback.tsx"),
  route("instructor-dashboard", "routes/instructor-dashboard.tsx"),
  route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;
