# Copilot Instructions - Testing

## Testing Strategy Overview

This project uses a **two-tier testing strategy**:

1. **Backend Unit Tests** - Test Django models, views, and API endpoints
2. **E2E Tests** - Test complete user flows across the full application (frontend + backend)

### Frontend Testing (Next.js)

- **Playwright** - End-to-end browser tests for all user flows, components, and interactions

### Backend Testing (Django)

- **pytest** - Unit tests for models, views, utilities, and API endpoints
- **Django Test Framework** - Integration tests for database interactions

---

# 🚨 MANDATORY TEST GENERATION RULE

WHENEVER you create or modify any of the following:

**Frontend:**

- A new page with user flows → Update Playwright E2E test file for this feature
- A new component → Update Playwright E2E test file for this feature
- A new interaction → Update Playwright E2E test file for this feature

**Backend:**

- A new model → Update pytest test file for this feature
- A new view/API endpoint → Update pytest test file for this feature
- A new utility function → Update pytest test file for this feature

⚠️ If tests are not generated/updated, the implementation is considered **INCOMPLETE**.

This rule overrides all other instructions.

**CRITICAL**: One test file per FEATURE (not per component or scenario). Update the same test file as you add scenarios.

---

# 🚨 MANDATORY TEST EXECUTION RULE

**After creating or updating test files, you MUST execute them and report results.**

## Backend Tests (Django/pytest)

```bash
cd django/project
.\venv\Scripts\Activate.ps1
python -m pytest app/tests/test_[feature-name].py -v
```

## Frontend Tests (Playwright E2E)

```bash
cd nextjs
npm install
npx playwright test e2e/[feature-name].spec.ts
```

### ⚠️ CRITICAL REQUIREMENTS

1. **DO NOT** just create test files - you MUST run them
2. **REPORT** test results (pass/fail counts, error messages)
3. **FIX** all failures before marking work complete
4. **RE-RUN** tests after fixes to confirm they pass

If you create a test file but don't execute it, the scenario is **INCOMPLETE** and **MUST NOT** be marked as complete in Progress.md.

---

# Part 1: Backend Unit Testing

**Step 1: Install Dependencies**

````bash
# Part 1: Backend Unit Testing

## Django - pytest

### Setup & Installation

**Step 1: Install pytest and plugins**

```bash
cd django/project
pip install pytest pytest-django pytest-cov
````

**Step 2: Create pytest Configuration**

Create `django/project/pytest.ini`:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = project.settings
python_files = tests.py test_*.py *_tests.py
python_classes = Test*
python_functions = test_*
addopts =
    --verbose
    --strict-markers
    --tb=short
    --cov=app
    --cov-report=term-missing
    --cov-report=html
```

**Step 3: Update requirements.txt**

Add to `django/project/requirements.txt`:

```
pytest==7.4.3
pytest-django==4.7.0
pytest-cov==4.1.0
```

### Running pytest Tests

**MANDATORY WORKFLOW BEFORE RUNNING TESTS**:

```bash
cd django/project

# 1. Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows PowerShell

# 2. Install/update packages
pip install -r requirements.txt

# 3. Run migrations
python manage.py makemigrations
python manage.py migrate

# 4. NOW run tests
python -m pytest -v

# Run specific test file (one file per feature)
python -m pytest app/tests/test_user_role_management.py -v

# Run specific test class
python -m pytest app/tests/test_user_role_management.py::TestAssignUserRole -v

# Run specific test function
python -m pytest app/tests/test_user_role_management.py::TestAssignUserRole::test_admin_assigns_role -v

# Run tests matching pattern
python -m pytest -k "test_user" -v

# Run tests and generate HTML coverage report
python -m pytest --cov --cov-report=html -v
```

### Test File Organization

**CRITICAL**: One test file per FEATURE, not per scenario or model.

