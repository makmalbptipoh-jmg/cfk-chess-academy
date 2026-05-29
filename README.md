# CFK Academy — Chess For Kids

CFK Academy is an online chess coaching platform for young players. This repository contains the backend API server that powers the CFK Academy website, providing structured data for features, pricing, and a contact/enrollment form.

## Prerequisites

- Node.js 18 or higher
- npm (comes bundled with Node.js)

## Installation

From the project root, install dependencies:

```bash
npm install
```

## Running the Server

```bash
node src/server.js
```

The server starts at **http://localhost:3000**.

- The website (`src/index.html`) is served at `http://localhost:3000`
- API endpoints are available under `/api/`

## API Endpoints

### GET /api/features

Returns an array of CFK Academy program features.

**Example request:**
```bash
curl http://localhost:3000/api/features
```

**Example response:**
```json
[
  { "id": 1, "title": "Expert Coaches", "icon": "♟", "description": "..." },
  { "id": 2, "title": "Fun Learning",   "icon": "♞", "description": "..." },
  { "id": 3, "title": "Tournament Ready","icon": "♛", "description": "..." }
]
```

---

### GET /api/pricing

Returns an array of subscription pricing tiers (Starter, Intermediate, Champion).

**Example request:**
```bash
curl http://localhost:3000/api/pricing
```

**Example response:**
```json
[
  { "id": 1, "name": "Starter",      "price": 99,  "currency": "RM", "period": "month", "features": [...], "highlight": false },
  { "id": 2, "name": "Intermediate", "price": 199, "currency": "RM", "period": "month", "features": [...], "highlight": true  },
  { "id": 3, "name": "Champion",     "price": 349, "currency": "RM", "period": "month", "features": [...], "highlight": false }
]
```

---

### POST /api/contact

Submits a contact/enrollment enquiry.

**Request body** (JSON):

| Field        | Type   | Required | Description                        |
|--------------|--------|----------|------------------------------------|
| name         | string | Yes      | Parent or student name             |
| email        | string | Yes      | Contact email address              |
| studentAge   | number | No       | Age of the student                 |
| chessLevel   | string | No       | Current chess level (e.g. Beginner)|
| message      | string | No       | Additional message                 |

**Example request:**
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Ali Hassan","email":"ali@example.com","studentAge":10,"chessLevel":"Beginner","message":"Interested in the Starter plan."}'
```

**Success response (200):**
```json
{ "success": true, "message": "Thank you! We'll contact you within 24 hours." }
```

**Validation error response (400):**
```json
{ "success": false, "message": "Name and email are required." }
```

---

## Project Structure

```
cfk/
├── src/
│   ├── server.js       # Express API server
│   ├── index.html      # Main website (served at /)
│   └── styles.css      # Website stylesheet
├── docs/               # Additional documentation
├── tests/              # Test files and completion markers
├── package.json        # Node project manifest & dependencies
└── README.md           # This file
```

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Middleware:** cors, express.json, express.static
