("use node");

import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import Replicate from "replicate";
import { internal } from "./_generated/api";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || "",
});

interface whisperOutput {
  detected_language: string;
  segments: any;
  transcription: string;
  translation: string | null;
}

export const chat = internalAction({
  args: {
    fileUrl: v.string(),
    id: v.id("records"),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const replicateOutput = (await replicate.run(
      "openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2",
      {
        input: {
          audio: args.fileUrl,
          model: "large-v3",
          translate: false,
          temperature: 0,
          transcription: "plain text",
          suppress_tokens: "-1",
          logprob_threshold: -1,
          no_speech_threshold: 0.6,
          condition_on_previous_text: true,
          compression_ratio_threshold: 2.4,
          temperature_increment_on_fallback: 0.2,
        },
      },
    )) as whisperOutput;

    const transcript = replicateOutput.transcription || "error";

    await ctx.runMutation(internal.whisper.saveTranscript, {
      id: args.id,
      transcript,
      companyId: args.companyId,
    });
  },
});

//do i pass companyId in along with recordId or do I make a database call?
export const saveTranscript = internalMutation({
  args: {
    id: v.id("records"),
    transcript: v.string(),
    companyId: v.id("companies"),
  },
  handler: async (ctx, { id, transcript, companyId }) => {
    await ctx.db.patch(id, {
      transcription: transcript,
      generatingTranscript: false,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.helpers.promptHelpers.generateTaskObject,
      {
        id,
        transcript,
        companyId,
      },
    );

    //redundant?
    await ctx.scheduler.runAfter(0, internal.together.chat, {
      id,
      transcript,
    });

    //feed this to the chat as more
    await ctx.scheduler.runAfter(0, internal.together.embed, {
      id,
      transcript,
    });
  },
});
