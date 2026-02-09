# Proof — Full Project Spec & Refactor Brief

You are working on **Proof**, a compliance-first platform for alcohol brand activations at bars/venues. Think of it as "the compliance OS for alcohol marketing." The product's core value prop is an **AI compliance agent** that ensures every bar activation follows state ABC regulations (starting with Virginia).

This is being submitted to **Y Combinator** and demoed to investors. It needs to feel like a real, polished product — not a hackathon project. Every screen should look intentional and professional.

## CONTEXT: What exists now

The codebase is a **Next.js** app with **Supabase** (auth + database + storage) and **shadcn/ui** components. There are two versions floating around — a GitHub version with a "bar" role and a local version where "bar" has been partially replaced with "agency." The styling is inconsistent across pages. Some features are cosmetic-only (which is fine), but the core flows need to actually work. The Supabase project is already configured. Environment variables are in .env.local, .env.example shows the variable names. Do not modify auth configuration or Supabase project settings.

**Tech stack (do not change):**
- Next.js (App Router)
- Supabase (auth, Postgres, storage)
- Tailwind CSS + shadcn/ui
- TypeScript

---

## THE PRODUCT: What Proof actually does

Proof has **two user roles**:

### 1. BRAND (Alcohol company — e.g. Tito's, Modelo, a craft brewery)
Brands use Proof to:
- **Plan activations** at venues (tastings, sampling events, ambassador visits, sponsored events)
- **Run AI compliance checks** before executing — the AI agent analyzes their activation plan against Virginia ABC regulations and flags violations, required permits, and conditions
- **Generate compliance packets** — audit-ready documentation bundles with checklists, ambassador details, evidence, and receipts
- **Track all activations** in a dashboard with compliance status
- **View their venue network** — browse partner venues available for activations

### 2. AGENCY (Field marketing agency executing activations on behalf of brands)
Agencies use Proof to:
- **Receive activation briefs** from brands (these replace the old "offers" concept)
- **Execute activations** using the compliance checklist as a real-time guide
- **Upload proof of performance** — photos, receipts, attendance estimates
- **Track their active and completed activations**

### What is NOT a role: "Bar"
Bars/venues are entities in the database (name, location, capacity, peak nights) but they are NOT a user role in the current version. Venues are selected by brands when planning activations. We may add a venue portal later, but not now.

---

## CRITICAL: The compliance model

Virginia ABC law **prohibits brands from paying bars** to host promotions (tied-house rules). The old codebase had an "offer" system with dollar amounts and payments — **this must be removed or completely reframed.**

What IS legal:
- Brand ambassador conducts a **tasting** at a venue
- Brand **buys product from the bar** at retail price (up to **$100/day** per location)
- Ambassador must hold a **Solicitor Tasting Permit** ($350/year)
- **Bar staff must pour** all drinks (ambassador cannot serve)
- Sample limits: **0.5 oz spirits per sample, 1.5 oz total spirits per person, 6 oz wine, 16 oz beer**
- Brand can give **consumer swag** (hats, shirts, etc.) — NOT to the bar as compensation
- Branded POS materials must be under **$40 wholesale value** each
- All tasting records must be kept for **2 years**
- Sponsored events (charity, cultural, sports) require **prior ABC approval** via a sponsorship request form

The AI compliance agent should understand all of this. It should be powered by a real API call to Claude (Anthropic API) with the VA ABC regulations as system context, not just keyword matching.

---

## DATABASE SCHEMA

The current schema needs updates. Here is the target schema. Migrate what exists; add what's missing. Keep backward compatibility where possible but prioritize correctness.

### Existing tables to KEEP (with modifications):
- **profiles** — id, email, role (change allowed values to: 'brand', 'agency'), created_at
- **brands** — id, name, category, owner_id, created_at
- **bars** → rename conceptually to **venues** OR keep as `bars` but treat as venue data, not a user role. Fields: id, name, location, capacity, peak_nights, image_url, created_at. Remove owner_id (venues are not users anymore) OR keep it for future venue portal.

### Tables to REDESIGN:
- **campaigns** → rename to **activations** (or keep as campaigns, but the UI should say "Activations"). Fields:
  - id, brand_id, title, description, activation_type (enum: 'tasting', 'sponsored_event', 'ambassador_visit', 'brand_promotion'), venue_id (references bars/venues), city, state (default 'Virginia'), proposed_date, status (draft, compliance_check, compliant, conditional, blocked, active, completed), compliance_status (compliant, conditional, blocked), compliance_reasoning (text/jsonb — AI output), deliverables (jsonb array), created_at

