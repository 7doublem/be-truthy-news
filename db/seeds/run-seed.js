const devData = require('../data/development-data/index.js');
const seed = require('./seed.js');
const db = require('../connection.js');

// runs the seed function with development data, then closes the database connection
const runSeed = () => {
  return seed(devData).then(() => db.end());
};

runSeed();
