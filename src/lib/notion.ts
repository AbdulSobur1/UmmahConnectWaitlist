import { Client } from "@notionhq/client";

export type WaitlistEntry = {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  industry: string;
};

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "";

function assertNotionConfig() {
  if (!process.env.NOTION_API_KEY || !DATABASE_ID) {
    throw new Error("Missing NOTION_API_KEY or NOTION_DATABASE_ID.");
  }
}

export async function addToWaitlist(entry: WaitlistEntry) {
  assertNotionConfig();

  return notion.pages.create({
    parent: {
      database_id: DATABASE_ID,
    },
    properties: {
      "First Name": {
        title: [
          {
            text: {
              content: entry.firstName,
            },
          },
        ],
      },
      "Last Name": {
        rich_text: [
          {
            text: {
              content: entry.lastName,
            },
          },
        ],
      },
      Email: {
        email: entry.email,
      },
      City: {
        select: {
          name: entry.city,
        },
      },
      Industry: {
        select: {
          name: entry.industry,
        },
      },
      "Joined At": {
        date: {
          start: new Date().toISOString(),
        },
      },
    },
  });
}

export async function getWaitlistCount(): Promise<number> {
  assertNotionConfig();

  let count = 0;
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      page_size: 100,
      start_cursor: cursor,
    });

    count += response.results.length;
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return count;
}

export async function isEmailAlreadyRegistered(email: string): Promise<boolean> {
  assertNotionConfig();

  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    page_size: 1,
    filter: {
      property: "Email",
      email: {
        equals: email,
      },
    },
  });

  return response.results.length > 0;
}
