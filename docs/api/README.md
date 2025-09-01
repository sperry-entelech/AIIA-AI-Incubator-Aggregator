# CommunityOS API Documentation

**Version**: 1.0.0  
**Base URL**: `https://api.communityos.com`  
**Environment**: Production

## 🔑 Authentication

### Bearer Token Authentication
```http
Authorization: Bearer <your_jwt_token>
```

### API Key Authentication
```http
X-API-Key: <your_api_key>
```

### Discord OAuth Flow
```http
GET /auth/discord
GET /auth/discord/callback
```

## 📁 Core Endpoints

### Communities

#### Get All Communities
```http
GET /api/v1/communities
```

**Response:**
```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "comm_1234567890",
        "name": "Gaming Hub",
        "discordGuildId": "123456789012345678",
        "memberCount": 5432,
        "subscriptionTier": "premium",
        "monthlyRevenue": 2499.99,
        "createdAt": "2024-01-15T10:30:00Z",
        "settings": {
          "autoRoleAssignment": true,
          "welcomeMessage": "Welcome to our community!",
          "premiumChannels": ["premium-chat", "vip-lounge"]
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 156,
      "totalPages": 16
    }
  },
  "meta": {
    "timestamp": "2025-01-01T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

#### Create Community
```http
POST /api/v1/communities
```

**Request Body:**
```json
{
  "name": "My Gaming Community",
  "discordGuildId": "123456789012345678",
  "description": "A community for gaming enthusiasts",
  "subscriptionTiers": [
    {
      "name": "Basic",
      "price": 9.99,
      "features": ["Access to premium channels", "Custom role"]
    }
  ]
}
```

### Members

#### Get Community Members
```http
GET /api/v1/communities/{communityId}/members
```

#### Add Member
```http
POST /api/v1/communities/{communityId}/members
```

#### Update Member Subscription
```http
PUT /api/v1/members/{memberId}/subscription
```

### Subscriptions

#### Create Subscription
```http
POST /api/v1/subscriptions
```

#### Cancel Subscription
```http
DELETE /api/v1/subscriptions/{subscriptionId}
```

#### Get Subscription History
```http
GET /api/v1/subscriptions/{subscriptionId}/history
```

### Analytics

#### Get Community Analytics
```http
GET /api/v1/communities/{communityId}/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "monthly": 2499.99,
      "yearly": 29999.88,
      "growth": 15.5
    },
    "members": {
      "total": 5432,
      "active": 4321,
      "premium": 1234,
      "churnRate": 2.1
    },
    "engagement": {
      "dailyActiveUsers": 1234,
      "messagesPerDay": 5678,
      "retentionRate": 85.5
    }
  }
}
```

## 🔌 Webhooks

### Webhook Events

- `community.created`
- `community.updated`
- `member.subscribed`
- `member.unsubscribed`
- `payment.successful`
- `payment.failed`

### Webhook Payload Example
```json
{
  "event": "member.subscribed",
  "data": {
    "communityId": "comm_1234567890",
    "memberId": "member_0987654321",
    "subscriptionTier": "premium",
    "amount": 19.99,
    "currency": "USD"
  },
  "timestamp": "2025-01-01T12:00:00Z",
  "signature": "sha256=abc123def456"
}
```

## 📋 Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 409  | Conflict |
| 429  | Too Many Requests |
| 500  | Internal Server Error |

## ⚙️ Rate Limiting

- **Rate Limit**: 1000 requests per hour per API key
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## 📝 Error Handling

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid community name",
    "details": {
      "field": "name",
      "reason": "Name must be between 3 and 50 characters"
    }
  },
  "meta": {
    "timestamp": "2025-01-01T12:00:00Z",
    "requestId": "req_error123"
  }
}
```

## 📚 SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @communityos/sdk
```

### Python
```bash
pip install communityos-python
```

### Go
```bash
go get github.com/communityos/go-sdk
```

## 📞 Support

- **Documentation**: https://docs.communityos.com
- **Email**: api-support@communityos.com
- **Discord**: https://discord.gg/communityos-dev