# Copilot Instructions - Frontend (Next.js)

## Frontend Implementation Checklist (MANDATORY)

**CRITICAL: Follow this checklist for EVERY frontend implementation. Do NOT skip any step.**

### Before Starting ANY Page Implementation

1. ✅ **Check for existing Header/Footer components** in `src/components/`
   - Look for `header.tsx` (preferred) or `site-header.tsx` or `app-header.tsx`
   - Look for `footer.tsx` (preferred) or `site-footer.tsx` or `app-footer.tsx`
   - If they exist → Import and use them in your layout
   - If they DON'T exist → Create them FIRST as shared components in `src/components/`
2. ✅ **Create header.tsx with navigation links**:
   - Define `navLinks` array with all main pages (Products, Categories, Cart, etc.)
   - Include cart icon with badge (for e-commerce apps)
   - Handle authentication state (Sign In/Sign Up buttons OR UserButton)
   - Make it responsive (desktop nav + mobile overflow menu)
   - Use `usePathname()` for active state highlighting
3. ✅ **Verify Header authentication states**:
   - NOT logged in → Show Sign In and Sign Up buttons
   - IS logged in → Show Clerk `<UserButton />` component
4. ✅ **Ensure Header and Footer are used in layout.tsx** (NOT in individual pages)
   - Import both components
   - Wrap layout with flex column structure
   - Header at top, main content in middle, footer at bottom
5. ✅ **Customize navLinks array** in header.tsx to match your app's pages
6. ✅ **Check for existing TypeScript interfaces** in `src/types/` before creating new ones
7. ✅ **Check for existing utility functions** in `src/utils/` before creating new ones
8. ✅ **Install required shadcn/ui components** using `npx shadcn@latest add [component]`

### During Page Implementation

1. ✅ **Extract components from page.tsx** - NEVER put all code in page.tsx
2. ✅ **Use Server Components** for data fetching (avoid API routes when possible)
3. ✅ **Pass user email** to Django backend for authorization
4. ✅ **Follow Next.js 15+ async params pattern** (await params in dynamic routes)
5. ✅ **Use ONLY shadcn/ui components** - NEVER create custom button/input/card implementations
6. ✅ **Add new public pages to proxy.ts** if they should be accessible without authentication

### After Completing Page Implementation

1. ✅ **Run Next.js build** to verify no errors: `npm run build`
2. ✅ **Run Playwright E2E tests** for this feature: `npx playwright test e2e/[feature-name].spec.ts`
3. ✅ **Fix any test failures** before marking scenario as complete
4. ✅ **Verify responsive design** (mobile, tablet, desktop)
5. ✅ **Confirm Header/Footer are visible** on all pages

---
### Root Page — Welcome Screen Flow

**The correct flow is:**
1. User signs in → lands on `/` → sees the **welcome screen**
2. Welcome screen shows a "Go to Dashboard" button
3. Button uses `redirect_link` from `screens.json` to navigate to the **first real page**

**With `screens.json`** — render the welcome screen at `/`:
```typescript
// app/page.tsx
import dynamic from "next/dynamic";
import screensJSON from "../../screens.json";
import Loader from "@/components/loader";
import { ScreenHeader, ScreensJSON } from "@/types/screens";

const Page: React.FC = async () => {
  const screen = (screensJSON as ScreensJSON).screens.find(
    (screen) => screen.screen_name === "welcome"
  );
  if (!screen) throw new Error("Welcome screen not found");

  const DynamicScreenHeader = screen.screen_header
    ? (dynamic(() => import(`@/components/${screen.screen_header?.file_name}`), {
        loading: () => <Loader />,
      }) as React.ComponentType<ScreenHeader>)
    : null;

  return (
    <>
      {screen.screen_header && DynamicScreenHeader && (
        <DynamicScreenHeader {...screen.screen_header} />
      )}
      <div className="flex flex-col items-center gap-5 mb-5">
        {screen.components?.map((component) => {
          const DynamicComponent = dynamic(
            () => import(`@/components/${component.file_name}`),
            { loading: () => <Loader /> }
          );
          return <DynamicComponent key={component.file_name} {...component} />;
        })}
      </div>
    </>
  );
};

export default Page;
```

The `welcome` component reads `redirect_link` from `screens.json` and uses it for the "Go to Dashboard" button:
```json
{
  "screen_name": "welcome",
  "components": [{ "file_name": "welcome", "redirect_link": "/goals-preferences" }]
}
```

**Without `screens.json`** — render a simple welcome/landing component at `/` with a button linking to the first page:
```typescript
// app/page.tsx
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold text-green-600">Welcome!</h1>
      <Link href="/goals-preferences">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
}
```

### ❌ Anti-patterns to avoid

```typescript
// ❌ WRONG — skips welcome and redirects directly to first page
import { redirect } from "next/navigation";
export default function Page() { redirect("/goals-preferences"); }

// ❌ WRONG — redirects to / (infinite loop)
redirect("/");

// ❌ WRONG — uses screens[0] which may not be the welcome screen
const screen = screensJSON.screens[0];
```
---
## Route Organization

