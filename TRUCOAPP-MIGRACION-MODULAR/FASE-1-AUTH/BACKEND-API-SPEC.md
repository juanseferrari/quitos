# 🚀 TRUCOAPP BACKEND API SPECIFICATION
## Go Microservices Architecture

## 📋 OVERVIEW

Sistema backend en Go para TrucoApp que provee servicios de autenticación, gestión de usuarios, sincronización de datos de juego, y APIs para funcionalidades sociales futuras.

### Stack Tecnológico
- **Language**: Go 1.21+
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Auth**: JWT + OAuth2
- **API**: REST + JSON
- **Deploy**: Docker + Docker Compose

---

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────┐    HTTP/REST     ┌─────────────────┐
│                 │ ◄──────────────► │                 │
│  React Frontend │                  │   Go Backend    │
│                 │                  │                 │
│  - Auth Context │                  │  ┌─────────────┐│
│  - Game State   │                  │  │Auth Service ││
│  - API Client   │                  │  │User Service ││
│                 │                  │  │Game Service ││
└─────────────────┘                  │  │Stats Service││
                                     │  └─────────────┘│
┌─────────────────┐                  │                 │
│                 │                  │  ┌─────────────┐│
│  PostgreSQL     │ ◄──────────────► │  │             ││
│                 │                  │  │ Middleware  ││
│  - users        │                  │  │             ││
│  - games        │                  │  │ - Auth      ││
│  - sessions     │                  │  │ - CORS      ││
│  - stats        │                  │  │ - Logging   ││
│                 │                  │  │ - Rate Limit││
└─────────────────┘                  │  └─────────────┘│
                                     └─────────────────┘
┌─────────────────┐                           │
│                 │                           │
│  Redis Cache    │ ◄─────────────────────────┘
│                 │
│  - sessions     │
│  - rate_limits  │
│  - game_cache   │
└─────────────────┘

┌─────────────────┐
│OAuth2 Providers │
│                 │
│  - Google       │
│  - Apple        │
│  - Facebook     │
└─────────────────┘
```

---

## 🗄️ DATABASE SCHEMA

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    avatar TEXT,
    city VARCHAR(100),
    provider VARCHAR(20) NOT NULL DEFAULT 'email',
    provider_id VARCHAR(255),
    password_hash VARCHAR(255), -- NULL for OAuth users
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    
    -- Profile fields
    bio TEXT,
    favorite_points INTEGER DEFAULT 30,
    preferred_theme VARCHAR(20) DEFAULT 'rey-del-truco',
    
    -- Privacy settings
    profile_public BOOLEAN DEFAULT TRUE,
    stats_public BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    app_version VARCHAR(20),
    platform VARCHAR(20),
    timezone VARCHAR(50),
    locale VARCHAR(10) DEFAULT 'es-AR'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
```

### Games Table
```sql
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Game data
    player1_name VARCHAR(100) NOT NULL,
    player1_points INTEGER NOT NULL DEFAULT 0,
    player2_name VARCHAR(100) NOT NULL,
    player2_points INTEGER NOT NULL DEFAULT 0,
    winner VARCHAR(10) NOT NULL, -- 'nos' | 'ellos'
    total_points INTEGER NOT NULL DEFAULT 30,
    
    -- Timing
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP NOT NULL,
    duration_ms BIGINT NOT NULL,
    
    -- Game details
    moves JSONB, -- Array of game moves
    game_mode VARCHAR(20) DEFAULT '1v1',
    platform VARCHAR(20) NOT NULL,
    app_version VARCHAR(20),
    
    -- Metadata
    migrated BOOLEAN DEFAULT FALSE,
    migration_source VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Stats (denormalized for performance)
    total_moves INTEGER,
    falta_envido_count INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0
);

CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_finished_at ON games(finished_at);
CREATE INDEX idx_games_winner ON games(winner);
CREATE INDEX idx_games_migrated ON games(migrated);
```

