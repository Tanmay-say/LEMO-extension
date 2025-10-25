# LEMO Backend API Documentation

## Base URL
`http://localhost:8001`

## API Endpoints

### 1. Health Check
**GET /**
- **Description**: Health check endpoint
- **Response**: 
```json
{
  "message": "Hello, World!"
}
```

---

### 2. Authentication

#### Authenticate User
**GET /auth/{walletAddress}**
- **Description**: Authenticate existing user by wallet address
- **Parameters**:
  - `walletAddress` (path): User's wallet address
- **Response Success** (200):
```json
{
  "success": true,
  "message": "User authenticated successfully",
  "data": {
    "user": {
      "id": "0x123...",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "wallet_address": "0x123...",
      "is_active": true
    }
  }
}
```
- **Response Error** (404):
```json
{
  "success": false,
  "error": "User not found"
}
```

#### Create User
**POST /auth/{walletAddress}**
- **Description**: Create new user
- **Parameters**:
  - `walletAddress` (path): User's wallet address
- **Body**:
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "otherDetails": {}
}
```
- **Response Success** (201):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "0x123...",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "wallet_address": "0x123..."
    }
  }
}
```

---

### 3. Sessions

**Note**: All session endpoints require `Authorization` header with wallet address

#### Create Session
**POST /sessions/**
- **Headers**: 
  - `Authorization`: User's wallet address
- **Body**:
```json
{
  "current_url": "https://example.com",
  "current_domain": "example.com"
}
```
- **Response Success** (201):
```json
{
  "message": "Session created successfully",
  "session_id": "uuid-here"
}
```

#### Get All Sessions
**GET /sessions/**
- **Headers**:
  - `Authorization`: User's wallet address
- **Response Success** (200):
```json
{
  "sessions": [
    {
      "id": "uuid",
      "user_id": "0x123...",
      "current_url": "https://example.com",
      "current_domain": "example.com",
      "created_at": "2024-01-01T00:00:00Z",
      "last_activity": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Session Details
**GET /sessions/data?id={sessionId}**
- **Headers**:
  - `Authorization`: User's wallet address
- **Query Parameters**:
  - `id`: Session ID
- **Response Success** (200):
```json
{
  "session": {
    "id": "uuid",
    "user_id": "0x123...",
    "current_url": "https://example.com",
    "current_domain": "example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "chat_messages": [
      {
        "id": "uuid",
        "message": "Hello",
        "message_type": "user",
        "detected_intent": "greeting",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Save Message
**POST /sessions/message**
- **Headers**:
  - `Authorization`: User's wallet address
- **Body**:
```json
{
  "session_id": "uuid",
  "message": "Hello, how are you?",
  "message_type": "user",
  "detected_intent": "greeting"
}
```
- **Response Success** (201):
```json
{
  "message": "Message saved successfully",
  "message_id": "uuid"
}
```

---

### 4. Query (Main Chat Endpoint)

**POST /query?session_id={sessionId}**
- **Description**: Main chat endpoint for AI responses
- **Headers**:
  - `Authorization`: User's wallet address
- **Query Parameters**:
  - `session_id`: Session ID
- **Body**:
```json
{
  "user_query": "What are the best headphones under $200?"
}
```
- **Response Success** (200):
```json
{
  "answer": "Based on your query, here are the best headphones under $200..."
}
```
- **Response Error** (400):
```json
{
  "message": "User query is required"
}
```

---

## Message Types
- `user`: Message from user
- `assistant`: Message from AI assistant
- `system`: System message

## Intent Types
- `ask`: User asking a question
- `compare`: User wants to compare products
- `search`: User wants to search for products

---

## Environment Variables Required

```ini
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lemo_db
REDIS_URL=redis://localhost:6379/0
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8001
HOST=0.0.0.0
```

---

## Error Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (duplicate)
- `500`: Internal Server Error

---

## Frontend Integration Example

```javascript
import lemoAPI from './services/api';

// Authenticate user
const authResponse = await lemoAPI.authenticateUser(walletAddress);

// Create session
const sessionResponse = await lemoAPI.createSession(
  walletAddress,
  'https://example.com',
  'example.com'
);

// Send query
const queryResponse = await lemoAPI.sendQuery(
  walletAddress,
  sessionId,
  'What are the best laptops?'
);
```
