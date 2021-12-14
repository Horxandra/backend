const { json } = require("body-parser");
const express = require("express");
const app = express();
const fs = require('fs');
const { parse } = require("path/posix");
const bcrypt = require('bcrypt')

const sessionStorage = {}

app.use(express.json())

app.get("/api/hello",(req,res)=>{
    res.json({msg: "hello"})
})

app.post("/api/signup", async (req,res)=>{
    const data = fs.readFileSync('./data.json','utf-8');
    const parsedData = JSON.parse(data)
    if(parsedData[req.body.username]){
        return res.sendStatus(409)
    }
    const hashedPass = await bcrypt.hash(req.body.password, 10) 
    parsedData[req.body.username] = hashedPass
    const dataAsString = JSON.stringify(parsedData, null, 2)
    fs.writeFileSync('./data.json', dataAsString)

    res.sendStatus(200)
})

app.post("/api/login", async (req,res)=>{
    const data = fs.readFileSync('./data.json','utf-8');
    const parsedData = JSON.parse(data)
    if(!parsedData[req.body.username]){
        return res.sendStatus(401)
    }
    const comparePass = await bcrypt.compare(req.body.password, parsedData[req.body.username])

    if(comparePass){
        const secretRandomKey = (Math.random() + 1).toString(36).substring(7);
        sessionStorage[secretRandomKey] = req.body.username
        return res.json({sessionId: secretRandomKey})
    }else{
        return res.sendStatus(401)
    }
})

app.post('/api/secret', (req,res)=>{
    const sessionId = req.header('sessionId')
    if(!sessionStorage[sessionId]){
        return res.sendStatus(401)
    }

    res.send(`hello ${sessionStorage[sessionId]} this is a secret`)
})

app.listen(8000)
