export type WaitlistEntry = {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  industry: string;
};

type AirtableListResponse = {
  records: Array<{
    id: string;
    fields: Record<string, unknown>;
  }>;
  offset?: string;
};

function getAirtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME ?? "Waitlist";

  if (!apiKey || !baseId) {
    throw new Error("Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID.");
  }

  return { apiKey, baseId, tableName };
}

function escapeFormulaValue(value: string): string {
  return value.replace(/'/g, "\\'");
}

function getTableUrl() {
  const { baseId, tableName } = getAirtableConfig();

  return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
}

async function airtableFetch(searchParams?: URLSearchParams, init?: RequestInit) {
  const { apiKey } = getAirtableConfig();
  const queryString = searchParams ? `?${searchParams.toString()}` : "";
  const response = await fetch(`${getTableUrl()}${queryString}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response;
}

export async function addToWaitlist(entry: WaitlistEntry) {
  await airtableFetch(undefined, {
    method: "POST",
    body: JSON.stringify({
      records: [
        {
          fields: {
            "First Name": entry.firstName,
            "Last Name": entry.lastName,
            Email: entry.email,
            City: entry.city,
            Industry: entry.industry,
            "Joined At": new Date().toISOString(),
          },
        },
      ],
    }),
  });
}

export async function getWaitlistCount(): Promise<number> {
  let count = 0;
  let offset: string | undefined;

  do {
    const searchParams = new URLSearchParams({
      pageSize: "100",
    });
    searchParams.append("fields[]", "Email");

    if (offset) {
      searchParams.set("offset", offset);
    }

    const response = await airtableFetch(searchParams);
    const data = (await response.json()) as AirtableListResponse;

    count += data.records.length;
    offset = data.offset;
  } while (offset);

  return count;
}

export async function isEmailAlreadyRegistered(email: string): Promise<boolean> {
  const searchParams = new URLSearchParams({
    pageSize: "1",
    filterByFormula: `LOWER({Email}) = '${escapeFormulaValue(email.toLowerCase())}'`,
  });
  searchParams.append("fields[]", "Email");

  const response = await airtableFetch(searchParams);
  const data = (await response.json()) as AirtableListResponse;

  return data.records.length > 0;
}