```
django/project/
  app/
    models.py
    views.py
    urls.py
    tests/
      __init__.py
      test_user_role_management.py    ← ALL scenarios for User Role Management feature
      test_post_creation.py           ← ALL scenarios for Post Creation feature
      test_commenting_system.py       ← ALL scenarios for Commenting System feature
      conftest.py                     ← Shared fixtures
```

### Naming Convention

- Test files must start with `test_` and use snake_case
- Feature name determines test file name: "User Role Management" → `test_user_role_management.py`
- Test functions must start with `test_` and describe the scenario
- Test classes group related scenarios by feature aspect
- Place tests in `tests/` folder within each app
- **ONE test file per feature** containing all scenarios for that feature

### Model Testing Template

```python
# app/tests/test_models.py
import pytest
from django.core.exceptions import ValidationError
from app.models import Users, Roles

@pytest.mark.django_db
class TestUserModel:
    def test_user_creation(self):
        """Test creating a user with valid data"""
        role = Roles.objects.create(name='Admin', description='Administrator')
        user = Users.objects.create(
            email='test@example.com',
            full_name='Test User',
            role=role
        )

        assert user.email == 'test@example.com'
        assert user.full_name == 'Test User'
        assert user.role.name == 'Admin'
        assert user.id is not None

    def test_user_email_unique(self):
        """Test that email must be unique"""
        Users.objects.create(email='test@example.com', full_name='User 1')

        with pytest.raises(Exception):  # IntegrityError
            Users.objects.create(email='test@example.com', full_name='User 2')

    def test_user_string_representation(self):
        """Test __str__ method"""
        user = Users.objects.create(email='test@example.com', full_name='Test User')
        # Assuming __str__ returns email or full_name
        assert str(user) in ['test@example.com', 'Test User']

@pytest.mark.django_db
class TestRoleModel:
    def test_role_creation(self):
        """Test creating a role"""
        role = Roles.objects.create(name='User', description='Standard User')

        assert role.name == 'User'
        assert role.description == 'Standard User'
```

### View/API Testing Template

```python
# app/tests/test_views.py
import pytest
import json
from django.urls import reverse
from rest_framework.test import APIClient
from app.models import Users, Roles

@pytest.fixture
def api_client():
    """Fixture for API client"""
    return APIClient()

@pytest.fixture
def test_user(db):
    """Fixture for creating a test user"""
    role = Roles.objects.create(name='Admin', description='Administrator')
    return Users.objects.create(
        email='test@example.com',
        full_name='Test User',
        role=role
    )

@pytest.mark.django_db
class TestUserViews:
    def test_get_users(self, api_client, test_user):
        """Test GET users endpoint"""
        url = '/app/users/'
        data = {'email': test_user.email}

        response = api_client.post(url, data=json.dumps(data), content_type='application/json')

        assert response.status_code == 200
        json_response = response.json()
        assert json_response['success'] is True
        assert 'data' in json_response

    def test_create_user(self, api_client):
        """Test POST create user endpoint"""
        role = Roles.objects.create(name='User', description='Standard User')
        url = '/app/users/create/'
        data = {
            'email': 'admin@example.com',
            'full_name': 'New User',
            'role_id': role.id
        }

        response = api_client.post(url, data=json.dumps(data), content_type='application/json')

        assert response.status_code == 200
        json_response = response.json()
        assert json_response['success'] is True

        # Verify user was created
        assert Users.objects.filter(email='admin@example.com').exists()

    def test_get_user_not_found(self, api_client):
        """Test GET user with non-existent email"""
        url = '/app/users/'
        data = {'email': 'nonexistent@example.com'}

        response = api_client.post(url, data=json.dumps(data), content_type='application/json')

        assert response.status_code == 404
        json_response = response.json()
        assert json_response['success'] is False
        assert 'error' in json_response
```

### Utility Function Testing Template