### User Stats Table
```sql
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic stats
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Points stats
    total_points_scored BIGINT DEFAULT 0,
    total_points_conceded BIGINT DEFAULT 0,
    avg_points_per_game DECIMAL(5,2) DEFAULT 0.00,
    
    -- Time stats
    total_play_time_ms BIGINT DEFAULT 0,
    avg_game_duration_ms BIGINT DEFAULT 0,
    fastest_game_ms BIGINT,
    longest_game_ms BIGINT,
    
    -- Streaks
    current_win_streak INTEGER DEFAULT 0,
    current_loss_streak INTEGER DEFAULT 0,
    best_win_streak INTEGER DEFAULT 0,
    worst_loss_streak INTEGER DEFAULT 0,
    
    -- Advanced stats
    falta_envido_won INTEGER DEFAULT 0,
    falta_envido_lost INTEGER DEFAULT 0,
    comeback_games INTEGER DEFAULT 0, -- Games won after being behind
    blowout_games INTEGER DEFAULT 0,  -- Games won by 15+ points
    
    -- Preferences from games
    favorite_total_points INTEGER DEFAULT 30,
    most_common_opponent VARCHAR(100),
    
    -- Timestamps
    last_game_at TIMESTAMP,
    stats_updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW(),
    
    -- Session metadata
    ip_address INET,
    user_agent TEXT,
    platform VARCHAR(20),
    app_version VARCHAR(20),
    
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### Base URL: `/api/v1/auth`

#### POST `/register`
Registrar nuevo usuario con email/password.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "name": "Juan Pérez",
  "username": "juanp", // optional
  "city": "Buenos Aires", // optional
  "timezone": "America/Argentina/Buenos_Aires" // optional
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "usuario@example.com",
      "name": "Juan Pérez",
      "username": "juanp",
      "avatar": null,
      "city": "Buenos Aires",
      "provider": "email",
      "email_verified": false,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "access_token": "jwt-token-here",
      "refresh_token": "refresh-token-here",
      "expires_at": "2024-01-16T10:30:00Z"
    }
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email ya está registrado",
    "details": {
      "field": "email"
    }
  }
}
```

#### POST `/login`
Login con email/password.

**Request:**
```json
{
  "email": "usuario@example.com", 
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "usuario@example.com",
      "name": "Juan Pérez",
      "username": "juanp",
      "avatar": "https://example.com/avatar.jpg",
      "city": "Buenos Aires",
      "provider": "email",
      "last_login_at": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "access_token": "jwt-token-here",
      "refresh_token": "refresh-token-here", 
      "expires_at": "2024-01-16T10:30:00Z"
    }
  }
}
```

#### GET `/google`
Iniciar OAuth flow con Google.

**Query Parameters:**
- `redirect_uri` (required): URL de callback
- `state` (required): Random state para CSRF protection

**Response 302:**
Redirect a Google OAuth URL.

#### GET `/google/callback`
Callback de Google OAuth.

**Query Parameters:**
- `code`: Authorization code de Google
- `state`: State original para validación

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "usuario@gmail.com",
      "name": "Juan Pérez",
      "username": null,
      "avatar": "https://lh3.googleusercontent.com/...",
      "provider": "google",
      "provider_id": "google-user-id",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "access_token": "jwt-token-here",
      "refresh_token": "refresh-token-here",
      "expires_at": "2024-01-16T10:30:00Z"
    },
    "is_new_user": true
  }
}
```

#### POST `/refresh`
Renovar access token usando refresh token.

**Request:**
```json
{
  "refresh_token": "refresh-token-here"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "access_token": "new-jwt-token-here",
    "expires_at": "2024-01-16T10:30:00Z"
  }
}
```

#### POST `/logout`
Cerrar sesión e invalidar tokens.

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response 200:**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

#### GET `/verify`
Verificar validez del token actual.

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "usuario@example.com",
      "name": "Juan Pérez",
      "username": "juanp"
    },
    "expires_at": "2024-01-16T10:30:00Z"
  }
}
```

---

## 👤 USER MANAGEMENT ENDPOINTS

### Base URL: `/api/v1/users`

