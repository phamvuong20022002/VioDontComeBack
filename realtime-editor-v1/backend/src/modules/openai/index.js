const systemMessage = {
  role: "system",
  content: "You are a helpful assistant.",
};

async function getStreamingCompletion(messages) {
  return global._openai.beta.chat.completions.stream({
    model: "gpt-3.5-turbo",
    // model: "gpt-4-turbo-preview",
    messages: [systemMessage, ...messages],
    stream: true,
  })

}

module.exports = { getStreamingCompletion };