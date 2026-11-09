# RepairFlow cloud setup

RepairFlow runs in portfolio mode when cloud environment variables are absent. To enable live accounts and durable data:

1. Create a Supabase project.
2. Apply `migrations/202611090001_repairflow_foundation.sql` with the Supabase CLI or SQL editor.
3. Add the application URL and `/auth/callback` URL to the Supabase Auth redirect allow list.
4. Configure these deployment environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Older Supabase projects can use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead of the publishable key. Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable or browser code.

Private uploads use the `repair-attachments` bucket and this path shape:

```text
{organization_id}/{ticket_id}/{unique_file_name}
```

The migration creates customer, technician, service advisor, administrator, and owner access rules. Browser requests always use the authenticated user's row-level security policies. Server-only administration uses `lib/supabase/admin.ts`.
