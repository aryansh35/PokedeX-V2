"use server";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Bypass SRM certificate failures project-wide 🛡️

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginToSRM, scrapeEverything } from "@/lib/scraper";

// Session Handshake Utilities
async function getSessionSeed() {
  const seedRes = await fetch("https://academia.srmist.edu.in/accounts/p/40-10002227248/signin", { 
    headers: { "User-Agent": "Mozilla/5.0" } 
  });
  const seedCookies = (seedRes.headers as any).getSetCookie?.()?.map((c: any) => c.split(";")[0]).join("; ") || "";
  const iamcsr = seedCookies.match(/iamcsr=([^;]+)/)?.[1] || "";
  return { seedCookies, iamcsr };
}

export async function validateUser(username: string) {
  try {
    const { seedCookies, iamcsr } = await getSessionSeed();
    
    const res = await fetch(`https://academia.srmist.edu.in/accounts/p/40-10002227248/signin/v2/lookup/${username}`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        "cookie": seedCookies,
        "x-zcsrf-token": `iamcsrcoo=${iamcsr}`,
        "User-Agent": "Mozilla/5.0"
      },
      body: `mode=primary&cli_time=${Date.now()}&servicename=ZohoCreator&service_language=en&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin`,
    });
    
    const response = await res.json();
    
    // Store seed cookies in a temporary cookie for the next step
    const cookieStore = await cookies();
    cookieStore.set("auth_seed", seedCookies, { httpOnly: true, maxAge: 300 });
    cookieStore.set("auth_csr", iamcsr, { httpOnly: true, maxAge: 300 });

    return { res: {
      data: {
        identifier: response.lookup?.identifier,
        digest: response.lookup?.digest,
        status_code: response.status_code,
        message: response.message
      }
    }};
  } catch (error) {
    console.error("❌ [AUTH] Lookup failed:", error);
    return { res: { error: "Failed to validate user" } };
  }
}

export async function validatePassword({ digest, identifier, password }: any) {
  try {
    const cookieStore = await cookies();
    const seedCookies = cookieStore.get("auth_seed")?.value || "";
    const iamcsr = cookieStore.get("auth_csr")?.value || "";

    const res = await fetch(`https://academia.srmist.edu.in/accounts/p/40-10002227248/signin/v2/primary/${identifier}/password?digest=${digest}&cli_time=${Date.now()}&servicename=ZohoCreator&service_language=en&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        "cookie": seedCookies,
        "x-zcsrf-token": `iamcsrcoo=${iamcsr}`,
        "User-Agent": "Mozilla/5.0"
      },
      body: `{"passwordauth":{"password":"${password}"}}`,
    });

    if (res.redirected && res.url && res.url.includes("sessions-reminder")) {
      return { res: { data: { statusCode: 435, message: "Max concurrent sessions reached", isConcurrentLimit: true } }, isAuthenticated: false };
    }

    const bodyText = await res.text();
    let data: any;
    try {
      data = JSON.parse(bodyText);
    } catch {
      if (bodyText.toLowerCase().includes("concurrent")) {
        return { res: { data: { statusCode: 435, message: "Max concurrent sessions reached", isConcurrentLimit: true } }, isAuthenticated: false };
      }
      return { res: { error: "Invalid response from server" } };
    }

    const setCookie = res.headers.get("set-cookie");
    let matchCount = 0;
    if (setCookie) {
      matchCount = [...setCookie.matchAll(/(_(?:iamadt|iambdt)_client_\d+|_z_identity)=[^;]+/g)].length;
    }

    let isConcurrent = data.status_code === 435 || 
                        String(data.message).toLowerCase().includes("concurrent") || 
                        String(data.localized_message).toLowerCase().includes("concurrent") ||
                        !!data.flowId;

    // Reddy Hack: If we only get 1 or 2 cookies instead of the full set, it's often a session warning state
    if (data.status_code === 201 && matchCount < 2) {
      isConcurrent = true;
    }

    let finalCookies = "";
    if (setCookie && data.status_code === 201) {
       const matches = [...setCookie.matchAll(/(_(?:iamadt|iambdt)_client_\d+|_z_identity)=[^;]+/g)];
       finalCookies = [seedCookies, ...matches.map((m) => m[0])].join("; ");
    }

    return { res: {
      data: {
        statusCode: isConcurrent ? 435 : data.status_code,
        message: isConcurrent ? "Max concurrent sessions reached" : (data.message || data.localized_message),
        cookies: finalCookies,
        isConcurrentLimit: isConcurrent
      },
      isAuthenticated: data.status_code === 201 && !isConcurrent
    }};
  } catch (e) {
    console.error("❌ [AUTH] Password check failed:", e);
    return { res: { error: "Failed to validate Password" } };
  }
}

export async function loginAction(formData: FormData) {
  const emailInput = formData.get("email") as string;
  const email = emailInput.includes("@") ? emailInput : `${emailInput}@srmist.edu.in`;
  const password = formData.get("password") as string;

  if (!email || !password) return { success: false, error: "Credentials required" };

  try {
    const result = await loginToSRM(email, password);
    if (result.success && result.cookies) {
      const cookieStore = await cookies();
      cookieStore.set("token", result.cookies, { httpOnly: true, secure: true, maxAge: 2592000, path: "/" });
      cookieStore.set("user", email, { httpOnly: true, secure: true, maxAge: 2592000, path: "/" });
      return { success: true };
    }
    return { success: false, error: result.error || "Authentication failed" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("user");
  cookieStore.delete("auth_seed");
  cookieStore.delete("auth_csr");
  redirect("/login");
}

export async function getDashboardData(targets?: string[]) {
  const cookieStore = await cookies();
  const session = cookieStore.get("token")?.value;
  const userEmail = cookieStore.get("user")?.value;

  if (!session) redirect("/login");

  try {
    let data: any = {};
    const hasOnlyDayOrder = targets?.length === 1 && targets[0] === "dayOrder";
    
    if (!hasOnlyDayOrder) {
      const scraped = await scrapeEverything(session, userEmail, targets);
      data = { ...scraped };
    }
    
    if (targets?.includes("dayOrder")) {
      const { scrapeDayOrder } = await import("@/lib/scraper");
      const { getDayOrderFromPlanner } = await import("@/lib/planner-data");
      const scraped = await scrapeDayOrder(session);
      data.dayOrder = scraped || getDayOrderFromPlanner(new Date());
    }
    
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDayOrderAction() {
  const cookieStore = await cookies();
  const session = cookieStore.get("token")?.value;
  const { getDayOrderFromPlanner } = await import("@/lib/planner-data");
  const fallbackOrder = getDayOrderFromPlanner(new Date());

  if (!session) return { success: true, dayOrder: fallbackOrder };

  try {
    const { scrapeDayOrder } = await import("@/lib/scraper");
    const dayOrder = await scrapeDayOrder(session);
    return { success: true, dayOrder: dayOrder || fallbackOrder };
  } catch (error: any) {
    return { success: true, dayOrder: fallbackOrder };
  }
}