### Directory Structure

- **(auth)**: Clerk authentication pages (sign-in, sign-up) with centered layout
- **(dashboard)**: Authenticated routes with custom dashboard layout
- Use Next.js **App Router file conventions**: `layout.tsx`, `page.tsx`, `route.ts`

### Route Examples

```
app/
  (auth)/
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
    layout.tsx                          ← Centered auth layout
  (dashboard)/
    page.tsx                            ← Dashboard home
    tasks/page.tsx                      ← Tasks page
    settings/page.tsx                   ← Settings page
    layout.tsx                          ← Dashboard layout with sidebar
  api/
    webhooks/route.ts                   ← Clerk webhook handler
    example/route.ts                    ← API endpoint for client components
```

## Authentication Patterns

### Server Components (PREFERRED)

```typescript
// app/(dashboard)/example/page.tsx
import { currentUser } from "@clerk/nextjs/server";

export default async function ExamplePage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!email) {
    return <div>Please sign in</div>;
  }

  // Direct fetch to Django backend
  const response = await fetch(`${process.env.API_URL}/app/endpoint/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  return <div>{/* render data */}</div>;
}
```
---
### API Routes (Use Only When Necessary)

Use API routes ONLY for:

- Client-side interactivity requirements
- Fetching from client components
- Webhooks or external callbacks

**CRITICAL - Next.js 15+ Async Params:**

In Next.js 15+, route `params` is a Promise and MUST be awaited before accessing properties.

**⚠️ THIS APPLIES TO BOTH `route.ts` AND `page.tsx` FILES WITH DYNAMIC ROUTES!**

❌ **WRONG - Will cause error:**

```typescript
// app/api/posts/[id]/route.ts OR app/(dashboard)/posts/[id]/page.tsx
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }, // ❌ Wrong type
) {
  const postId = params.id; // ❌ Error: params is a Promise
  // ...
}
```

✅ **CORRECT - Await params first:**

```typescript
// app/api/posts/[id]/route.ts OR app/(dashboard)/posts/[id]/page.tsx
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ✅ Correct type
) {
  const { id } = await params; // ✅ Await before accessing
  const postId = id; // ✅ Now you can use it
  // ...
}
```

**Example with body parsing:**

```typescript
// app/api/example/route.ts
import { currentUser } from "@clerk/nextjs/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // ✅ Always await params first
  const body = await req.json();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  const response = await fetch(`${process.env.API_URL}/app/endpoint/${id}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, ...body }),
  });

  return Response.json(await response.json());
}
```

**Example - Server Component page.tsx:**

```typescript
// app/(dashboard)/posts/[id]/view/page.tsx
export default async function ViewPostPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ Promise type
}) {
  const { id } = await params; // ✅ Await first
  const user = await currentUser();
  // ... rest of code
}
```

**This applies to ALL dynamic route parameters in BOTH route.ts AND page.tsx:**

- `params.id` → `const { id } = await params;`
- `params.slug` → `const { slug } = await params;`
- `params.userId` → `const { userId } = await params;`
- Any `[paramName]` folder in your route path

**CRITICAL - Next.js 15+ Async searchParams:**

In Next.js 15+, `searchParams` is ALSO a Promise and must be awaited.

**⚠️ BOTH PARENT AND CHILD COMPONENTS MUST BE ASYNC!**

❌ **WRONG - Parent passes sync searchParams to child:**

```typescript
// Parent page.tsx
export default function ParentPage({
  searchParams,
}: {
  searchParams: { order_id?: string }; // ❌ Wrong - not a Promise
}) {
  return <ChildComponent searchParams={searchParams} />; // ❌ Will fail
}

// Child component
async function ChildComponent({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams; // ❌ Type mismatch
}
```

✅ **CORRECT - Both parent AND child are async:**

```typescript
// Parent page.tsx
export default async function ParentPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>; // ✅ Promise type
}) {
  return <ChildComponent searchParams={searchParams} />; // ✅ Pass Promise
}

// Child component
async function ChildComponent({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>; // ✅ Promise type
}) {
  const { order_id } = await searchParams; // ✅ Await it
  // Now use order_id
}
```

**Common searchParams patterns:**

- `searchParams.query` → `const { query } = await searchParams;`
- `searchParams.page` → `const { page } = await searchParams;`
- `searchParams.filter` → `const { filter } = await searchParams;`

### API Routes (Use Only When Necessary - Original Section)

```typescript
// app/api/example/route.ts
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  const response = await fetch(`${process.env.API_URL}/app/endpoint/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return Response.json(await response.json());
}
```

### Protected Routes & Middleware Configuration (CRITICAL)

**File Location**: `nextjs/src/proxy.ts`

This file configures Clerk authentication middleware and defines which routes are public vs. protected.

#### How It Works

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  // Add your public routes here
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      const signUpUrl = new URL("/sign-up", request.url);
      return NextResponse.redirect(signUpUrl);
    }
  }
  return NextResponse.next();
});
```

