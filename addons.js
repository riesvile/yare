const fs = require('fs');

const addons = {};

fs.readdirSync(__dirname + "/addons/").forEach(function(file) {
    const code = fs.readFileSync(__dirname + "/addons/" + file, "utf8");
    addons[file] = code;
});

module.exports = {
    get(name) {
        return addons[name];
    }
};

