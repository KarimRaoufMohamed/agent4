# Copilot Instructions - Figma Design Implementation

## ONE-PROMPT IMPLEMENTATION GOAL

**Objective**: Generate a complete, production-ready, responsive page from a single Figma URL prompt.

**When the user provides a Figma URL or Figma Design System, you MUST**:

1. Fetch design context using `mcp_figma_get_design_context`
2. Extract ALL layout, spacing, colors, and typography values
3. **Extract the design system rules** (colors, typography, spacing, components)
4. Check and update `globals.css` for missing colors
5. Configure fonts in `layout.tsx` if needed
6. **Identify and install required shadcn/ui components** (run `npx shadcn@latest add [component-name]`)
7. **Customize shadcn/ui components** to match the Figma design system (colors, spacing, typography, border radius)
8. Check if Header/Footer exist in `components/` - if yes, use them; if no, create as shared components
9. Use ONLY shadcn/ui components (never custom implementations) - customize them to match design system
10. Implement FULL responsive design (mobile → desktop)
11. Download and save all images to `public/`
12. Extract components into separate files (MUST be in `nextjs/src/components/` or page directories)
13. Generate Playwright tests
14. **Implement all scenarios** from `Scenarios.md` (happy path, error cases, edge cases)
15. Verify pixel-perfect match with design system applied consistently

**All steps above must be completed in ONE TURN** - do not stop midway or ask for confirmation unless there's an error.

**CRITICAL: Figma Design System Integration**

When the user provides a Figma design system in the prompt:

- **Extract the design system rules** (colors, typography, spacing, components)
- **Install matching shadcn/ui components** using `npx shadcn@latest add [component-name]`
- **Customize shadcn components** to match the Figma design system (colors, spacing, typography, border radius)
- **Never create custom components** - always start with shadcn and modify to match design system
- **Apply design system consistently** across all pages and components

**Example**: If Figma design system specifies:

- Primary color: `#3B82F6` → Update `globals.css` with this color as `--primary`
- Border radius: `12px` → Override shadcn components with `rounded-[12px]`
- Font: `Inter` → Configure in `layout.tsx` and use throughout
- Button height: `44px` → Customize Button component with `h-[44px]`

## Required Figma MCP Workflow (NON-NEGOTIABLE)

Pixel-perfect output is only possible if the model is working from the exact frame/node (with real measurements), not guesses.

When the user provides a Figma URL:

1. Extract `fileKey` + `node-id` from the URL.
2. Always fetch BOTH for the SAME node:

- `mcp_figma_get_screenshot(nodeId, fileKey)`
- `mcp_figma_get_design_context(nodeId, fileKey, forceCode: true, disableCodeConnect: true)`

3. If the URL has no `node-id`:

- Call `mcp_figma_get_metadata(nodeId: "0:1", fileKey)` to locate the relevant frame(s).
- Choose the most relevant page/frame by name (route/page name) and proceed.
- If there are multiple plausible frames, treat it as an error and ask the user which node to implement.

Hard rule: never invent spacing/typography/colors when the design context provides values.

## Pixel-Perfect Conversion Philosophy

When implementing designs from Figma using MCP tools, act as a **Pixel-Perfect Front-End Engine** with zero tolerance for deviation.

**Core Principle**: The Figma file is the absolute standard - no exceptions.

## STRICT EXECUTION RULES

### 1. Single Source of Truth

- The Figma file is the absolute standard - no exceptions
- **Do NOT "improve", "modernize", or "simplify" the design**
- **Do NOT change spacing, colors, typography, or alignment**
- **Do NOT add features or elements not in the design**
- **Do NOT omit features or elements that are in the design**

### 2. Geometry & Spacing

**Extract EXACT pixel values** for all layout properties:

- `padding` - Extract from Figma frame padding
- `margin` - Calculate from spacing between elements
- `gap` - Extract from auto-layout gap values
- `width` / `height` - Use exact frame dimensions
- `border-radius` - Use exact corner radius values

**Rules**:

- Do not round or adjust spacing values
- Maintain the exact visual hierarchy defined by font weights and sizes
- Use Figma's spacing values directly

**Example**:

