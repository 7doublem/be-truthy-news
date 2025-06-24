const db = require('./connection.js');

// queries all users from the database
db.query(`SELECT * FROM users`)
  .then((result) => {
    console.log(result.rows);
  })
  .then(() => {
    // queries all articles where the topic is 'coding'
    db.query(`SELECT * FROM articles WHERE topic = 'coding'`)
      .then((result) => {
        console.log(result.rows);
      })
      .then(() => {
        // queries all comments with votes less than zero
        db.query(`SELECT * FROM comments WHERE votes < 0`)
          .then((result) => {
            //console.log(result.rows);
          })
          .then(() => {
            // queries all topics from the database
            db.query(`SELECT * FROM topics`)
              .then((result) => {
                //console.log(result.rows);
              })
              .then(() => {
                // queries all articles by user 'grumpy19'
                db.query(`SELECT * FROM articles WHERE author = 'grumpy19';`)
                  .then((result) => {
                    //console.log(result.rows);
                  })
                  .then(() => {
                    // queries all comments with more than 10 votes
                    db.query(`SELECT * FROM comments where votes > 10`).then(
                      (result) => {
                        //console.log(result.rows);
                      }
                    );
                  });
              });
          });
      });
  });
