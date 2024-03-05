const express = require("express");
const OpenAI= require("openai");
const winston = require('winston'),expressWinston = require('express-winston');
const corsoption = { origin: "*"}
const cors = require("cors");
const config = require('config');
const bodyParser = require('body-parser');
const openai = new OpenAI({
  apiKey: config.get("openai")["apiKey"], // This is the default and can be omitted
});
//https://platform.openai.com/docs/api-reference/streaming

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsoption));
app.use(express.json());
app.options('*', cors(corsoption))

expressWinston.requestWhitelist.push('body');

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File(config.get('logs'))
  ],
}));

app.use(expressWinston.errorLogger({
  transports: [
      new winston.transports.File(config.get('error-logs'))
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
  )
}));

app.get("/status", (req, res) =>{
	res.json({"s":"ok"})
})

app.post("/beta/v4", (req, res) => {
  const userInput = req.body.input;
  //set streaming headers
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive", // allowing TCP connection to remain open for multiple HTTP requests/responses
    "Content-Type": "text/event-stream", // media type for Server Sent Events (SSE)
  });
  //res.flushHeaders();
  const stream =  openai.beta.chat.completions.stream({
    model: 'gpt-4',
    messages: [{ 
      role: 'user', 
      content:userInput}],
    stream: true,
  });
  stream.on('content', (delta, snapshot) => {
    console.log("delta:"+delta)
    res.write(delta);
  });
  stream.on('finalChatCompletion', (completion) => {
    console.log("finalChatCompletion")
    console.log(JSON.stringify(completion))
    res.end();
  })
  res.on("close", () => {
    stream.abort()
    console.log("close")
    res.end();
  });
});

port = config.get("env")["port"]
app.listen(port, () => {
  console.log(`Server is up and running at port ${port}`);
});
