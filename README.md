B2B SaaS OS

The production-ready Next.js + Supabase foundation for developers and agencies building secure, multi-tenant B2B SaaS applications.

Stop rebuilding authentication, organizations, billing, and security. Build your SaaS, not your infrastructure.

Features
Authentication — Email/password, Google OAuth, GitHub OAuth, and SSR sessions.
Multi-Tenancy — Organization-scoped data with strict Row Level Security (RLS).
RBAC — Owner, Admin, and Member roles with server-side enforcement.
Team Management — Secure team invitations with hashed tokens.
Stripe Billing — Subscriptions, Checkout, Customer Portal, and webhook synchronization.
API Keys — Secure generation, hashing, and usage tracking.
Usage Limits — Server-side enforcement tied to Stripe plans.
Audit Logs & Notifications — Built-in activity tracking and user alerts.
Feature Flags — Plan-based and organization-specific feature gating.
Tech Stack
Technology	Purpose
Next.js 15	App Router
React 19	UI
Supabase	PostgreSQL database + authentication
Tailwind CSS	Styling
shadcn/ui	UI components
Stripe	Payments & subscriptions
TypeScript	Strictly typed development
Requirements

Before getting started, make sure you have:

Node.js 18+
A Supabase account — Free tier works
A Stripe account — Test mode works
Installation & Setup
1. Extract the package

Extract:

b2b-saas-os-v1.0.0.zip

Then open the project directory:

cd b2b-saas-os
2. Install dependencies
npm install
Environment Variables

Create your local environment file from the included example:

cp .env.example .env.local

Open .env.local and add your own credentials.

Never share or commit .env.local.

Database Setup — Supabase
1. Create a Supabase project

Create a new project in Supabase.

2. Get your API credentials

In your Supabase dashboard, go to:

Project Settings → API

You will need:

Supabase Project URL
Anon/Public Key
Service Role Key

Add them to .env.local.

Important: The Supabase Service Role Key is a server-only secret. Never expose it through client-side code or NEXT_PUBLIC_* variables.

3. Apply the database migrations

Run:

npx supabase db push

This will apply the project's database migrations, including the required tables, functions, indexes, and RLS policies.

Authentication Setup

In your Supabase dashboard, go to:

Authentication → Providers

Enable the authentication providers you want to use:

Email
Google
GitHub
Local development

Set your Supabase Site URL to:

http://localhost:3000

For Google and GitHub OAuth, configure the appropriate OAuth redirect URLs in both Supabase and the respective provider.

For production, replace the local URL with your deployed application URL.

Stripe Setup

B2B SaaS OS uses Stripe for subscription billing.

1. Enable Stripe Test Mode

Open your Stripe Dashboard and make sure Test Mode is enabled.

2. Create your products and prices

Create the products/plans you want your SaaS to offer.

For example:

Pro — Monthly
Pro — Yearly
Business — Monthly
Business — Yearly

Copy the corresponding Stripe price_... IDs into your environment/configuration.

3. Configure Stripe webhooks

For local development, install the Stripe CLI and run:

stripe listen --forward-to http://localhost:3000/api/stripe/webhook

The Stripe CLI will provide a webhook signing secret similar to:

whsec_...

Add that value to your .env.local.

Use your own Stripe account and credentials. The boilerplate does not use or depend on the seller's Stripe account.

Run the Application

Start the development server:

npm run dev

Then open:

http://localhost:3000

Create an account, configure your organization, and start building your SaaS.

What's Included

B2B SaaS OS provides the core infrastructure needed to build a modern multi-tenant SaaS application:

Authentication
      ↓
Organizations
      ↓
RBAC & Permissions
      ↓
Team Management
      ↓
Projects & Resources
      ↓
Stripe Billing
      ↓
API Keys
      ↓
Usage Limits
      ↓
Audit Logs
      ↓
Notifications
      ↓
Feature Flags

You configure your own Supabase, Stripe, OAuth providers, branding, and application logic.

The boilerplate provides the foundation so you can focus on building your actual SaaS product.