#### When to Update proxy.ts

**ALWAYS update `src/proxy.ts` when you create a new public page that should be accessible without authentication.**

**Examples of public pages**:

- Landing pages: `/`, `/about`, `/contact`
- Product browsing: `/products`, `/products/[id]`, `/browse`
- Marketing pages: `/pricing`, `/features`, `/blog`
- Legal pages: `/privacy`, `/terms`

**Examples of protected pages** (no proxy.ts update needed):

- User dashboards: `/dashboard`, `/profile`, `/settings`
- User-specific actions: `/cart`, `/orders`, `/wishlist`
- Admin pages: `/admin/*`

#### How to Add Public Routes

**Step 1: Identify the route pattern**

- Single page: `/about` → `"/about"`
- Dynamic route: `/products/[id]` → `"/products(.*)"`
- Nested routes: `/blog/*` → `"/blog(.*)"`

**Step 2: Add to `isPublicRoute` array in proxy.ts**

```typescript
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/", // ✅ Homepage
  "/about", // ✅ About page
  "/products(.*)", // ✅ All product pages
  "/browse(.*)", // ✅ Browse pages
  "/contact", // ✅ Contact page
]);
```

**Step 3: Test authentication behavior**

- Visit the page while logged out → Should NOT redirect to sign-up
- Visit a protected page while logged out → Should redirect to sign-up

#### Pattern Matching Rules

- **Exact match**: `"/about"` matches only `/about`
- **Wildcard**: `"/products(.*)"` matches `/products`, `/products/123`, `/products/category/electronics`
- **API routes**: `"/api/public(.*)"` matches `/api/public/*`

#### Default Configuration

- **Public routes**: `/sign-in`, `/sign-up`, `/api/webhooks`
- **Protected routes**: Everything else (all dashboard routes)

**CRITICAL**: If you create a public page and forget to add it to proxy.ts, unauthenticated users will be redirected to sign-up when they try to access it.

---

## Code Organization Rules

### CRITICAL: Component Separation

**NEVER put all code in page.tsx** - This is the most important rule.

#### Page File Rules

- **ALWAYS extract components into separate files**
- Pages should only handle layout and data fetching
- Break down ANY page that has more than 100 lines into smaller components
- If you're writing JSX for cards, tables, forms, or any UI element, create a separate component file
- Page files should be lightweight orchestrators that compose smaller components

#### What to Keep in page.tsx

- Data fetching logic
- Authentication checks
- Basic layout structure
- Component composition

#### What to Extract from page.tsx

- Any custom JSX component (cards, tables, forms, headers, sidebars)
- Reusable UI patterns (list items, filters, search bars)
- Complex rendering logic (conditional displays, mappings)

### TypeScript Interfaces & Types

Location: `nextjs/src/types/` directory

**MANDATORY WORKFLOW (NON-NEGOTIABLE):**

1. **BEFORE creating ANY interface**, check `nextjs/src/types/` directory
2. **IF the interface exists** → IMPORT it (do NOT recreate it)
3. **IF the interface does NOT exist** → Create it in the appropriate types file
4. **NEVER define interfaces inline** in page.tsx or component files if they represent domain models

**RULES:**

- **ALWAYS check if the interface already exists before creating a new one**
- Search the types folder for similar interfaces and reuse them
- Use clear, descriptive names following PascalCase convention
- One file per domain (e.g., `user.ts`, `task.ts`, `api.ts`, `post.ts`, `comment.ts`)

**❌ WRONG - Defining interface inline:**

```typescript
// app/(dashboard)/posts/[id]/view/page.tsx
interface Post {
  // ❌ WRONG - interface already exists in types/post.ts
  PostID: number;
  Title: string;
  Content: string;
}

export default async function ViewPostPage() {
  // ...
}
```

**✅ CORRECT - Import existing interface:**

```typescript
// app/(dashboard)/posts/[id]/view/page.tsx
import { Post, PostsListResponse } from "@/types/post"; // ✅ Import from types

export default async function ViewPostPage() {
  // ...
}
```

**Example types file:**

```typescript
// types/task.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  success: boolean;
  data: Task[];
}
```

### Utility Functions

Location: `nextjs/src/utils/` directory

**RULES:**

- **ALWAYS check if a utility function already exists before creating a new one**
- Search the utils folder for existing helper functions
- Create focused, single-purpose utility functions
- Use clear, descriptive names following camelCase convention

```typescript
// utils/date-helpers.ts
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// utils/api-helpers.ts
export async function fetchWithAuth(
  url: string,
  email: string,
  options?: RequestInit,
) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: JSON.stringify({
      email,
      ...JSON.parse((options?.body as string) || "{}"),
    }),
  });
}
```

### shadcn/ui Component Installation (MANDATORY)

**CRITICAL RULE**: Before implementing ANY UI pattern, check if shadcn/ui has a matching component.

#### IMPORTANT: shadcn Defaults Are Not “Pixel-Perfect”

Using shadcn/ui components is mandatory, but their default paddings, radii, typography, and spacing often will NOT match Figma.