- **offers** → repurpose as **activation_briefs** or **assignments**. This represents a brand assigning an activation to an agency. Fields:
  - id, activation_id (references activations), agency_id (references profiles where role='agency'), status (sent, accepted, in_progress, completed), notes, created_at

### New tables to ADD:
- **ambassadors** — id, agency_id, name, email, phone, permit_number, permit_expiry, created_at
- **compliance_packets** — id, activation_id, ambassador_id, checklist_responses (jsonb), evidence_photos (jsonb array of storage paths), receipt_total (numeric), receipt_photo_path, estimated_attendance (integer), notes, completed_at, created_at
- **compliance_checklist_templates** — id, state (e.g. 'Virginia'), activation_type, items (jsonb array of checklist item objects), created_at

Don't stress about making every migration perfect — this is a prototype. But the core tables (activations, compliance_packets, ambassadors) need to exist and work.

---

## PAGE STRUCTURE & ROUTING

### Public pages:
- `/` — Landing page (keep existing but clean up)
- `/login` — Google OAuth (keep existing)
- `/onboard/brand` — Brand onboarding (keep, clean up)
- `/onboard/agency` — Agency onboarding (create or fix — should collect: agency name, contact info, primary state)

### Brand dashboard (`/dashboard/brand`):
- `/dashboard/brand` — **Main dashboard.** Table/list of all activations with compliance status badges. Metrics row: active activations, pending compliance, completed packets. "+ New Activation" button.
- `/dashboard/brand/new` — **Create Activation** flow. This is the HERO FEATURE. Form: activation name, type (dropdown), venue (dropdown or search from venues table), city, proposed date, description. "Run Compliance Check" button triggers real AI analysis. Results screen shows: compliant/conditional/blocked status, AI reasoning, required forms (with real links), dynamic checklist, and "Continue to Setup" button.
- `/dashboard/brand/activation/[id]` — **Activation detail page.** Shows activation info, compliance status, assigned agency, compliance packet status, and activation report if completed.
- `/dashboard/brand/activation-setup` — **Activation setup.** Compliance checklist with file upload for each item, ambassador assignment, additional notes. "Generate Compliance Packet" button.
- `/dashboard/brand/compliance-packet` — **View generated compliance packet.** Summary of all compliance data, uploaded evidence, ambassador record, required forms links. "Download PDF" button (cosmetic is fine).
- `/dashboard/brand/venues` — **Venue network.** Grid of venue cards (from bars/venues table). Keep existing design, just clean up.

### Agency dashboard (`/dashboard/agency`):
- `/dashboard/agency` — **Main dashboard.** List of activation briefs received from brands. Cards showing: brand name, activation title, venue, date, status. Filter by status.
- `/dashboard/agency/activation/[id]` — **Activation detail.** View the brief, compliance checklist, deliverables. Accept/decline the assignment. Once accepted: upload proof, complete checklist items, submit completion.
- `/dashboard/agency/activation/[id]/execute` — **Execution view.** Real-time checklist: take photos (upload), log spending (running total with $100 alert), confirm bartender poured, log sample counts. This is the "field mode" for ambassadors.
- `/dashboard/agency/history` — **Completed activations.**
- `/dashboard/agency/ambassadors` — **Ambassador management.** List of ambassadors with permit status. Add/edit ambassadors.

### Shared layout (`/dashboard/layout.tsx`):
- Dark sidebar (slate-900) with teal accent — keep this pattern
- Navigation adapts based on role (brand vs agency)
- Clean, consistent typography throughout

---

## DESIGN SYSTEM — MAKE IT CONSISTENT

This is critical. Every page must use the same design language.

### Colors:
- **Primary accent:** `#0D9488` (teal-600) — buttons, active states, brand identity
- **Background:** `slate-50` for page bg, `white` for cards
- **Sidebar:** `slate-900` with white text
- **Text:** `slate-900` for headings, `slate-600` for body, `slate-400`/`slate-500` for secondary
- **Success:** `emerald-100`/`emerald-600`
- **Warning:** `amber-100`/`amber-600`
- **Error:** `red-100`/`red-600`
- **Status badges:** Use the existing `StatusBadge` component pattern

### Typography:
- Headings: `font-bold` or `font-semibold`, `tracking-tight`
- Body: `text-sm` or `text-base`, `text-slate-600`
- Labels: `text-xs font-bold uppercase tracking-wider text-slate-500`
- No emojis in production UI (remove the ✅, 📦, ⚡ emoji from buttons and badges)

