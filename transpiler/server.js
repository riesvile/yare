const fs = require('fs');
const express = require('express')
const app = express()

const router = new express.Router()

router.use(express.json())

router.post("/ping", (req, res, next)=>{
  res.status(200).send("I'm alive!")
})

router.post('/transpile', function (req, res) {
  let requiredOptions = [
    "language",
    "code"
  ].sort();
  if (Object.keys(req.body).sort().join(",") !== requiredOptions.join(",")) {
    return res.status(400).send("Missing required options")
  }
  let code = req.body.code
  let language = req.body.language
  if (fs.readdirSync(`./languages`).indexOf(language+".js") === -1) {
    return res.status(400).send("Language not found")
  }
  try {
    let result = require(`./languages/${language}`)(code)
    res.status(200).send({result})
    console.log(`Transpiled from ${language} successfully`)
  }catch(e){
    let errorMessage = e.message.split("\n").slice(1).join("\n")
    res.status(400).send({error: errorMessage})
  }
  
})

router.get("/languages", (req, res) => {
  let languages = fs.readdirSync(`./languages`)
  languages = languages.map(l => l.split(".")[0])
  res.status(200).send(languages)
})

// haproxy sends requests starting with /transpiler >:(
app.use("/transpiler", router)

// listen to 5000
app.listen(5000)