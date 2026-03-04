const config = require('./global');

if (!process.env.S3_BUCKET) {
    config.s3.bucket = 'yare';
    config.s3.bucketEndpoint = true;
}

if (!process.env.FRONTEND_ADDRESS) {
    config.frontendAddress = 'https://yare.io';
}

module.exports = config;
