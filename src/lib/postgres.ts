import { Pool } from "pg";

export type WaitlistEntry = {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  industry: string;
};

declare global {
  // eslint-disable-next-line no-var
  var waitlistPool: Pool | undefined;
}

function getConnectionString() {
  const connectionString =
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    throw new Error("Missing POSTGRES_URL or DATABASE_URL.");
  }

  return connectionString;
}

function getPool() {
  if (!globalThis.waitlistPool) {
    globalThis.waitlistPool = new Pool({
      connectionString: getConnectionString(),
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 1,
      query_timeout: 5000,
    });
  }

  return globalThis.waitlistPool;
}

async function ensureWaitlistTable() {
  await getPool().query(`
    create table if not exists waitlist_entries (
      id bigserial primary key,
      first_name text not null,
      last_name text not null,
      email text not null unique,
      city text not null,
      industry text not null,
      joined_at timestamptz not null default now()
    );
  `);
}

export async function addToWaitlist(entry: WaitlistEntry) {
  await ensureWaitlistTable();

  await getPool().query(
    `
      insert into waitlist_entries (first_name, last_name, email, city, industry)
      values ($1, $2, $3, $4, $5)
    `,
    [entry.firstName, entry.lastName, entry.email, entry.city, entry.industry],
  );
}

export async function getWaitlistCount(): Promise<number> {
  await ensureWaitlistTable();

  const result = await getPool().query<{ count: string }>(
    "select count(*)::text as count from waitlist_entries",
  );

  return Number(result.rows[0]?.count ?? 0);
}

export async function isEmailAlreadyRegistered(email: string): Promise<boolean> {
  await ensureWaitlistTable();

  const result = await getPool().query(
    "select id from waitlist_entries where lower(email) = lower($1) limit 1",
    [email],
  );

  return (result.rowCount ?? 0) > 0;
}
