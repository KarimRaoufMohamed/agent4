# Copilot Instructions - Full-Stack Application

## Architecture Overview

This is a full-stack application with a **Django REST backend** and **Next.js 16 frontend** running in Docker containers, communicating through a shared network.

### Core Components

- **Backend**: Django 5.1 + Django REST Framework on port 8000
- **Frontend**: Next.js 16 (App Router) with React 19 + Clerk authentication on port 3000
- **Database**: SQLite (persisted in Docker volume `sqlite_data_*`)
- **Auth**: Clerk handles authentication; user email passed to Django for authorization

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4 (CSS-first configuration), shadcn/ui components
- **Backend**: Django 5.1, Django REST Framework, django-unfold admin
- **Database**: SQLite with volume persistence
- **Auth**: Clerk (authentication) + Django (authorization)
- **Containers**: Docker Compose with shared network

## File Organization

Detailed implementation rules are split across specialized files:

- **[copilot-frontend.md](./copilot-frontend.md)**: Next.js patterns, routing, authentication, component organization
- **[copilot-backend.md](./copilot-backend.md)**: Django models, views, API conventions, database patterns
- **[copilot-figma.md](./copilot-figma.md)**: Pixel-perfect Figma design implementation rules
- **[copilot-testing.md](./copilot-testing.md)**: Playwright testing with MCP server integration
- **[Scenarios.md](../.digitizeit/Scenarios.md)**: BDD-style feature and scenario definitions for core functionalities
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**(if provided): Documented design system extracted from Figma (if provided)
- **[copilot-specific-instructions.md](./copilot-specific-instructions.md)**: Any additional instructions or rules specific to this project that don't fit into the above categories

## Scenario-Based Implementation Workflow (CRITICAL)

### Default Implementation Mode: Scenario-by-Scenario

**IMPORTANT**: By default, ALWAYS implement scenarios one at a time, pausing after EACH scenario for user confirmation before proceeding to the next. Do NOT implement multiple scenarios in one turn.

When the user asks to implement features or scenarios, follow this **MANDATORY WORKFLOW**:

#### Step 1: Read Scenarios from Scenarios.md (ALWAYS FIRST)

**CRITICAL**: All scenarios are defined in `.digitizeit/Scenarios.md`. Read this file to get the list of features and scenarios.

```bash
# Scenarios are ALWAYS in this file
.digitizeit/Scenarios.md
```

#### Step 2: Discover All Features & Check Progress

1. **Read Scenarios.md**: Open `.digitizeit/Scenarios.md` to see all features and scenarios
2. **Check current progress**: Look at checkboxes in Scenarios.md:
   - `- [ ]` = Not started
   - `- [x]` = Completed
3. **Identify next scenario**: Find the first scenario with `- [ ]` checkbox that needs implementation

#### Step 3: Setup Design System FIRST (If Figma Design Provided)

**CRITICAL**: If user provides Figma design system, complete this ENTIRE step BEFORE implementing any scenarios.

1. **Extract design system rules** (colors, typography, spacing, components, types)
2. **Create `.github/DESIGN_SYSTEM.md`** file documenting:
   - Color palette (with HSL values for globals.css)
   - Typography system (fonts, sizes, weights, line heights)
   - Spacing scale (padding, margin, gap values)
   - Border radius values
   - Shadow system
   - Component specifications (buttons, cards, inputs, etc.)
   - Usage guidelines for globals.css, layout.tsx, and components
3. **Update `globals.css`** with design system:
   - Add all colors to `@theme` block and `@layer base`
   - Configure typography in `@theme` block
   - Add custom spacing, radius, shadows if needed
4. **Update `layout.tsx`** with design system:
   - Configure fonts using Next.js font optimization
   - Apply design system font variables
5. **Install ALL shadcn/ui components** mentioned in design system:
   ```bash
   npx shadcn@latest add button card dialog input select table tabs badge avatar skeleton
   ```
6. **CRITICAL: Edit EACH installed shadcn component** to customize with Figma design system:
   - Open each component file in `nextjs/src/components/ui/`
   - Modify default styles to match Figma colors, spacing, typography
   - Update component variants to align with design system
   - Override border radius, shadows, and other design tokens
   - **DO NOT use shadcn components as-is without customization**