```text
// ❌ WRONG - Rounded/approximated values
<div className="p-4 gap-4 rounded-lg">

// ✅ CORRECT - Exact Figma values
// Use Tailwind arbitrary values for GEOMETRY (spacing/sizing/radius/shadows/typography metrics)
<div className="p-[19.1px] gap-[13.3px] rounded-[15.7px]">
```

#### Geometry Implementation Strategy (Tailwind v4)

Tailwind's default spacing scale will NOT cover most Figma measurements. To prevent “close enough” output:

- You MAY use Tailwind arbitrary values for geometry, including:
  - spacing: `p-[19.1px]`, `px-[22px]`, `gap-[13.3px]`, `mt-[10px]`
  - sizing: `w-[312px]`, `h-[144px]`, `max-w-[1160px]`
  - radius: `rounded-[12px]`
  - shadows: `shadow-[0_10px_30px_rgba(0,0,0,0.12)]`
  - typography metrics: `text-[32px]`, `leading-[44px]`, `tracking-[-0.02em]`

Do NOT use arbitrary values for colors. Colors must be expressed via theme tokens in `globals.css`.

### 3. Colors (CRITICAL RULES)

#### MANDATORY COLOR WORKFLOW

**Step 1: Check globals.css FIRST**

Before implementing any color, ALWAYS check `nextjs/src/app/globals.css` for existing shadcn/ui color variables.

**Step 2: Extract Figma Color**

Get the exact color value from Figma (hex, rgb, or hsl format).

**Step 3: Compare & Decide**

- **If an exact or very close match exists** in globals.css → USE the existing Tailwind class
- **If NO match exists** → ADD the new color to globals.css following shadcn naming convention

**Step 4: Use Tailwind Classes Only**

- **NEVER use custom Tailwind colors** like `bg-[#3B82F6]`
- **NEVER use hardcoded hex/rgb values** directly in components
- **NEVER use CSS variable syntax** like `bg-[hsl(var(--primary))]`
- **ALWAYS use semantic Tailwind classes** that map to CSS variables

#### shadcn/ui Color Classes

Use these semantic Tailwind classes that map to CSS variables:

**Background Colors**:

- `bg-background` - Main background
- `bg-primary` - Primary actions/elements
- `bg-secondary` - Secondary elements
- `bg-muted` - Muted/subdued content
- `bg-accent` - Accent elements
- `bg-card` - Card backgrounds
- `bg-popover` - Popover/dropdown backgrounds
- `bg-destructive` - Destructive actions

**Text Colors**:

- `text-foreground` - Main text
- `text-primary-foreground` - Text on primary background
- `text-secondary-foreground` - Text on secondary background
- `text-muted-foreground` - Muted text
- `text-accent-foreground` - Text on accent background
- `text-card-foreground` - Text on card background
- `text-popover-foreground` - Text on popover background
- `text-destructive-foreground` - Text on destructive background

**Other Colors**:

- `border-border` - Border colors
- `ring-ring` - Focus ring colors

**Opacity Modifiers**:

```tsx
<div className="bg-primary/80">     {/* 80% opacity */}
<div className="text-muted-foreground/50">  {/* 50% opacity */}
```

#### Adding New Colors to globals.css (MANDATORY WORKFLOW)

**CRITICAL**: When ANY design color doesn't match the existing palette, you MUST update `globals.css` IMMEDIATELY.

**Tailwind v4 uses CSS-first configuration** - all colors are defined in the `@theme` block and CSS variables.

**Step-by-Step Process**:

1. **Extract color from Figma** (e.g., `#3B82F6`)
2. **Convert to HSL format** (e.g., `217 91% 60%`) - no `hsl()` wrapper, just numbers
3. **Choose semantic name** following shadcn convention
4. **Add to @theme block** in `globals.css`
5. **Add CSS variables to :root and .dark** in `@layer base`
6. **Use the Tailwind class** in components

**Example: Adding a custom color**

Figma shows `#3B82F6` for a custom blue:

```css
/* nextjs/src/app/globals.css */

@theme {
  /* Existing theme colors... */
  --color-custom-blue: hsl(var(--custom-blue));
  --color-custom-blue-foreground: hsl(var(--custom-blue-foreground));
}

@layer base {
  :root {
    /* Existing colors... */
    --custom-blue: 217 91% 60%; /* ← Add your color here */
    --custom-blue-foreground: 0 0% 100%;
  }

  .dark {
    /* Existing colors... */
    --custom-blue: 217 91% 70%; /* ← Lighter for dark mode */
    --custom-blue-foreground: 0 0% 100%;
  }
}
```

