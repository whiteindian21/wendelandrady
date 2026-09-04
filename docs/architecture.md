Architecture
The app follows a strict Server/Client boundary.

Server Components fetch data and check permissions.
Client Components handle interactivity via Server Actions.
Supabase RLS enforces multi-tenant isolation at the database level.