- You MUST override styles via `className` (and component sub-slots like `CardHeader`, `CardContent`, etc.) to match Figma values.
- Do NOT accept “close enough” spacing just because a component looks good by default.
- Combine with the geometry rules in `copilot-figma.md` (Tailwind arbitrary values for spacing/sizing/radius/shadow are allowed).

#### Component Installation Workflow

**Step 1: Identify the UI Pattern**

Determine what UI element you need (button, card, dialog, input, etc.)

**Step 2: Check shadcn/ui Documentation**

Visit https://ui.shadcn.com/docs/components to see available components.

**Step 3: Check If Already Installed**

Check `nextjs/src/components/ui/` directory for the component.

**Step 4: Install If Missing**

If the component doesn't exist, install it using the shadcn CLI:

```bash
# Navigate to Next.js directory
cd nextjs

# Install single component
npx shadcn@latest add button

# Install multiple components
npx shadcn@latest add card dialog input button
```

#### Common shadcn/ui Components

**Form & Input Components**:

- `button` - ALL buttons
- `input` - ALL text inputs
- `textarea` - ALL multi-line inputs
- `select` - ALL dropdowns
- `checkbox` - ALL checkboxes
- `radio-group` - ALL radio buttons
- `switch` - ALL toggle switches
- `slider` - ALL range sliders
- `label` - ALL form labels
- `form` - ALL forms (includes validation)

**Layout Components**:

- `card` - ALL card containers
- `separator` - ALL dividers
- `tabs` - ALL tabbed interfaces
- `accordion` - ALL collapsible sections
- `sheet` - ALL slide-in panels
- `scroll-area` - ALL scrollable containers

**Overlay Components**:

- `dialog` - ALL modals/popups
- `alert-dialog` - ALL confirmation dialogs
- `popover` - ALL popovers
- `tooltip` - ALL tooltips
- `hover-card` - ALL hover cards

**Feedback Components**:

- `alert` - ALL alerts/notices
- `badge` - ALL badges/tags
- `toast` - ALL notifications
- `skeleton` - ALL loading states
- `progress` - ALL progress bars

**Navigation Components**:

- `dropdown-menu` - ALL dropdown menus
- `menubar` - ALL menubars
- `navigation-menu` - ALL navigation menus
- `breadcrumb` - ALL breadcrumbs
- `pagination` - ALL pagination controls

**Data Display Components**:

- `table` - ALL data tables
- `avatar` - ALL user avatars
- `calendar` - ALL date pickers
- `command` - ALL command palettes

#### Installation Examples

```bash
# Install form components
npx shadcn@latest add form input button select

# Install layout components
npx shadcn@latest add card tabs separator

# Install overlay components
npx shadcn@latest add dialog sheet popover

# Install all commonly used components at once
npx shadcn@latest add button card dialog input select table tabs badge avatar skeleton
```

**NEVER create custom implementations** of these components - always use shadcn/ui.

#### ⚠️ Common shadcn/ui Component Errors

**Select Component - Empty Value Error**:

❌ **WRONG - Will cause runtime error:**

```tsx
<Select>
  <SelectContent>
    <SelectItem value="">Select option</SelectItem>{" "}
    {/* ❌ Empty string not allowed */}
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

✅ **CORRECT - Use non-empty value or omit placeholder item:**

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />{" "}
    {/* Use placeholder prop instead */}
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**Rule**: `<SelectItem />` must NEVER have an empty string as the `value` prop. Use the `placeholder` prop on `<SelectValue />` instead.

### Component Organization

Location: `nextjs/src/components/` for shared components

**RULES:**

- **ALL component files MUST be created inside `nextjs/src/components/` or page directories**
- **NEVER create components in the root or other locations**
- Check `nextjs/src/components/` for existing shared components before creating new ones
- Break down complex pages into smaller, reusable components
- Place **reusable components** in `nextjs/src/components/`
- Place **page-specific components** in the same directory as the page that uses them
- Follow the single responsibility principle - one component, one purpose

**CRITICAL**: Component file location is non-negotiable:

- ✅ `nextjs/src/components/header.tsx`
- ✅ `nextjs/src/app/(dashboard)/tasks/task-filters.tsx`
- ❌ `nextjs/header.tsx` (root level - WRONG)
- ❌ `nextjs/src/header.tsx` (wrong directory)

#### Example Structure

```
src/
  app/
    (dashboard)/
      layout.tsx                    ← Uses Header/Footer components
      tasks/
        page.tsx                    ← Main page (data fetching + layout only)
        task-header.tsx             ← Page-specific section header (NOT site header)
        task-filters.tsx            ← Page-specific filters
        task-create-dialog.tsx      ← Page-specific create dialog
  components/
    header.tsx                      ← SHARED site header (used in layout)
    footer.tsx                      ← SHARED site footer (used in layout)
    navigation.tsx                  ← Shared navigation component
    task-card.tsx                   ← Shared task card component
    task-list.tsx                   ← Shared task list component
    task-status-badge.tsx           ← Shared status badge
    ui/                             ← shadcn/ui components (installed via CLI)
      button.tsx
      card.tsx
      dialog.tsx
      input.tsx
      select.tsx
  types/
    task.ts                         ← Task interfaces
  utils/
    task-helpers.ts                 ← Task utility functions