7. **Verify design system setup** is complete before proceeding to scenarios

#### Step 4: Implement ONE Scenario at a Time

For the current scenario:

1. **Read scenario details** from `.digitizeit/Scenarios.md` - use the Given/When/Then steps as implementation guide
2. **Create todos** for all scenarios in that feature (one todo per scenario) - do this only once per feature
3. **Implement the NEXT INCOMPLETE scenario systematically**:
   - Mark scenario todo as `in-progress`
   - Read Given/When/Then steps from Scenarios.md
   - Implement backend FIRST (models → views → URLs)
   - Implement frontend NEXT (pages → components → types)
   - **Update header navigation**: If creating a new main page (not a detail/dynamic route), add it to `navLinks` array in `header.tsx`
   - If Figma design provided, ensure pixel-perfect implementation with design system
   - **Verify implementation against scenario**: Check that all Given/When/Then steps are satisfied
   - Mark scenario todo as `completed`
4. **Update or create the test file** for this feature (add/update test for this scenario)
5. **Mark scenario as complete in Scenarios.md**: Change `- [ ]` to `- [x]` for the completed scenario
6. **STOP after ONE scenario** - do not proceed to the next scenario

#### Step 5: Setup Environment and Run Migrations

After implementing the scenario:

1. **Setup Python virtual environment** (if not already created):

   ```bash
   cd django
   python -m venv venv
   .\venv\Scripts\Activate.ps1  # Windows PowerShell
   ```

2. **Update requirements.txt** if new packages were added:

   ```bash
   cd project
   pip freeze > requirements.txt
   ```

3. **Install/Update Python packages**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Create and run migrations** (if models were added/modified):
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

#### Step 6: Install Frontend Dependencies

1. **Install Next.js dependencies** (if not already installed):

   ```bash
   cd nextjs
   npm install
   ```

2. **Install shadcn/ui components** if any were used:

   ```bash
   npx shadcn@latest add [component-name]
   ```

3. **Create or verify Header/Footer components with navigation**:
   - Check `nextjs/src/components/header.tsx` (preferred name)
   - Check `nextjs/src/components/footer.tsx`
   - If missing, create as shared components following this pattern:
     - Header with flexible navigation: Define `navLinks` array for all main pages
     - Cart icon with badge (if e-commerce app)
     - Authentication state handling (Sign In/Sign Up OR UserButton)
     - Responsive design (desktop nav + mobile overflow menu)
     - Active state highlighting using `usePathname()`
   - Header must show Sign In/Sign Up buttons when not logged in
   - Header must show Clerk UserButton when logged in
   - Customize `navLinks` array to match your application's pages

4. **CRITICAL: Ensure Header/Footer are USED in layout**:
   - Check `app/(dashboard)/layout.tsx` or `app/layout.tsx`
   - Header and Footer MUST be imported and rendered
   - Example:

     ```tsx
     import { Header } from "@/components/header";
     import { Footer } from "@/components/footer";

     export default function Layout({ children }) {
       return (
         <div className="min-h-screen flex flex-col">
           <Header />
           <main className="flex-1">
             <div className="container mx-auto px-4 md:px-6 py-6">
               {children}
             </div>
           </main>
           <Footer />
         </div>
       );
     }
     ```

     ```

     ```

#### Step 7: Run Tests and Update Progress

After completing the scenario, run tests and update progress:

1. **Run Django backend tests**:

   ```bash
   cd django/project
   .\venv\Scripts\Activate.ps1
   python manage.py check
   python -m pytest app/tests/test_[feature-name].py -v
   ```

   Replace `[feature-name]` with the snake_case feature name (e.g., `user_role_management`, `post_creation`)

2. **Run Next.js build verification**:

   ```bash
   cd nextjs
   npm install
   npm run build
   ```

3. **Run Playwright E2E tests for this feature** (MANDATORY - MUST BE EXECUTED):

   ```bash
   cd nextjs
   npm install
   npx playwright test e2e/[feature-name].spec.ts
   ```

   Replace `[feature-name]` with the kebab-case feature name (e.g., `user-role-management.spec.ts`, `post-creation.spec.ts`)

   **⚠️ CRITICAL**: After creating or updating the Playwright test file, you MUST actually run it using the command above.
   - Do NOT just create the test file and skip running it
   - Report the test results in your summary
   - Include pass/fail counts and any error messages