#### GET `/profile`
Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "usuario@example.com",
      "name": "Juan Pérez",
      "username": "juanp",
      "avatar": "https://example.com/avatar.jpg",
      "city": "Buenos Aires",
      "bio": "Jugador de truco desde los 12 años",
      "provider": "email",
      "email_verified": true,
      "profile_public": true,
      "stats_public": true,
      "created_at": "2024-01-15T10:30:00Z",
      "last_login_at": "2024-01-15T10:30:00Z"
    },
    "preferences": {
      "favorite_points": 30,
      "preferred_theme": "rey-del-truco",
      "timezone": "America/Argentina/Buenos_Aires",
      "locale": "es-AR"
    }
  }
}
```

#### PUT `/profile`
Actualizar perfil del usuario.

**Request:**
```json
{
  "name": "Juan Carlos Pérez",
  "username": "juancp",
  "city": "Córdoba",
  "bio": "Rey del truco en Córdoba",
  "avatar": "https://example.com/new-avatar.jpg",
  "profile_public": false,
  "stats_public": true,
  "preferences": {
    "favorite_points": 24,
    "preferred_theme": "dark-mode",
    "timezone": "America/Argentina/Cordoba"
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "usuario@example.com",
      "name": "Juan Carlos Pérez",
      "username": "juancp",
      "city": "Córdoba",
      "bio": "Rey del truco en Córdoba",
      "updated_at": "2024-01-15T11:30:00Z"
    }
  }
}
```

#### GET `/username/check/:username`
Verificar disponibilidad de username.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "suggestions": ["juanp2024", "juan_perez", "juanp_ar"]
  }
}
```

**Response 200 (no disponible):**
```json
{
  "success": true,
  "data": {
    "available": false,
    "suggestions": ["juanp2024", "juan_perez", "juanp_ar"]
  }
}
```

#### DELETE `/account`
Eliminar cuenta del usuario.

**Request:**
```json
{
  "password": "current-password", // Solo para usuarios con password
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Cuenta eliminada correctamente"
}
```

---

## 🎮 GAME DATA ENDPOINTS

### Base URL: `/api/v1/games`

#### POST `/`
Guardar nuevo juego.

