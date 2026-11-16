# Node.js Express Integration Guide

This directory provides optional middleware, routing, and schema definitions for developers integrating the Plant Disease Detection module into an existing Node.js / Express backend.

---

## 1. Quick Integration

If you have an existing Express application (e.g. `server.js` or `app.js`), you can mount `disease.routes.js` directly:

```javascript
const express = require('express');
const diseaseRouter = require('./server-integration/disease.routes');

const app = express();
app.use(express.json());

// Mount the disease detection API router
app.use('/api/disease', diseaseRouter);

app.listen(5002, () => {
  console.log('Node.js server listening on port 5002');
});
```

---

## 2. Environment Variables

Configure the destination of your Python Flask AI service in your `.env`:

```env
FLASK_AI_URL=http://localhost:5001
```

---

## 3. Supported Routes

| HTTP Method | Route | Description |
|---|---|---|
| `POST` | `/api/disease/predict` | Multipart upload (`image`, `crop_type`, `symptoms`) forwarded to Python ML service |
| `GET` | `/api/disease/health` | Returns health status and model metadata of the Python AI service |
| `GET` | `/api/disease/classes` | Returns list of 38 supported disease classes and covered crops |
| `GET` | `/api/disease/history` | Fetches historical scan records |

---

## 4. Database Schema (Sequelize)

If your project uses PostgreSQL/MySQL/SQLite with Sequelize:

```javascript
const { Sequelize } = require('sequelize');
const defineDiseaseScan = require('./server-integration/DiseaseScan.model');

const sequelize = new Sequelize(process.env.DATABASE_URL);
const DiseaseScan = defineDiseaseScan(sequelize);

// Sync model with DB
await DiseaseScan.sync();
```
