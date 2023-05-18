/* eslint-disable max-len */
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { StreamingText } from "../components/StreamingText";
import { useTextBuffer } from "../hooks";


export default function Home() {
  const priceRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState({ price: "Basically free..." });
  const { buffer, done, error, headers, refresh, cancel } = useTextBuffer({
    url: "/api/chat",
    throttle: 100,
    options: {
      method: "POST",
    },
    data,
  });

  // eslint-disable-next-line no-console
  console.log({ buffer, done, error, headers, data });

  useEffect(
    () => {
      const price = priceRef.current?.value;
      if (price) setData((data) => ({ ...data, price }));
    },
    []
  );

  const setPrice = () => {
    const price = priceRef?.current?.value;
    if (price) {
      setData((data) => ({ ...data, price }));
      refresh();
    }
  };


  return (
    <>
      <Head>
        <title>OpenAI Completion Stream</title>
      </Head>

      <main>
        <div className="flex justify-center flex-col items-center">
          <img
            className="w-32 h-32 object-cover rounded-md"
            src="https://nftstorage.link/ipfs/bafybeif4ryzw3wjhzm3wwjb2m5rd5fwmef6pjrurf6f3b5dqhnbzzfnd5i"
            alt="Your NFT Image"
          />
          <label className="mt-2">Price</label>
          <input
            ref={priceRef}
            defaultValue={data.price}
            placeholder="Type a price here..."
          />
        </div>

        <div className="w-full max-w-md p-4 rounded-lg border-solid border-2 border-blue-400">
          {/* <StreamingTextURL url="/api/demo" fade={600} throttle={100} data={data} /> */}
          <StreamingText buffer={buffer} />
        </div>

        <div className="flex flex-row">
          <button className="w-full" onClick={setPrice}>
            Guess
          </button>
          <button className="w-full" onClick={cancel}>Cancel</button>
        </div>
      </main>

    </>
  );
}