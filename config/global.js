var config = module.exports = {};

config.hooks = {};

config.mongo = process.env.MONGO_URI || 'mongodb://mongodb:27017/yare-io';

config.hooks.new_match = process.env.DISCORD_WEBHOOK_NEW_MATCH || '';
config.hooks.queue = process.env.DISCORD_WEBHOOK_QUEUE || '';

config.s3 = {
    key: process.env.S3_KEY || '',
    secret: process.env.S3_SECRET || '',
    bucket: process.env.S3_BUCKET || 'yare-io-replays',
    endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
    bucketEndpoint: process.env.S3_BUCKET_ENDPOINT === 'true'
};

config.frontendAddress = process.env.FRONTEND_ADDRESS || 'http://frontend:5000';

config.transpilerSecret = process.env.TRANSPILER_SECRET || 'default-transpiler-secret';
