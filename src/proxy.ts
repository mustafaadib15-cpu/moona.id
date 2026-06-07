import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

// Next.js 16 proxy (the renamed middleware). Keeps the Supabase session fresh.
// Heavy logic lives in updateSession; this stays thin.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on every path except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