**Request:**
```json
{
  "player1_name": "Juan",
  "player1_points": 30,
  "player2_name": "Carlos",
  "player2_points": 28,
  "winner": "nos",
  "total_points": 30,
  "started_at": "2024-01-15T10:00:00Z",
  "finished_at": "2024-01-15T10:15:00Z",
  "duration_ms": 900000,
  "moves": [
    {
      "id": "move-1",
      "action": "+",
      "team": "nos",
      "previous_points": 0,
      "new_points": 1,
      "timestamp": "2024-01-15T10:01:00Z"
    }
  ],
  "game_mode": "1v1",
  "platform": "web"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "game": {
      "id": "game-uuid",
      "user_id": "user-uuid",
      "player1_name": "Juan",
      "player1_points": 30,
      "player2_name": "Carlos", 
      "player2_points": 28,
      "winner": "nos",
      "total_points": 30,
      "started_at": "2024-01-15T10:00:00Z",
      "finished_at": "2024-01-15T10:15:00Z",
      "duration_ms": 900000,
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### GET `/`
Obtener historial de juegos del usuario.

**Query Parameters:**
- `limit` (default: 20, max: 100)
- `offset` (default: 0)
- `winner` (optional: 'nos' | 'ellos')
- `from_date` (optional: ISO date)
- `to_date` (optional: ISO date)
- `total_points` (optional: 16 | 24 | 30)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "game-uuid",
        "player1_name": "Juan",
        "player1_points": 30,
        "player2_name": "Carlos",
        "player2_points": 28,
        "winner": "nos",
        "total_points": 30,
        "started_at": "2024-01-15T10:00:00Z",
        "finished_at": "2024-01-15T10:15:00Z",
        "duration_ms": 900000
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

#### GET `/:game_id`
Obtener detalles de un juego específico.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "game": {
      "id": "game-uuid",
      "user_id": "user-uuid",
      "player1_name": "Juan",
      "player1_points": 30,
      "player2_name": "Carlos",
      "player2_points": 28,
      "winner": "nos",
      "total_points": 30,
      "started_at": "2024-01-15T10:00:00Z",
      "finished_at": "2024-01-15T10:15:00Z",
      "duration_ms": 900000,
      "moves": [
        {
          "id": "move-1",
          "action": "+",
          "team": "nos",
          "previous_points": 0,
          "new_points": 1,
          "timestamp": "2024-01-15T10:01:00Z"
        }
      ],
      "game_mode": "1v1",
      "platform": "web",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### POST `/migrate`
Migrar datos de juegos desde localStorage.

**Request:**
```json
{
  "games": [
    {
      "id": "migrated_1642248000000_user-uuid",
      "player1_name": "Nosotros",
      "player1_points": 30,
      "player2_name": "Ellos",
      "player2_points": 24,
      "winner": "nos",
      "total_points": 30,
      "started_at": "2024-01-15T10:00:00Z",
      "finished_at": "2024-01-15T10:15:00Z",
      "duration_ms": 900000,
      "moves": [],
      "game_mode": "1v1",
      "platform": "web",
      "migrated": true
    }
  ],
  "stats": {
    "games_played": 25,
    "games_won": 15,
    "total_points_scored": 750,
    "avg_game_duration": 600000,
    "favorite_total_points": 30
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "migrated_games": 25,
    "failed_games": 0,
    "updated_stats": {
      "games_played": 25,
      "games_won": 15,
      "win_rate": 60.00
    },
    "migration_id": "migration-uuid"
  }
}
```

---

## 📊 STATS ENDPOINTS

### Base URL: `/api/v1/stats`

#### GET `/user`
Obtener estadísticas del usuario autenticado.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "games_played": 150,
      "games_won": 95,
      "games_lost": 55,
      "win_rate": 63.33,
      "total_points_scored": 4500,
      "total_points_conceded": 3890,
      "avg_points_per_game": 30.00
    },
    "time_stats": {
      "total_play_time_ms": 75600000,
      "avg_game_duration_ms": 504000,
      "fastest_game_ms": 180000,
      "longest_game_ms": 1800000
    },
    "streaks": {
      "current_win_streak": 3,
      "current_loss_streak": 0,
      "best_win_streak": 12,
      "worst_loss_streak": 8
    },
    "advanced": {
      "falta_envido_won": 25,
      "falta_envido_lost": 15,
      "comeback_games": 18,
      "blowout_games": 22,
      "favorite_total_points": 30,
      "most_common_opponent": "Carlos"
    },
    "last_updated": "2024-01-15T10:30:00Z"
  }
}
```

