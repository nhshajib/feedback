import { createCookieSessionStorage, redirect } from "react-router";

export interface SessionStudent {
  id: string;
  full_name: string;
  section: string;
}

/**
 * Get session storage lazily to avoid crashing at module load.
 * Returns null if SESSION_SECRET is missing.
 */
function getSessionStorage() {
  const sessionSecret = process.env.SESSION_SECRET;
  const nodeEnv = process.env.NODE_ENV;
  const isProduction = nodeEnv === "production";

  if (!sessionSecret) {
    if (isProduction) {
      console.error("CRITICAL: SESSION_SECRET environment variable is required in production");
    } else {
      console.warn("WARNING: SESSION_SECRET not set. Using insecure fallback for development.");
    }
  }

  const useSecureCookies = isProduction;

  return {
    storage: createCookieSessionStorage({
      cookie: {
        name: "__session",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "lax",
        secrets: [sessionSecret || "dev-secret-please-change-in-production"],
        secure: useSecureCookies,
      },
    }),
    useSecureCookies,
    sessionSecret,
  };
}

export function createInstructorCookie(): string {
  const { useSecureCookies } = getSessionStorage();
  const cookieParts = [`instructor_auth=authenticated`];
  cookieParts.push(`HttpOnly`);
  if (useSecureCookies) {
    cookieParts.push(`Secure`);
  }
  cookieParts.push(`SameSite=Lax`);
  cookieParts.push(`Path=/`);
  cookieParts.push(`Max-Age=86400`);
  return cookieParts.join("; ");
}

export function destroyInstructorCookie(): string {
  const { useSecureCookies } = getSessionStorage();
  const cookieParts = [`instructor_auth=`];
  cookieParts.push(`HttpOnly`);
  if (useSecureCookies) {
    cookieParts.push(`Secure`);
  }
  cookieParts.push(`SameSite=Lax`);
  cookieParts.push(`Path=/`);
  cookieParts.push(`Max-Age=0`);
  return cookieParts.join("; ");
}

/**
 * Validates that required environment variables are set.
 * Returns an error response if validation fails.
 */
export function validateEnvironment(): Response | null {
  const { sessionSecret } = getSessionStorage();
  
  if (!sessionSecret) {
    return new Response(
      JSON.stringify({
        error: "Server configuration error: SESSION_SECRET is not set",
        message: "The server is not properly configured. Please contact the administrator.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  return null;
}

/**
 * Gets the session object from a request.
 */
export async function getSession(cookieHeader?: string | null) {
  const { storage } = getSessionStorage();
  return storage.getSession(cookieHeader);
}

/**
 * Commits a session and returns the Set-Cookie header.
 */
export async function commitSession(session: Awaited<ReturnType<typeof getSession>>) {
  const { storage } = getSessionStorage();
  return storage.commitSession(session);
}

/**
 * Destroys a session and returns the Set-Cookie header.
 */
export async function destroySession(session: Awaited<ReturnType<typeof getSession>>) {
  const { storage } = getSessionStorage();
  return storage.destroySession(session);
}

export async function createUserSession(student: SessionStudent, redirectTo: string) {
  const session = await getSession();
  session.set("student", student);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function getSessionStudent(request: Request): Promise<SessionStudent | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const student = session.get("student");
  return student || null;
}

export async function requireSessionStudent(request: Request, redirectTo: string = "/login"): Promise<SessionStudent> {
  const student = await getSessionStudent(request);
  if (!student) {
    throw redirect(redirectTo);
  }
  return student;
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
