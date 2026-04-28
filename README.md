# Distributed Task Queue System

A scalable backend system built using Node.js, PostgreSQL, and Redis to process asynchronous tasks using a distributed worker architecture.

## Features
- REST API for task submission
- Redis-based queue for fast task dispatch
- PostgreSQL for persistent storage
- Multiple workers for parallel processing
- Retry logic with exponential backoff
- Priority-based task scheduling (HIGH, MEDIUM, LOW)

## Tech Stack
- Node.js (Express)
- PostgreSQL
- Redis

## How to Run
1. Install dependencies:
   npm install

2. Start PostgreSQL and Redis

3. Run the server:
   node server.js

4. Run workers (in separate terminals):
   node worker.js
   node worker.js

## API Example
Create a task:
curl -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d '{"type":"EMAIL","payload":{"message":"hello"},"priority":"HIGH"}'

## Architecture
Client → API → PostgreSQL → Redis Queue → Workers → Status Updates

## Key Concepts
- Distributed systems
- Asynchronous processing
- Queue-based architecture
- Fault tolerance and retries
- Horizontal scaling with multiple workers

## Author
Mohammed Masroor Ahmed
