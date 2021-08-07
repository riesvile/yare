var config = require("./global");

config.mongo =
  "mongodb+srv://levmiseri:02468a13579A@cluster0.us90f.mongodb.net/yare-io?retryWrites=true&w=majority";

config.hooks.new_match =
  "https://discord.com/api/webhooks/857708766567727115/qbi_Aunar_6hJgZkpVej21BBWoBiLpH9rrC08aP7huFPDGNY7bFwgH9vHvps3-NdZRER";
config.hooks.queue =
  "https://discord.com/api/webhooks/857712958942609458/0VUkHZ9cqHj1ow0tCIelJQecBRY0lO92gkAeyn2IuCLqTkIhE9hdBCfn1lnwXunp0Pb-";

module.exports = config;
