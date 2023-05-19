/* eslint-disable no-console */
/* eslint-disable max-len */
import Head from "next/head";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { StreamingText } from "../components/StreamingText";
import { useTextBuffer } from "../hooks";

interface DataType {
  isPriceCorrect: boolean,
  tiplinkUrl: string
}


const date = "1/4/2020";

const GuessComponent = ( { data, setData }: { data: DataType, setData: React.Dispatch<SetStateAction<DataType>> }) => {
  const handleLowerClick = async () => {
    await sendGuess("lower");
  };

  const handleHigherClick = async () => {
    await sendGuess("higher");
  };

  const sendGuess = async (userGuess: string) => {
    try {
      const response = await fetch("/api/checkGuess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guess: userGuess }),
      });
      const res = await response.json();
      console.log(res);
      setData(res);
      // Handle the response data as needed
    } catch (error) {
      console.error(error);
      // Handle the error
    }
  };

  return (
    <>
      {/* ... */}
      <div className="flex justify-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
          onClick={handleLowerClick}
        >
          Lower
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l"
          onClick={handleHigherClick}
        >
          Higher
        </button>
      </div>
      {/* ... */}
    </>
  );
};

export default function Home() {
  const [data, setData] = useState ({
    isPriceCorrect: false, tiplinkUrl: ""
  });

  const [images, setImages] = useState(["", ""]);  // Initialize with two empty strings

  // This function will be executed when the component loads
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("api/getNFT");  // Replace with your actual endpoint
        const jsonData = await response.json();
        setImages(jsonData.images);
      } catch (error) {
        console.error(error);
      }
    };
    fetchImages();
  }, []);
  return (
    <>
      <Head>
        <title>NFT Guessor</title>
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-200 py-2 px-4">
        <div className="flex justify-center items-center bg-white p-6 rounded-lg shadow-lg">
          <div className="mr-4">
            <div className="relative">
              <img
                className="w-64 h-64 object-cover rounded-lg"
                src={images[0]}
                alt="Your NFT Image"
              />
              <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1">
                <span className="text-xs">Sold on {date}</span>
              </div>
            </div>
            <p className="text-center mt-2 mb-10">NFT 1</p>
            <div className="flex items-center bg-green-500 text-white px-2 py-2 rounded-lg mt-4">
              <span className="text-lg font-bold text-center">Last Sold: $36,000</span>
            </div>
          </div>

          <div className="mx-4 bg-gray-300 rounded-full h-20 w-20 flex items-center justify-center mb-20">
            <span className="text-xl font-bold">VS</span>
          </div>

          <div className="ml-4">
            <div className="relative">
              <img
                className="w-64 h-64 object-cover rounded-lg"
                src={images[1]}
                alt="Your NFT Image"
              />
              <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1">
                <span className="text-xs">Sold on {date}</span>
              </div>
            </div>
            <p className="text-center mt-2 mb-10">NFT 2</p>
            <GuessComponent data={data} setData={setData} />
          </div>
        </div>
        {data.isPriceCorrect == true && (
          <a href={data.tiplinkUrl} className="w-full">
            <button className="bg-transparent text-blue-700 font-semibold hover:text-white py-2 px-4 border-none border-blue-500 hover:border-transparent rounded">
              <img className="w-26 h-16" src="https://tiplink.io/_next/static/media/badge-blue.7b7bcf2a.png" alt="SVG as an image"/>
            </button>
          </a>
        )}
        <div className="w-full max-w-md p-4 rounded-lg border-2 border-blue-400 mb-6 bg-white mt-4">
          {/* <StreamingTextURL url="/api/demo" fade={600} throttle={100} data={data} /> */}
          {/* <StreamingText buffer={buffer} /> */}
        </div>

      </main>
    </>
  );
}
