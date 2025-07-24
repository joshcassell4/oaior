.PHONY: dev dev-build dev-up dev-down dev-logs dev-restart dev-clean \
        prod prod-build prod-up prod-down prod-logs prod-restart \
        build up down logs restart clean health status \
        frontend-logs backend-logs mongodb-logs test

# === DEVELOPMENT COMMANDS ===
# 🛠 Start development environment (with build)
dev:
	docker-compose -f docker-compose.dev.yml up --build

# 🔨 Build development containers
dev-build:
	docker-compose -f docker-compose.dev.yml build

# 🚀 Start development environment (background)
dev-up:
	docker-compose -f docker-compose.dev.yml up -d

# 🛑 Stop development environment
dev-down:
	docker-compose -f docker-compose.dev.yml down

# 📜 Follow development logs
dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# 🔄 Restart development environment
dev-restart: dev-down dev-up

# 🧹 Clean development environment (with volumes)
dev-clean:
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

# === PRODUCTION COMMANDS ===
# 🚀 Start production environment
prod:
	docker-compose up -d

# 🔨 Build production containers
prod-build:
	docker-compose build

# ⬆️ Start production environment (background)
prod-up:
	docker-compose up -d

# 🛑 Stop production environment
prod-down:
	docker-compose down

# 📜 Follow production logs
prod-logs:
	docker-compose logs -f

# 🔄 Restart production environment
prod-restart: prod-down prod-up

# === LEGACY COMMANDS (default to production) ===
# 🐳 Build all containers (production)
build: prod-build

# 🚀 Run containers in the background (production)
up: prod-up

# 🛑 Stop containers (production)
down: prod-down

# 📜 Follow logs from all services (production)
logs: prod-logs

# 🔄 Restart everything (production)
restart: prod-restart

# 🧹 Clean everything (production, with volumes)
clean:
	docker-compose down -v
	docker system prune -f

# === SERVICE-SPECIFIC COMMANDS ===
# 📱 Frontend logs only
frontend-logs:
	docker-compose logs -f frontend

# 🔧 Backend logs only
backend-logs:
	docker-compose logs -f backend

# 🗄️ MongoDB logs only
mongodb-logs:
	docker-compose logs -f mongodb

# === HEALTH & STATUS COMMANDS ===
# 🏥 Check health of all services
health:
	@echo "=== Service Health Status ==="
	@docker-compose ps
	@echo "\n=== Container Health Checks ==="
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 📊 Show service status
status:
	docker-compose ps

# 🧪 Test API endpoints
test:
	@echo "Testing API endpoints..."
	@echo "Backend health: $$(curl -s http://localhost:8000/health || echo 'FAILED')"
	@echo "Nginx health: $$(curl -s http://localhost/health || echo 'FAILED')"
	@echo "Frontend: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost/ || echo 'FAILED')"
