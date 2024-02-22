import { OpenAIApi, Configuration } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";

//i think the api key is just preloaded

export const storymaker = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, { prompt }) => {
    console.log("storymaker", prompt);

    //what does this actually do?
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(config);

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI capable of creating stories. Generate a story based on the provided elements. Be colorful in your details. Pick a genre and stick to it. Add twists at the end.",
        },
        {
          role: "user",
          content: `Here is some random user input by me for which you are to create a story ${prompt.prompt}`,
        },
      ],
      stream: true,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  },
});
