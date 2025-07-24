# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Development stage (for dev docker-compose)
FROM build as development

# Expose port for development
EXPOSE 3000

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build production assets
FROM build as build-prod
RUN npm run build

# Production stage
FROM nginx:alpine as production

# Copy built files from build stage
COPY --from=build-prod /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nginx_app && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx_app -g nginx_app nginx_app && \
    chown -R nginx_app:nginx_app /usr/share/nginx/html && \
    chown -R nginx_app:nginx_app /var/cache/nginx && \
    chown -R nginx_app:nginx_app /var/log/nginx && \
    chown -R nginx_app:nginx_app /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx_app:nginx_app /var/run/nginx.pid

# Switch to non-root user
USER nginx_app

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]