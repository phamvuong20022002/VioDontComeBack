"use strict";

class ChatBotService {
  static getAnswers = async (req) => {
    const message = await global._openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: req.body.question }],
    });

    if (message) {
      return {
        code: "200",
        metadata: message.choices[0].message,
      };
    }

    //error
    return {
      code: "200",
      metadata: null,
    };
  };
}
module.exports = ChatBotService;
