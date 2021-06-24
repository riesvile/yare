var env = process.env.NODE_ENV || 'dev'
, cfg = require('./'+env);

module.exports = cfg;