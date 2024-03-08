const express = require('express'),
    router = express.Router();
const config = require('config');
const Groq = require("groq-sdk");
const groq = new Groq({
    apiKey: config.get("groq")["apiKey"],
});

router.post("/mixtral", async(req, res) => {
    const userInput = req.body.input;
    //set streaming headers
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive", // allowing TCP connection to remain open for multiple HTTP requests/responses
      "Content-Type": "text/event-stream", // media type for Server Sent Events (SSE)
    });
    //res.flushHeaders();
    try{
    const stream = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [{ 
        role: 'user', 
        content:userInput}],
      stream: true,
    });
    
      for await (const chunk of stream){
        delta = chunk.choices[0]?.delta?.content || "";
        res.write(delta)
      }
      res.end()
    }catch(err){
      if (err instanceof Groq.APIError) {
        console.log(err.name); // BadRequestError
        res.json(err)
      } else {
        res.json(err)
      }
    }
   
  });


module.exports = router;