```

#### Component File Template

```typescript
// components/task-card.tsx
import { Task } from '@/types/task';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TaskCardProps {
  task: Task;
  onUpdate?: (task: Task) => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{task.description}</p>
      </CardContent>
    </Card>
  );
}
```

### Header & Footer Components (MANDATORY SHARED COMPONENTS)

**CRITICAL RULE**: Header and Footer MUST ALWAYS be present in ALL pages and MUST be created as shared components in `nextjs/src/components/`.

**Authentication State Requirements (NON-NEGOTIABLE)**:

- **When user is NOT logged in**: Header MUST show Sign In and Sign Up buttons
- **When user IS logged in**: Header MUST show Clerk `<UserButton />` component
- **Never show both**: Either show auth buttons OR user button, never both

#### Workflow for Header & Footer (MANDATORY FOR EVERY IMPLEMENTATION)

**⚠️ CRITICAL: Header and Footer are REQUIRED for EVERY page implementation. Do NOT skip this step.**

**Step 1: Check If Already Exists**

Before creating header or footer:

```bash
# Check for existing header
ls nextjs/src/components/header.tsx
ls nextjs/src/components/site-header.tsx
ls nextjs/src/components/app-header.tsx

# Check for existing footer
ls nextjs/src/components/footer.tsx
ls nextjs/src/components/site-footer.tsx
ls nextjs/src/components/app-footer.tsx
```

**Step 2: If Exists - USE IT**

Import and use the existing component in your layout:

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

**Step 3: If NOT Exists - CREATE AS SHARED COMPONENT WITH AUTHENTICATION STATES**

Create header and footer as separate shared component files with proper authentication handling:

**⚠️ CRITICAL: After creating components, you MUST integrate them into layout.tsx!**

**Header Component Pattern (header.tsx):**

The header should be a flexible navigation component that includes:
- Logo/brand link
- Main navigation links to all primary pages
- Shopping cart icon with badge (if applicable)
- Authentication state handling (Sign In/Sign Up buttons OR UserButton)
- Responsive design (mobile menu for small screens)

```typescript
// components/header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { ShoppingCart, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface NavLink {
  href: string;
  label: string;
  adminOnly?: boolean;
}

const navLinks: NavLink[] = [
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/cart', label: 'Cart' },
  { href: '/workflows', label: 'Workflows' },
  { href: '/admin-reviews', label: 'Admin Reviews', adminOnly: true },
];

