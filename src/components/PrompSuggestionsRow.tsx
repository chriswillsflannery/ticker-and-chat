import PromptSuggestionButton from "./PromptSuggestionButton";

interface PromptSuggestionsRowProps {
  handlePrompt: (prompt: string) => void;
}

const PromptSuggestionsRow: React.FC<PromptSuggestionsRowProps> = ({
  handlePrompt,
}) => {
  const prompts = [
    "What is the current NAV of the S&P 500 ETF?",
    "How many stocks are in the Vanguard S&P 500 ETF?",
    "What is the expense ratio of the S&P 500 ETF?",
    "What is the gross expense ratio of the SPDR ETF?",
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
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