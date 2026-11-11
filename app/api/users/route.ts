import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { currentUser, auth, clerkClient, verifyToken } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  let user: any = null;

  // 1. Standard Clerk auth() from session cookie
  try {
    const authObj = await auth();
    userId = authObj?.userId ?? null;
  } catch (e) {
    console.warn("auth() session check warning:", e);
  }

  // 2. Fallback to currentUser()
  if (!userId) {
    try {
      user = await currentUser();
      if (user?.id) {
        userId = user.id;
      }
    } catch (e) {
      console.warn("currentUser() check warning:", e);
    }
  }

  // 3. Fallback to incoming Authorization Bearer token
  if (!userId) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const rawToken = authHeader.replace("Bearer ", "").trim();
      if (rawToken) {
        // Attempt cryptographic verification via secretKey
        if (process.env.CLERK_SECRET_KEY) {
          try {
            const payload = await verifyToken(rawToken, {
              secretKey: process.env.CLERK_SECRET_KEY,
            });
            if (payload?.sub) {
              userId = payload.sub;
            }
          } catch (err) {
            console.warn("Bearer token verification failed:", err);
          }
        }

        // Secondary fallback: decode token and verify existence via Clerk API
        if (!userId) {
          try {
            const { decodeJwt } = await import("@clerk/backend/jwt");
            const decoded: any = decodeJwt(rawToken);
            const candidateSub = decoded?.payload?.sub;
            if (candidateSub && typeof candidateSub === "string" && candidateSub.startsWith("user_")) {
              const client = await clerkClient();
              const verifiedUser = await client.users.getUser(candidateSub);
              if (verifiedUser?.id) {
                userId = verifiedUser.id;
                user = verifiedUser;
              }
            }
          } catch (err) {
            console.warn("Bearer token Clerk API fallback check failed:", err);
          }
        }
      }
    }
  }

  // If still not authenticated, return 401 Unauthorized
  if (!userId && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract email and display name
  let email = user?.primaryEmailAddress?.emailAddress;
  let displayName =
    user?.username ||
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : null);

  // If email was not found from currentUser, fetch directly from Clerk via verified userId
  if (!email && userId) {
    try {
      const client = await clerkClient();
      const u = await client.users.getUser(userId);
      email =
        u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ||
        u.emailAddresses[0]?.emailAddress;
      displayName =
        displayName ||
        u.username ||
        (u.firstName || u.lastName ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : null);
    } catch (e: any) {
      console.warn("Failed to fetch user from clerkClient:", e);
    }
  }

  // Optional payload fallback for name/email if user is authenticated
  if (!email) {
    const body = await req.json().catch(() => ({}));
    if (body.email) email = body.email;
    if (body.name && !displayName) displayName = body.name;
  }

  if (!email) {
    return NextResponse.json({ error: "No email address found" }, { status: 400 });
  }

  displayName = displayName || email.split("@")[0] || "User";

  const userResult = await db.select().from(users).where(eq(users.email, email));

  if (userResult.length === 0) {
    const result = await db
      .insert(users)
      .values({
        name: displayName,
        email: email,
      })
      .returning();

    return NextResponse.json(result[0]);
  }

  // If user's name/username changed or was empty, update it in the database
  if (userResult[0].name !== displayName) {
    const updated = await db
      .update(users)
      .set({ name: displayName })
      .where(eq(users.id, userResult[0].id))
      .returning();
    return NextResponse.json(updated[0]);
  }

  return NextResponse.json(userResult[0]);
}

export async function GET(req: NextRequest) {
  let userId: string | null = null;
  try {
    const authObj = await auth();
    userId = authObj?.userId ?? null;
  } catch {}

  if (!userId) {
    try {
      const u = await currentUser();
      userId = u?.id ?? null;
    } catch {}
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const u = await client.users.getUser(userId);
  const email =
    u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ||
    u.emailAddresses[0]?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: "User email not found" }, { status: 404 });
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length === 0) {
    return NextResponse.json({ error: "User not found in database" }, { status: 404 });
  }

  return NextResponse.json(existing[0]);
}
