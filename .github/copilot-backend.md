# Copilot Instructions - Backend (Django)

## Django App Structure

### Project Organization

```
django/project/
  app/                      ← Core application
    models.py               ← Core data models
    views.py                ← API endpoints
    urls.py                 ← URL routing
    admin.py                ← Admin interface registration
    migrations/             ← Database migrations
  project/                  ← Django settings
    settings.py             ← Main configuration
    urls.py                 ← Root URL routing
    wsgi.py                 ← WSGI config
  database/
    db.sqlite3              ← SQLite database file
```

## API Conventions

### View Decorators

**CRITICAL**: All views must use appropriate decorators:

```python
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

# Standard API view
@api_view(['GET'])
def get_items(request):
    return JsonResponse({
        'success': True,
        'data': []
    })

# Multiple HTTP methods
@api_view(['POST', 'PUT'])
def update_item(request):
    return JsonResponse({
        'success': True,
        'data': {}
    })

# External webhook (Clerk, etc.)
@csrf_exempt
@api_view(['POST'])
def webhook_handler(request):
    return JsonResponse({
        'success': True
    })
```

### Response Format

**Standard response structure:**

```python
# Success response
return JsonResponse({
    'success': True,
    'data': {
        # ... response data
    }
})

# Error response
return JsonResponse({
    'success': False,
    'error': 'Error message here'
}, status=400)
```

### User Authorization

All API endpoints should extract user email from request and validate:

```python
import json

@api_view(['POST'])
def protected_endpoint(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')

        if not email:
            return JsonResponse({
                'success': False,
                'error': 'Email is required'
            }, status=400)

        # Get user from database
        try:
            user = Users.objects.get(email=email)
        except Users.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'User not found'
            }, status=404)

        # Process request
        return JsonResponse({
            'success': True,
            'data': {}
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
```

## Database Models

### Model Best Practices

```python
from django.db import models
import uuid

class ExampleModel(models.Model):
    # Use UUID for primary keys where appropriate
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Or use AutoField for sequential IDs
    # id = models.AutoField(primary_key=True)

    # Required fields
    name = models.CharField(max_length=255)
    description = models.TextField()

    # Optional fields
    status = models.CharField(max_length=50, blank=True, null=True)

    # Relationships
    user = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='examples')

    # Timestamps (auto-managed)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'example_model'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
```

### Field Type Guidelines

- **CharField**: Fixed-length strings (max 255 chars typically)
- **TextField**: Unlimited text, flexible data storage
- **IntegerField**: Whole numbers
- **DecimalField**: Precise decimal numbers (financial data)
- **BooleanField**: True/False values
- **DateTimeField**: Timestamps
- **UUIDField**: Unique identifiers
- **ForeignKey**: One-to-many relationships
- **ManyToManyField**: Many-to-many relationships
- **JSONField**: Structured JSON data (SQLite 3.9.0+)

### Model Naming Conventions

- Use PascalCase: `Users`, `TaskItem`, `ReportDefinition`
- Plural for collection models: `Users`, `Roles`
- Singular for single-entity models: `UserProfile`, `SystemConfig`

### Example Models

```python
# Core user model
class Users(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.ForeignKey('Roles', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name_plural = 'Users'

# Role model
class Roles(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'roles'
        verbose_name_plural = 'Roles'
```

## Database Migrations

### Creating Migrations

```bash
# Create migration for app
python manage.py makemigrations app

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations
```

### Migration Best Practices

1. **One model change per migration** when possible
2. **Always review generated migrations** before applying
3. **Add data migrations** when needed for existing data
4. **Never edit applied migrations** - create new ones instead

### Custom Data Migration Example

```python
# migrations/0002_populate_default_roles.py
from django.db import migrations

def create_default_roles(apps, schema_editor):
    Roles = apps.get_model('app', 'Roles')
    Roles.objects.get_or_create(name='Admin', defaults={'description': 'Administrator'})
    Roles.objects.get_or_create(name='User', defaults={'description': 'Standard User'})

class Migration(migrations.Migration):
    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_roles),
    ]
```

## Admin Interface

### Registering Models

```python
# app/admin.py
from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Users, Roles

@admin.register(Users)
class UsersAdmin(ModelAdmin):
    list_display = ['email', 'full_name', 'role', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['email', 'full_name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Roles)
class RolesAdmin(ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']
```

### django-unfold Features

The project uses **django-unfold** for a modern admin UI:

- Configured in `settings.py` under `INSTALLED_APPS` and `UNFOLD` settings
- Provides improved UI/UX for Django admin
- Supports custom theming and branding

## URL Routing

### App URLs

```python
# app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.get_users, name='get_users'),
    path('users/create/', views.create_user, name='create_user'),
    path('users/<uuid:user_id>/', views.get_user, name='get_user'),
    path('tasks/', views.get_tasks, name='get_tasks'),
]
```

### Root URLs

```python
# project/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('app/', include('app.urls')),
]
```

## Django Settings Configuration

### Critical Settings

