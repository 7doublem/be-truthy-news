# Possible Errors

## Relevant HTTP Status Codes

- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 404 Not Found
- 405 Method Not Allowed
- 418 I'm a teapot
- 422 Unprocessable Entity
- 500 Internal Server Error

---

## Unavailable Routes

### GET `/not-a-route`

- 404: Route does not exist (e.g. `/mitch`)

## Available Routes

### GET `/api/articles/:article_id`

- Bad `article_id` (e.g. `/dog`)
- Well formed `article_id` that doesn't exist in the database (e.g. `/999999`)

### GET `/api/articles/:article_id/comments`

- Bad `article_id` (e.g. `/dog`)
- Well formed `article_id` that doesn't exist in the database (e.g. `/999999`)

### PATCH `/api/articles/:article_id`

- Bad `article_id` (e.g. `/dog`)
- Well formed `article_id` that doesn't exist in the database (e.g. `/999999`)
- Request body does not have the required fields (e.g. `{}`)
- Invalid `inc_votes` (e.g. `{ inc_votes : "cat" }`)

### POST `/api/articles/:article_id/comments`

- Bad `article_id` (e.g. `/dog`)
- Well formed `article_id` that doesn't exist in the database (e.g. `/999999`)
- Request body does not have the required fields (e.g. `{}`)
- Request body has invalid data types (e.g {`username`: `600`, `body`: `false`}")
- Username does not exist in database (e.g. `username`: `silly_message`)

### GET `/api/articles`

- Bad queries:
  - `sort_by` a column that doesn't exist
  - `order` !== "asc" / "desc"
  - `topic` that is not in the database
  - `topic` that exists but does not have any articles associated with it

### PATCH `/api/comments/:comment_id`

- Well formed `comment_id` that doesn't exist in the database (e.g. `/99999`)
- Request body does not have the required fields (e.g. `{}`)
- Request body has invalid data types (e.g {`inc_votes`: `yes`}")

### DELETE `/api/comments/:comment_id`

- Bad `comment_id` (e.g. `/comment`)
- Well formed `comment_id` that doesn't exist in the database (e.g. `/999999`)

### GET `/api/users/:username`

- Bad `username` (e.g. `/900`)
- Well formed `username` that doesn't exist in the database

### POST `/api/articles`

- Request body does not have the required fields (e.g. `{}`)
- Request body has invalid data types (e.g {`author`: `600`, `title`: `the`, `body`: `the`, `topic`: `cooking`, `article_img_url`: ``}")
- Author or topic does not exist in database (e.g. `author`: `silly_message` / `topic`: `skydiving`)
