# Historical Token Price Oracle with Interpolation Engine

A full-stack application that fetches, caches, and interpolates historical cryptocurrency token prices using Alchemy API with intelligent caching and background job processing.

## Tech Stack

### Frontend
- **Framework:** Next.js 14+
- **Styling:** Tailwind CSS
- **State Management:** Zustand

### Backend
- **API Server:** Express.js
- **Queue System:** BullMQ
- **Cache:** Redis via ioredis
- **Database:** MongoDB
- **Web3 Provider:** Alchemy SDK
- **Retry Logic:** p-retry

## Features

- **Token Price Querying:** Get historical token prices by address, network, and timestamp
- **Price Interpolation:** Intelligent weighted interpolation for timestamps without direct price data
- **Caching:** Redis-based caching for fast response times
- **Background Processing:** BullMQ for handling long-running historical data fetches
- **Token Creation Detection:** Automatically detects token creation date for complete history

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- Redis

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd token-price-oracle
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Configure environment variables:
- Create `.env.local` in the frontend directory
- Create `.env` in the backend directory

4. Start the development servers:
```bash
# Start the backend
cd backend
npm run dev

# Start the frontend in another terminal
cd frontend
npm run dev
```

## API Endpoints

### GET /api/price
Get token price at a specific timestamp.

**Query Parameters:**
- `token`: Contract address (0x...)
- `network`: ethereum | polygon
- `timestamp`: Unix timestamp

**Response:**
```json
{
  "price": 0.9998,
  "source": "cache" | "alchemy" | "interpolated",
  "timestamp": 1678901234,
  "success": true
}
```

### POST /api/schedule
Schedule a full history fetch for a token.

**Request Body:**
```json
{
  "token": "0x1f9840...85d5",
  "network": "polygon"
}
```

**Response:**
```json
{
  "jobId": "job_12345",
  "message": "Scheduled full history fetch",
  "estimatedCompletion": "2024-01-20T15:30:00Z"
}
```
## Screenshot

<img width="1164" height="623" alt="Screenshot 2025-07-21 195145" src="https://github.com/user-attachments/assets/dbaead2a-b0ab-4bfc-8eea-d9ce25f64803" />
