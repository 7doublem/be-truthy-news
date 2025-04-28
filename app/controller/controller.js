const endpointsJson = require("../../endpoints.json");

const getApi = (req, res) => {
  res.status(200).send({ endpoints: endpointsJson });
};

module.exports = { getApi };
