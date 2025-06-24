/**
Entry point for starting the Express server.

Loads the main API app and listens on the specified port.

The port can be set via the PORT environment variable (defaults to 9090).

To run the server, use the command `node listen.js` or `npm run start`.
**/

const app = require('./api');

const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
});
