# Vercel Postgres setup

Vercel Postgres is now provided through Vercel Marketplace integrations such as Neon.

1. Open your Vercel project.
2. Go to `Storage` or `Marketplace`.
3. Choose a Postgres provider, such as Neon.
4. Connect it to this project.
5. Make sure Vercel adds a connection string environment variable.

This app reads the first available value from:

```bash
POSTGRES_URL=
DATABASE_URL=
POSTGRES_PRISMA_URL=
```

No manual SQL setup is required. The API creates this table automatically:

```sql
create table if not exists waitlist_entries (
  id bigserial primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  city text not null,
  industry text not null,
  joined_at timestamptz not null default now()
);
```

After connecting the database, redeploy the project so the production function can read the new environment variables.
