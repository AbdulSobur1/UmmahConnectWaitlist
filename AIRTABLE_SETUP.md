# Airtable setup

Create an Airtable base with a table named `Waitlist`.

Add these fields:

| Field name | Type |
| --- | --- |
| First Name | Single line text |
| Last Name | Single line text |
| Email | Email |
| City | Single select or single line text |
| Industry | Single select or single line text |
| Joined At | Date |

Create a personal access token from Airtable Developer Hub with these scopes:

```text
data.records:read
data.records:write
schema.bases:read
```

Give the token access to the waitlist base.

Set these environment variables in `.env.local` and Vercel:

```bash
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_NAME=Waitlist
```

The base ID starts with `app` and is visible in Airtable's API docs for your base.