4. **Fix any test failures or build errors** before proceeding
   - If Playwright tests fail, debug and fix them immediately
   - Re-run tests until all pass
   - Only proceed to step 5 when all tests are passing

5. **Update Scenarios.md**: Mark the completed scenario as done by changing `- [ ] Scenario:` to `- [x] Scenario:` in `.digitizeit/Scenarios.md`

6. **Update progress file** `.digitizeit/progress.md`:
   - Add ONLY the scenario name and completion date - NO detailed summaries
   - Format:

     ```markdown
     ## [Feature Name]

     - ✅ [Scenario Name] - Completed [Date]
     ```

   - Example:

     ```markdown
     ## User Authentication

     - ✅ Successful Login - Completed 2026-02-09
     - ✅ Failed Login Attempt - Completed 2026-02-09
     - ✅ User Registration - Completed 2026-02-10
     ```

   - ⚠️ **DO NOT** add implementation details, backend/frontend summaries, or test statuses

7. **End the message after ONE scenario is complete**
8. **Provide summary** of what was completed (including test results)
9. **Wait for user to send "continue"** - do not automatically proceed to next scenario

#### User Commands

The user can trigger this workflow with:

- **"Implement scenarios"** or **"Start implementing scenarios"** → Begin with first unchecked scenario from Scenarios.md
- **"Continue"** → Continue to next unchecked scenario from Scenarios.md
- **"Implement scenario [Scenario Name]"** → Implement specific scenario by name from Scenarios.md
- **"Skip to next feature"** → Move to first unchecked scenario of next feature
- **User may provide Figma design system URL** → Extract design system and use with shadcn/ui components

#### Critical Rules

- ❌ NEVER implement scenarios before completing design system setup (if Figma provided)
- ❌ NEVER implement more than one scenario per message
- ❌ NEVER skip updating Scenarios.md checkbox after completing a scenario
- ❌ NEVER use MCP scenario tools - read from Scenarios.md instead
- ❌ NEVER mark todo as completed until backend + frontend + tests are done
- ❌ NEVER proceed to next scenario without user sending "continue"
- ❌ NEVER skip running tests after completing a scenario
- ❌ NEVER just create Playwright test files without actually running them
- ❌ NEVER create multiple test files for one feature
- ❌ NEVER create header/footer without using them in the layout file
- ❌ NEVER create Header/Footer components without immediately integrating them into layout.tsx
- ❌ NEVER forget to run `npm run build` after creating or updating Header/Footer
- ❌ NEVER forget to create/update header and footer or sidebar with proper authentication states
- ❌ NEVER create a new main page without adding it to header navigation
- ❌ NEVER make parent page.tsx async:false when child component needs async searchParams Promise
- ❌ NEVER redirect root `/` directly to the first page — always show the welcome screen first
- ❌ NEVER redirect root page to `/` (causes infinite redirect loop)
- ❌ NEVER use `screens[0]` as fallback in root page — it may not be the welcome screen
- ✅ ALWAYS read scenarios from `.digitizeit/Scenarios.md` file
- ✅ IF Figma design system provided, ALWAYS complete Step 3 (design system setup) BEFORE implementing any scenario
- ✅ ALWAYS update globals.css, layout.tsx, and customize ALL shadcn components before scenario implementation
- ✅ ALWAYS update Scenarios.md checkbox `- [ ]` to `- [x]` after completing scenario
- ✅ ALWAYS verify implementation against scenario Given/When/Then steps before marking complete
- ✅ ALWAYS follow backend-first approach for each scenario
- ✅ ALWAYS create/update ONE test file per feature (add test for each scenario)
- ✅ ALWAYS update todo list status after each scenario
- ✅ ALWAYS update `.digitizeit/progress.md` after each scenario
- ✅ ALWAYS setup venv and install packages before running tests
- ✅ ALWAYS run migrations after implementing a scenario (if models changed)
- ✅ ALWAYS run `npm install` before build and before E2E tests
- ✅ IF user provides Figma design system, EDIT and customize shadcn/ui components after installation
- ✅ NEVER use shadcn components without customizing them to match Figma design system
- ✅ ALWAYS run ALL tests AFTER implementing each scenario:
  1. Setup venv and activate it
  2. Install/update Python packages
  3. Create and run migrations (if needed)
  4. Run Django backend tests (`python -m pytest`)
  5. Run `npm install` in Next.js directory
  6. Run Next.js build verification (`npm run build`)
  7. **CREATE OR UPDATE** Playwright test file for this feature
  8. **EXECUTE** Playwright E2E tests: `npx playwright test e2e/[feature-name].spec.ts`
  9. **REPORT** test results with pass/fail counts
  10. **FIX** any failures before marking scenario complete

