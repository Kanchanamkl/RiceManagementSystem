import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  // This is a simple check - in production you'd verify JWT tokens
  // For now, we rely on client-side auth context
  return NextResponse.next()
}

export const config = {
  matcher: ["/farmer/:path*", "/admin/:path*"],
}
