# Truthy News API

## Truthy News™ © 2025 - Powered by 100% truthy news, no falsy headlines here.

This is the backend project for a Reddit-style news application. This is a RESTful API built using Node.js, Express.js and PostgreSQL. It is designed to power a frontend news application. You can fetch articles, users, topics and comments and filter by topic or sort articles by things like date, author or votes.

---

## Hosted Version

You can try out the live API right now:
**[https://nc-news-inse.onrender.com](https://nc-news-inse.onrender.com)**

---

## Project Summary

This API interacts with a PostgreSQL database to offer:

- Fetching articles, users, topics, and comments
- Filtering articles by topic
- Sorting and ordering articles dynamically
- Posting new comments
- Updating vote counts
- Deleting comments
- Error handling for all edge cases

## Getting Started Locally

### 1. Clone & Install

```bash
git clone https://github.com/your-username/be-truthy-news.git
cd be-truthy-news
npm install
```

### 2. Environment Setup

Before you can run the app locally, you need to create two `.env` files in the root directory of the project. These files will tell your app which local PostgreSQL database to connect to.

#### `.env.development`

```
PGDATABASE=truthy_news
```

#### `.env.test`

```
PGDATABASE=truthy_news_test
```

Your app uses dotenv to read these files and set the environment variables automatically when you run it. This ensures the correct database is used when seeding or testing.

### 3. Setup the database

```bash
npm run setup-dbs
```

### 4. Seed the database

To seed the development database:

```bash
npm run seed-dev
```

### 5. Run the server

```bash
node listen.js
```

### 6. Run Tests

```bash
npm test
```

Uses Jest and Supertest to test endpoints, including sad paths and edge cases.

---

## Minimum Versions

- **Node.js**: v23
- **PostgreSQL**: v14

---

## Tech Stack

- Node.js
- Express
- PostgreSQL
- pg-format
- dotenv
- Jest
- Supertest

---

## Final Notes

- API documentation available via `/api` endpoint on the hosted version.
