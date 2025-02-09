import { FC } from "react";

type BubbleProps = {
  message: {
    content: string;
    role: "user" | "assistant" | "system" | "data";
  };
};

const Bubble: FC<BubbleProps> = ({ message }) => {
  const { content, role } = message;
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          p-4 
          text-[15px] 
          min-w-[80%]
          max-w-[80%]
          shadow-lg 
          border
          transition-colors
          ${
            isUser
              ? "rounded-[20px_20px_0_20px] bg-indigo-700 text-white border-indigo-500 ml-8"
              : "rounded-[20px_20px_20px_0] bg-gray-900 text-gray-100 border-gray-700 mr-8"
          }
        `}
      >
        {content}
      </div>
    </div>
  );
};

export default Bubble;