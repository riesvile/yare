const fs = require('fs');

var addons = {};

fs.readdirSync(__dirname + "/addons/").forEach(function(file) {
    var code = fs.readFileSync(__dirname + "/addons/" + file, "utf8");
    addons[file] = code;
});

module.exports = {
    get(name) {
        return addons[name];
    }
}