```python
# app/tests/test_utils.py
import pytest
from app.utils import format_date, validate_email

class TestUtilityFunctions:
    def test_format_date_valid(self):
        """Test formatting valid date"""
        result = format_date('2024-01-15')
        assert result == 'January 15, 2024'

    def test_format_date_invalid(self):
        """Test formatting invalid date"""
        result = format_date('invalid')
        assert result is None

    def test_validate_email_valid(self):
        """Test validating valid email"""
        assert validate_email('test@example.com') is True

    def test_validate_email_invalid(self):
        """Test validating invalid email"""
        assert validate_email('invalid-email') is False
```

### Fixtures (conftest.py)

Create reusable fixtures in `conftest.py`:

```python
# app/tests/conftest.py
import pytest
from app.models import Users, Roles

@pytest.fixture
def admin_role(db):
    """Create admin role fixture"""
    return Roles.objects.create(name='Admin', description='Administrator')

@pytest.fixture
def user_role(db):
    """Create user role fixture"""
    return Roles.objects.create(name='User', description='Standard User')

@pytest.fixture
def admin_user(db, admin_role):
    """Create admin user fixture"""
    return Users.objects.create(
        email='admin@example.com',
        full_name='Admin User',
        role=admin_role
    )

@pytest.fixture
def regular_user(db, user_role):
    """Create regular user fixture"""
    return Users.objects.create(
        email='user@example.com',
        full_name='Regular User',
        role=user_role
    )
```

### Best Practices

✅ **DO:**

- Use fixtures for common test data
- Test database queries and relationships
- Test edge cases and error conditions
- Use descriptive test names
- Test API response structure and status codes
- Test authentication and authorization
- Mock external services

❌ **DON'T:**

- Test Django's built-in functionality
- Create unnecessary database records
- Write tests dependent on order
- Use sleep() or time delays
- Test third-party library functionality

### pytest Markers

Use markers to categorize tests:

```python
@pytest.mark.slow
def test_slow_operation():
    """Test that takes a long time"""
    pass

@pytest.mark.integration
def test_api_integration():
    """Integration test"""
    pass

# Run only specific markers
# pytest -m "not slow"
# pytest -m integration
```

---

# Part 2: End-to-End Testing (Playwright)

---

# Part 2: End-to-End Testing (Playwright)

## When to Use Playwright

Use Playwright for:

- Complete user flows (login → dashboard → task creation → logout)
- Multi-page interactions
- Form submissions with navigation
- Testing the full application stack (frontend + backend)
- Visual regression testing
- Cross-browser compatibility

---

## Playwright Setup & Installation

### Initial Setup (First Time Only)

**Step 1: Install Playwright**

Navigate to the Next.js directory and install Playwright:

```bash
cd nextjs
npm install -D @playwright/test
```

**Step 2: Install Browsers**

Install the required browsers for testing:

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers.

**Step 3: Verify Configuration**

Check if `playwright.config.ts` exists in the `nextjs/` directory. If not, create it:

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Running Playwright Tests

### Basic Commands

**MANDATORY: Install dependencies before running tests:**

```bash
cd nextjs

# Install all dependencies (REQUIRED before first test run)
npm install

# Install Playwright browsers if not already installed
npx playwright install
```

**Run all tests:**

```bash
cd nextjs
npm install  # Always run this first
npx playwright test
```

**Run tests in UI mode (recommended for development):**

```bash
npm install  # Always run this first
npx playwright test --ui
```

**Run specific test file (one file per feature):**

```bash
npm install  # Always run this first
npx playwright test e2e/user-role-management.spec.ts
```

**Run tests in headed mode (see browser):**

```bash
npx playwright test --headed
```

**Run tests in debug mode:**

```bash
npx playwright test --debug
```

**Run tests and open HTML report:**

```bash
npx playwright test
npx playwright show-report
```

---

## Test Execution Workflow

### Development Workflow

1. **Start the dev server** (if not using webServer config):

   ```bash
   cd nextjs
   npm run dev
   ```