**Note**: In Tailwind v4, there's NO separate config file - everything is CSS-based!

**Naming Convention (Tailwind v4 + shadcn/ui style)**:

- Use **semantic names** that describe purpose: `--chart-1`, `--success`, `--warning`, `--info`
- For custom colors, follow pattern: `--feature-name` (e.g., `--sidebar`, `--highlight`)
- In `@theme` block, prefix with `--color-`: `--color-success`, `--color-custom-blue`
- In `@layer base`, use plain names: `--success`, `--custom-blue`
- Avoid generic names like `--color1` or `--new-color`
- **Ensure each color has both light and dark mode values**

**Then use with Tailwind**:

```tsx
// After adding to globals.css:
// @theme { --color-custom-blue: hsl(var(--custom-blue)); }
// @layer base { :root { --custom-blue: 220 90% 56%; } }

<div className="bg-custom-blue text-white">
  <span className="text-success">Success message</span>
</div>
```

**Common Custom Colors to Add (Tailwind v4 format)**:

```css
/* Add to @theme block */
@theme {
  --color-success: hsl(var(--success));
  --color-warning: hsl(var(--warning));
  --color-info: hsl(var(--info));
  --color-error: hsl(var(--error));
}

/* Add to @layer base */
@layer base {
  :root {
    /* Status colors */
    --success: 142 76% 36%;
    --warning: 38 92% 50%;
    --info: 199 89% 48%;
    --error: 0 84% 60%;

    /* Chart colors (if not already defined) */
    --chart-1: 220 90% 56%;
    --chart-2: 280 65% 60%;
    --chart-3: 340 75% 55%;
    --chart-4: 160 60% 50%;
    --chart-5: 30 80% 55%;
  }

  .dark {
    /* Adjust colors for dark mode */
    --success: 142 71% 45%;
    --warning: 38 87% 60%;
    --info: 199 89% 58%;
    --error: 0 72% 51%;
  }
}
```

#### Examples

❌ **WRONG - Using custom values or incorrect syntax**:

```tsx
<div className="bg-[#3B82F6] text-white">
  <span className="text-[#8B5CF6]">Hello</span>
</div>

<div className="bg-[hsl(var(--primary))] text-white">
  <span>Also wrong syntax</span>
</div>
```

✅ **CORRECT - Using shadcn Tailwind classes**:

```tsx
<div className="bg-primary text-primary-foreground">
  <span className="text-muted-foreground">Hello</span>
</div>

<div className="bg-card border border-border">
  <h2 className="text-foreground">Card Title</h2>
  <p className="text-muted-foreground">Card description</p>
</div>
```

### 4. Typography & Fonts

#### Font Configuration Workflow

**CRITICAL RULE**: NEVER use inline font classes like `font-['FontName']` or `font-[fontName]`.

**ALL fonts MUST be configured in `layout.tsx` and `globals.css`.**

**Step 1: Check Existing Fonts**

- Check `nextjs/src/app/globals.css` for font imports
- Check `nextjs/src/app/layout.tsx` for font configurations

**Step 2: Add New Fonts (if needed)**

If the design font doesn't exist, follow this process:

**Use Next.js Font Optimization** (preferred for performance):

````typescript
// layout.tsx
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}


**Step 3: Use Tailwind Font Classes**

```tsx
// ❌ WRONG - Inline font class
<h1 className="font-['Poppins'] text-2xl">

// ❌ WRONG - Inline font class
<h1 className="font-[Poppins] text-2xl">

// ✅ CORRECT - Tailwind font class
<h1 className="font-poppins text-2xl">
````

#### Typography Properties

Preserve **exact values** from Figma:

- **Font family**: Use Next.js font optimization + Tailwind classes
- **Font weight**: Extract exact weight (300, 400, 500, 600, 700)
- **Font size**: Use exact pixel values or Tailwind classes
- **Line height**: Extract from Figma (e.g., 1.5, 1.75)
- **Letter spacing**: Extract from Figma (e.g., -0.02em, 0.05em)

**Example**:

```tsx
<h1 className="font-poppins text-[32px] font-semibold leading-10 tracking-[-0.02em]">
  Title Text
