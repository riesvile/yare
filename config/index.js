const env = process.env.NODE_ENV || 'prod';
const cfg = require('./' + env);

module.exports = cfg;