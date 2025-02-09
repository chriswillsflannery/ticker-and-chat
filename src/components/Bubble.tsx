import { FC } from "react";

type BubbleProps = {
  message: {
    content: string;
    role: "user" | "assistant" | "system" | "data";
  };
};

const Bubble: FC<BubbleProps> = ({ message }) => {
  const { content, role } = message;
  return (
    <div
      className={`
                m-2 p-2 
                text-[15px] 
                text-foreground 
                shadow-lg 
                w-4/5 
                text-left
                ${
                  role === "user"
                    ? "rounded-[20px_20px_0_20px] bg-secondary ml-auto"
                    : "rounded-[20px_20px_20px_0] bg-accent"
                }
            `}
    >
      {content}
    </div>
  );
};

export default Bubble;