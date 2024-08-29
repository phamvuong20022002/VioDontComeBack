"use strict";
const { getStreamingCompletion } = require("../../src/modules/openai/index");

const CODE_ERROR = {
  OPENAI_RATE_LIMIT_ERROR_CODE: 429,
};

class ChatBotServiceStream {
  static async getAnswers(req, res) {
    try {
      const { messages } = req.body;

      const stream = await getStreamingCompletion(messages);

      stream.on("error", (error) => {
        if (error.status === CODE_ERROR.OPENAI_RATE_LIMIT_ERROR_CODE) {
          // Handle rate limit error
          console.log(`Rate limit exceeded from service: ${error.message}`);
          return res.status(200).json({
            status: "error",
            metadata: {
              code: "429",
              message: "Lost OpenAI service!",
            },
          });
        } else {
          // Handle other errors
          console.log(`An error occurred: ${error.message}`);
          return res.status(200).json({
            status: "error",
            metadata: {
              code: "404",
              message: "Request to OpenAI server failed!",
            },
          });
        }
      });

      for await (const part of stream) {
        // Stream the response
        res.write(part.choices[0]?.delta.content || "");
      }

      // End the response after streaming is complete
      res.end();
    } catch (err) {
      // General error handling
      console.error(`An error occurred in getAnswers: ${err.message}`);
      return res.status(500).json({
        status: "error",
        metadata: {
          code: "500",
          message: "Internal Server Error",
        },
      });
    }
  }
}

module.exports = ChatBotServiceStream;
