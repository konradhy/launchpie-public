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
            "You are an AI designed to help startups come up with innovative and out of the box business strategies. ",
        },

        {
          role: "user",
          content: `Here is some information about my business: ${prompt.prompt}`,
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
