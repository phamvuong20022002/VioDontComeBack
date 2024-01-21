'use strict';

const ChatBotService = require('../services/chatbot.service')
class ChatBoxController {
    getAnswers = async(req, res, next) => {
        const chatCompletion = await ChatBotService.getAnswers(req);
        if(chatCompletion){
            return res.status(200).json({
                status: 'success',
                answer: chatCompletion
            });
        }
        return res.status(404).json({
            status: 'success',
            answer: null
        });
    }
}

module.exports = new ChatBoxController();