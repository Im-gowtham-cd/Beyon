# Beyon Configuration

## Environment Variables

| Variable | Service | Public? | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | Web | Yes | Backend API base URL |
| `VITE_APP_ENV` | Web | Yes | Environment (development/production) |
| `VITE_APP_NAME` | Web | Yes | Application name |
| `SPRING_PROFILES_ACTIVE` | Backend | No | Spring profile (dev/test/prod) |
| `SERVER_PORT` | Backend | No | Backend server port |
| `DATABASE_URL` | Backend | No | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | Backend | No | PostgreSQL username |
| `DATABASE_PASSWORD` | Backend | No | PostgreSQL password |
| `MONGODB_URI` | Backend | No | MongoDB connection URI |
| `REDIS_URL` | Backend | No | Upstash Redis URL |
| `SUPABASE_URL` | Backend | No | Supabase project URL |
| `SUPABASE_ANON_KEY` | Backend | No | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Backend | No | Supabase service role key |
| `AI_SERVICE_URL` | Backend | No | AI service base URL |
| `JWT_SECRET` | Backend | No | JWT signing secret |
| `CORS_ALLOWED_ORIGINS` | Backend | No | Comma-separated allowed origins |
| `AI_SERVICE_PORT` | AI Service | No | FastAPI port |
| `ASSESSMENT_API_URL` | Desktop | No | Backend API URL for assessment |
| `ASSESSMENT_ENV` | Desktop | No | Desktop environment |

## Rules

- Never commit `.env` files
- Only `.env.example` may contain placeholder values
- `VITE_` prefixed variables are publicly visible in the browser
- Never place secrets in frontend environment variables
- Use environment-specific profiles (dev/test/prod)

## Files

| File | Purpose |
|---|---|
| `.env.example` | Root environment template |
| `web/.env.example` | Web app template |
| `desktop/.env.example` | Desktop app template |
| `ai-service/.env.example` | AI service template |
