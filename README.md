# Face Detection Studio — Real-Time Video Streaming System

A containerised full-stack application that captures webcam video, detects faces in real-time using **MediaPipe**, draws bounding boxes with **Pillow**, stores Region-Of-Interest (ROI) data in **PostgreSQL**, and displays the annotated live feed plus detection analytics in a **React** dashboard — all orchestrated with **Docker Compose**.

---

##  Quickstart

```bash
git clone <repo-url> face-detection-system
cd face-detection-system
cp .env.example .env
docker compose up --build
```

Open **http://localhost:3000** in a browser with a webcam. Click **"Start Camera"** and watch the detections stream in.

### Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| Docker Desktop | ≥ 4.x |
| Webcam | Any USB / built-in camera |
| Browser | Chrome / Edge / Firefox (WebRTC support) |

---

## Architecture Overview

The system is a three-tier architecture running inside a Docker Compose network. The **React frontend** (served by nginx on port 3000) captures webcam frames via the browser's `getUserMedia` API, sends them as binary blobs over a **WebSocket** connection to the **FastAPI backend** (port 8000). The backend decodes each JPEG frame, runs MediaPipe face detection on the RGB pixel array, draws a bounding box using Pillow's `ImageDraw`, and sends the annotated frame back through the same WebSocket. Simultaneously, every detected ROI (bounding box + confidence) is persisted to **PostgreSQL** (port 5432) via async SQLAlchemy with the `asyncpg` driver.

The frontend also polls a REST endpoint (`GET /roi/`) every 2 seconds using TanStack Query to display a scrollable list of recent detections with animated confidence bars. The entire pipeline is fully asynchronous — from the WebSocket handler through to the database commits — ensuring high throughput at webcam frame rates (~15 fps). No OpenCV is used anywhere in the stack.

![Architecture Diagram](frontend/public/architecture.svg)

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `WS` | `/video/ws/{session_id}` | WebSocket — send JPEG frames, receive annotated frames |
| `GET` | `/video/stream/{session_id}` | MJPEG stream of latest annotated frame for a session |
| `GET` | `/roi/?session_id=X&limit=50&offset=0` | Paginated ROI records (newest first). Returns `X-Total-Count` header |
| `GET` | `/health` | Health check — `{"status": "ok", "db": "connected"}` |

---

##  Database Schema

```sql
CREATE TABLE roi_records (
    id              SERIAL PRIMARY KEY,
    session_id      VARCHAR(36) NOT NULL,
    frame_number    INTEGER NOT NULL,
    x               FLOAT NOT NULL,          -- absolute px
    y               FLOAT NOT NULL,          -- absolute px
    width           FLOAT NOT NULL,          -- absolute px
    height          FLOAT NOT NULL,          -- absolute px
    confidence      FLOAT NOT NULL,          -- 0.0 – 1.0
    img_width       INTEGER NOT NULL,        -- original frame width
    img_height      INTEGER NOT NULL,        -- original frame height
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_roi_records_session_id ON roi_records (session_id);
```

### Schema design rationale

- **Absolute pixel coords + original dimensions** — the frontend can compute relative positions for any canvas size without loss of precision.
- **`session_id` index** — all queries filter by session; an index makes pagination O(log n) instead of O(n).
- **`frame_number`** — enables ordering and gap-detection for dropped frames.
- **`confidence`** — stored so the UI can render colour-coded bars without re-running detection.

---

##  Key Design Decisions

### Why PostgreSQL over Redis / SQLite?

PostgreSQL provides ACID transactions, indexed queries for paginated retrieval, and scales to millions of ROI records per session. Redis is a cache, not a durable store. SQLite would lock on concurrent writes from the WebSocket handler and the REST query endpoint.

### Why MediaPipe + Pillow instead of OpenCV?

The assignment explicitly forbids OpenCV. MediaPipe's `FaceDetection` solution operates on raw NumPy RGB arrays, and Pillow handles JPEG decode/encode and rectangle drawing — covering all needs without `cv2`.

### Why WebSocket over HTTP polling for frame delivery?

At 15 fps, HTTP polling would require 15 round-trips/sec, each with TCP + TLS handshake overhead. A single long-lived WebSocket connection achieves sub-frame latency with binary message support, perfect for streaming raw JPEG bytes in both directions.

### Why async FastAPI over Flask?

FastAPI's native async support means the WebSocket handler, DB writes, and REST queries can all run concurrently on one event loop without thread pool gymnastics. Flask would require `flask-socketio` + `eventlet` — a far more fragile stack for real-time workloads.

---

##  Frontend Stack Decisions

- **Framer Motion v11** — powers all 10 mandatory animations (page load, card entries, digit flips, confidence bars, etc.) with spring physics for a premium feel.
- **Zustand** — single-file global store for session ID, connection status, FPS, and stats — far lighter than Redux for this scope.
- **TanStack Query v5** — declarative polling with automatic caching, error retry, and refetch-on-reconnect — replaces manual `setInterval` + `useState` patterns.

---

## Development Mode (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Start a local PostgreSQL instance first, then:
export POSTGRES_HOST=localhost
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173 (Vite proxy forwards /api and /ws to backend)
```

---

##  Project Structure

```
face-detection-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app with lifespan + CORS + health
│   │   ├── config.py            # Pydantic Settings (env vars)
│   │   ├── database.py          # Async engine, session, Base
│   │   ├── models/roi.py        # SQLAlchemy ROIRecord model
│   │   ├── schemas/roi.py       # Pydantic response schemas
│   │   ├── routers/video.py     # WebSocket + MJPEG endpoints
│   │   ├── routers/roi.py       # GET /roi/ paginated endpoint
│   │   └── services/face_detection.py  # MediaPipe + Pillow detector
│   ├── alembic/                 # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Root layout with motion wrappers
│   │   ├── store/useAppStore.ts # Zustand global state
│   │   ├── hooks/               # useVideoStream, useROIData
│   │   └── components/          # Header, Sidebar, VideoFeed, ROIPanel
│   ├── public/architecture.svg
│   ├── Dockerfile               # Multi-stage: Node build → nginx serve
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

---



