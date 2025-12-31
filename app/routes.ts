import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("submit-feedback", "routes/submit-feedback.tsx"),
  route("view-feedback", "routes/view-feedback.tsx"),
  route("instructor", "routes/instructor-dashboard.tsx"),
] satisfies RouteConfig;
