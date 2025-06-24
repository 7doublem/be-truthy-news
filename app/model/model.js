// model module for handling database queries and data manipulation
// provides functions for topics, articles, comments, users, and related operations

const db = require('../../db/connection');
const { checkExists } = require('../utils/databaseHelpers');

// fetches all topics from the database
// returns array of topic objects
const selectAllTopics = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => {
    return rows;
  });
};

// fetches an article by its id from the database
// article_id: number, id of the article to fetch
// returns article object with comment_count or rejects with 404 if not found
const selectArticlesById = (article_id) => {
  // SQL query joins articles and comments, counts comments for the article
  const queryStr = `SELECT articles.*, COUNT(comments.comment_id)::INT as comment_count 
       FROM articles
       LEFT JOIN comments
       ON articles.article_id = comments.article_id
       WHERE articles.article_id = $1
       GROUP BY articles.article_id`;

  // executes parameterised query and handles not found error
  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'Oops! That article could not be found. It might have been deleted or never existed',
      });
    }
    return rows[0];
  });
};

// fetches all articles with optional sorting, filtering, and pagination
// sort_by: string, field to sort by
// order: string, 'asc' or 'desc'
// topic: string, optional topic filter
// parsedLimit: number, articles per page
// parsedPage: number, page number
// returns { articles: array, total_count: number }
const selectAllArticles = (
  sort_by = 'created_at',
  order = 'desc',
  topic,
  parsedLimit,
  parsedPage
) => {
  const allowedSorts = [
    'title',
    'topic',
    'author',
    'created_at',
    'votes',
    'comment_count',
  ];
  const allowedOrders = ['asc', 'desc'];

  if (!allowedSorts.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: 'Invalid Sort Field',
    });
  }

  if (!allowedOrders.includes(order.toLowerCase())) {
    return Promise.reject({
      status: 400,
      msg: 'Invalid Order Field',
    });
  }

  // builds base SQL query with comment count and total count using window function
  let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
        COUNT(comments.article_id)::int AS comment_count,
        COUNT(*) OVER()::int AS total_count
        FROM articles
        LEFT JOIN comments
        ON articles.article_id = comments.article_id`;

  const queryValues = [];

  // adds topic filter if provided
  if (topic) {
    queryStr += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  // groups by all selected article fields to allow aggregation
  queryStr += ` GROUP BY articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url`;

  let sort_by_inc_cc;

  // handles sorting by comment_count (aggregate) vs. article fields
  if (sort_by === 'comment_count') {
    sort_by_inc_cc = 'comment_count';
  } else {
    sort_by_inc_cc = `articles.${sort_by}`;
  }

  // appends ORDER BY clause with validated sort and order
  queryStr += ` ORDER BY ${sort_by_inc_cc} ${order.toUpperCase()}`;

  // calculates offset for pagination
  const offset = (parsedPage - 1) * parsedLimit;
  // appends LIMIT and OFFSET with parameterised values
  queryStr += ` LIMIT $${queryValues.length + 1} OFFSET $${
    queryValues.length + 2
  }`;
  queryValues.push(parsedLimit, offset);

  // if topic filter is used, check topic exists before querying articles
  if (topic) {
    // calls helper to check topic existence, then queries articles
    return checkExists('topics', 'slug', topic).then(() => {
      return db.query(queryStr, queryValues).then(({ rows }) => {
        // extracts total_count from first row, removes it from articles array
        const total_count = rows[0] ? rows[0].total_count : 0;
        const articles = rows.map(({ total_count, ...rest }) => rest);
        return { articles, total_count };
      });
    });
  }
  // queries articles without topic filter
  return db.query(queryStr, queryValues).then(({ rows }) => {
    const total_count = rows[0] ? rows[0].total_count : 0;
    const articles = rows.map(({ total_count, ...rest }) => rest);
    return { articles, total_count };
  });
};

// fetches comments for a specific article by article id
// article_id: number, id of the article
// parsedLimit: number, comments per page
// parsedPage: number, page number
// returns array of comment objects or rejects with 404 if article not found
const selectCommentsByArticleId = (article_id, parsedLimit, parsedPage) => {
  // checks if article exists before querying comments
  return checkExists('articles', 'article_id', article_id)
    .catch((err) => {
      if (err.status === 404) {
        return Promise.reject({
          status: 404,
          msg: 'Oops! That article could not be found. It might have been deleted or never existed',
        });
      }
      return Promise.reject(err);
    })
    .then(() => {
      // calculates offset for pagination and queries comments
      const offset = (parsedPage - 1) * parsedLimit;
      return db.query(
        `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;`,
        [article_id, parsedLimit, offset]
      );
    })
    .then(({ rows }) => {
      return rows;
    });
};

// inserts a new comment for a specific article
// article_id: number, id of the article
// username: string, author of the comment
// body: string, comment text
// returns inserted comment object or rejects with 404 if article or user not found
const insertComments = (article_id, username, body) => {
  // checks if article exists before inserting comment
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((articleResult) => {
      if (articleResult.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: 'Oops! That article could not be found. It might have been deleted or never existed',
        });
      }
      // checks if username exists before inserting comment
      return db
        .query(`SELECT * FROM users where username = $1`, [username])
        .then((usernameResult) => {
          if (usernameResult.rows.length === 0) {
            return Promise.reject({
              status: 404,
              msg: 'Username Not Found',
            });
          }
          // inserts comment and returns the inserted row
          return db
            .query(
              `INSERT INTO comments (article_id, author, body)
    VALUES ($1, $2, $3)
    RETURNING *`,
              [article_id, username, body]
            )
            .then((commentResult) => {
              return commentResult.rows[0];
            });
        });
    });
};

// updates the vote count for a specific article
// inc_votes: number, increment for votes
// article_id: number, id of the article
// returns updated article object or rejects with 404 if not found
const updateArticleById = (inc_votes, article_id) => {
  // checks if article exists before updating
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((articleIdResult) => {
      if (articleIdResult.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: 'Oops! That article could not be found. It might have been deleted or never existed',
        });
      }
      // updates votes and returns updated article
      return db
        .query(
          `UPDATE articles
    SET
    votes = votes + $1
    WHERE article_id = $2
    RETURNING *`,
          [inc_votes, article_id]
        )
        .then((articleResult) => {
          return articleResult.rows[0];
        });
    });
};

// deletes a comment by its id
// comment_id: number, id of the comment
// resolves if deleted, rejects with 404 if not found
const deleteCommentById = (comment_id) => {
  // deletes comment and checks if any row was affected
  return db
    .query(
      `DELETE FROM comments
    WHERE comment_id = $1`,
      [comment_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: 'Oops! That comment could not be found. It might have been deleted or never existed',
        });
      }
    });
};

// fetches all users from the database
// returns array of user objects
const selectAllUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => {
    return rows;
  });
};

// fetches a user by their username
// username: string, username to fetch
// returns user object or rejects with 404 if not found
const selectUserByUsername = (username) => {
  // queries user by username and handles not found error
  return db
    .query(
      `SELECT * FROM users
    WHERE username = $1`,
      [username]
    )
    .then((userResult) => {
      if (userResult.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'User Not Found' });
      }
      return userResult.rows[0];
    });
};

// updates the vote count for a specific comment
// inc_votes: number, increment for votes
// comment_id: number, id of the comment
// returns updated comment object or rejects with 404 if not found
const updateCommentById = (inc_votes, comment_id) => {
  // checks if comment exists before updating
  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1;`, [comment_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Not Found' });
      }

      // updates votes and returns selected fields from updated comment
      return db
        .query(
          `
          UPDATE comments
          SET votes = votes + $1
          WHERE comment_id = $2
          RETURNING comment_id, body, votes, author, created_at;
          `,
          [inc_votes, comment_id]
        )
        .then((updateResult) => updateResult.rows[0]);
    });
};

