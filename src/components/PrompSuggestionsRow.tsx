import PromptSuggestionButton from "./PromptSuggestionButton";

interface PromptSuggestionsRowProps {
  handlePrompt: (prompt: string) => void;
}

const PromptSuggestionsRow: React.FC<PromptSuggestionsRowProps> = ({
  handlePrompt,
}) => {
  const prompts = [
    "Provide me a summary of AAPL.",
    "Provide me a summary of AMZN and MSFT.",
  ];

  return (
    <div className="w-[80%] max-w-4xl mx-auto py-12">
      <h2 className="text-gray-400 text-sm font-medium mb-4 px-4">Suggested questions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
        {prompts.map((prompt, index) => (
          <PromptSuggestionButton
            key={`suggestion-${index}`}
            text={prompt}
            onClick={() => handlePrompt(prompt)}
          />
        ))}
      </div>
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Or type your own question below
        </p>
      </div>
    </div>
  );
};

export default PromptSuggestionsRow;