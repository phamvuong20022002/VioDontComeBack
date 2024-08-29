"use strict";

const ChatBotService = require("../services/chatbot.service");
const ChatBotServiceStream = require("../services/chatbotsteam.service");

class ChatBoxController {
  getAnswers = async (req, res, next) => {
    try {
      // Steam
      if (req.body.stream) {
        return await ChatBotServiceStream.getAnswers(req, res);
      } else {
        const chatCompletion = await ChatBotService.getAnswers(req);
        if (chatCompletion) {
          return res.status(200).json({
            status: "success",
            answer: chatCompletion,
          });
        }
      }

      return res.status(200).json({
        status: "success",
        metadata: {
          message: "[DONE]",
        },
      });
    } catch (err) {
      // Catch any errors that occur and pass them to the next middleware
      console.error(`Error in getAnswers: ${err.message}`);
      next(err); // Forward the error to the error-handling middleware
    }
  };
}

module.exports = new ChatBoxController();
