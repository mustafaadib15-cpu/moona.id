import { redirect } from "next/navigation";

// Entry point. Phase 1 will resolve the session here and route by role
// (admin -> /admin, client -> /dashboard). For now, send visitors to login.
export default function Home() {
  redirect("/login");
}
