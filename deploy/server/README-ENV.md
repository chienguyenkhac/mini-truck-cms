# Environment Configuration

## Setup Instructions

### For Local Development

1. Copy template file:
```bash
copy env.development.template .env
```

Or manually create `.env` file with:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:sinotruk123@localhost:5433/sinotruk
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=debug
```

### For Production

1. Copy template file:
```bash
copy env.production.template .env
```

2. Update with your production values:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db:5432/sinotruk
CORS_ORIGIN=https://your-domain.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
```

## Environment Variables

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `NODE_ENV` | Environment mode | `development` | `production` |
| `PORT` | Server port | `3001` | `3001` |
| `DATABASE_URL` | PostgreSQL connection | `localhost:5433` | `db:5432` |
| `CORS_ORIGIN` | Allowed origins | `localhost:5173,5174` | Your domain |
| `UPLOAD_DIR` | Upload directory | `./uploads` | `./uploads` |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` (10MB) | `10485760` |
| `LOG_LEVEL` | Logging level | `debug` | `info` |

## Notes

- `.env` file is gitignored for security
- Always use `.env` for local development
- For production, use environment variables in Docker/hosting platform
- Never commit `.env` files to git

