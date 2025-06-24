# Error Handling

Below are the possible errors for each endpoint, along with their HTTP status codes and example messages.

---

## Unavailable Routes

### GET `/not-a-route`

- Route does not exist (e.g. `/mitch`)
  - **404**: "Page Not Found"

## Available Routes

### GET `/api/articles/:article_id`

- Bad `article_id` (e.g. `/dog`)
  - **400**: "Invalid Article ID"
- Well formed `article_id` that doesn't exist in the database (e.g. `/999999`)
  - **404**: "Oops! That article could not be found. It might have been deleted or never existed"

### GET `/api/articles/:article_id/comments`

- Bad `article_id` (e.g. `/dog`)
  - **400**: "Invalid Article ID"
- Well formed `article_id` that doesn't exist in the database (e.g. `/999999`)
  - **404**: "Oops! That article could not be found. It might have been deleted or never existed"

### PATCH `/api/articles/:article_id`

- Bad `article_id` (e.g. `/dog`)
  - **400**: "Invalid Article ID"
- Well formed `article_id` that doesn't exist in the database (e.g. `/999999`)
  - **404**: "Oops! That article could not be found. It might have been deleted or never existed"
- Request body does not have the required fields (e.g. `{}`)
  - **400**: "Invalid or Missing Votes"
- Invalid `inc_votes` (e.g. `{ inc_votes : "cat" }`)
  - **400**: "Invalid or Missing Votes"

### POST `/api/articles/:article_id/comments`

- Bad `article_id` (e.g. `/dog`)
  - **400**: "Invalid Article ID"
- Well formed `article_id` that doesn't exist in the database (e.g. `/999999`)
  - **404**: "Oops! That article could not be found. It might have been deleted or never existed"
- Request body does not have the required fields (e.g. `{}`)
  - **400**: "Username is required" or "Body is required" or "Missing more than one required field"
- Request body has invalid data types (e.g {`username`: `600`, `body`: `false`}")
  - **400**: "Invalid Username" or "Invalid Body" or "Invalid data type for more than one field"
- Username does not exist in database (e.g. `username`: `silly_message`)
  - **404**: "Username Not Found"

### GET `/api/articles`

- Bad queries:
  - `sort_by` a column that doesn't exist
    - **400**: "Invalid Sort Field"
  - `order` !== "asc" / "desc"
    - **400**: "Invalid Order Field"
  - `topic` that is not in the database
    - **404**: "Not Found"
  - `topic` that exists but does not have any articles associated with it
    - **200**: (Empty articles array, no error)

### PATCH `/api/comments/:comment_id`

- Well formed `comment_id` that doesn't exist in the database (e.g. `/99999`)
  - **404**: "Not Found"
- Request body does not have the required fields (e.g. `{}`)
  - **400**: "Invalid or Missing Votes"
- Request body has invalid data types (e.g {`inc_votes`: `yes`}")
  - **400**: "Invalid or Missing Votes"

### DELETE `/api/comments/:comment_id`

- Bad `comment_id` (e.g. `/comment`)
  - **400**: "Invalid Comment ID"
- Well formed `comment_id` that doesn't exist in the database (e.g. `/999999`)
  - **404**: "Oops! That comment could not be found. It might have been deleted or never existed"

### GET `/api/users/:username`

- Bad `username` (e.g. `/900`)
  - **400**: "Invalid Username"
- Well formed `username` that doesn't exist in the database
  - **404**: "User Not Found"

### POST `/api/articles`

- Request body does not have the required fields (e.g. `{}`)
  - **400**: "Author is required" or "Title is required" or "Body is required" or "Topic is required" or "Missing more than one required field"
- Request body has invalid data types (e.g {`author`: `600`, `title`: `the`, `body`: `the`, `topic`: `cooking`, `article_img_url`: ``}")
  - **400**: "Invalid Author" or "Invalid Title" or "Invalid Body" or "Invalid Topic" or "Invalid data type for more than one field"
- Author or topic does not exist in database (e.g. `author`: `silly_message` / `topic`: `skydiving`)
  - **404**: "Author Not Found" or "Topic Not Found"

### POST `/api/topics`

- Request body does not have the required fields (e.g. `{}`)
  - **400**: "Topic is required" or "Description is required" or "Image URL is required" or "Missing more than one required field"
- Request body has invalid data types (e.g. `{ slug: 123, description: false, img_url: [] }`)
  - **400**: "Invalid Topic Slug" or "Invalid Description" or "Invalid Image URL" or "Invalid data type for more than one field"
- Duplicate slug (topic with this slug already exists)
  - **400**: "Topic already exists"

### DELETE `/api/articles/:article_id`

- Bad `article_id` (e.g. `/dog`)
  - **400**: "Invalid Article ID"
- Well formed `article_id` that doesn't exist in the database (e.g. `/999999`)
  - **404**: "Oops! That article could not be found. It might have been deleted or never existed"