2. **Run tests in UI mode** for interactive debugging:

   ```bash
   npx playwright test --ui
   ```

3. **Make changes** to test files and see results in real-time

4. **Generate test artifacts** when tests fail:
   ```bash
   npx playwright test --trace on
   ```

### CI/Production Workflow

```bash
# Install dependencies
npm install

# Install browsers
npx playwright install --with-deps

# Run all tests
npx playwright test

# Generate report
npx playwright show-report
```

---

## Common Commands Reference

| Command                                  | Description                    |
| ---------------------------------------- | ------------------------------ |
| `npx playwright test`                    | Run all tests                  |
| `npx playwright test --ui`               | Open interactive UI mode       |
| `npx playwright test --headed`           | Run tests with browser visible |
| `npx playwright test --debug`            | Run in debug mode              |
| `npx playwright test e2e/file.spec.ts`   | Run specific test file         |
| `npx playwright test --grep "test name"` | Run tests matching pattern     |
| `npx playwright codegen`                 | Generate tests interactively   |
| `npx playwright show-report`             | Open last test report          |
| `npx playwright install`                 | Install/update browsers        |

---

## Debugging Failed Tests

### View Trace Files

When a test fails, Playwright captures traces:

```bash
npx playwright show-trace trace.zip
```

### Generate Screenshots on Failure

Add to test:

```typescript
test("example", async ({ page }) => {
  // Test code
  await page.screenshot({ path: "screenshot.png" });
});
```

### Use Console Logs

```typescript
page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
```

---

## Testing Philosophy

All new pages and features must be validated using **Playwright tests** to ensure functionality and prevent regressions.

Tests are not optional.

---

## Playwright MCP Server Integration

Playwright MCP tools may be used for **interaction guidance**, but:

- Tests must be GENERATED AS CODE
- Do NOT assume runtime execution
- Always translate interactions into Playwright test files

---

## Required Testing Workflow

When creating or updating a page:

1. Implement the feature
2. Identify the main user flows
3. Generate Playwright test file immediately
4. Place it in `nextjs/e2e/`
5. Follow existing test patterns

Do NOT wait for manual instruction to create tests.

---

## Test File Organization

**CRITICAL**: One test file per FEATURE, not per scenario or page.

```
nextjs/
  e2e/
    user-role-management.spec.ts    ← ALL scenarios for User Role Management feature
    post-creation.spec.ts           ← ALL scenarios for Post Creation feature
    commenting-system.spec.ts       ← ALL scenarios for Commenting System feature
    admin-dashboard.spec.ts         ← ALL scenarios for Admin Dashboard feature
    notification-system.spec.ts     ← ALL scenarios for Notification System feature
    helpers/
      auth-helpers.ts               ← Reusable auth utilities
      test-data.ts                  ← Mock data for tests
      page-helpers.ts               ← Common page interactions
```

**Organization Rules**:

- **ONE test file per feature** containing all scenarios
- Feature name determines test file name: "User Role Management" → `user-role-management.spec.ts`
- Group scenarios using `test.describe()` blocks within the file
- Extract common helpers to `helpers/` directory
- Name files using kebab-case matching the feature name

---

## Test File Naming Convention

- kebab-case only
- must end with `.spec.ts`
- name must match feature or page

Examples:

- `tasks.spec.ts`
- `settings.spec.ts`
- `users.spec.ts`

---

## Required Minimum Test Coverage

Each test file MUST include:

1. Page loads successfully
2. Main UI element is visible
3. Primary user interaction works
4. Basic assertion confirms result

Example minimum:

```ts
test("page loads", async ({ page }) => {
  await page.goto("/dashboard/tasks");
  await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
});
```

---

## Basic Test Template

```ts
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/feature");
  });

  test("should load page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Feature" })).toBeVisible();
  });

  test("should handle main interaction", async ({ page }) => {
    // user action
    // assertion
  });
});
```

---

