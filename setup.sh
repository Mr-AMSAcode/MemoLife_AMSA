#!/bin/bash
# ────────────────────────────────────────────
# MemoLife Setup & Deploy Script
# Usage: ./setup.sh [local|docker|production]
# ────────────────────────────────────────────

set -e

ENVIRONMENT=${1:-local}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 MemoLife Setup Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Environment: $ENVIRONMENT"
echo "Project Dir: $PROJECT_DIR"
echo ""

# ─────── UTILITY FUNCTIONS ───────
function cleanup_processes() {
    echo "🧹 Cleaning up stale processes..."
    pkill -f "uvicorn" || true
    pkill -f "python.*app.main" || true
    sleep 2
}

function setup_env() {
    echo "⚙️  Setting up environment..."
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example (update with your values)"
    fi
}

# ─────── LOCAL SETUP ───────
function setup_local() {
    echo "📦 Setting up LOCAL environment..."
    
    cleanup_processes
    
    cd "$PROJECT_DIR/backend"
    
    # Create venv if not exists
    if [ ! -d "venv" ]; then
        echo "📚 Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Install/upgrade dependencies
    echo "📥 Installing dependencies..."
    ./venv/bin/pip install --upgrade pip
    ./venv/bin/pip install -r requirements.txt
    
    # Start backend
    echo "🚀 Starting backend server..."
    rm -f memolife_dev.db
    ./venv/bin/python -m uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --reload &
    
    BACKEND_PID=$!
    sleep 3
    
    echo ""
    echo "✅ Backend started (PID: $BACKEND_PID)"
    echo "📍 API available at: http://localhost:8000"
    echo "📖 Docs at: http://localhost:8000/docs"
    echo ""
    echo "Frontend setup:"
    echo "  cd frontend && npm install && npx expo start"
    echo ""
}

# ─────── DOCKER SETUP ───────
function setup_docker() {
    echo "🐳 Setting up DOCKER environment..."
    
    cleanup_processes
    setup_env
    
    cd "$PROJECT_DIR"
    
    echo "🐘 Starting PostgreSQL & Backend..."
    docker-compose down -v 2>/dev/null || true
    docker-compose up -d
    
    sleep 5
    
    # Wait for healthy status
    echo "⏳ Waiting for services to be healthy..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            echo "✅ Services are healthy"
            break
        fi
        echo "  ...waiting ($i/30)"
        sleep 1
    done
    
    echo ""
    echo "✅ Docker environment ready"
    echo "📍 API available at: http://localhost:8000"
    echo "🐘 PostgreSQL: localhost:5432"
    echo ""
    echo "View logs: docker-compose logs -f backend"
    echo "Stop services: docker-compose down"
    echo ""
}

# ─────── PRODUCTION SETUP ───────
function setup_production() {
    echo "🌍 Setting up PRODUCTION environment..."
    echo ""
    echo "⚠️  PRODUCTION CHECKLIST:"
    echo "  [ ] Update .env.production with production values"
    echo "  [ ] Configure PostgreSQL (managed service or self-hosted)"
    echo "  [ ] Update CORS_ORIGINS to your domain"
    echo "  [ ] Change SECRET_KEY to strong random value"
    echo "  [ ] Setup SSL/TLS certificate"
    echo "  [ ] Configure DNS records"
    echo ""
    
    if [ ! -f ".env.production" ]; then
        cp .env.example .env.production
        echo "✅ Created .env.production"
        echo "📝 Update it with your production values"
        echo ""
    fi
    
    echo "Deploy with:"
    echo "  docker-compose -f docker-compose.yml --env-file .env.production up -d"
    echo ""
}

# ─────── MAIN ───────
case $ENVIRONMENT in
    local)
        setup_local
        ;;
    docker)
        setup_docker
        ;;
    production)
        setup_production
        ;;
    *)
        echo "Usage: $0 [local|docker|production]"
        echo ""
        echo "Examples:"
        echo "  $0 local       # Local development (requires Python venv)"
        echo "  $0 docker      # Docker Compose setup"
        echo "  $0 production  # Production configuration (manual deploy)"
        exit 1
        ;;
esac

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup complete!"
echo ""
