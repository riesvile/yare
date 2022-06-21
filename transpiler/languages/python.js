const { execSync } = require("child_process")
const fs = require("fs")
const {v4: uuid} = require('uuid')
const path = require("path")

module.exports = javascripthon

function javascripthon(code) {
  let output = execSync(
    `python3 -m metapensiero.pj --inline-map --source-name "~sandbox/user.py" -s - -o -`, {
      input: code
    }
  )
  return output.toString()
}

// transcrypt refuses to find the python file for some reason ):<
function transcrypt(code) {
  let srcdir = "/tmp/transcrypt/"
  // if (fs.existsSync(srcdir)) {
  //   fs.rmdirSync(srcdir, { recursive: true })
  // }
  if (!fs.existsSync(srcdir)) {
    fs.mkdirSync(srcdir)
    fs.chmodSync(srcdir, 0o777)
  }
  let id = uuid()
  let tempFile = path.join(srcdir, id + ".py")
  let tempDir = path.join(srcdir, id)
  let outFile = path.join(tempDir, id + ".js")
  fs.mkdirSync(tempDir)
  fs.writeFileSync(tempFile, code)
  // console.log(fs.readdirSync(srcdir), fs.readFileSync(tempFile, "utf-8"))
  let transcryptOutput = ""
  try {
    transcryptOutput = execSync(
      `find ${srcdir} && python3 -m transcrypt -m -n -v -p .none ${tempFile} -od ./${id}`,
      {
        cwd: srcdir
      }
    )
  } catch (error) {
      // console.log(error.message);
      // console.log("error", error.stdout.toString());
  }
  // console.log(transcryptOutput.toString())
  const result = fs.readFileSync(outFile, "utf-8")
  return result
}