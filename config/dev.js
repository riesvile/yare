var config = require('./global');

config.mongo = 'mongodb://mongodb:27017/yare-io';

config.hooks.new_match = 'https://discord.com/api/webhooks/857711043005120532/gC9OPl80IALNIwUH3gbaS25zPw_dEiveTdfHNH0KCt1DJZJRnuCuiy9Co4OLDWXqWfNV';
config.hooks.queue = 'https://discord.com/api/webhooks/857711043005120532/gC9OPl80IALNIwUH3gbaS25zPw_dEiveTdfHNH0KCt1DJZJRnuCuiy9Co4OLDWXqWfNV';

//config.s3 = {
//    key: 'minioadmin',
//    secret: 'minioadmin',
//    bucket: 'yare-io-replays',
//    endpoint: 'http://minio:9000',
//    bucketEndpoint: false
//};

config.s3 = {
    key: 'HRPXONDTHZ5GLOZ6ZKDQ',
    secret: 'pmRvXApmdh+2gWdwHqvcD3du1jZdugYYRXHnGGYpR4E',
    bucket: 'yare',
    endpoint: 'https://yare.sfo3.digitaloceanspaces.com/',
    bucketEndpoint: true
};

module.exports = config;