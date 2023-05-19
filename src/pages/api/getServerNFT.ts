/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

interface OnChainAccountInfo {
    accountInfo: any; // Replace 'any' with the actual type
    error: string;
  }
  interface OnChainMetadata {
    metadata: any; // Replace 'any' with the actual type
    error: string;
  }
  interface OffChainMetadata {
    metadata: any; // Replace 'any' with the actual type
    uri: string;
    error: string;
  }
  interface Metadata {
    account: string;
    onChainAccountInfo: OnChainAccountInfo;
    onChainMetadata: OnChainMetadata;
    offChainMetadata: OffChainMetadata;
    legacyMetadata: null;
  }

interface NFT {
    mint: string;
    name: string;
    burned: boolean;
    firstVerifiedCreator: string;
    verifiedCollectionAddress: string;
  }

  interface SaleData {
    timestamp: number;
    amount: number;
    nfts: NFT[];
  }

  interface ParsedSaleData {
    date: Date;
    amountInSol: number;
    nfts: NFT[];
  }

  function parseData(data: SaleData): ParsedSaleData {
    const date = new Date(data.timestamp * 1000);
    const amountInSol = data.amount / 1_000_000_000;

    return { date, amountInSol, nfts: data.nfts };
  }

export default async (req: NextApiRequest, res: NextApiResponse) => {


  const url = `https://api.helius.xyz/v1/nft-events?api-key=75001ea1-b48d-493a-957c-c9ced9dcf0ee`;

  const getSales = async () => {
    const { data } = await axios.post(url, {
      query: {
        sources: ["MAGIC_EDEN"],
        types: ["NFT_SALE"],
        nftCollectionFilters: {
          verifiedCollectionAddress: ["SMBtHCCC6RYRutFEPb4gZqeBLUZbMNhRKaMKZZLHi7W"],
        },
      },
    });

    return data.result;
  };

  const sales = await getSales();
  const parsedSales = sales.map(parseData);

  if (parsedSales.length < 2) {
    console.error('Not enough sales data');
    return res.status(500).json({ error: 'Not enough sales data' });
  }

  const randomIndices = getRandomIndices(parsedSales.length);
  const sale1 = parsedSales[randomIndices[0]];
  const sale2 = parsedSales[randomIndices[1]];
  const nftAddress1 = sale1.nfts[0]?.mint;
  const nftAddress2 = sale2.nfts[0]?.mint;

  const nftPrice1 = sale1.amountInSol;
  const nftPrice2 = sale2.amountInSol;
  const formattedDate1 = new Date(sale1.date).toLocaleDateString("en-US");
  const formattedDate2 = new Date(sale2.date).toLocaleDateString("en-US");


  const url2 = "https://api.helius.xyz/v0/token-metadata?api-key=75001ea1-b48d-493a-957c-c9ced9dcf0ee";
  const nftAddresses = [nftAddress1, nftAddress2];

  const getMetadata = async () => {
    const { data } = await axios.post(url2, {
      mintAccounts: nftAddresses,
      includeOffChain: true,
      disableCache: false,
    });

    // Create an array to store the image URLs
    const images: string[] = [];
    data.forEach((item: any, index: any) => {
      console.log(`Metadata for item ${index + 1}:`, item.offChainMetadata.metadata.image);
      images.push(item.offChainMetadata.metadata.image);
    });

    return images;
  };

  const images = await getMetadata();

  // Do something with `nftPrice1` and `nftPrice2`...
  // ...

  // Send back the images and prices
  res.status(200).json({
    images,
    prices: {
      price1: nftPrice1,
      price2: nftPrice2,
    },
    dates: {
      date1: formattedDate1,
      date2: formattedDate2
    }

  });
};

export const config = {
  api: {
    bodyParser: true
  },
};

function getRandomIndices(arrayLength: number): [number, number] {
  if (arrayLength < 2) {
    throw new Error('Array length must be at least 2');
  }

  const index1 = Math.floor(Math.random() * arrayLength);
  let index2 = Math.floor(Math.random() * arrayLength);

  // Ensure the indices are unique
  while (index1 === index2) {
    index2 = Math.floor(Math.random() * arrayLength);
  }

  return [index1, index2];
}
