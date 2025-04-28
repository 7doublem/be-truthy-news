const app = require("./api");

const port = 9090;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
