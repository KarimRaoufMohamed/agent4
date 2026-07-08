# Use the official Python image from the Docker Hub
FROM python:3.12.8

# Define build arguments
ARG app_migrations=true
ARG create_superuser=true


# Set the working directory inside the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Install dependencies
RUN pip install --default-timeout=100 -r project/requirements.txt 

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Expose the port the app runs on
EXPOSE 8000

# Pass build args as environment variables to be used in entrypoint
ENV APP_MIGRATIONS=${app_migrations}
ENV CREATE_SUPERUSER=${create_superuser}
ENV RUN_REPORTS=false
ENV RUN_ROLES=false

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
CMD ["sh", "-c", "cd /app/project && gunicorn project.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120"]
