/* eslint-disable no-console */
/* eslint-disable no-trailing-spaces */
/* eslint-disable max-len */
/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { LRUCache } from "lru-cache";

const cache = new LRUCache({ max: 10 });

// ...
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

function getRandomIndices(arrayLength: number): number[] {
  if (arrayLength < 5) {
    throw new Error("Array length must be at least 5");
  }

  const indices: number[] = [];

  while (indices.length < 5) {
    const randomIndex = Math.floor(Math.random() * arrayLength);

    if (!indices.includes(randomIndex)) {
      indices.push(randomIndex);
    }
  }

  return indices;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const cacheKey = "nfts"; // Define a cache key for the NFT data

  // Check if the NFT data is already cached
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    // If cached data is available, use it
    return res.status(200).json(cachedData);
  }

  const url = "https://api.helius.xyz/v1/nft-events?api-key=75001ea1-b48d-493a-957c-c9ced9dcf0ee";

  // Fetch the NFT data from the API
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

  if (parsedSales.length < 5) {
    console.error("Not enough sales data");
    return res.status(500).json({ error: "Not enough sales data" });
  }
  
  const randomIndices = getRandomIndices(parsedSales.length);
  const nftData: { address: string; price: number; date: string }[] = [];
  
  randomIndices.forEach((index) => {
    const sale = parsedSales[index];
    const nftAddress = sale.nfts[0]?.mint;
    const nftPrice = sale.amountInSol;
    const formattedDate = new Date(sale.date).toLocaleDateString("en-US");
  
    nftData.push({
      address: nftAddress,
      price: nftPrice,
      date: formattedDate,
    });
  });
  
  const url2 = "https://api.helius.xyz/v0/token-metadata?api-key=75001ea1-b48d-493a-957c-c9ced9dcf0ee";
  const nftAddresses = nftData.map((data) => data.address);
  
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
  
  // Combine the NFT data with the corresponding images
  const nfts = nftData.map((data, index) => ({
    ...data,
    image: images[index],
  }));
  
  // Store the generated NFTs in the cache
  cache.set(cacheKey, nfts);
  
  // Send back the generated NFTs
  res.status(200).json(nfts);
};