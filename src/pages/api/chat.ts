import { NextRequest } from "next/server";
import { OpenAI } from "openai-streams";

export default async function demo(req: NextRequest) {
  const { guess } = await req.json();
  if (!guess) {
    return new Response(null, { status: 400, statusText: "Did not include `guess` parameter" });
  }

  const nft = "Claynosaurz #6175";

  const completionsStream = await OpenAI(
    "chat",
    {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `Write a sarcastic two-sentence paragraph for a riddle where someone guessed that the price that someone bought ${nft} for is ${guess}. Be more sarcastic the further away they are. Don't reveal the true price.\n\n`, }
      ],
    },
  );

  return new Response(completionsStream, {
  });
}

export const config = {
  runtime: "edge",
};
