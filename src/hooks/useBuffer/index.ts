import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { yieldStream } from "yield-stream";
import { BufferHook } from "../types";
import { State, streamState } from "./state";

export const useBuffer: BufferHook = ({
  url,
  throttle = 0,
  data = null,
  options = {}
}) => {
  const initialState: State = {
    done: false,
    buffer: [],
    refreshCount: 0,
    aborted: false,
    controller: null,
    error: null,
    headers: null,
  };

  const optionsRef = useRef(options);
  const [mounted, setMounted] = useState(false);

  const [state, dispatch] = useReducer(streamState, initialState);
  const { done, buffer, refreshCount, error, headers } = state;

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
  }, [mounted]);

  const streamChunks = useCallback(async (stream: AsyncGenerator<Uint8Array>, delay: number) => {
    let lastUpdateTime = 0;
    let responseHeaders: Headers | null = null; // Initialize with null
    // eslint-disable-next-line no-console
    console.log("Stream:", stream);

    for await (const chunk of stream) {
      dispatch({ type: "add", payload: chunk });
      if (delay) {
        const timeSinceLastUpdate = Date.now() - lastUpdateTime;
        const timeToWait = Math.max(0, delay - timeSinceLastUpdate);

        await new Promise((resolve) => setTimeout(resolve, timeToWait));
        lastUpdateTime = Date.now();
      }
    }
    dispatch({ type: "done" });

    // Get the headers from the response object
    if (stream instanceof ReadableStream && stream.locked) {
      // eslint-disable-next-line no-console
      console.log("ReadableStream locked:", stream.locked);

      const readableStreamDefaultReader = stream.getReader();
      const { value } = await readableStreamDefaultReader.read();

      // eslint-disable-next-line no-console
      console.log("ReadableStream value:", value);

      const response = value?.response;
      // eslint-disable-next-line no-console
      console.log("Response object:", response);
      responseHeaders = response?.headers || null;
    }
    // eslint-disable-next-line no-console
    console.log("Response Headers:", responseHeaders);
    // Dispatch the setHeaders action with the updated headers
    dispatch({ type: "setHeaders", payload: responseHeaders });
  }, [dispatch]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const newController = new AbortController();
    dispatch({ type: "setController", payload: newController });

    let animation: number;

    (async () => {
      try {
        const { method = "POST" } = optionsRef.current;
        const { signal } = newController;

        const response = await fetch(url, {
          signal,
          method,
          body: method === "POST" && data ? JSON.stringify(data) : undefined,
          ...optionsRef?.current,
        });

        if (!response.ok || !response.body) {
          const errorText = `[${response.status}] ${response.statusText}`;

          if (response.body) {
            const error = await response.text();
            throw new Error(`${errorText}\n\n${error}`);
          } else {
            throw new Error(errorText);
          }
        }

        const stream = yieldStream(response.body, newController);
        animation = requestAnimationFrame(() => streamChunks(stream, throttle));
      } catch (error) {
        if (error instanceof Error) {
          const { name, message } = error;
          dispatch({ type: "setError", payload: { name, message } });
        } else {
          dispatch({ type: "setError", payload: { name: "Error", message: JSON.stringify(error) } });
        }
      }
    })();

    return () => {
      cancelAnimationFrame(animation);
      dispatch({ type: "cancel" });
      dispatch({ type: "reset" });
      dispatch({ type: "setError", payload: null });
    };
  }, [refreshCount, url, throttle, streamChunks, data, mounted]);

  return {
    buffer,
    done,
    error,
    headers,
    refresh: () => dispatch({ type: "refresh" }),
    cancel: () => dispatch({ type: "cancel" }),
  };
};