- ✅ ALWAYS integrate into layout.tsx immediately after creating Header/Footer
- ✅ ALWAYS run `npm run build` after Header/Footer integration to verify
- ✅ ALWAYS update header navigation when creating a new main page:
  - Add to `navLinks` array in `header.tsx` for: /products, /categories, /cart, /orders, /checkout, etc.
  - DON'T add detail pages: /product/[id], /order/[id], /workflow/[id] (use contextual links instead)
  - Main page = A primary destination users navigate to directly (list/collection pages, dashboards, forms)
  - Detail page = A page showing a single item (accessed via links from main pages)
- ✅ ALWAYS make BOTH parent page.tsx AND child component async when using searchParams
- ✅ ALWAYS use Promise<{ key?: type }> type for searchParams in Next.js 15+
- ✅ ALWAYS set `app/page.tsx` to show the welcome screen first:
  - **With `screens.json`**: render the screen where `screen_name === "welcome"` — the welcome component's button uses `redirect_link` to go to the first real page
  - **Without `screens.json`**: show a welcome/landing component with a button that navigates to the first main page you created
- Use `manage_todo_list` to track scenario-level progress
- Group todos by feature name for clarity
- Report which scenarios are complete and which remain
- Maintain context across multiple sessions
- Always ensure header shows Sign In/Sign Up when not authenticated
- Always ensure header shows Clerk UserButton when authenticated

**Example Interaction Flow**

**User**: "Implement scenarios" (optionally with Figma design system URL)

**Agent**:

1. Reads `.digitizeit/Scenarios.md` to get all features and scenarios
2. Identifies first unchecked scenario (e.g., "Expense Entry")
3. **If Figma design provided (COMPLETE THIS FIRST)**:
   - Extracts design system (colors, typography, spacing, components)
   - Creates `.github/DESIGN_SYSTEM.md` documentation file
   - Updates `globals.css` with all design system colors and tokens
   - Updates `layout.tsx` with font configuration
   - Installs ALL shadcn components mentioned in design system
   - **Edits EACH installed component file** in `nextjs/src/components/ui/` to customize with design system
   - Applies design tokens (colors, spacing, typography, radius, shadows) to components
   - Verifies design system setup is complete
4. Creates todos for all scenarios in the feature
5. Implements FIRST scenario (backend → frontend with design system)
   - Backend: Models, views, URLs, migrations
   - Frontend: Page component, extracted components, types
   - **If page is a main page** (not `/[id]` route): Updates `navLinks` in `header.tsx`
6. Creates/updates test file for the feature
7. Sets up venv, installs packages, runs migrations
8. Runs all tests (backend + build + E2E)
9. Updates checkbox in `.digitizeit/Scenarios.md`: `- [ ] Scenario:` to `- [x] Scenario:`
10. Reports completion: "✅ Scenario complete (tests passing)"
11. **STOPS** - waits for "continue" message

**User**: "continue"

**Agent**:

1. Checks progress ("Admin creates user" = done, "Admin assigns role" = next)
2. Marks "Admin assigns role" todo as in-progress
3. Implements "Admin assigns role" scenario (backend → frontend)
4. Updates test file for User Management feature (adds new test)
5. Sets up venv, installs packages, runs migrations (if needed)
6. Runs all tests (backend + build + E2E)
7. Updates `.digitizeit/progress.md` with scenario name and completion date
8. Reports completion: "✅ Scenario 'Admin assigns role' complete (tests passing)"
9. **STOPS** - waits for "continue" message

**Benefits:**

