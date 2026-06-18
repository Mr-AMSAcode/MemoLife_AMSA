# 🧠 MemoLife - AI Personal Assistant

MemoLife is an intelligent personal assistant application designed with local-first AI, powered by:
- **Backend**: FastAPI + SQLAlchemy (PostgreSQL/SQLite)
- **Frontend**: React Native (Expo) + TypeScript
- **AI Engine**: Ollama + Qwen3 (4B local model)
- **TTS**: Piper TTS (local, no cloud APIs)

---

## 🎯 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker & Docker Compose (optional)
- Expo CLI

### 1️⃣ Backend - Local Development

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend ready at: **http://localhost:8000**
📖 API docs: **http://localhost:8000/docs**

### 2️⃣ Frontend - Local Development

```bash
cd frontend

# Install dependencies
npm install

# Start Expo
npx expo start

# Scan QR code with Expo Go app (iOS/Android)
# Or press 'a' for Android / 'i' for iOS emulator
```

### 3️⃣ Frontend Configuration

Update your API URL in `frontend/.env.local`:
```
# For local testing on phone, use your machine IP
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

---

## 📱 Testing on Smartphone

### Option 1: Automatic Setup (Easiest)

```bash
# From project root
chmod +x test-smartphone.sh
./test-smartphone.sh
```

This will:
1. Detect your machine IP
2. Update frontend configuration
3. Start Expo dev server
4. Show QR code to scan

### Option 2: Manual Setup

1. **Get your machine IP**:
   ```bash
   # macOS/Linux
   ifconfig | grep inet
   # Windows
   ipconfig
   ```

2. **Update frontend config**:
   ```bash
   # frontend/.env.local
   EXPO_PUBLIC_API_URL=http://YOUR_IP:8000
   ```

3. **Start services**:
   ```bash
   # Terminal 1: Backend
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

   # Terminal 2: Frontend
   cd frontend
   npx expo start
   ```

4. **On your smartphone**:
   - Download Expo Go from App Store / Google Play
   - Scan QR code from Expo terminal
   - App will connect to your backend

---

## 🐳 Docker Deployment

### Local Docker Testing

```bash
# Setup environment
cp .env.example .env

# Start with Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

✅ API ready at: **http://localhost:8000**
🐘 PostgreSQL: `localhost:5432`

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Docker image deployment
- Production environment setup
- Security checklist
- Health monitoring

---

## 📁 Project Structure

```
memolife_PROJET_COMPLET/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Entry point
│   │   ├── db/                # Database config
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── static/            # Generated audio files
│   ├── requirements.txt
│   ├── Dockerfile
│   └── venv/                  # Virtual environment
│
├── frontend/                   # React Native (Expo)
│   ├── app/                   # App screens & logic
│   ├── components/            # Reusable components
│   ├── services/              # API client
│   ├── types/                 # TypeScript types
│   ├── package.json
│   └── .env.local             # Configuration
│
├── docker-compose.yml         # Multi-container setup
├── .env.example               # Environment template
├── setup.sh                   # Automated setup script
├── test-smartphone.sh         # Smartphone testing setup
└── DEPLOYMENT.md              # Deployment guide
```

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login

### Chat (Main Feature)
- `POST /chat/` - Send message to AI
- `GET /chat/history/{user_id}` - Get conversation history

### Features
- `GET /taches/` - Tasks management
- `GET /sante/` - Health tracking
- `GET /budget/` - Budget management
- `GET /roadmap/` - Roadmaps
- `GET /rappels/` - Reminders

### Health
- `GET /health` - Health check
- `GET /` - Root endpoint

📖 Full API docs: **http://localhost:8000/docs** (Swagger UI)

---

## ⚙️ Configuration

### Backend `.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/memolife
ENVIRONMENT=development
SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=["http://localhost:3000"]
OLLAMA_BASE_URL=http://localhost:11434
QWEN_MODEL=qwen:3b
```

### Frontend `frontend/.env.local`
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

---

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Option 2: Heroku
```bash
heroku create memolife-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Option 3: Self-hosted VPS
See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions

---

## 🔐 Security

**Important for Production:**
- [ ] Change `SECRET_KEY` to strong random value
- [ ] Use PostgreSQL (not SQLite)
- [ ] Enable HTTPS/SSL
- [ ] Update CORS settings
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Review authentication

See [DEPLOYMENT.md](DEPLOYMENT.md) for security checklist

---

## 🧪 Testing

### Unit Tests
```bash
cd backend
python -m pytest
```

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# Full API docs
curl http://localhost:8000/docs
```

### Frontend Testing on Device
- See "Testing on Smartphone" section above
- Or use `./test-smartphone.sh` script

---

## 🛠️ Development

### Adding New API Endpoint

1. Create model in `backend/app/models/`
2. Create schema in `backend/app/schemas/`
3. Create route in `backend/app/routes/`
4. Add to `backend/app/main.py`

### Frontend Component
1. Create component in `frontend/app/` or `frontend/components/`
2. Import API service from `frontend/app/services/api.ts`
3. Use TypeScript types from `frontend/app/types/`

---

## 📊 Status

✅ Backend: Operational
✅ Frontend: Functional
✅ Docker Setup: Ready
🔄 Testing: Ready for smartphone testing
📦 Deployment: Ready for production

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill existing process
pkill -f uvicorn

# Verify Python version
python --version  # Should be 3.12+
```

### Smartphone can't connect to API
```bash
# Verify backend is accessible from smartphone
ping YOUR_MACHINE_IP

# Check firewall allows port 8000
sudo ufw allow 8000
```

### Docker issues
```bash
# View detailed logs
docker-compose logs backend

# Reset everything
docker-compose down -v
docker-compose up -d
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting

---

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [SQLAlchemy ORM](https://www.sqlalchemy.org/)
- [Pydantic](https://docs.pydantic.dev/)

---

## 📝 License

This project is provided as-is for educational and personal use.

---

## 🚀 Next Steps

1. ✅ Backend is running
2. 📱 Test on smartphone using `./test-smartphone.sh`
3. 🐳 Deploy with Docker when ready
4. 🌍 Move to production following [DEPLOYMENT.md](DEPLOYMENT.md)

**Happy building! 🎉**