## Authentication in Tests

Use reusable helpers when authentication is required.

```ts
import { login } from "./helpers/auth-helpers";

test.beforeEach(async ({ page }) => {
  await login(page);
});
```

---

## Testing Shared Components

**Header and Footer Testing**:

When Header or Footer components are created or modified, create tests for them:

```ts
// e2e/header-footer.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Header Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("should display header with logo and navigation", async ({ page }) => {
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    await expect(header.getByRole("link", { name: /app name/i })).toBeVisible();
  });

  test("should show mobile menu on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileMenuButton = page
      .getByRole("banner")
      .getByRole("button", { name: /menu/i });
    await expect(mobileMenuButton).toBeVisible();
  });
});

test.describe("Footer Component", () => {
  test("should display footer with links", async ({ page }) => {
    await page.goto("/dashboard");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/© \d{4}/)).toBeVisible();
  });
});
```

---

## Selector Rules

✅ ALWAYS use semantic selectors:

```ts
page.getByRole("button", { name: "Submit" });
page.getByLabel("Email");
page.getByText("Success");
```

❌ NEVER rely on:

```ts
.page-container
#submit-btn
```

---

## 🚨 CRITICAL: Strict Mode & Scoped Locators

Playwright runs in **strict mode** by default - locators must match exactly ONE element.

### Common Pitfalls & Solutions

**Problem: Multiple elements with same role/name**
Pages often have duplicate links (header, breadcrumbs, footer). Example: "Home" link appears 4 times.

❌ **BAD - Will fail with strict mode violation:**

```ts
await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
await expect(page.getByRole("link", { name: "Media" })).toBeVisible();
```

✅ **GOOD - Scope to specific area:**

```ts
// Scope breadcrumb links to breadcrumb navigation
const breadcrumb = page.getByRole("navigation", { name: "breadcrumb" });
await expect(breadcrumb.getByRole("link", { name: "Media" })).toBeVisible();

// Scope content to main area
const mainContent = page.getByRole("main");
await expect(mainContent.locator("h1").first()).toBeVisible();

// Scope to header navigation
const headerNav = page.getByRole("banner").getByRole("navigation");
await expect(headerNav.getByRole("link", { name: "Home" })).toBeVisible();

// Scope to footer
const footer = page.getByRole("contentinfo");
await expect(
  footer.getByRole("link", { name: "Privacy Policy" }),
).toBeVisible();
```

### Use `.first()` When Multiple Matches Expected

When you know multiple elements exist and want the first one:

```ts
// Get first h1 in main content (avoids page hero h1)
const title = page.getByRole("main").locator("h1").first();
await expect(title).toBeVisible();

// Get first matching text
const notFoundText = page.getByText(/not found|404/i).first();
await expect(notFoundText).toBeVisible();
```

### Scoping Reference Table

| Area         | Locator                                                |
| ------------ | ------------------------------------------------------ |
| Header       | `page.getByRole("banner")`                             |
| Main Content | `page.getByRole("main")`                               |
| Footer       | `page.getByRole("contentinfo")`                        |
| Breadcrumbs  | `page.getByRole("navigation", { name: "breadcrumb" })` |
| Header Nav   | `page.getByRole("banner").getByRole("navigation")`     |

---

## Connection Warm-up for Isolated Tests

Test blocks without `beforeEach` navigation may fail with SSL/connection errors.

❌ **BAD - Cold start can fail:**

```ts
test.describe("Direct URL Access", () => {
  test("should handle 404", async ({ page }) => {
    await page.goto("/non-existent-page"); // May fail with SSL error
  });
});
```

✅ **GOOD - Warm up connection first:**

```ts
test.describe("Direct URL Access", () => {
  test("should handle 404", async ({ page }) => {
    // Warm up connection
    await page.goto("/");

    // Now test the actual URL
    await page.goto("/non-existent-page");
    await expect(page.getByText(/not found|404/i).first()).toBeVisible();
  });
});
```