export function Header() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Fetch cart item count (if applicable)
  useEffect(() => {
    if (!isSignedIn || !user?.primaryEmailAddress?.emailAddress) return;
    
    const fetchCartCount = async () => {
      try {
        const response = await fetch(`/api/cart?email=${user.primaryEmailAddress?.emailAddress}`);
        if (response.ok) {
          const data = await response.json();
          setCartItemCount(data.ItemCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch cart count:', error);
      }
    };
    
    fetchCartCount();
    
    // Refresh cart count periodically
    const interval = setInterval(fetchCartCount, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn, user?.primaryEmailAddress?.emailAddress]);
  
  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };
  
  // Check if user is admin (customize based on your auth logic)
  const isAdmin = user?.publicMetadata?.role === 'admin' || 
                  user?.emailAddresses?.[0]?.emailAddress?.includes('admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/products" className="flex items-center gap-2 font-semibold">
          <Store className="h-6 w-6" />
          <span className="hidden sm:inline-block">E-commerce Store</span>
        </Link>
        
        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            // Skip admin-only links for non-admin users
            if (link.adminOnly && !isAdmin) return null;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive(link.href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Icon with Badge (if applicable) */}
          {isSignedIn && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
          
          {/* Authentication State: Show Sign In/Sign Up OR UserButton */}
          {isSignedIn ? (
            <UserButton 
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9'
                }
              }}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t">
        <nav className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
          {navLinks.map((link) => {
            if (link.adminOnly && !isAdmin) return null;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive(link.href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
```

**Key Features of Header Component:**
- **Navigation Array**: Define all main navigation links in a structured array
- **Active State Detection**: Highlights current page using `usePathname()`
- **Role-Based Access**: Conditionally show admin-only links based on user role
- **Cart Badge**: Real-time cart item count (refreshes every 30 seconds)
- **Authentication States**: Sign In/Sign Up buttons when logged out, UserButton when logged in
- **Responsive Design**: Desktop navigation + mobile overflow scroll navigation
- **Sticky Header**: Always visible at top of page with backdrop blur

#### When to Update Header Navigation (CRITICAL FOR SCENARIOS)

**RULE**: When implementing a scenario that creates a new page, you MUST update the header's `navLinks` array if the page is a "main page" (not a detail/dynamic route).

**Main Page vs Detail Page:**

| Type | Description | Example Routes | Add to Header? |
|------|-------------|----------------|----------------|
| **Main Page** | A primary destination users navigate to directly. List, collection, or dashboard pages. | `/products`, `/categories`, `/cart`, `/orders`, `/checkout`, `/workflows` | ✅ YES - Add to navLinks |
| **Detail Page** | Shows a single item. Accessed via links from main pages. Uses dynamic route `[id]`. | `/product/[id]`, `/order/[id]`, `/workflow/[id]`, `/user/[id]` | ❌ NO - Use contextual links |
| **Form/Action Page** | Specific action or form related to a resource. | `/product/create`, `/order/edit`, `/checkout/payment` | ⚠️ DEPENDS - Add if primary action |

**Step-by-Step: Adding a Page to Header Navigation**

1. **Identify if page is a main page**:
   - Does the scenario describe it as a primary feature? → YES
   - Is it a list/collection page? → YES
   - Does it use `[id]` or `[slug]` in the route? → NO (detail page)

2. **Open header.tsx** and locate the `navLinks` array:
   ```typescript
   const navLinks: NavLink[] = [
     { href: '/products', label: 'Products' },
     // Add your new page here
   ];
   ```

3. **Add your new page** to the array:
   ```typescript
   const navLinks: NavLink[] = [
     { href: '/products', label: 'Products' },
     { href: '/categories', label: 'Categories' },
     { href: '/cart', label: 'Cart' },
     { href: '/orders', label: 'Orders' },        // ← New page
     { href: '/workflows', label: 'Workflows' },
   ];
   ```

4. **Add `adminOnly: true`** if the page is admin-only:
   ```typescript
   { href: '/admin-reviews', label: 'Admin Reviews', adminOnly: true },
   ```

5. **Run build** to verify:
   ```bash
   npm run build
   ```

**Examples from E-commerce Scenarios:**

| Scenario | Page Created | Route | Add to Header? | Reason |
|----------|--------------|-------|----------------|--------|
| "Browse products" | Products page | `/products` | ✅ YES | Main collection page |
| "View product details" | Product detail page | `/product/[id]` | ❌ NO | Detail page (dynamic) |
| "Manage cart" | Cart page | `/cart` | ✅ YES | Primary shopping feature |
| "Checkout process" | Checkout page | `/checkout` | ⚠️ MAYBE | Important but accessed from cart |
| "View orders" | Orders page | `/orders` | ✅ YES | User's order history |
| "Order details" | Order detail page | `/order/[id]` | ❌ NO | Detail page (dynamic) |
| "Admin reviews" | Admin reviews page | `/admin-reviews` | ✅ YES (admin) | Admin primary feature |

**Best Practices:**
- **Keep it focused**: Only add truly primary pages to header (5-7 links max)
- **Order by importance**: Most used pages first
- **Use clear labels**: 1-2 words per link
- **Consider user role**: Use `adminOnly` for admin-restricted pages
- **Detail pages use contextual links**: Add "View" or "Edit" buttons on list pages instead

**Decision Flowchart:**

```
When implementing a scenario that creates a new page:

1. Does the route contain [id], [slug], or [param]?
   └─ YES → ❌ DON'T add to header (it's a detail page)
   └─ NO → Continue to step 2

2. Is it a list/collection/dashboard page?
   └─ YES → ✅ ADD to header (main page)
   └─ NO → Continue to step 3

3. Is it mentioned as a primary feature in the scenario?
   └─ YES → ✅ ADD to header (important feature)
   └─ NO → Continue to step 4

4. Will users need to access it frequently?
   └─ YES → ✅ ADD to header (frequent access)
   └─ NO → ❌ DON'T add to header (use contextual links)
```

**Quick Reference:**

| Route Pattern | Add to Header? | Alternative Navigation |
|---------------|----------------|------------------------|
| `/products` | ✅ YES | - |
| `/product/[id]` | ❌ NO | Click product from `/products` |
| `/cart` | ✅ YES | Header cart icon also available |
| `/checkout` | ⚠️ MAYBE | Usually accessed from cart button |
| `/orders` | ✅ YES | - |
| `/order/[id]` | ❌ NO | Click order from `/orders` |
| `/admin-reviews` | ✅ YES (admin) | - |
| `/workflows` | ✅ YES | - |
| `/workflow/[id]` | ❌ NO | Click workflow from `/workflows` |

**Simplified Header (Minimal Version):**

```typescript
// components/header.tsx (simpler version without cart/roles)
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserButton, useUser } from '@clerk/nextjs';

export function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          App Name
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/settings">Settings</Link>

          {/* Authentication State: Show Sign In/Sign Up OR UserButton */}
          {!isSignedIn ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </nav>
      </div>
    </header>
  );
}
```

**Footer Component Pattern:**

```typescript
// components/footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} App Name. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
```

#### Header & Footer Naming Conventions

**Acceptable names**:

- `header.tsx` / `footer.tsx` (preferred)
- `site-header.tsx` / `site-footer.tsx`
- `app-header.tsx` / `app-footer.tsx`

**File location**: ALWAYS `nextjs/src/components/` (shared components)

**Component naming**: Export as named export (e.g., `export function Header()`)

**Step 4: INTEGRATE INTO LAYOUT (MANDATORY)**

After creating Header and Footer components, update the layout:

```typescript
// app/(dashboard)/layout.tsx
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

**⚠️ CRITICAL: Run `npm run build` after integration to verify it works!**

#### Customizing Navigation Links

When implementing header.tsx, customize the `navLinks` array based on your application's pages:

```typescript
// Customize this array with your actual pages
const navLinks: NavLink[] = [
  { href: '/products', label: 'Products' },           // E-commerce
  { href: '/categories', label: 'Categories' },       // E-commerce
  { href: '/cart', label: 'Cart' },                   // E-commerce
  { href: '/orders', label: 'Orders' },               // E-commerce
  { href: '/workflows', label: 'Workflows' },         // Workflow management
  { href: '/admin-reviews', label: 'Admin Reviews', adminOnly: true }, // Admin only
];
```

**Rules for navLinks:**
- Add ALL main pages that users need quick access to
- Use `adminOnly: true` for admin-restricted pages
- Keep labels short (1-2 words)
- Order by importance (most used first)
- Remove cart/orders if not an e-commerce app
- Add your specific feature pages (dashboard, analytics, settings, etc.)

#### Header & Footer Best Practices

1. **Make them responsive** (mobile, tablet, desktop)
2. **Use shadcn/ui components** for buttons, navigation, etc.
3. **Include proper accessibility** (semantic HTML, ARIA labels)
4. **Extract navigation to separate component** if complex
5. **Keep them reusable** across different layouts
6. **ALWAYS handle authentication state**: Show Sign In/Sign Up OR UserButton (never both)
7. **Use `useUser()` from Clerk** to check authentication state
8. **ALWAYS integrate into layout.tsx immediately** - don't just create the files
9. **ALWAYS run `npm run build`** after integration to catch TypeScript errors
10. **Customize navLinks array** to match your application's pages

#### Navigation Integration Checklist

After creating ANY navigation component (button, sidebar section, breadcrumbs, etc.):

**BEFORE implementing navigation:**
- [ ] ✅ **Verify layout structure exists** (check if AppSidebar/header is in layout.tsx)
- [ ] ✅ **Check if similar component exists** to avoid duplicates
- [ ] ✅ **Ensure layout imports** SidebarProvider/header components if needed

**AFTER creating component:**
- [ ] ✅ **Import the component** in the appropriate layout file
- [ ] ✅ **Add it to the layout** (header, sidebar, or content area)
- [ ] ✅ **Pass required props** (userEmail, data, etc.)
- [ ] ✅ **Run `npm run build`** to verify no TypeScript errors
- [ ] ✅ **Test in browser** to ensure it appears and functions correctly
- [ ] ✅ **Check responsive behavior** on mobile, tablet, and desktop

**CRITICAL RULES**: 
- A navigation component is NOT complete until it's integrated into the layout and verified working
- ALWAYS verify the layout has the required structure (sidebar, header) before adding navigation elements
- If AppSidebar doesn't exist in layout.tsx, add it before creating sidebar sections
- If header doesn't exist in layout.tsx, add sticky header structure before creating header buttons

#### Common Header/Footer Mistakes to Avoid

❌ **WRONG - Creating header/footer but NOT using them**:

```typescript
// You created header.tsx and footer.tsx but forgot to import them in layout.tsx
// Users won't see the header/footer!
```

❌ **WRONG - Creating navigation components but NOT adding them to layout**:

```typescript
// You created cart-button.tsx or feature-button.tsx but forgot to import in layout.tsx
// The button won't appear on any pages!
```

❌ **WRONG - Adding header buttons without checking if layout has header structure**:

```typescript
// You created a header button component but layout.tsx has no <header> element
// The button has nowhere to be placed!
```

❌ **WRONG - Not running build after making changes**:

❌ **WRONG - 
❌ **WRONG - Creating header/footer but NOT using them**:

```typescript
// You created header.tsx and footer.tsx but forgot to import them in layout.tsx
// Users won't see the header/footer!
```

❌ **WRONG - Not running build after making changes**:

```bash
# You made changes but didn't verify they work
# Always run: npm run build
```

❌ **WRONG - Parent component not async when passing searchParams to child**:

```typescript
// Parent passes searchParams but isn't async
export default function Page({ searchParams }) { // ❌ Not async
  return <Child searchParams={searchParams} />; // ❌ Type error
}
```

❌ **WRONG - Showing both Sign In/Sign Up AND UserButton**:

```typescript
// Header shows all buttons at once - confusing UX
<Button>Sign In</Button>
<Button>Sign Up</Button>
<UserButton />
```

❌ **WRONG - Not handling authentication state**:

```typescript
// Header always shows Sign In/Sign Up, even when user is logged in
export function Header() {
  return (
    <header>
      <Button>Sign In</Button>
    </header>
  );
}
```

✅ **CORRECT - Conditional authentication state**:

```typescript
'use client';
import { useUser } from '@clerk/nextjs';

export function Header() {
  const { isSignedIn } = useUser();
  return (
    <header>
      {!isSignedIn ? (
        <><Button>Sign In</Button><Button>Sign Up</Button></>
      ) : (
        <UserButton />
      )}
    </header>
  );
}
```

**Example - Responsive Header with Mobile Menu and Authentication States**:

```typescript
// components/header.tsx
'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserButton, useUser } from '@clerk/nextjs';

export function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          App Name
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-primary">
            Dashboard
          </Link>
          <Link href="/settings" className="hover:text-primary">
            Settings
          </Link>

          {/* Authentication State */}
          {!isSignedIn ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/dashboard" className="text-lg">
                Dashboard
              </Link>
              <Link href="/settings" className="text-lg">
                Settings
              </Link>

              {/* Mobile Authentication State */}
              {!isSignedIn ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </>
              ) : (
                <UserButton afterSignOutUrl="/" />
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
```

## Backend Communication

### Rules

1. **PRIORITY: Use Server Components** for data fetching
2. Server components can directly fetch from Django backend
3. **Never call Django directly from client components**
4. Use Next.js API routes (`/api/*`) only when client-side interactivity is required

### Environment Variable

```typescript
// Server Components and API Routes
const API_URL = process.env.API_URL; // http://localhost:8000
```

### Passing User Email to Django

All Django requests must include the user's email for authorization:

```typescript
const response = await fetch(`${process.env.API_URL}/app/endpoint/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: userEmail,
    // ... other data
  }),
});
```

## UI Component Library (shadcn/ui)

### Available Components

Components located in `nextjs/src/components/ui/`:

- Radix UI primitives + Tailwind CSS v4 styling
- Configuration via `components.json`
- Colors defined in `globals.css` using `@theme` directive
- Common components: Button, Card, Dialog, Form, Input, Select, Table, Tabs

### Data Visualization

Use **Recharts** for charts:

```typescript
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis } from 'recharts';

