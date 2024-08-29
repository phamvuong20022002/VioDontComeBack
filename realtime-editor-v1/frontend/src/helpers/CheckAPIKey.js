export const checkOpenAPIKey = async (apiKey) => {
  // Check if the API key has the expected format (32 characters long)
  const apiKeyPattern = /^sk-[a-zA-Z0-9-_]+$/;
  if (!apiKeyPattern.test(apiKey)) {
    return {
      status: false,
      message: "Invalid OpenAI API key format.",
    };
  }

  // Perform a simple request to the OpenAI API
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const messages = [{ role: "system", content: "Hello. Who are you?" }];
  console.log("apiKey::", apiKey);
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
      }),
    });

    if (response.ok) {
      // API key is valid
      return {
        status: true,
        message: "API key is valid",
      };
    } else {
      // API key is invalid
      const errorMessage = await response.json(); // Get the error message from the response body
      return {
        status: false,
        message:
          errorMessage.error.code === "insufficient_quota"
            ? "Your API key has expired or has not been paid. Please pay and reactivate!"
            : "API key is invalid",
        details: errorMessage.error.message,
        errors_details:
          "https://platform.openai.com/docs/guides/error-codes/api-errors",
      };
    }
  } catch (error) {
    // An error occurred during the request
    return {
      status: false,
      message: "An error occurred during the request",
      details: error.message,
    };
  }
};
