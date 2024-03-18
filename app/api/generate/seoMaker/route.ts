import { OpenAIApi, Configuration } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const prompt = await req.json();

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a skilled seo marketer. Provide some key words for the users company based on the description. ",
        },
        {
          role: "user",
          content: `Here is a description of my company:${prompt.prompt}`,
        },
      ],
      stream: true,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (e) {
    console.log("[GENERATE_POST]", e);
    return new NextResponse("Internal Error beng resolved" + e, {
      status: 500,
    });
  }
}