// Example usage
<LineChart width={600} height={300} data={data}>
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
  <XAxis dataKey="name" />
  <YAxis />
</LineChart>
```

### Naming Convention

- shadcn/ui components use kebab-case: `button.tsx`, `card.tsx`, `dialog.tsx`
- Custom components use PascalCase: `TaskCard.tsx`, `UserProfile.tsx`

## TypeScript Best Practices

- **No `any` types** - always provide proper typing
- Use TypeScript strict mode
- Define interfaces for all API responses
- Use type guards for runtime checks

```typescript
// Good
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Type guard
function isTask(obj: unknown): obj is Task {
  return (
    typeof obj === "object" && obj !== null && "id" in obj && "title" in obj
  );
}
```

## Common Patterns

### Loading States

```typescript
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <DataComponent />
    </Suspense>
  );
}
```

### Toast Notifications (CRITICAL - SONNER ONLY)

**⚠️ IMPORTANT: The `toast` component is DEPRECATED. Always use `sonner` instead.**

#### Installation

```bash
cd nextjs
npx shadcn@latest add sonner
```

#### Setup (Required in Root Layout)

Add the `<Toaster />` component to your root layout:

```typescript
// app/layout.tsx
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

#### Usage

```typescript
// Import toast from sonner
import { toast } from "sonner";

// Success notification
toast.success("Product added to cart");

// Error notification
toast.error("Failed to load products");
toast.error(data.error || "Failed to add to cart");

// Info notification
toast.info("Processing your request");

// Warning notification
toast.warning("Low stock available");

// Custom notification with description
toast.success("Order placed", {
  description: "Your order has been confirmed",
});
```

#### ❌ NEVER Use Deprecated Toast Format

```typescript
// ❌ WRONG - Deprecated format
import { useToast } from "@/hooks/use-toast";
const { toast } = useToast();
toast({
  title: "Success",
  description: "Product added to cart",
  variant: "destructive",
});

// ✅ CORRECT - Sonner format
import { toast } from "sonner";
toast.success("Product added to cart");
toast.error("Failed to add to cart");
```

#### Key Differences

- **No `useToast()` hook** - Direct import from `sonner`
- **Simpler API** - Just call `toast.success()` or `toast.error()`
- **No object format** - Pass string directly
- **No `variant` prop** - Use different methods (`success`, `error`, `info`, `warning`)

### Error Handling

```typescript
// app/(dashboard)/tasks/page.tsx
export default async function TasksPage() {
  try {
    const response = await fetch(`${process.env.API_URL}/app/tasks/`);

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const data = await response.json();
    return <TaskList tasks={data.data} />;
  } catch (error) {
    return <div>Error loading tasks. Please try again.</div>;
  }
}
```

### Client Component Interactivity

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function TaskCreateButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ /* data */ }),
      });
      // Handle response
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleCreate} disabled={isLoading}>
      Create Task
    </Button>
  );
}
```
