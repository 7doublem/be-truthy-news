# Truthy News API

![Test & Deploy](https://github.com/7doublem/be-truthy-news/actions/workflows/test-and-deploy.yml/badge.svg)
![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)
![Node version](https://img.shields.io/badge/node-%3E=23-brightgreen)

## Truthy News™ © 2025 — Powered by 100% truthy news, no falsy headlines here.

This is the backend project for a Reddit-style news application. This RESTful API, built with Node.js, Express.js, and PostgreSQL, powers a frontend news app and provides features such as:

- Fetching API documentation
- Fetching, creating, updating (votes), and deleting articles
- Fetching and creating topics
- Fetching, creating, updating (votes), and deleting comments
- Fetching users and user details
- Advanced filtering, sorting, and pagination for articles and comments
- Robust error handling for all endpoints

---

## Table of Contents

- [Hosted Version](#hosted-version)
- [Project Summary](#project-summary)
- [Getting Started Locally](#getting-started-locally)
- [Linting & Formatting](#linting--formatting)
- [Minimum Versions](#minimum-versions)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Example Requests](#example-requests)
- [License](#license)
- [Contact](#contact)

---

## Hosted Version

Try out the live API:  
**[https://truthy-news.onrender.com/api](https://truthy-news.onrender.com/api)**

---

## Project Summary

This API interacts with a PostgreSQL database to offer:

- Fetching API documentation (/api)
- Fetching all topics
- Fetching all articles with filtering, sorting, ordering, and pagination
- Fetching a single article by ID
- Posting new articles
- Posting new topics
- Updating article vote counts
- Deleting articles by ID
- Fetching comments for an article with pagination
- Posting new comments to articles
- Updating comment vote counts
- Deleting comments by ID
- Fetching all users and user details by username
- Robust validation and error handling

---

## Getting Started Locally

### 1. Clone & Install

```bash
git clone https://github.com/7doublem/be-truthy-news.git
cd be-truthy-news
npm install
```

### 2. Environment Setup

Create two `.env` files in the root directory:

#### `.env.development`

```
PGDATABASE=truthy_news
```

#### `.env.test`

```
PGDATABASE=truthy_news_test
```

### 3. Setup the Database

```bash
npm run setup-dbs
```

### 4. Seed the Database

To seed the development database:

```bash
npm run seed-dev
```

To seed the production database:

```bash
npm run seed-prod
```

### 5. Run the Server

```bash
npm start
```

or

```bash
node listen.js
```

### 6. Run Tests

```bash
npm test
```

Uses Jest and Supertest to test endpoints, including sad paths and edge cases.

---

## Linting & Formatting

To lint your code:

```bash
npm run lint
```

To auto-format your code:

```bash
npm run format
```

---

## Minimum Versions

<p>
  <img src="https://img.shields.io/badge/node-%3E=23-brightgreen?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/postgresql-%3E=14-blue?logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## Tech Stack

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=for-the-badge" alt="Express.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white&style=for-the-badge" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/pg-4169E1?style=for-the-badge" alt="pg" />
  <img src="https://img.shields.io/badge/pg--format-008bb9?style=for-the-badge" alt="pg-format" />
  <img src="https://img.shields.io/badge/dotenv-8DD6F9?logo=dotenv&logoColor=white&style=for-the-badge" alt="dotenv" />
  <img src="https://img.shields.io/badge/cors-003366?style=for-the-badge" alt="cors" />
  <img src="https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white&style=for-the-badge" alt="Jest" />
  <img src="https://img.shields.io/badge/jest--extended-2b2b2b?style=for-the-badge" alt="jest-extended" />
  <img src="https://img.shields.io/badge/jest--sorted-2b2b2b?style=for-the-badge" alt="jest-sorted" />
  <img src="https://img.shields.io/badge/Supertest-333333?style=for-the-badge" alt="Supertest" />
  <img src="https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white&style=for-the-badge" alt="ESLint" />
  <img src="https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=white&style=for-the-badge" alt="Prettier" />
  <img src="https://img.shields.io/badge/Husky-7C3AED?style=for-the-badge" alt="Husky" />
</p>

---

## API Documentation

- Visit [`/api`](https://truthy-news.onrender.com/api) for a full list of endpoints and example responses.

---

## Example Requests

### Fetch all articles

```bash
curl https://truthy-news.onrender.com/api/articles
```

**Response:**

```json
{
  "articles": [
    {
      "article_id": 1,
      "title": "Running a Node App",
      "topic": "coding",
      "author": "jessjelly",
      "body": "...",
      "created_at": "2025-06-21T12:34:56.000Z",
      "votes": 100,
      "comment_count": 5
    }
  ]
}
```

---

## License

This project is licensed under the ISC License.

---

## Contact

Created by [7doublem](https://github.com/7doublem) — feel free to reach out!
