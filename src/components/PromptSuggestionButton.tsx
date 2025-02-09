import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface PromptSuggestionButtonProps {
  text: string;
  onClick: () => void;
}

const PromptSuggestionButton: React.FC<PromptSuggestionButtonProps> = ({
  text,
  onClick,
}) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="w-full p-4 text-left justify-between bg-gray-900 hover:bg-gray-800 
                 border-gray-800 hover:border-gray-700
                 shadow-sm hover:shadow-lg transition-all duration-200
                 text-sm text-gray-300 hover:text-gray-200 group"
    >
      <span className="line-clamp-2">{text}</span>
      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0 ml-2" />
    </Button>
  );
};

export default PromptSuggestionButton;