- Clear boundaries between implementation chunks
- User can review/test each scenario before proceeding
- Better control over implementation pace
- Easier to handle feedback or changes mid-implementation
- Natural checkpoints for code review
- Progress file maintains clean history of completed scenarios

**Example: Creating a Page and Updating Header Navigation**

Scenario: "User views their order history"
→ Creates `/orders` page (list of all orders)
→ **Action**: Add to header navigation

```typescript
// components/header.tsx - BEFORE
const navLinks: NavLink[] = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/cart", label: "Cart" },
];

// components/header.tsx - AFTER (added Orders)
const navLinks: NavLink[] = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders" }, // ← Added
];
```

Scenario: "User views a specific order"
→ Creates `/order/[id]` page (detail page with dynamic route)
→ **Action**: DON'T add to header (use link from orders list instead)

---

## Implementation Workflow

### Backend-First Development (MANDATORY)

**CRITICAL RULE**: Always implement backend functionality BEFORE starting frontend work.

**Rationale**:

- Frontend depends on backend API contracts
- TypeScript interfaces should mirror backend models
- Testing is more reliable when backend exists first
- Avoids mock data and placeholder implementations

**Enforcement**:

- If a user requests a feature, ALWAYS start with Django backend
- Complete all backend work (models, views, URLs, migrations) before touching Next.js
- Only proceed to frontend after backend endpoints are confirmed working

**Exception**: When explicitly working on frontend-only changes (styling, UI components without new data)

### Next.js 15+ Async Params (CRITICAL WARNING)

**IMPORTANT**: In Next.js 15+, all dynamic route `params` are Promises and MUST be awaited.

**⚠️ THIS APPLIES TO BOTH `route.ts` AND `page.tsx` FILES!**

❌ **WRONG - Will cause runtime error:**

```typescript
// app/api/posts/[id]/route.ts OR app/(dashboard)/posts/[id]/page.tsx
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }, // ❌ Wrong
) {
  const id = params.id; // ❌ Error: params is a Promise
}
```

✅ **CORRECT - Always await params:**

```typescript
// app/api/posts/[id]/route.ts OR app/(dashboard)/posts/[id]/page.tsx
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ✅ Correct type
) {
  const { id } = await params; // ✅ Await first
}
```

**This applies to ALL dynamic routes (API routes AND pages):**

- `/api/posts/[id]/route.ts` → `const { id } = await params;`
- `app/(dashboard)/posts/[id]/page.tsx` → `const { id } = await params;`
- `/api/users/[userId]/route.ts` → `const { userId } = await params;`
- Any route with `[paramName]` in the path

See [copilot-frontend.md](./copilot-frontend.md) for detailed examples.

## Critical Integration Points

### Authentication Flow

1. Clerk handles user authentication in frontend
2. User email extracted via `currentUser()` from Clerk
3. Email passed to Django backend for authorization
4. Webhook syncs Clerk user events to Django (`/api/webhooks/route.ts` → `/app/userCreated`)

### Frontend ↔ Backend Communication

- **PRIORITY**: Use Next.js Server Components for data fetching
- Server components directly fetch from Django backend at `process.env.API_URL`
- Use API routes (`/api/*`) only when client-side interactivity is required
- Never call Django directly from client components

### Environment Configuration

