import { FC } from "react";
import { useTextStream } from "../../hooks";
import { TextBufferView } from "../TextBufferView";

export interface TextStreamViewProps extends JSX.IntrinsicAttributes {
  url: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Stream the given `url` and display the text as a `TextBufferView`.
 */
export const TextStreamView: FC<TextStreamViewProps> = ({
  as,
  url,
  ...props
}) => {
  const { buffer } = useTextStream(url);
  return (
    <TextBufferView as={as} buffer={buffer} {...props} />
  );
};