// inserts a new article into the database
// author: string, username of the author
// title: string, article title
// body: string, article content
// topic: string, topic slug
// article_img_url: string, optional image url
// returns inserted article object with comment_count 0 or rejects with 404 if author or topic not found
const insertArticle = (author, title, body, topic, article_img_url) => {
  // sets default image URL if none provided
  const defaultImgUrl =
    'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

  const finalImgUrl = article_img_url || defaultImgUrl;

  // checks if author and topic exist before inserting article
  return Promise.all([
    checkExists('users', 'username', author).catch(() => {
      return Promise.reject({ status: 404, msg: 'Author Not Found' });
    }),
    checkExists('topics', 'slug', topic).catch(() => {
      return Promise.reject({ status: 404, msg: 'Topic Not Found' });
    }),
  ])
    .then(() => {
      // inserts article and returns the inserted row
      return db.query(
        `INSERT into articles (author, title, body, topic, article_img_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
        [author, title, body, topic, finalImgUrl]
      );
    })
    .then(({ rows }) => {
      // sets comment_count to 0 for new article
      const newArticle = rows[0];
      newArticle.comment_count = 0;
      return newArticle;
    });
};

// inserts a new topic into the database
// slug: string, topic slug
// description: string, topic description
// img_url: string, topic image url
// returns inserted topic object or rejects with 400 if topic already exists
const insertTopic = (slug, description, img_url) => {
  // inserts topic and handles duplicate topic error
  return db
    .query(
      `INSERT INTO topics (slug, description, img_url)
    VALUES ($1, $2, $3)
    RETURNING *`,
      [slug, description, img_url]
    )
    .then(({ rows }) => {
      return rows[0];
    })
    .catch((err) => {
      if (err.code === '23505') {
        return Promise.reject({
          status: 400,
          msg: 'Topic already exists',
        });
      }
      return Promise.reject(err);
    });
};

// deletes an article by its id
// article_id: number, id of the article
// deletes all comments for the article, then deletes the article itself
// resolves to deleted article object or rejects with 404 if not found
const deleteArticleById = (article_id) => {
  // checks if article exists before deleting
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: 'Oops! That article could not be found. It might have been deleted or never existed',
        });
      }
      // deletes all comments for the article, then deletes the article itself
      return db
        .query(`DELETE FROM comments WHERE article_id = $1`, [article_id])
        .then(() => {
          return db.query(
            `DELETE FROM articles WHERE article_id = $1 RETURNING *`,
            [article_id]
          );
        });
    });
};

// export all model functions for use in the controller
module.exports = {
  selectAllTopics,
  selectArticlesById,
  selectAllArticles,
  selectCommentsByArticleId,
  insertComments,
  updateArticleById,
  deleteCommentById,
  selectAllUsers,
  selectUserByUsername,
  updateCommentById,
  insertArticle,
  insertTopic,
  deleteArticleById,
};
