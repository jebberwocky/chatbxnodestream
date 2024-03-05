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
      content:userInput}],// '解卦: ["888679", "觀", "萃", {"0": "盥而不荐，有孚顒若。", "1": "初六：童觀，小人無咎，君子吝。", "2": "六二：窺觀，利女貞。", "3": "六三：觀我生，進退。", "4": "六四：觀國之光，利用賓於王。", "5": "九五：觀我生，君子無咎。", "6": "上九：觀其生，君子無咎。", "7": "彖︰大觀在上，順而巽，中正以觀天下。觀，盥而不薦，有孚顒若，下觀而化也。觀天之神道，而四時不忒，聖人以神道設教，而天下服矣。"}, ["【觀之萃】", "動爻有【2】根。", "主要看【上九】，其次看【六四】。", "上九：觀其生，君子無咎。", "六四：觀國之光，利用賓於王。"]]' }],
    stream: true,
  });
  stream.on('content', (delta, snapshot) => {
    console.log("response:"+delta)
    res.write(delta);
  });
  //
  res.on("close", () => {
    //clearInterval(interval);
    console.log("close")
    res.end();
  });
});

port = config.get("env")["port"]
app.listen( () => {port,
  console.log(`Server is up and running at port ${port}`);
});
