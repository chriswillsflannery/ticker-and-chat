import LoadingBubble from "@/components/LoadingBubble";
import PromptSuggestionsRow from "@/components/PrompSuggestionsRow";
import Bubble from "@/components/Bubble";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../util/axios";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const Chat = () => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
	const { accessToken } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;
    setIsLoading(true);

    const newMessages: Message[] = [
      ...conversation,
      { role: "user", content: input },
    ];
    setConversation(newMessages);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
				body: JSON.stringify({ messages: newMessages, accessToken })
      });

			if (!response.ok || !response.body) {
        throw new Error("Failed to fetch response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

			setIsLoading(false) // nice to remove as soon as results start streaming in
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setConversation([
          ...newMessages,
          { role: "assistant", content: assistantMessage },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const noMessages = !conversation || conversation.length === 0;

	const handlePromptClick = async (promptText: string) => {
		const msg: Message = {
			role: "user",
			content: promptText,
		};
	
		const newMessages: Message[] = [...conversation, msg];
		setConversation(newMessages);

		setInput("");
	
		try {
			setIsLoading(true);
	
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ messages: newMessages, accessToken }),
			});
	
			if (!response.ok || !response.body) {
				throw new Error("Failed to fetch response");
			}
	
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let assistantMessage = "";
	
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
	
				const chunk = decoder.decode(value);
				assistantMessage += chunk;
	
				setConversation([
					...newMessages,
					{ role: "assistant", content: assistantMessage },
				]);
			}
		} catch (error) {
			console.error("Error in handlePromptClick:", error);
		} finally {
			setIsLoading(false);
		}
	};
	

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  return (
    <section>
      <div className="messages h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        <div className="flex flex-col items-center px-4 py-6">
          {noMessages ? (
            <PromptSuggestionsRow handlePrompt={handlePromptClick} />
          ) : (
            <div className="space-y-6 w-full max-w-4xl">
              {conversation.map((message, idx) => {
                return <Bubble key={`message-${idx}`} message={message} />;
              })}
              {isLoading && <LoadingBubble />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 bg-gray-900 p-6 border-t border-gray-800 backdrop-blur-lg bg-opacity-95"
      >
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            className="flex-1 p-4 bg-gray-800 text-gray-100 rounded-xl border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            onChange={(event) => {
              setInput(event.target.value);
            }}
            value={input}
            placeholder="Ask me something about ETFs..."
          />

          <input
            className="px-8 py-4 bg-indigo-600 text-gray-100 rounded-xl font-medium hover:bg-indigo-500 transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            type="submit"
            value="Send"
          />
        </div>
      </form>
    </section>
  );
};
