export const maskApiKey = (apiKey) => {
  // Check if the API key has the expected format (32 characters long)
  const apiKeyPattern = /^sk-[a-zA-Z0-9]+$/;
  if (!apiKeyPattern.test(apiKey)) {
    throw new Error("Invalid OpenAI API key format.");
  }

  // Extract the last four characters
  const lastFour = apiKey.slice(-4);

  // Mask the rest of the API key with asterisks
  const maskedKey = `sk-${"*".repeat(apiKey.length - 6)}${lastFour}`;

  return maskedKey;
};
