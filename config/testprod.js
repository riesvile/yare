var config = require("./global");

config.mongo = "mongodb://mongodb:27017/yare-io";

config.hooks.new_match =
  "https://discord.com/api/webhooks/991305071218409532/jyQ0rrna7SA653whpgsXlmZyBV6a1K2REq9bw--ZbOecX7NCdY0iPs1SIhewp0owt-4S";
config.hooks.queue =
  "https://discord.com/api/webhooks/991305071218409532/jyQ0rrna7SA653whpgsXlmZyBV6a1K2REq9bw--ZbOecX7NCdY0iPs1SIhewp0owt-4S";

config.s3 = {
  key: "minioadmin",
  secret: "minioadmin",
  bucket: "yare-io-replays",
  endpoint: "http://minio:9000",
  bucketEndpoint: false,
};

config.frontendAddress = "http://frontend:5000";

module.exports = config;