#### GET `/user/:user_id`
Obtener estadísticas públicas de otro usuario.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "other-user-uuid",
      "username": "carlos_truco",
      "name": "Carlos Martínez",
      "avatar": "https://example.com/carlos.jpg",
      "city": "Rosario"
    },
    "stats": {
      "games_played": 89,
      "games_won": 52,
      "win_rate": 58.43,
      "best_win_streak": 8,
      "favorite_total_points": 24
    }
  }
}
```

#### GET `/leaderboard`
Obtener ranking de usuarios.

**Query Parameters:**
- `type` (default: 'win_rate', options: 'win_rate', 'games_won', 'games_played')
- `period` (default: 'all_time', options: 'all_time', 'monthly', 'weekly')
- `limit` (default: 10, max: 50)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "user-uuid",
          "username": "el_rey_del_truco",
          "name": "Juan Pérez",
          "avatar": "https://example.com/juan.jpg",
          "city": "Buenos Aires"
        },
        "stats": {
          "games_played": 200,
          "games_won": 140,
          "win_rate": 70.00,
          "best_win_streak": 15
        }
      }
    ],
    "user_rank": {
      "rank": 25,
      "total_users": 1500
    },
    "period": "all_time",
    "last_updated": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🔒 MIDDLEWARE & SECURITY

### Authentication Middleware
```go
func AuthRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(401, gin.H{"error": "Authorization header required"})
            c.Abort()
            return
        }
        
        token := strings.TrimPrefix(authHeader, "Bearer ")
        claims, err := validateJWTToken(token)
        if err != nil {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }
        
        c.Set("user_id", claims.UserID)
        c.Set("session_id", claims.SessionID)
        c.Next()
    }
}
```

### Rate Limiting
```go
func RateLimit(requests int, window time.Duration) gin.HandlerFunc {
    return gin.HandlerFunc(func(c *gin.Context) {
        key := getRateLimitKey(c)
        
        count, err := redis.Incr(key)
        if err != nil {
            c.JSON(500, gin.H{"error": "Internal server error"})
            c.Abort()
            return
        }
        
        if count == 1 {
            redis.Expire(key, window)
        }
        
        if count > requests {
            c.JSON(429, gin.H{"error": "Rate limit exceeded"})
            c.Abort()
            return
        }
        
        c.Next()
    })
}
```

### CORS Configuration
```go
func CORSMiddleware() gin.HandlerFunc {
    return cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000", "https://trucoapp.com"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    })
}
```

---

## 📦 PROJECT STRUCTURE

```
trucoapp-backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── auth/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── jwt.go
│   │   └── oauth.go
│   ├── user/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── model.go
│   │   └── repository.go
│   ├── game/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── model.go
│   │   └── repository.go
│   ├── stats/
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── calculator.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── cors.go
│   │   ├── logging.go
│   │   └── ratelimit.go
│   └── config/
│       ├── config.go
│       ├── database.go
│       └── redis.go
├── pkg/
│   ├── database/
│   │   ├── postgres.go
│   │   └── migrations/
│   ├── redis/
│   │   └── client.go
│   ├── logger/
│   │   └── logger.go
│   └── utils/
│       ├── crypto.go
│       ├── validation.go
│       └── response.go
├── api/
│   └── openapi.yaml
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
├── scripts/
│   ├── migrate.sh
│   ├── seed.sh
│   └── deploy.sh
├── tests/
│   ├── integration/
│   ├── unit/
│   └── testdata/
├── .env.example
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

---

## 🚀 DEPLOYMENT

### Docker Configuration
```dockerfile
# docker/Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080
CMD ["./main"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: trucoapp
      POSTGRES_USER: trucoapp
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./pkg/database/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Environment Variables
```bash
# .env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trucoapp
DB_USER=trucoapp
DB_PASSWORD=secure_password
DB_SSL_MODE=require

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URL=http://localhost:8080/api/v1/auth/google/callback

# Server
PORT=8080
GIN_MODE=release
CORS_ORIGINS=http://localhost:3000,https://trucoapp.com

# External Services
SENDGRID_API_KEY=your-sendgrid-key
CLOUDINARY_URL=your-cloudinary-url

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

---

## ⚡ PERFORMANCE & MONITORING

### Key Metrics to Monitor
- **API Response Time**: < 200ms p95
- **Database Query Time**: < 50ms p95  
- **Authentication Time**: < 100ms p95
- **Memory Usage**: < 512MB
- **CPU Usage**: < 70%
- **Error Rate**: < 1%

### Health Check Endpoint
```go
// GET /health
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  },
  "version": "1.0.0",
  "uptime": "72h15m30s"
}
```

---

## 🧪 TESTING STRATEGY

### Unit Tests
- Handlers with mocked services
- Services with mocked repositories  
- Repository tests with test database
- Utility functions

### Integration Tests
- Full API endpoint testing
- Database integration
- Redis integration
- OAuth flow testing

### Load Tests
- Authentication endpoints
- Game data endpoints
- Stats calculation
- Concurrent user scenarios

---

## 📈 SCALABILITY CONSIDERATIONS

### Database Optimization
- Proper indexing strategy
- Query optimization
- Connection pooling
- Read replicas for stats

### Caching Strategy
- Session data in Redis
- Frequently accessed stats
- User profile cache
- Rate limiting counters

### Horizontal Scaling
- Stateless application design
- Load balancer ready
- Microservice architecture
- Database sharding strategy

---

*Complete API specification for TrucoApp backend in Go, ready for implementation and integration with React frontend.*