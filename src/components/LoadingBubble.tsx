const LoadingBubble = () => {
  return (
    <div
      className="m-2 p-2 text-[15px] border-none text-foreground shadow-lg w-4/5 text-left animate-loading"
      style={{
        background: `
                    no-repeat radial-gradient(circle closest-side, hsl(var(--foreground)) 90%, #0000) 0% 50%,
                    no-repeat radial-gradient(circle closest-side, hsl(var(--foreground)) 90%, #0000) 50% 50%,
                    no-repeat radial-gradient(circle closest-side, hsl(var(--foreground)) 90%, #0000) 100% 50%
                `,
        backgroundSize: "calc(100%/3) 100%",
      }}
    />
  );
};

export default LoadingBubble;
