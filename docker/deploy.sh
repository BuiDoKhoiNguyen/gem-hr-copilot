#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# GEM HR Copilot - Production Deployment Script
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo "🚀 Starting GEM HR Copilot deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "📝 Copy .env.example to .env and fill in your API keys:"
    echo ""
    echo "   cp .env.example .env"
    echo "   # Edit .env with your actual API keys"
    echo ""
    exit 1
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."

source .env

required_vars=(
    "LLM_API_KEY"
    "LLM_BASE_URL"
    "LLM_MODEL"
    "EMBED_BASE_URL"
    "EMBED_MODEL"
    "RERANK_BASE_URL"
    "RERANK_MODEL"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [ "${!var}" = "your_llm_api_key_here" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing or placeholder values for:"
    printf '   %s\n' "${missing_vars[@]}"
    echo ""
    echo "📝 Please update your .env file with actual values"
    exit 1
fi

echo "✅ Environment validation passed"

# Build and start services
echo "🏗️ Building services..."
docker compose build --parallel

echo "🚀 Starting services..."
docker compose up -d

# Wait for health checks
echo "⏳ Waiting for services to be healthy..."
sleep 10

max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker compose ps | grep -q "unhealthy"; then
        echo "⏳ Services still starting... ($((attempt+1))/$max_attempts)"
        sleep 5
        attempt=$((attempt+1))
    else
        break
    fi
done

# Check service status
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🔍 Health Checks:"
echo "Backend: $(curl -s http://localhost:${BACKEND_PORT:-8000}/health | jq -r '.status // "❌ Failed"' 2>/dev/null || echo "❌ Failed")"
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:${FRONTEND_PORT:-3000} 2>/dev/null | grep -q "200" && echo "✅ OK" || echo "❌ Failed")"
echo "Nginx: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:${NGINX_PORT:-80} 2>/dev/null | grep -q "200" && echo "✅ OK" || echo "❌ Failed")"

echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:${NGINX_PORT:-80}"
echo "   Backend API: http://localhost:${NGINX_PORT:-80}/api"
echo "   Direct Backend: http://localhost:${BACKEND_PORT:-8000}"
echo "   Direct Frontend: http://localhost:${FRONTEND_PORT:-3000}"

echo ""
echo "📋 Useful Commands:"
echo "   View logs:         docker compose logs -f"
echo "   View specific:     docker compose logs -f backend|frontend|worker|nginx"
echo "   Stop services:     docker compose down"
echo "   Rebuild:           docker compose up -d --build"
echo "   Queue stats:       curl http://localhost:${NGINX_PORT:-80}/api/ingest/queue/stats"

echo ""
echo "✅ Deployment complete!"