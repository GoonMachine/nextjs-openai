/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";


export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { guess } = req.body;
  console.log("req.body", guess);

  if (!guess) {
    return res.status(200).json({
      isPriceCorrect: false,
      tiplinkUrl: "",
      message: "Your guess cannot be empty! Please try again.",
    });
  }
  const isCorrectGuess = checkGuess(guess, nftPrice1, nftPrice2);

  const tiplinkUrl = isCorrectGuess
    ? "https://tiplink.io/i#3rf5Au66NsNPGtAJm"
    : "";

  const body = {
    isPriceCorrect: isCorrectGuess,
    tiplinkUrl,
  };

  console.log("body", body);

  return res.status(200).json(body);
};

function checkGuess(userGuess: string, price1: number, price2: number) {
    if (userGuess === "higher" && price1 < price2) {
      return true;
    }
    if (userGuess === "lower" && price1 > price2) {
      return true;
    }
    return false;
  }

export const config = {
  api: {
    bodyParser: true
  }
};
