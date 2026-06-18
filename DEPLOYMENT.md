# 📱 MemoLife Testing & Deployment Guide

## 🚀 QUICK START - LOCAL TESTING

### Backend (Already Running)
✅ Backend is running on `http://127.0.0.1:8000`

Test with:
```bash
curl http://127.0.0.1:8000/health
```

### Frontend - Local Development

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not done)
npm install

# Start Expo dev server
npx expo start

# Press 'i' for iOS or 'a' for Android (if you have emulator)
# Or scan QR code with Expo Go app on your smartphone
```

---

## 📱 SMARTPHONE TESTING (Expo)

### Method 1: Expo Go App (Easiest)

1. **Install Expo Go** on your smartphone from App Store or Google Play
2. **Start backend** (ensure accessible from smartphone IP):
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
3. **Get your machine IP**:
   ```bash
   # macOS/Linux
   ifconfig | grep inet
   # Windows
   ipconfig
   ```
   Note the IP (e.g., `192.168.1.100`)

4. **Update frontend configuration**:
   ```bash
   # frontend/.env.local
   EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
   ```

5. **Start Expo dev server**:
   ```bash
   cd frontend
   npx expo start
   ```

6. **Connect smartphone**:
   - Scan QR code with Expo Go app (or press link in terminal)
   - App will connect to backend on your machine IP

### Method 2: Expo Tunnel (Remote/Different Network)

```bash
cd frontend
npx expo start --tunnel
```

Then scan the tunnel QR code. This works across different networks.

### API Testing from Smartphone

Once app is running on your phone:
1. Create account (Register)
2. Login
3. Test chat functionality
4. Test other features (tasks, health, budget, etc.)

---

## 🐳 DOCKER DEPLOYMENT

### Prerequisites
- Docker installed
- Docker Compose installed

### Deploy Locally with Docker Compose

```bash
# From project root
cp .env.example .env

# Edit .env with your configuration (optional)
# nano .env

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Test API
curl http://localhost:8000/health

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Build Backend Image Only

```bash
cd backend
docker build -t memolife-backend:latest .

docker run -p 8000:8000 \
  -e DATABASE_URL="sqlite:///./memolife_dev.db" \
  memolife-backend:latest
```

---

## 🌍 PRODUCTION DEPLOYMENT

### Prerequisites for Production
1. PostgreSQL database (managed service or self-hosted)
2. SSL/TLS certificate
3. Domain name
4. Server or cloud provider (AWS, DigitalOcean, Heroku, etc.)
5. Environment variables configured

### Production Environment Setup

```bash
# Copy and update .env for production
cp .env.example .env.production

# Edit with production values
nano .env.production
```

**Production .env.production should include:**
```
ENVIRONMENT=production
DATABASE_URL=postgresql://user:password@prod-db-host:5432/memolife_prod
SECRET_KEY=<strong-random-key-min-32-chars>
CORS_ORIGINS=["https://your-domain.com"]
```

### Deploy to Production

#### Option 1: Docker Compose on VPS

```bash
# On production server
git clone <your-repo>
cd memolife_PROJET_COMPLET

# Update .env.production
nano .env.production

# Start with production env
docker-compose --env-file .env.production up -d

# Check health
curl https://your-domain.com/health
```

#### Option 2: Heroku (Simplest)

```bash
# Install Heroku CLI
# heroku login

# Create Heroku app
heroku create memolife-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Option 3: AWS EC2 / DigitalOcean

```bash
# SSH into server
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone and run with docker-compose
git clone <repo>
cd memolife_PROJET_COMPLET
docker-compose -f docker-compose.yml up -d

# Setup SSL with Let's Encrypt (Nginx reverse proxy)
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

---

## 🔒 SECURITY CHECKLIST

Before going to production:

- [ ] Change `SECRET_KEY` to a strong random value (32+ chars)
- [ ] Update `CORS_ORIGINS` to only allow your domain
- [ ] Use PostgreSQL (not SQLite) in production
- [ ] Enable HTTPS/SSL
- [ ] Set up rate limiting
- [ ] Configure database backups
- [ ] Enable logging and monitoring
- [ ] Update dependencies (security patches)
- [ ] Review authentication implementation
- [ ] Set up environment-based configuration
- [ ] Test all API endpoints

---

## 📊 MONITORING & HEALTH CHECKS

### Health Endpoint
```bash
curl http://your-api:8000/health
# Response: {"statut":"ok"}
```

### Docker Health Status
```bash
docker-compose ps

# Status should show: healthy ✓
```

### Database Connection
```bash
docker exec memolife_postgres psql -U postgres -c "SELECT version();"
```

---

## 🐛 TROUBLESHOOTING

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Verify DATABASE_URL is correct
# Ensure PostgreSQL is running

# Check port 8000 is available
lsof -i :8000
```

### Smartphone can't connect to API
```bash
# Verify backend is accessible from smartphone
ping 192.168.1.100  # Use your actual IP

# Check firewall isn't blocking port 8000
sudo ufw allow 8000

# Verify API_URL in frontend/.env.local is correct
```

### Database migration errors
```bash
# Reset database (development only)
docker-compose down -v
docker-compose up -d

# This will recreate all tables
```

---

## 📚 USEFUL COMMANDS

```bash
# View API documentation
http://your-api:8000/docs

# Check running services
docker-compose ps

# View logs for specific service
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend bash

# Restart services
docker-compose restart

# Update and restart
docker-compose down
docker-compose up -d
```

---

## 🚀 NEXT STEPS

1. **Test on Smartphone**: Use Expo Go method with your machine IP
2. **Fix any issues**: Check logs and troubleshoot
3. **Docker Compose**: Verify local Docker deployment works
4. **Production**: Choose deployment option and configure
5. **Monitoring**: Set up logs and health checks
6. **Scaling**: Add load balancer and multiple instances if needed

---

**Status**: ✅ Ready for testing on smartphone & Docker deployment
