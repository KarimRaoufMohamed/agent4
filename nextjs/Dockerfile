# Use the official Node.js image from the Docker Hub
FROM node:20-alpine

# Accept build argument for environment
ARG ENVIRONMENT=production
 
# Set the working directory inside the container
WORKDIR /app
 
# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install
 
# Set NODE_ENV after installing dependencies
ENV NODE_ENV=${ENVIRONMENT}
 
# Copy the rest of the application code
COPY . .

# Copy the appropriate .env file based on NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then \
        cp -f .env.production .env; \
        rm -f .env.local; \
    else \
        cp -f .env.local .env; \
        rm -f .env.local; \
    fi
 
# Build the Next.js app
RUN npm run build
 
# Expose the port the app runs on
EXPOSE 3000
 
# Command to run the app
CMD ["npm", "start"]