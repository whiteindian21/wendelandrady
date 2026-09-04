Customization
Branding: Update app/layout.tsx and components/site-header.tsx.
Plans: Update config/plans.ts (or config/stripe.ts) to change limits and features.
Database: Add new tables via supabase/migrations/ and run npx supabase db push.
Usage Metrics: Add new limits to config/plans.ts and enforce them via lib/usage.ts.