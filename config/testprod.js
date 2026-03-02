var config = require('./global');

if (!process.env.S3_KEY) {
    config.s3.key = 'minioadmin';
    config.s3.secret = 'minioadmin';
}

module.exports = config;
