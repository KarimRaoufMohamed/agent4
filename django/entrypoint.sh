#!/bin/bash

# Add the project directory to PYTHONPATH
export PYTHONPATH=/app/project:$PYTHONPATH
export DJANGO_SETTINGS_MODULE=project.settings

# Function to check if postgres is ready
# postgres_ready() {
# python << END
# import sys
# import psycopg2
# import os
# import urllib.parse as urlparse

# url = os.getenv('DATABASE_URL')
# try:
#     result = urlparse.urlparse(url)
#     username = result.username
#     password = result.password
#     database = result.path[1:]
#     hostname = result.hostname
#     port = result.port
#     conn = psycopg2.connect(
#         dbname=database,
#         user=username,
#         password=password,
#         host=hostname,
#         port=port
#     )
# except psycopg2.OperationalError:
#     sys.exit(-1)
# sys.exit(0)
# END
# }

# until postgres_ready; do
#   >&2 echo "Postgres is unavailable - sleeping"
#   sleep 1
# done

# >&2 echo "Postgres is up - continuing..."

# Handle app migrations if enabled
if [ "$APP_MIGRATIONS" = "true" ]; then
    echo "Creating app migrations..."
    cd /app/project && python manage.py makemigrations app
fi

# Apply all migrations
echo "Applying database migrations..."
cd /app/project && python manage.py migrate

# Collect static files
echo "Collecting static files..."
cd /app/project && python manage.py collectstatic --noinput

# Create superuser if needed
if [ "$CREATE_SUPERUSER" = "true" ]; then
    echo "Creating/updating superuser..."
    cd /app/project && python manage.py shell << END
import os
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.filter(username='admin').delete()
User.objects.create_superuser('admin', 'admin@example.com', 'iVx874AJc8hL')
END
fi


# Start server
echo "Starting server..."
exec "$@"