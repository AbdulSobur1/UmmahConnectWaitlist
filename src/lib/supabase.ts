export type WaitlistEntry = {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  industry: string;
};

const TABLE_NAME = "waitlist_entries";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return { url, serviceRoleKey };
}

function getHeaders(extraHeaders?: HeadersInit): HeadersInit {
  const { serviceRoleKey } = getSupabaseConfig();

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extraHeaders,
  };
}

async function supabaseFetch(path: string, init?: RequestInit) {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: getHeaders(init?.headers),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response;
}

function readCount(response: Response): number {
  const contentRange = response.headers.get("content-range");
  const count = contentRange?.match(/\/(\d+)$/)?.[1];

  return count ? Number(count) : 0;
}

export async function addToWaitlist(entry: WaitlistEntry) {
  await supabaseFetch(TABLE_NAME, {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      first_name: entry.firstName,
      last_name: entry.lastName,
      email: entry.email,
      city: entry.city,
      industry: entry.industry,
    }),
  });
}

export async function getWaitlistCount(): Promise<number> {
  const response = await supabaseFetch(`${TABLE_NAME}?select=id`, {
    method: "HEAD",
    headers: {
      Prefer: "count=exact",
    },
  });

  return readCount(response);
}

export async function isEmailAlreadyRegistered(email: string): Promise<boolean> {
  const response = await supabaseFetch(
    `${TABLE_NAME}?select=id&email=eq.${encodeURIComponent(email)}&limit=1`,
    {
      method: "GET",
    },
  );
  const records = (await response.json()) as unknown[];

  return records.length > 0;
}
