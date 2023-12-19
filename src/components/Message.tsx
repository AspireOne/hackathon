import { twMerge } from "tailwind-merge";
import { CgDanger, CgSmile, CgSmileNeutral } from "react-icons/cg";
import { FaRegFaceAngry } from "react-icons/fa6";
import { Sentiment } from "./Chat.tsx";

export interface ChatMessage {
  id: string; // Now required as it will be assigned by the server
  sender: string;
  message: string;
  timestamp: string; // Use string to be consistent and allow Date conversion as needed
  sentiment?: Sentiment; // Include the sentiment as optional
}

export const Message = (props: { msg: ChatMessage }) => {
  return (
    <div
      className={twMerge(
        "message-item rounded m-5 p-3 bg-gray-200 border-[5px]",
        props.msg.sentiment && getBorderCss(props.msg.sentiment),
      )}
    >
      <div className={"flex flex-row gap-3 items-center"}>
        <p className={"font-semibold text-blue-500"}>{props.msg.sender}</p>
        <p>({new Date(props.msg.timestamp).toLocaleTimeString()})</p>
        {props.msg.sentiment && (
          <div className={"ml-auto"}>
            {getSentimentIcon(props.msg.sentiment)}
          </div>
        )}
      </div>
      {/* Use the highlightUsernames function to render the message with highlighted usernames */}
      <p>{highlightUsernames(props.msg.message)}</p>
    </div>
  );
}

const getBorderCss = (sentiment?: Sentiment) => {
  switch (sentiment) {
    case "positive":
      return "border-l-green-500";
    case "negative":
      return "border-l-gray-700";
    case "profane":
      return "border-l-red-500";
    case "neutral":
      return "border-l-gray-200";
    default:
      throw new Error("Invalid sentiment");
  }
};

const getSentimentIcon = (sentiment?: Sentiment) => {
  switch (sentiment) {
    case "positive":
      return <CgSmile className={"text-green-500"} size={27} />;
    case "negative":
      return <CgDanger className={"text-gray-700"} size={27} />;
    case "profane":
      return <FaRegFaceAngry className={"text-red-500"} size={23} />;
    case "neutral":
      return <CgSmileNeutral className={"text-gray-500"} size={27} />;
    default:
      throw new Error(`Invalid sentiment ${sentiment}`);
  }
};

const highlightUsernames = (text: string) => {
  // Split the text by the pattern and include the pattern in the result
  const parts = text.split(/(@\w+)/);
  return parts.map((part, index) => {
    // Check if the part matches the pattern
    if (part.startsWith('@')) {
      // Wrap the matched text in a span with a specific style
      return (
        <span key={index} className="text-blue-500">
          {part}
        </span>
      );
    }
    return part; // Return the non-matching text as is
  });
}