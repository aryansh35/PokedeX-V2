import { load } from "cheerio";

const BASE_URL = "https://academia.srmist.edu.in";

export async function loginToSRM(emailInput: string, password: string) {
    console.log(`🔑 [POKÉDEX] INITIATING AUTHENTICATION HANDSHAKE FOR: ${emailInput}`);
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const email = emailInput.includes("@") ? emailInput : `${emailInput}@srmist.edu.in`;
    
    // 1. Get Init Session
    console.log("🛰️ [POKÉDEX] ESTABLISHING INITIAL SESSION SEED...");
    const seedRes = await fetch(`${BASE_URL}/accounts/p/40-10002227248/signin`, { headers: { "User-Agent": "Mozilla/5.0" } });
    const seedCookies = (seedRes.headers as any).getSetCookie?.()?.map((c: any) => c.split(";")[0]).join("; ") || "";
    const iamcsr = seedCookies.match(/iamcsr=([^;]+)/)?.[1] || "";
    console.log("✅ [POKÉDEX] SESSION SEED ACQUIRED.");

    // 2. Identity Lookup
    console.log("🔍 [POKÉDEX] VERIFYING IDENTITY ON SRM NETWORK...");
    const idRes = await fetch(`${BASE_URL}/accounts/p/40-10002227248/signin/v2/lookup/${encodeURIComponent(email)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": seedCookies, "x-zcsrf-token": `iamcsrcoo=${iamcsr}`, "User-Agent": "Mozilla/5.0" },
      body: `mode=primary&cli_time=${Date.now()}&orgtype=40&serviceurl=${BASE_URL}/portal/academia-academic-services/redirectFromLogin`
    });
    const idData = await idRes.json();
    if (!idData.lookup) {
      console.log("❌ [POKÉDEX] IDENTITY VERIFICATION FAILED: USER NOT FOUND.");
      return { success: false, error: "User not found" };
    }
    console.log("✅ [POKÉDEX] IDENTITY CONFIRMED.");

    // 3. Password Auth
    console.log("🛡️ [POKÉDEX] EXECUTING SECURE PASSWORD HANDSHAKE...");
    const pwdRes = await fetch(`${BASE_URL}/accounts/p/40-10002227248/signin/v2/primary/${idData.lookup.identifier}/password?digest=${idData.lookup.digest}&cli_time=${Date.now()}&orgtype=40`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": seedCookies, "x-zcsrf-token": `iamcsrcoo=${iamcsr}`, "User-Agent": "Mozilla/5.0" },
      body: JSON.stringify({ passwordauth: { password } })
    });
    
    if (pwdRes.status !== 200) {
      console.log("❌ [POKÉDEX] AUTHENTICATION FAILED: INVALID CREDENTIALS.");
      return { success: false, error: "Login Failed" };
    }

    const finalCookies = [seedCookies, ...(pwdRes.headers as any).getSetCookie?.()?.map((c: any) => c.split(";")[0]) || []].join("; ");
    console.log("🔓 [POKÉDEX] AUTHENTICATION GRANTED. SESSION TOKEN SYNCHRONIZED.");
    return { success: true, cookies: finalCookies };
}

async function fetchSanitized(url: string, cookies: string) {
  try {
    const res = await fetch(url, { headers: { "Cookie": cookies, "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
    
    // If we're redirected to the sign-in page, the session is dead
    if (res.url.includes("signin") || res.url.includes("accounts.srmist.edu.in")) {
      return "AUTH_ERROR";
    }

    const raw = await res.text();
    const match = raw.match(/\.sanitize\(\s*(['"])((?:(?!\1)[\s\S]|\\\1)*)\1\s*\)/);
    if (!match) return "";
    return match[2].replace(/\\x([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\(.)/g, "$1");
  } catch { return ""; }
}

export async function scrapeEverything(cookies: string, loginEmail?: string, targets: string[] = ["attendance", "marks", "courses", "profile"]) {
  console.log(`🚀 [POKÉDEX] INITIALIZING TARGETED EXTRACTION: [${targets.join(", ")}]`);
  const data: any = { attendance: [], marks: [], courses: [], profile: { advisors: [] } };
  
  const shouldFetch = (t: string) => targets.includes(t);

  console.log("🛰️ [POKÉDEX] FETCHING INTEL FROM ACADEMIA...");
  
  let attHtml = "";
  if (shouldFetch("attendance") || shouldFetch("marks") || shouldFetch("profile")) {
     attHtml = await fetchSanitized(`${BASE_URL}/srm_university/academia-academic-services/page/My_Attendance`, cookies);
     if (attHtml === "AUTH_ERROR") throw new Error("AUTH_ERROR");
  }

  let marksHtml = "";
  if (shouldFetch("marks") || shouldFetch("profile")) {
     marksHtml = await fetchSanitized(`${BASE_URL}/srm_university/academia-academic-services/page/My_Internal_Marks`, cookies);
     if (marksHtml === "AUTH_ERROR") throw new Error("AUTH_ERROR");
     if (!marksHtml && attHtml) {
        console.log("💡 [POKÉDEX] ATTENDANCE DETECTED; FALLING BACK TO INTEGRATED MARKS SCAN.");
        marksHtml = attHtml;
     }
  }

  // Try multiple timetable URLs to find the active one
  let ttHtml = "";
  if (shouldFetch("courses") || shouldFetch("profile")) {
    const ttUrls = [
      `${BASE_URL}/srm_university/academia-academic-services/page/My_Time_Table_2025_26`,
      `${BASE_URL}/srm_university/academia-academic-services/page/My_Time_Table_2024_25`,
      `${BASE_URL}/srm_university/academia-academic-services/page/My_Time_Table_2023_24`,
      `${BASE_URL}/srm_university/academia-academic-services/page/My_Time_Table`
    ];

    for (const url of ttUrls) {
      console.log(`🔍 [POKÉDEX] PROBING TIMETABLE PATH: ${url.split('/').pop()}`);
      ttHtml = await fetchSanitized(url, cookies);
      if (ttHtml === "AUTH_ERROR") throw new Error("AUTH_ERROR");
      if (ttHtml && ttHtml.includes("Course Code")) {
        console.log("✅ [POKÉDEX] TIMETABLE MATRIX IDENTIFIED.");
        break;
      }
    }
  }

  const $att = attHtml ? load(attHtml) : null;
  const $marks = marksHtml ? load(marksHtml) : null;
  const $tt = ttHtml ? load(ttHtml) : null;

  if (!$att && !$tt && !$marks) {
    console.log("❌ [POKÉDEX] MISSION FAILURE: NO SOURCE INTEL RETRIEVED.");
    return data;
  }

  // Profile - Multi-Tier Precision Extraction
  const getFromSource = (source: any, label: string) => {
    if (!source) return "";
    const el = source(`td:contains('${label}')`).filter((_: any, e: any) => source(e).text().trim().replace(":", "") === label);
    return el.next().text().replace(":", "").trim();
  };

  const clean = (s: string) => s.replace(/<[^>]*>/g, "").trim();

  const regNo = clean(getFromSource($marks, "Registration Number") || getFromSource($att, "Registration Number") || (ttHtml ? (ttHtml.match(/Registration Number:<\/td>\s*<td>\s*<strong>(.*?)<\/strong>/i)?.[1] || "") : ""));
  const name = clean(getFromSource($marks, "Name") || getFromSource($att, "Name") || (ttHtml ? (ttHtml.match(/Name:<\/td>\s*<td>\s*<strong>(.*?)<\/strong>/i)?.[1] || "") : ""));
  const batchRaw = (ttHtml ? (ttHtml.match(/Combo\s*\/\s*Batch:?<\/td>\s*<td>\s*(?::<\/td>\s*<td>\s*)?<strong>(.*?)<\/strong>/i)?.[1] || "") : "");
  const batchValue = clean(batchRaw);
  const batch = getFromSource($marks, "Batch") || getFromSource($att, "Batch") || (batchValue.includes("/") ? batchValue.split("/").pop()?.trim() : batchValue) || "";
  
  const mobile = clean((ttHtml ? (ttHtml.match(/Mobile:?<\/td>\s*<td>\s*<strong>(\d+)<\/strong>/i)?.[1] || "") : "") || getFromSource($marks, "Mobile") || getFromSource($att, "Mobile"));
  const program = clean((ttHtml ? (ttHtml.match(/Program:?<\/td>\s*<td>\s*<strong>(.*?)<\/strong>/i)?.[1] || "") : "") || getFromSource($marks, "Program") || getFromSource($att, "Program"));

  const deptText = $tt ? $tt("td:contains('Department:')").next().text() : "";
  const sectionMatch = deptText.match(/\(([^(\s]+)\s+Section\)/i);
  const section = sectionMatch ? sectionMatch[1] : "N/A";

  const deptMatch = deptText.match(/^(.*?)\((.*?)\)/i);
  const mainDept = deptMatch ? deptMatch[1].trim() : deptText.split("-")[0].split("(")[0].trim();
  const spec = deptMatch ? deptMatch[2].trim() : "";

  data.profile = { 
    regNo, name, email: loginEmail || (regNo ? `${regNo.toLowerCase()}@srmist.edu.in` : ""),
    phone: mobile, program, section, batch, department: mainDept, specialization: spec,
    advisors: [] 
  };

  console.log(`👤 [POKÉDEX] PROFILE: ${name} (${regNo}) | BATCH: ${batch}`);

  // Attendance
  if ($att) {
    $att("tr").each((_, row) => {
      const cols = $att(row).find("td");
      const code = $att(cols[0]).text().match(/[A-Z0-9]{5,}/)?.[0];
      if (code && cols.length >= 9) {
        const cond = parseInt($att(cols[6]).text()) || 0, abs = parseInt($att(cols[7]).text()) || 0;
        const stat = calculateStatus(cond, abs);
        data.attendance.push({ 
          courseCode: code, 
          courseTitle: $att(cols[1]).text().trim(), 
          type: $att(cols[2]).text().trim(), 
          conducted: cond, absent: abs, attendance: $att(cols[8]).text().trim(), status: stat.status, margin: stat.margin || stat.required 
        });
      }
    });
    console.log(`📊 [POKÉDEX] ATTENDANCE: ${data.attendance.length} RECORDS SYNCED.`);
  }

  // Marks
  if (attHtml) {
    const marksBlock = attHtml.split(/Internal Marks/i)[1] || "";
    const $marksLocal = load(marksBlock);
    $marksLocal("tr").each((_, row) => {
      const cols = $marksLocal(row).find("td");
      const code = $marksLocal(cols[0]).text().match(/[A-Z0-9]{5,}/)?.[0];
      if (code && cols.length >= 3) {
        const scores: any[] = [];
        $marksLocal(cols[2]).find("td").each((_, s) => {
          const l = $marksLocal(s).find("strong").text().trim();
          const v = $marksLocal(s).find("font").html()?.split("<br>")[1] || $marksLocal(s).text().trim().split("\n").pop();
          if (l && v) scores.push({ label: l, value: v.trim() });
        });
        if (scores.length > 0) {
          data.marks.push({ courseCode: code, courseType: $marksLocal(cols[1]).text().trim(), scores });
        }
      }
    });
    console.log(`🏆 [POKÉDEX] MARKS: ${data.marks.length} COURSES ANALYZED.`);
  }

  // Timetable & Advisors
  if ($tt) {
    $tt("table.course_tbl tr").each((_, el) => {
      const cols = $tt(el).find("td");
      if (cols.length >= 10 && $tt(cols[1]).text().trim() !== "Course Code") {
        data.courses.push({
          code: $tt(cols[1]).text().trim(), title: $tt(cols[2]).text().trim(),
          credit: $tt(cols[3]).text().trim(), category: $tt(cols[5]).text().trim(),
          type: $tt(cols[6]).text().trim(), faculty: $tt(cols[7]).text().trim(),
          slot: $tt(cols[8]).text().trim(), room: $tt(cols[9]).text().trim()
        });
      }
    });

    $tt("td[align='center']").each((_, el) => {
      if ($tt(el).text().includes("Advisor")) {
        data.profile.advisors.push({ 
          name: $tt(el).find("strong").html()?.split("<br>")[0] || "",
          role: $tt(el).text().includes("Faculty") ? "Faculty Advisor" : "Academic Advisor",
          email: $tt(el).find("font[color='blue']").text().trim(),
          phone: $tt(el).find("font[color='green']").text().trim()
        });
      }
    });
    console.log(`📅 [POKÉDEX] TIMETABLE: ${data.courses.length} SLOTS SYNCED.`);
  }

  // Post-process Marks to add Title, Credits and Totals
  data.marks = data.marks.map((m: any) => {
    const course = data.attendance.find((a: any) => a.courseCode === m.courseCode) || data.courses.find((c: any) => c.code === m.courseCode);
    let totalObtained = 0;
    let totalMax = 0;
    
    m.scores.forEach((s: any) => {
      const obtained = parseFloat(s.value) || 0;
      const maxMatch = s.label.match(/\/([\d\.]+)/);
      const max = maxMatch ? parseFloat(maxMatch[1]) : 0;
      totalObtained += obtained;
      totalMax += max;
    });

    return { 
      ...m, 
      courseTitle: course?.courseTitle || course?.title || "Unknown Subject",
      credits: course?.credits || course?.credit || "0",
      totalObtained: totalObtained.toFixed(2),
      totalMax: totalMax.toFixed(2)
    };
  });

  return data;
}

function calculateStatus(c: number, a: number) {
  const p = c - a, t = 0.75;
  if (c === 0) return { status: "safe", margin: 0 };
  return p/c >= t ? { status: "safe", margin: Math.floor(p/t - c) } : { status: "critical", required: Math.ceil((t*c - p)/(1-t)) };
}

export async function scrapeDayOrder(cookies: string) {
  console.log("📅 [POKÉDEX] PROBING ACADEMIA FOR LIVE DAY ORDER...");
  try {
    const html = await fetchSanitized(`${BASE_URL}/srm_university/academia-academic-services/page/Course_Details_Report`, cookies);
    if (!html) return 0;
    if (html === "AUTH_ERROR") throw new Error("AUTH_ERROR");

    const $ = load(html);
    const text = $("body").text();
    const match = text.match(/Day Order\s*(\d)/i);
    const order = match ? parseInt(match[1]) : 0;
    console.log(`✅ [POKÉDEX] LIVE DAY ORDER IDENTIFIED: DAY ${order}`);
    return order;
  } catch (e) {
    console.error("❌ [POKÉDEX] DAY ORDER EXTRACTION FAILED:", e);
    return 0;
  }
}