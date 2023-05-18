import { NextRequest } from "next/server";
import { OpenAI } from "openai-streams";

export default async function demo(req: NextRequest) {
  const { price } = await req.json();
  if (!price) {
    return new Response(null, { status: 400, statusText: "Did not include `price` parameter" });
  }

  const nft = "Claynosaurz #6175";
  const nftPrice = "$30,969.24";
  const isCorrect = checkGuess(price, nftPrice);

  const completionsStream = await OpenAI(
    "chat",
    {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `Write a sarcastic two-sentence paragraph for a riddle where someone guessed the price that someone bought ${nft} for ${price}, the price is ${nftPrice}. Be more sarcastic the further away they are. Dont reveal the true price.\n\n`, }
      ],
    },
  );

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "text/plain");
  responseHeaders.set("X-Is-Correct", isCorrect.toString());

  return new Response(completionsStream, {
    headers: responseHeaders,
  });
}

function checkGuess(guess: string, correctPrice: string) {
  return guess === correctPrice;
}

export const config = {
  runtime: "edge",
};