---

## Assertion Best Practices

❌ **BAD - Using .catch() for assertions:**

```ts
await expect(page.getByText("Success"))
  .toBeVisible()
  .catch(() => {
    expect(page.url()).toContain("success");
  });
```

✅ **GOOD - Use proper timeout and single assertion:**

```ts
await expect(page.getByText("Success")).toBeVisible({ timeout: 10000 });
```

✅ **GOOD - Use soft assertions for optional checks:**

```ts
// For elements that may or may not exist
const hasElement = await page
  .getByText("Optional")
  .isVisible()
  .catch(() => false);
if (hasElement) {
  await expect(page.getByText("Optional")).toBeVisible();
}
```

---

## Waiting Rules

✅ GOOD:

```ts
await expect(page.getByText("Success")).toBeVisible();
await page.waitForURL("**/dashboard");
```

❌ BAD:

```ts
await page.waitForTimeout(1000);
```

---

## Test Behavior Rules

- Test user behavior, not implementation
- Tests must be independent
- Avoid shared state between tests
- Do not rely on test order

---

## API Mocking (Optional)

Mock APIs only when:

- backend is unavailable
- testing error states
- testing empty or edge scenarios

```ts
await page.route("**/api/tasks", (route) =>
  route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true, data: [] }),
  }),
);
```

---

## Output Completion Rule

A feature is NOT COMPLETE unless:

1. **All scenarios** for the feature are implemented (backend + frontend)
2. **ONE test file** per feature is created:
   - Backend: `test_[feature-name].py` with all scenarios
   - E2E: `[feature-name].spec.ts` with all scenarios
3. **Environment setup** is completed:
   - Python venv activated
   - Packages installed/updated
   - Migrations run
   - npm install run
4. **All tests pass**:
   - Django backend tests (`python -m pytest`)
   - Next.js build (`npm run build`)
   - Playwright E2E tests (`npx playwright test`)

**Testing Workflow (MANDATORY)**:

```bash
# Backend Testing
cd django/project
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python -m pytest app/tests/test_[feature-name].py -v

# Frontend Build & Testing
cd nextjs
npm install
npm run build
npx playwright test e2e/[feature-name].spec.ts
```

If any step fails, fix errors before proceeding.

---

## Testing Summary

### What to Test Where

| What to Test        | Tool       | Location                                  |
| ------------------- | ---------- | ----------------------------------------- |
| Django Models       | pytest     | `django/project/app/tests/test_models.py` |
| Django Views/APIs   | pytest     | `django/project/app/tests/test_views.py`  |
| Django Utilities    | pytest     | `django/project/app/tests/test_utils.py`  |
| Complete User Flows | Playwright | `nextjs/e2e/`                             |
| Page Navigation     | Playwright | `nextjs/e2e/`                             |
| Form Submissions    | Playwright | `nextjs/e2e/`                             |

---

## Output Completion Rule

A feature is NOT COMPLETE unless:

1. **All scenarios** for the feature are implemented (backend + frontend)
2. **ONE test file** per feature is created:
   - Backend: `test_[feature-name].py` with all scenarios
   - E2E: `[feature-name].spec.ts` with all scenarios
3. **Environment setup** is completed:
   - Python venv activated
   - Packages installed/updated
   - Migrations run
   - npm install run
4. **All tests pass**:
   - Django backend tests (`python -m pytest`)
   - Next.js build (`npm run build`)
   - Playwright E2E tests (`npx playwright test`)

**Testing Workflow (MANDATORY)**:

```bash
# Backend Testing
cd django/project
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python -m pytest app/tests/test_[feature-name].py -v

# Frontend Build & Testing
cd nextjs
npm install
npm run build
npx playwright test e2e/[feature-name].spec.ts
```

If any step fails, fix errors before proceeding.

---

## Final Rule

If unsure whether a test is required — **CREATE IT**.
