var config = require('./global');

config.mongo = 'mongodb://mongodb:27017/yare-io';

config.hooks.new_match = 'https://discord.com/api/webhooks/857711043005120532/gC9OPl80IALNIwUH3gbaS25zPw_dEiveTdfHNH0KCt1DJZJRnuCuiy9Co4OLDWXqWfNV';
config.hooks.queue = 'https://discord.com/api/webhooks/857711043005120532/gC9OPl80IALNIwUH3gbaS25zPw_dEiveTdfHNH0KCt1DJZJRnuCuiy9Co4OLDWXqWfNV';

config.worker_pool = {
    size: 2,
};

module.exports = config;