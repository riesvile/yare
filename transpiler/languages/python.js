const { execSync } = require("child_process")
const fs = require("fs")
const {v4: uuid} = require('uuid')
const path = require("path")

module.exports = function(code) {
  let output = ""
  try {
    output = execSync(
      `python3 -m metapensiero.pj -s - -o -`, {
        input: code
      }
    )
  } catch (error) {
      console.log(error.message);
      console.log("error", error.stdout.toString());
  }
  return output.toString()
}

const transcrypt = function(code) {
  let id = uuid()
  let tempFile = path.join("/tmp/", id + ".py")
  let tempDir = path.join("/tmp/", id)
  let outFile = path.join(tempDir, id + ".js")
  fs.mkdirSync(tempDir)
  fs.writeFileSync(tempFile, code)
  console.log(fs.readdirSync("/tmp"), fs.readFileSync(tempFile, "utf-8"))
  try {
    const transcryptOutput = execSync(
      `cd /tmp && python3 -m transcrypt -b -m -n ${id + ".py"} -od ${tempDir}`
    )
  } catch (error) {
      console.log(error.message);
      console.log("error", error.stdout.toString());
  }
  console.log(transcryptOutput.toString())
  const result = fs.readFileSync(outFile, "utf-8")
  return result
}