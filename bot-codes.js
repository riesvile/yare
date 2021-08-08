module.exports = bots = {}

const fs = require('fs');

fs.readdirSync(__dirname + "/bots/").forEach(function(file) {
    var code = fs.readFileSync(__dirname + "/bots/" + file, "utf8");
    bots[file.replace(".js", "")] = code;
});