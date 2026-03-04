# Yare.io

A multiplayer programming strategy game where players write code to control units in real-time.

## Architecture

```
yare/
├── server.js            # Main Express server (HTTP routes, WebSocket, matchmaking)
├── game/
│   ├── game-server.js   # Game server instance (spawns worker threads per game)
│   ├── game.js          # Game logic worker thread (game loop, state, ELO)
│   └── sandbox.js       # Player code sandboxing via isolated-vm
├── models/              # Mongoose schemas (User, Session, Game, Module, Server)
├── bots/                # Bot AI scripts (run inside game sandbox)
├── transpiler/          # Code transpilation service (TypeScript, Python -> JS)
├── addons/              # Game addons/modules (console, graphics)
├── compress/            # Replay compression
├── config/              # Environment-based configuration
├── routes/              # Express route handlers
├── public/              # Static frontend (HTML, JS, CSS)
│   ├── rendering3.js    # Canvas-based game renderer
│   ├── game.html        # Main game page
│   ├── replay.html      # Replay viewer
│   └── ...
└── dev/                 # Development infrastructure (HAProxy)
```

**Game flow:**

1. Players join the matchmaking queue via WebSocket
2. Server matches players by rating and creates a game
3. Game server spawns a worker thread for the game
4. Worker runs the game loop at 500ms ticks
5. Player code executes in sandboxed `isolated-vm` instances
6. Commands are validated and executed, state is broadcast via WebSocket
7. Game ends, ELO ratings update, replay is compressed and saved to S3

## Tech Stack

- **Backend:** Node.js, Express, WebSocket (`ws`), Worker Threads
- **Database:** MongoDB (Mongoose)
- **Sandboxing:** `isolated-vm`
- **Storage:** AWS S3 / MinIO (replays)
- **Frontend:** Vanilla HTML/JS, Canvas API, Ace Editor
- **Transpiler:** esbuild
- **Logging:** Pino
- **Infrastructure:** Docker, Docker Compose, HAProxy

## Running Locally

### Prerequisites

- Docker and Docker Compose

### Setup

1. Copy the environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

2. Start all services:
   ```bash
   docker-compose up --build
   ```

3. Open http://localhost:5000

### Services

| Service        | Port  | Description                    |
|----------------|-------|--------------------------------|
| frontend       | 5000  | HAProxy reverse proxy          |
| main           | -     | Main Express server            |
| d1, d2         | -     | Game server instances          |
| tutorial       | -     | Tutorial game server           |
| mongodb        | 27017 | MongoDB database               |
| mongo-express  | 6001  | MongoDB admin UI               |
| minio          | 9000  | Object storage (S3-compatible) |
| minio console  | 9001  | MinIO admin UI                 |
| transpiler     | 8075  | Code transpilation service     |

## Environment Variables

See [`.env.example`](.env.example) for all available variables:

| Variable                    | Description                       |
|-----------------------------|-----------------------------------|
| `MONGO_URI`                 | MongoDB connection string         |
| `DISCORD_WEBHOOK_NEW_MATCH` | Discord webhook for new matches   |
| `DISCORD_WEBHOOK_QUEUE`     | Discord webhook for queue updates |
| `S3_KEY`                    | S3/MinIO access key               |
| `S3_SECRET`                 | S3/MinIO secret key               |
| `S3_BUCKET`                 | S3 bucket name                    |
| `S3_ENDPOINT`               | S3 endpoint URL                   |
| `S3_BUCKET_ENDPOINT`        | Use bucket-style endpoint (true/false) |
| `FRONTEND_ADDRESS`          | Public frontend URL               |
| `ADMINPANEL_PASSWORD`       | Admin panel password              |
| `TRANSPILER_SECRET`         | Shared secret for transpiler auth |

## Development

```bash
# Install dependencies
npm install

# Run linter
npm run lint
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is open source. See the [LICENSE](LICENSE) file for details.