</h1>
```

### 5. Layout Logic

**Preserve exact layout structure** from Figma:

- Main content columns
- Sidebar layouts
- Grid configurations
- Flexbox arrangements
- Z-index layering

**Use appropriate shadcn/ui components** that match design patterns:

- `Card` for content containers
- `Dialog` for modals
- `Tabs` for tabbed interfaces
- `Sheet` for slide-in panels

**Maintain grid/flex configurations** exactly as designed:

```tsx
// Extract from Figma auto-layout
<div className="grid grid-cols-3 gap-6">
<div className="flex items-center gap-4">
```

### 6. Zero Hallucination Rule

**Critical Requirements**:

- **Do not invent elements** not visible in the design
- **Do not omit elements** that are visible (breadcrumbs, icons, buttons, labels, etc.)
- Every visual element must have a code counterpart
- Every interactive element must be functional

**Verification Checklist**:

- [ ] All headers, titles, and labels present
- [ ] All buttons and interactive elements present
- [ ] All icons and images present
- [ ] All spacing and padding matches
- [ ] All colors match globals.css system
- [ ] All typography matches

### 6a. shadcn/ui Component Usage (MANDATORY)

**CRITICAL RULE**: ALWAYS use shadcn/ui components when they match the design pattern.

**NEVER create custom implementations** for components that exist in shadcn/ui.

#### Component Installation Workflow

**Before implementing any UI pattern, follow this process**:

1. **Identify the UI pattern** from the Figma design (button, card, dialog, etc.)
2. **Check if shadcn/ui has a matching component** (visit https://ui.shadcn.com/docs/components)
3. **Check if it already exists** in `nextjs/src/components/ui/`
4. **If NOT installed**, install it using the shadcn CLI:

```bash
npx shadcn@latest add [component-name]
```

**Common shadcn/ui Components**:

- **button** - ALL buttons must use this
- **card** - ALL card containers must use this
- **dialog** - ALL modals/popups must use this
- **input** - ALL text inputs must use this
- **select** - ALL dropdowns must use this
- **tabs** - ALL tabbed interfaces must use this
- **table** - ALL data tables must use this
- **sheet** - ALL side panels must use this
- **dropdown-menu** - ALL dropdown menus must use this
- **badge** - ALL badges/tags must use this
- **avatar** - ALL user avatars must use this
- **skeleton** - ALL loading states must use this

**Installation Examples**:

```bash
# Install button component
npx shadcn@latest add button

# Install multiple components at once
npx shadcn@latest add card dialog input

```

**Example - WRONG vs RIGHT**:

```tsx
// ❌ WRONG - Custom button implementation
<div className="px-4 py-2 bg-primary text-white rounded-md cursor-pointer">
  Click me
</div>

// ✅ CORRECT - Using shadcn Button
import { Button } from '@/components/ui/button';
<Button>Click me</Button>

// ❌ WRONG - Custom card implementation
<div className="border rounded-lg p-6 shadow-sm">
  <div className="text-xl font-bold">Title</div>
  <div className="text-sm">Content</div>
</div>

// ✅ CORRECT - Using shadcn Card
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### 7. Images & Assets

#### Image Handling Workflow

**Step 1: Identify Images in Design**

Use `mcp_figma_get_design_context` to get asset URLs from Figma.

**Step 2: Download Images**

Download all images from the asset URLs provided in the MCP response.

**Step 3: Save to Project**

Save images to `nextjs/public/` directory with descriptive names:

```
public/
  hero-background.png
  logo.svg
  user-avatar-placeholder.png
  feature-icon-1.svg
```

**Step 4: Use in Next.js**

```tsx
import Image from 'next/image';

// For static images
<Image
  src="/hero-background.png"
  alt="Hero background"
  width={1200}
  height={600}
  priority
/>

// Maintain aspect ratios from Figma
<div className="relative w-full h-100">
  <Image
    src="/feature-image.png"
    alt="Feature"
    fill
    className="object-cover"
  />
</div>
```

**Image Optimization**:

- Use Next.js `<Image>` component (not `<img>`)
- Provide proper `width` and `height` attributes
- Use `priority` prop for above-the-fold images
- Maintain original aspect ratios from design

## Integration Checklist

Before starting implementation, complete this checklist:

- [ ] **Fetch design context** from Figma MCP
- [ ] **Extract all spacing/sizing values** (padding, margin, gap, width, height)
- [ ] **Extract all colors from design** and compare with `globals.css`
- [ ] **Add missing colors** to `@theme` block and `@layer base` in `globals.css`
- [ ] **Verify all colors use** Tailwind v4 CSS variables (not hardcoded)
- [ ] **Check font configuration** in `@theme` block and `layout.tsx`
- [ ] **Download all images** and save to `nextjs/public/`
- [ ] **Identify appropriate shadcn components** for design patterns
- [ ] **Create Next.js page** with server components + auth
- [ ] **Extract components** from page (follow frontend rules)
- [ ] **Verify pixel-perfect match** against Figma overlay

## Responsive Design (MANDATORY)

### Mobile-First Approach

**CRITICAL RULE**: All pages MUST be fully responsive across all breakpoints.

**Tailwind Breakpoints**:

- `sm`: 640px (small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (laptops)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (large desktops)

### Responsive Implementation Checklist

For EVERY page, implement:

- [ ] Mobile layout (default, no prefix)
- [ ] Tablet layout (`md:` prefix)
- [ ] Desktop layout (`lg:` prefix)
- [ ] Responsive typography (font sizes scale with breakpoints)
- [ ] Responsive spacing (padding/margin scale with breakpoints)
- [ ] Responsive grid/flex (columns change with breakpoints)
- [ ] Responsive images (proper sizing at all breakpoints)
- [ ] Mobile navigation (hamburger menu if needed)

### Common Responsive Patterns

#### 1. Responsive Grid Layout

```tsx
{
  /* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */
}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>;
```

#### 2. Responsive Typography

```tsx
{/* Scale font sizes across breakpoints */}
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>

<p className="text-sm md:text-base lg:text-lg">
  Responsive body text
</p>
```

#### 3. Responsive Spacing

```tsx
{
  /* Increase padding on larger screens */
}
<div className="p-4 md:p-6 lg:p-8">
  <div className="space-y-4 md:space-y-6 lg:space-y-8">{/* Content */}</div>
</div>;
```

#### 4. Responsive Flex Direction

```tsx
{
  /* Stack vertically on mobile, horizontal on desktop */
}
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Content A</div>
  <div className="flex-1">Content B</div>
</div>;
```

#### 5. Responsive Sidebar Layout

```tsx
{
  /* Full-width sidebar on mobile, fixed sidebar on desktop */
}
<div className="flex flex-col lg:flex-row">
  {/* Sidebar */}
  <aside className="w-full lg:w-64 lg:fixed lg:h-screen">Sidebar content</aside>

  {/* Main content */}
  <main className="flex-1 lg:ml-64">Main content</main>
</div>;
```

#### 6. Show/Hide Elements by Breakpoint

```tsx
{
  /* Mobile menu button - hide on desktop */
}
<button className="lg:hidden">
  <Menu className="h-6 w-6" />
</button>;

{
  /* Desktop navigation - hide on mobile */
}
<nav className="hidden lg:flex gap-4">
  <a href="/home">Home</a>
  <a href="/about">About</a>
</nav>;
```

#### 7. Responsive Images

```tsx
{
  /* Adjust image size and aspect ratio */
}
<div className="relative w-full h-48 md:h-64 lg:h-80">
  <Image src="/hero.jpg" alt="Hero" fill className="object-cover" />
</div>;
```

#### 8. Responsive Card Layout

```tsx
<Card className="p-4 md:p-6">
  <CardHeader className="space-y-2 md:space-y-3">
    <CardTitle className="text-xl md:text-2xl">Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4 md:space-y-6">
    {/* Content scales with breakpoint */}
  </CardContent>
</Card>
```

### Mobile Navigation Patterns

For dashboard layouts with sidebars:

```tsx
"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="lg:hidden p-2">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        {/* Mobile navigation content */}
      </SheetContent>
    </Sheet>
  );
}
```

### Testing Responsive Design

**MANDATORY**: Test all pages at these breakpoints:

- 375px (iPhone SE)
- 768px (iPad)
- 1024px (Laptop)
- 1440px (Desktop)

**Use browser DevTools** to verify:

- No horizontal scrolling
- All text is readable
- All buttons are clickable
- Images don't overflow
- Layout doesn't break

## Component Mapping

### Figma → shadcn/ui Component Mapping

| Figma Pattern   | shadcn/ui Component           | Installation Command                          |
| --------------- | ----------------------------- | --------------------------------------------- |
| Modal/Popup     | `Dialog`                      | `npx shadcn@latest add dialog`                |
| Card Container  | `Card`                        | `npx shadcn@latest add card`                  |
| Navigation Tabs | `Tabs`                        | `npx shadcn@latest add tabs`                  |
| Dropdown Menu   | `DropdownMenu`                | `npx shadcn@latest add dropdown-menu`         |
| Side Panel      | `Sheet`                       | `npx shadcn@latest add sheet`                 |
| Form Inputs     | `Input`, `Select`, `Textarea` | `npx shadcn@latest add input select textarea` |
| Buttons         | `Button`                      | `npx shadcn@latest add button`                |
| Tables          | `Table`                       | `npx shadcn@latest add table`                 |
| Alerts/Notices  | `Alert`                       | `npx shadcn@latest add alert`                 |
| Breadcrumbs     | `Breadcrumb`                  | `npx shadcn@latest add breadcrumb`            |
| Badges/Tags     | `Badge`                       | `npx shadcn@latest add badge`                 |
| Avatar          | `Avatar`                      | `npx shadcn@latest add avatar`                |

### Component Installation During Implementation

**MANDATORY WORKFLOW**:

1. **Analyze the Figma design** and identify all UI patterns
2. **List required shadcn components** (buttons, cards, dialogs, inputs, etc.)
3. **Check `nextjs/src/components/ui/` directory** for existing components
4. **Install missing components** using `npx shadcn@latest add [component-name]`
5. **Import and use** the installed components in your implementation

**Example Implementation Process**:

```bash
# You see the design has: cards, buttons, dialog, input fields, table
# Install all required components at once
cd nextjs
npx shadcn@latest add card button dialog input table
```

Then use them in your code:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text" />
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>{/* Dialog content */}</DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
```

## Quality Standards

**Output Requirement**: Production-ready code that:

1. ✅ Installs all required shadcn/ui components using `npx shadcn@latest add`
2. ✅ Uses existing Header/Footer components OR creates them as shared components
3. ✅ Creates ALL component files inside `nextjs/src/components/` or page directories
4. ✅ Matches the design overlay perfectly with zero visual discrepancies
5. ✅ Uses globals.css color system consistently (no hardcoded colors)
6. ✅ Implements exact spacing, typography, and layout from Figma
7. ✅ Uses semantic shadcn/ui components appropriately (never custom implementations)
8. ✅ Includes all design elements (no omissions)
9. ✅ Adds no extra elements (no hallucinations)
10. ✅ Optimizes images with Next.js Image component
11. ✅ Follows frontend component organization rules

## Common Mistakes to Avoid

❌ **DO NOT**:

- Forget to install shadcn components before using them
- Create custom button/card/input implementations instead of using shadcn components
- Create component files outside `nextjs/src/components/` or page directories
- Recreate Header/Footer if they already exist (check first!)
- Put Header/Footer code directly in layout (must be separate component files)
- Use `bg-[#hex]` or hardcoded colors
- Use `font-['FontName']` or `font-[fontName]` inline classes
- Round or approximate spacing values
- Change or "improve" the design
- Use `<img>` instead of Next.js `<Image>`
- Put all code in page.tsx (extract components!)
- Omit elements from the design
- Add elements not in the design
- Forget to make the page responsive

✅ **DO**:

- Install shadcn components using `npx shadcn@latest add [component-name]` before using them
- Check if Header/Footer components exist in `components/` folder before creating new ones
- Create Header/Footer as shared components in `nextjs/src/components/`
- Create ALL component files inside `nextjs/src/components/` or page directories
- Check globals.css for colors first, add missing colors to @theme and @layer base immediately
- Configure fonts in @theme block (globals.css) or layout.tsx with Next.js fonts
- Use shadcn/ui components for all standard UI elements
- Use exact Figma values for spacing
- Use semantic Tailwind classes (bg-primary, text-foreground)
- Use Next.js Image optimization
- Extract components into separate files
- Match the design exactly
- Verify against Figma overlay
- Implement full responsive design (mobile, tablet, desktop)
- Test at multiple breakpoints
