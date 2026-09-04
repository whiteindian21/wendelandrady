import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { enforceUsageLimit } from "@/lib/usage";

export async function GET(req: NextRequest) {
  // 1. Extract the API key from the Authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing or invalid Authorization header." }, { status: 401 });
  }

  const rawKey = authHeader.replace("Bearer ", "").trim();

  // 2. Validate the key (this also records the usage automatically!)
  const orgId = await validateApiKey(rawKey);
  if (!orgId) {
    return NextResponse.json({ error: "Invalid or revoked API key." }, { status: 403 });
  }

  // 3. Enforce the usage limit (throws if they exceeded their plan's limit)
  try {
    await enforceUsageLimit(orgId, "maxApiRequests");
  } catch {
    return NextResponse.json({ error: "Usage limit exceeded. Please upgrade your plan." }, { status: 429 });
  }

  // 4. Return the secure data
  return NextResponse.json({ 
    message: "Secure API request successful!",
    organizationId: orgId 
  });
}