# FocusFlow Chrome Extension

FocusFlow is a full-stack productivity tracking tool built as a Chrome Extension with a MERN (MongoDB, Express, React, Node.js) backend. It runs silently in the background, monitoring how you spend time across websites, helping you identify distractions, block them instantly, and review your daily and weekly habits through detailed reports.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose (for containerized deployment)
- MongoDB (local or Atlas)
- Chrome browser

## 📦 Installation & Setup

### Option 1: Local Development (Recommended for Development)

#### 1. Clone the Repository
```bash
git clone https://github.com/Shreyas1909Tech/Focusflow-Chrome-extension.git
cd Focusflow-Chrome-extension
```

#### 2. Setup Backend
```bash
npm install
npm start
```
Backend runs on: `http://localhost:5000`

#### 3. Setup Chrome Extension
- Open Chrome and navigate to: `chrome://extensions/`
- Enable **Developer Mode** (toggle in top right)
- Click **Load Unpacked**
- Select the extension folder from this repository
- The extension is now ready to use!

#### 4. Verify Setup
- Backend health check: `http://localhost:5000/api/health`
- Extension should appear in Chrome toolbar

---

### Option 2: Docker Deployment (Recommended for Production)

#### Prerequisites
- Docker & Docker Compose installed
- `.env` file configured with MongoDB credentials

#### 1. Configure Environment
Create a `.env.example` file:
```env
MONGODB_URI=mongodb://username:password@host:27017/focusflow
NODE_ENV=production
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

#### 2. Build and Run with Docker Compose
```bash
# Start all services (MongoDB + API)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

Services:
- **MongoDB**: `mongodb:27017`
- **API Server**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

#### 3. Build Docker Image Manually
```bash
# Build image
docker build -t focusflow-api:latest .

# Run container
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://... \
  -e NODE_ENV=production \
  --name focusflow-api \
  focusflow-api:latest
```

---

## 📁 Project Structure

```
Focusflow-Chrome-extension/
├── Dockerfile              # Production Docker image
├── docker-compose.yml      # Local development setup
├── .dockerignore          # Docker build optimization
├── server.js              # Express backend
├── package.json           # Dependencies
├── routes/                # API endpoints
├── models/                # MongoDB schemas
└── node_modules/          # Dependencies
```

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://user:password@host:27017/focusflow

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Docker Environment (docker-compose.yml)
```yaml
# Default credentials (change in production!)
MONGO_USERNAME=focusflow
MONGO_PASSWORD=focusflow_dev
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/tracking` | Get tracking data |
| POST | `/api/tracking` | Create tracking entry |
| GET | `/api/reports` | Get reports |
| PUT | `/api/settings` | Update settings |

---

## 🐳 Docker Features

### Multi-Stage Build
- Optimized image size (~200MB)
- Production-ready Alpine Linux base
- Minimal dependencies

### Security
- Non-root user execution
- Health checks configured
- Environment variable management

### Health Checks
```bash
# Check if container is healthy
curl http://localhost:5000/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2026-05-08T11:00:00Z",
#   "db": "connected"
# }
```

---

## 🧪 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# View logs
npm logs

# Stop server
Ctrl + C
```

---

## 📝 Deployment Checklist

Before deploying to production:

- [ ] MongoDB credentials secured in environment variables
- [ ] CORS_ORIGIN configured correctly
- [ ] Health check endpoint responding
- [ ] All environment variables set
- [ ] Docker image built and tested
- [ ] Database backups configured
- [ ] Monitoring and logging setup

For detailed checklist, see `DEPLOYMENT_CHECKLIST.md`

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use environment variables** for all sensitive data
3. **Run as non-root user** in Docker (already configured)
4. **Enable HTTPS** in production
5. **Implement rate limiting** on API endpoints
6. **Rotate MongoDB credentials** regularly

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Docker Documentation](https://docs.docker.com/)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 💬 Support

For issues or questions:
1. Check existing GitHub Issues
2. Create a new issue with detailed description
3. Include environment details and error logs

---

**Last Updated**: May 8, 2026  
**Status**: Production Ready  
**Current Version**: 1.0.0
