const esbuild = require("esbuild")

module.exports = function(code) {
  const result = esbuild.transformSync(code, {
    target: [
      "node12"
    ],
    sourcemap: "inline",
    loader: "ts"
  })
  return result.code
}