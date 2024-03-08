# chatbx_node_stream
rewrite the chatbx backend for streaming

## config
./config/default.json
'''
{
    "logs":{"filename":"logs/all.log"},
    "service-logs":{"filename":"logs/service-log.log" },
    "error-logs":{"filename":"logs/error-log.log" },
    "env":{"port":"3000"},
    "openai":{
        "apiKey":"MASKED"
    },
    "groq":{
        "apiKey":"MASKED"
    }
}
'''