**Frontend** ([nextjs/.env.local](../nextjs/.env.local)):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `API_URL`: Django backend URL (http://localhost:8000)
- `NEXT_PUBLIC_NEXTJS_API_URL`: Frontend URL for webhooks
- `SIGNING_SECRET`: Clerk webhook verification

**Backend** ([django/project/project/settings.py](../django/project/project/settings.py)):

- `CSRF_TRUSTED_ORIGINS`: Must include frontend URL
- CORS enabled for `http://localhost:3000`
- SQLite at `BASE_DIR/database/db.sqlite3`

## Quick Reference

### Implementation Order (CRITICAL RULE)

**ALWAYS implement backend first, then frontend.**

This ensures:

- API endpoints exist before frontend tries to call them
- Data models are defined before creating TypeScript interfaces
- Backend validation is in place before UI is built
- No frontend code calling non-existent endpoints

### Adding a New Feature

**Phase 1: Backend (MUST BE COMPLETED FIRST)**

1. Create Django model (if needed)
2. Run migrations (`python manage.py makemigrations` → `python manage.py migrate`)
3. Add API endpoint(s) in `views.py`
4. Update `urls.py` to route the endpoint
5. Test endpoint manually or verify it's accessible

**Phase 2: Frontend (ONLY AFTER BACKEND IS COMPLETE)**

1. Create page in `app/(dashboard)/[route]/`
2. Extract components to `components/`
3. Add TypeScript types/interfaces
4. Implement data fetching from backend
5. Generate Playwright tests

**Phase 3: Integration**

1. Use server components for data fetching → pass user email for auth
2. Verify end-to-end functionality
3. Test responsive design

### Implementing from Figma Design (One-Prompt Workflow)

When given a Figma URL or Figma Design System:

Note: Pixel-perfect requires the exact Figma frame/node. Prefer URLs that include `node-id`; if missing, locate the correct frame via Figma metadata first (see `copilot-figma.md`).

1. **Fetch design** using MCP tools
2. **Extract ALL layout, spacing, colors, and typography values**
3. **Update colors** in `globals.css` (@theme block + @layer base) if needed
4. **Configure fonts** in `@theme` block or `layout.tsx` if needed
5. **Identify required shadcn/ui components** and install them using `npx shadcn@latest add [component-name]`
6. **Check for existing Header/Footer** in `components/` - reuse if exists, create as shared components if not
7. **Use ONLY shadcn/ui components** (never custom implementations)
8. **Implement responsive design** (mobile → tablet → desktop)
9. **Download images** to `public/`
10. **Extract components** to `components/` folder (follow frontend rules)
11. **Generate Playwright tests**
12. **Complete in ONE TURN** - don't stop midway

### Project Structure

```
nextjs/
  src/
    app/
      (auth)/           ← Clerk sign-in/sign-up pages
      (dashboard)/      ← Protected routes with dashboard layout
      api/              ← API routes (webhooks, client-side endpoints)
    components/         ← Shared components
      ui/               ← shadcn/ui components
    types/              ← TypeScript interfaces
    utils/              ← Utility functions
  e2e/                  ← Playwright tests

django/
  project/
    app/                ← Core application (models, views, APIs)
    project/            ← Settings, URLs, WSGI config
    database/           ← SQLite database file
```

## Development Workflow

1. Check existing code before creating new files (types, utils, components)
2. Follow file organization conventions (see frontend/backend docs)
3. Use TypeScript strictly (no `any` types)
4. Test new pages with Playwright MCP server
5. Maintain pixel-perfect design fidelity (see Figma docs)

For detailed implementation guidelines, refer to the specialized instruction files listed above.

---

## Example: Feature-by-Feature Implementation Workflow

### User Request: "Implement scenarios"

**Step 1: Read Scenarios.md**

```
Read from: .digitizeit/Scenarios.md
Parse features and scenarios with their checkbox status
```

**Step 2: Discover Features**

```
From Scenarios.md:
Features: ["Expense Entry and Management", "Automatic Categorization", "Reporting and Analytics", "User Authentication and Role-Based Access", "Mobile and Web Accessibility"]

Check progress: Look at checkboxes (- [ ] vs - [x])
Next feature to implement: First feature with unchecked scenarios
```

**Step 3: Get Scenarios for First Feature**

```
From Scenarios.md, read all scenarios under the feature
Identify which have - [ ] (not complete) vs - [x] (complete)
```

**Step 4: Create TODO List for This Feature**

```
manage_todo_list([
  { id: 1, title: "User Auth - Successful Login", description: "Implement backend, frontend, and tests for successful login scenario", status: "not-started" },
  { id: 2, title: "User Auth - Failed Login Attempt", description: "Implement backend, frontend, and tests for failed login scenario", status: "not-started" },
  { id: 3, title: "User Auth - User Registration", description: "Implement backend, frontend, and tests for registration scenario", status: "not-started" },
  { id: 4, title: "User Auth - Password Reset", description: "Implement backend, frontend, and tests for password reset scenario", status: "not-started" }
])
```

**Step 5: Implement Each Scenario**

For each scenario in "User Authentication" feature:

1. Mark todo as `in-progress`
2. Get scenario details using `mcp_digitizeit-mc_getScenarioDetails`
3. Implement backend (models → views → URLs → migrations)
4. Implement frontend (pages → components → types)
5. Generate Playwright tests
6. Mark todo as `completed`

**Step 6: Run All Tests**

```bash
# Backend tests
cd django/project
python manage.py check
python manage.py test

# Frontend build
cd nextjs
npm run build
 for this feature only
npx playwright test e2e/user-authentication.spec.ts
npx playwright test
```

If all tests pass, proceed to Step 7. If any fail, fix errors first.

**Step 7: Complete and Report**

```
✅ Feature 'User Authentication' Complete

Implemented:
- 4 scenarios with backend, frontend, and tests
- Django models and API endpoints
- Next.js pages and components
- Playwright E2E tests

Test Results:
- ✅ Django backend tests: PASSED
- ✅ Next.js build: SUCCESS
- ✅ Playwright E2E tests: PASSED

Remaining features: Task Management, Profile Management

Ready for next feature. Type "implement next feature" to continue.
```

**STOPS** - waits for user to request next feature.

---

## Common Issues & Troubleshooting

### Next.js 15+ Async Issues

**Issue**: `searchParams` or `params` type errors in Next.js

**Symptom**:

```
Type error: Type '{ order_id?: string }' is missing properties from type 'Promise<{ order_id?: string }>'
```

**Root Cause**: Next.js 15+ changed `params` and `searchParams` to Promises

**Solution**: BOTH parent page and child components must be async:

```typescript
// ✅ CORRECT - Both async
export default async function ParentPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  return <ChildComponent searchParams={searchParams} />;
}

async function ChildComponent({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;
  // Use order_id
}
```

### Header/Footer Not Showing

**Issue**: Created Header/Footer components but they don't appear on pages

**Symptom**: Components exist in `src/components/` but pages don't show them

**Root Cause**: Forgot to import and use them in `layout.tsx`

**Solution**: Always integrate immediately after creation:

```typescript
// app/(dashboard)/layout.tsx
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

**Verification**: Run `npm run build` to catch TypeScript errors

### Root Page Welcome Flow (screens.json)

**The correct flow:**
1. User signs in → `/` shows the **welcome screen**
2. Welcome screen has a "Go to Dashboard" button
3. Button navigates to the `redirect_link` value (e.g. `/goals-preferences`)

**Correct `app/page.tsx`:**
```typescript
const screen = (screensJSON as ScreensJSON).screens.find(
  (screen) => screen.screen_name === "welcome"
);
// Renders the welcome component — NOT a redirect
```

**Correct `screens.json`:**
```json
{ "screen_name": "welcome", "components": [{ "file_name": "welcome", "redirect_link": "/goals-preferences" }] }
```

**Anti-patterns**:
```typescript
// ❌ WRONG — skips welcome screen entirely
import { redirect } from "next/navigation";
export default function Page() { redirect("/goals-preferences"); }

// ❌ WRONG — falls back to screens[0] which may not be the welcome screen
const screen = screensJSON.screens[0];

// ❌ WRONG — infinite redirect loop
redirect("/");
```

### CRM/Email Integration Failures

**Issue**: Backend tests fail due to external service calls

**Root Cause**: CRM API or email service not available during tests

**Solution**: Mock external services in tests:

```python
@pytest.fixture
def mock_crm(mocker):
    return mocker.patch('requests.post', return_value=Mock(status_code=200))

def test_profile_update_with_crm(mock_crm, api_client):
    # Test will pass even if CRM is down
    response = api_client.post('/app/profile/update/', {...})
    assert response.status_code == 200
    mock_crm.assert_called_once()
```

### Model Field Mismatch

**Issue**: Backend code references `full_name` but model has `display_name`

**Symptom**: `AttributeError: 'Users' object has no attribute 'full_name'`

**Root Cause**: Code written before checking actual model schema

**Solution**: Always check model definition first:

```bash
# Check model fields before writing code
grep -n "class Users" django/project/app/models.py
```

Then use correct field name in code:

```python
# ✅ Correct - matches model
user_data = {
    'display_name': user.display_name,
    'email': user.email
}
```

---
