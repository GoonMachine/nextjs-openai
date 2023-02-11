import { FC } from "react";

const FADE_IN_CSS =
`@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.fadeIn {
  animation: fadeIn 250ms cubic-bezier(0.55, 0.79, 0, 1.07);
}`;

export interface TextBufferView extends JSX.IntrinsicAttributes {
  buffer: string[];
  as?: keyof JSX.IntrinsicElements;
}

/**
 * View an updating buffer of text as a DOM node where the final chunk of text
 * is faded in.
 */
export const TextBufferView: FC<TextBufferView> = ({
  buffer,
  as: ElementType = "p",
  ...props
}) => {
  /**
   * The last token is the final token or an empty string.
   */
  const lastChunk = buffer[buffer.length - 1] || "";
  /**
   * The leading chunks are all but the last chunk, joined together, or a soft
   * hyphen to ensure there is text to fill the container.
   */
  const leadingChunks = buffer.slice(0, buffer.length - 1).join("") || "&shy;";
  /**
   * Over five different approaches with useEffect() were tried, but none of
   * them worked reliably. We must RETVRN to native APIs.
   */
  return (
    <>
      <style>{FADE_IN_CSS}</style>
      <ElementType
        dangerouslySetInnerHTML={{
          __html: `${leadingChunks}<span class="fadeIn">${lastChunk}</span>`
        }}
        {...props}
      />
    </>
  );
};