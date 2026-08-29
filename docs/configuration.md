# Beyon — Environment & Configuration Reference

## 1. Environment Variables by Component

### Web Application (`web/.env`)
| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `http://localhost:8085/api/v1` | Spring Boot API gateway URL |
| `VITE_APP_ENV` | No | `development` | Environment mode (`development` / `production`) |
| `VITE_APP_NAME` | No | `Beyon` | Platform brand title |

### Desktop Lockdown Client (`desktop/.env`)
| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ASSESSMENT_API_URL` | Yes | `http://localhost:8085/api/v1` | Backend API URL for assessment lifecycle |
| `ASSESSMENT_ENV` | No | `development` | Lockdown environment configuration |

### Mobile Application (`mobile/android/` & `mobile/src/config/api.ts`)
| Variable / Setting | Required | Default | Purpose |
|---|---|---|---|
| `DEFAULT_API_URL` | Yes | `http://10.0.2.2:8085/api/v1` | Android emulator direct gateway to host API |
| `DEVICE_GATEWAY_URL` | No | `http://192.168.x.x:8085/api/v1` | LAN IP gateway for physical mobile devices |

### Backend API Server (`backend/.env` / `application.yml`)
| Variable | Required | Default | Purpose |
|---|---|---|---|
| `SERVER_PORT` | No | `8085` | Spring Boot HTTP listening port |
| `SPRING_PROFILES_ACTIVE` | Yes | `dev` | Active Spring profile (`dev`, `test`, `prod`) |
| `DATABASE_URL` | Yes | `jdbc:mysql://localhost:3306/beyon` | JDBC connection string (PostgreSQL / Dolt MySQL) |
| `DATABASE_USERNAME` | Yes | `root` / `postgres` | Database username |
| `DATABASE_PASSWORD` | Yes | `beyon123` | Database password |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/beyon_logs` | MongoDB connection URI for telemetry |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Upstash Redis connection string |
| `JWT_SECRET` | Yes | *(256-bit key)* | HMAC-SHA256 signing secret for JWT tokens |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:5173,http://localhost:3000` | Whitelisted cross-origin domains |
| `AI_SERVICE_URL` | No | `http://localhost:8000` | FastAPI AI microservice endpoint |
| `SUPABASE_URL` | No | `https://*.supabase.co` | Supabase Cloud project URL |
| `SUPABASE_KEY` | No | `eyJ...` | Supabase service/anon key |

### AI Microservice (`ai-service/.env`)
| Variable | Required | Default | Purpose |
|---|---|---|---|
| `AI_SERVICE_PORT` | No | `8000` | FastAPI HTTP listening port |
| `AI_SERVICE_HOST` | No | `0.0.0.0` | Host binding interface |
| `LOG_LEVEL` | No | `INFO` | Uvicorn logging level |

---

## 2. Port Allocation Table

| Service / Database | Protocol | Port | Description |
|---|---|---|---|
| **Web Portal** | HTTP | `5173` | React 19 Vite dev server |
| **Backend API Gateway** | HTTP | `8085` | Spring Boot REST API |
| **AI Microservice** | HTTP | `8000` | FastAPI Uvicorn service |
| **Dolt SQL Server** | MySQL Wire | `3306` | Git-versioned local SQL database |
| **PostgreSQL 17** | PostgreSQL Wire | `5432` | Production/Staging relational database |
| **MongoDB Atlas** | MongoDB Wire | `27017` | Telemetry, proctoring events, high-volume logs |
| **Upstash Redis** | RESP | `6379` | In-memory cache & leaderboards |
| **Android Emulator Host Gateway** | IP Alias | `10.0.2.2` | Maps emulator networking directly to host PC `127.0.0.1` |