### Components:
- Cards: `bg-white rounded-xl border border-slate-200 shadow-sm`
- Buttons primary: `bg-[#0D9488] hover:bg-[#0D9488]/90 text-white`
- Buttons secondary: `border-slate-200 text-slate-700`
- Form inputs: Use shadcn defaults, `h-11` for comfortable sizing
- Page layout: `max-w-7xl mx-auto px-6 py-8`

### Page pattern:
Every dashboard page should follow this structure:
```
<div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
  {/* Page header */}
  <div>
    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Page Title</h1>
    <p className="text-slate-500 text-sm mt-1">Subtitle or description</p>
  </div>
  
  {/* Content */}
  ...
</div>
```

---

## AI COMPLIANCE AGENT — THE CORE FEATURE

This is what makes Proof a real product, not just a form builder.

### Implementation:
Create a server action or API route (`/api/compliance-check`) that calls the Anthropic API. Use the Claude claude-sonnet-4-20250514 model.

**System prompt should include:**
- All Virginia ABC regulations from the compliance PDF (summarized into a structured reference)
- The tied-house prohibitions
- Tasting rules (permits, sample sizes, $100 cap, bar staff must pour)
- Sponsorship rules (charity/cultural events only, requires ABC pre-approval)
- Advertising restrictions
- Record-keeping requirements

**User message should include:**
- The activation details (title, type, venue, date, description)
- Ask for: compliance status (compliant/conditional/blocked), reasoning (array of bullet points), required_permits (array), required_forms (array with URLs), suggested_checklist (array of items), and if blocked: legal_alternatives (array)

**Response format:** JSON. Parse it and display in the results UI.

**Environment variable:** `ANTHROPIC_API_KEY` — the user will need to set this in their `.env.local`

If the API key is not set, fall back to the existing keyword-matching logic but show a banner saying "AI agent unavailable — using basic rule matching."

---

## PRIORITY ORDER

Work through these in order. Each should result in a working state.

### P0 — Core structure (do first):
1. Fix routing: ensure `/onboard/agency` exists and works
2. Fix the role system: `brand` and `agency` only. Remove all `bar` role references from auth, routing, and navigation.
3. Update the sidebar nav for both roles
4. Ensure both onboarding flows work and redirect correctly
5. Clean up the landing page role selector (Brand + Agency, not Brand + Bar)

### P1 — Brand activation flow:
1. Clean up `/dashboard/brand` — consistent table design, remove hardcoded demo rows, real data from activations table
2. Fix `/dashboard/brand/new` — the compliance check form. Wire up real AI if API key exists, keep fallback.
3. Fix activation setup and compliance packet pages — store data properly, consistent styling
4. Add `/dashboard/brand/venues` page (venue browser)

### P2 — Agency flow:
1. Build `/dashboard/agency` — list of assigned activations
2. Build activation detail and execution views
3. Build ambassador management page
4. Build proof upload and completion flow

### P3 — Polish:
1. Consistent styling pass across ALL pages
2. Remove all emoji from UI chrome
3. Fix any TypeScript errors
4. Make sure navigation highlights the active page
5. Responsive design check (should work on tablet at minimum)

### P4 — Nice to have (cosmetic only is fine):
1. "Download PDF" button on compliance packets (can just show a toast "PDF generation coming soon")
2. "Submit to ABC" button (cosmetic)
3. Audit log page
4. Analytics/reporting

---

## IMPORTANT NOTES

- **Do NOT delete the Supabase migrations** — they represent the current production schema. Write NEW migrations for any schema changes (next number would be 0011).
- **Keep the existing auth flow** — Google OAuth via Supabase works fine, don't change it.
- **The app name is "Proof"** — keep the branding consistent (the "P" logo in teal, "Proof" text).
- **State is Virginia only for now** — but structure the compliance logic so adding states later is straightforward (e.g., keep state as a field, template checklists per state).
- **This is a prototype/demo** — if something would take 3 hours to build properly vs 20 minutes with good mock data, use mock data. The compliance check AI and the core flows need to be real. Peripheral features can be cosmetic.
- **When in doubt, prioritize making the brand-side "Create Activation → Compliance Check → Setup → Packet" flow flawless.** That's the demo flow for YC.

---

## FIRST STEP

Before writing any code, read through the entire codebase to understand the current state (your local version, not just what's described above — there may be differences). Then outline your plan for what files you'll create, modify, or delete. Ask me to confirm before proceeding with major changes.