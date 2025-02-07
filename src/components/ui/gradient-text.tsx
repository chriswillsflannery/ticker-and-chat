import { cn } from "@/lib/utils"

interface GradientTextProps {
  children: React.ReactNode
  className?: string
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span className={cn(
      "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400",
      className
    )}>
      {children}
    </span>
  )
} 