```python
# settings.py

# CORS Configuration (required for frontend)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

# CSRF Trusted Origins (required for frontend)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
]

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'database' / 'db.sqlite3',
    }
}

# Static Files (WhiteNoise)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

## Common Patterns

### List View with Filtering

```python
@api_view(['POST'])
def get_tasks(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        status = data.get('status')  # Optional filter

        user = Users.objects.get(email=email)
        tasks = user.tasks.all()

        if status:
            tasks = tasks.filter(status=status)

        return JsonResponse({
            'success': True,
            'data': list(tasks.values())
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
```

### Create View

```python
@api_view(['POST'])
def create_task(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        title = data.get('title')
        description = data.get('description')

        user = Users.objects.get(email=email)

        task = Task.objects.create(
            user=user,
            title=title,
            description=description
        )

        return JsonResponse({
            'success': True,
            'data': {
                'id': str(task.id),
                'title': task.title,
                'created_at': task.created_at.isoformat()
            }
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
```

### Update View

```python
@api_view(['PUT'])
def update_task(request, task_id):
    try:
        data = json.loads(request.body)
        email = data.get('email')

        user = Users.objects.get(email=email)
        task = Task.objects.get(id=task_id, user=user)

        # Update fields
        if 'title' in data:
            task.title = data['title']
        if 'status' in data:
            task.status = data['status']

        task.save()

        return JsonResponse({
            'success': True,
            'data': {
                'id': str(task.id),
                'title': task.title,
                'status': task.status
            }
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
```

### Delete View

```python
@api_view(['DELETE'])
def delete_task(request, task_id):
    try:
        data = json.loads(request.body)
        email = data.get('email')

        user = Users.objects.get(email=email)
        task = Task.objects.get(id=task_id, user=user)
        task.delete()

        return JsonResponse({
            'success': True,
            'data': {'id': str(task_id)}
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
```

## Error Handling

### Standard Error Responses

```python
# 400 Bad Request
return JsonResponse({
    'success': False,
    'error': 'Invalid request data'
}, status=400)

# 404 Not Found
return JsonResponse({
    'success': False,
    'error': 'Resource not found'
}, status=404)

# 500 Internal Server Error
return JsonResponse({
    'success': False,
    'error': 'Internal server error'
}, status=500)
```

## Django ORM Best Practices

### Efficient Queries

```python
# Use select_related for foreign keys
tasks = Task.objects.select_related('user').all()

# Use prefetch_related for reverse foreign keys and many-to-many
users = Users.objects.prefetch_related('tasks').all()

# Use .values() for specific fields
tasks = Task.objects.values('id', 'title', 'status')

# Use .exists() for boolean checks
has_tasks = Task.objects.filter(user=user).exists()
```

### Aggregation

```python
from django.db.models import Count, Avg, Sum

# Count related objects
user_stats = Users.objects.annotate(task_count=Count('tasks'))

# Calculate averages
avg_completion = Task.objects.aggregate(avg=Avg('completion_rate'))
```

## Django Testing & Syntax Checking

### Python Virtual Environment Setup (MANDATORY)

**CRITICAL**: ALWAYS use a virtual environment for Django projects.

```bash
# Navigate to Django directory
cd django/project

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Windows Command Prompt:
.\venv\Scripts\activate.bat

# Linux/Mac:
source venv/bin/activate
```

### Install and Update Packages

```bash
# Install packages from requirements.txt
pip install -r requirements.txt

# Install specific packages
pip install pytest pytest-django

# Update requirements.txt after installing new packages
pip freeze > requirements.txt
```

### Database Migrations (Run BEFORE Tests)

```bash
# ALWAYS run these after implementing new models or changes
cd django/project
.\venv\Scripts\Activate.ps1  # Activate venv first

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Check for migration issues
python manage.py makemigrations --dry-run --verbosity 3
```

### Check for Syntax Errors

```bash
cd django/project
.\venv\Scripts\Activate.ps1  # Activate venv first

# Check for syntax errors
python manage.py check

# Check for deployment issues
python manage.py check --deploy
```

### Run Django Tests with pytest

**MANDATORY WORKFLOW**:

1. Activate virtual environment
2. Install/update packages
3. Run migrations
4. Run tests

```bash
cd django/project
.\venv\Scripts\Activate.ps1  # Activate venv
pip install -r requirements.txt  # Install packages
python manage.py migrate  # Run migrations

# Run all tests with pytest
python -m pytest -v

# Run tests for specific file
python -m pytest app/tests/test_[feature-name].py -v

# Run specific test class
python -m pytest app/tests/test_[feature-name].py::TestClassName -v

# Run specific test function
python -m pytest app/tests/test_[feature-name].py::TestClassName::test_function -v
```

### Run Development Server

```bash
cd django/project

# Start development server
python manage.py runserver

# Start on specific port
python manage.py runserver 8000
```

### Static Files Collection (for production)

```bash
cd django/project

# Collect static files
python manage.py collectstatic --noinput
```

### Backend Testing Best Practices

1. **Always run `python manage.py check`** before committing code
2. **Run tests after implementing new features** to ensure nothing breaks
3. **Use `--verbosity=2`** for detailed test output during development
4. **Validate migrations** before applying them to production
5. **Keep test database** with `--keepdb` for faster test iterations
