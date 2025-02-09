const LoadingBubble = () => {
  return (
    <div className="flex items-center justify-center gap-2 p-2 w-32 h-8 rounded-full bg-gray-900 text-gray-100 border-gray-700 shadow-lg">
      <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 rounded-full bg-white animate-bounce" />
    </div>
  );
};

export default LoadingBubble;
