const fs = require('fs');

const bots = {};

fs.readdirSync(__dirname + "/bots/").forEach(function(file) {
    const code = fs.readFileSync(__dirname + "/bots/" + file, "utf8");
    bots[file.replace(".js", "")] = code;
});

module.exports = bots;