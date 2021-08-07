var env = process.env.NODE_ENV || "prod",
  cfg = require("./" + env);

module.exports = cfg;
