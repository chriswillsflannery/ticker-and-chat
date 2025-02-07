import { Code, Brain, LineChartIcon as ChartLine } from "lucide-react"
import { GradientText } from "@/components/ui/gradient-text"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900 text-foreground">
      <main className="container mx-auto px-4 py-16 max-w-[960px]">
        <section className="text-center my-24">
          <GradientText className="text-6xl font-bold mb-6 animate-fade-in">
            Superintelligent Investing
          </GradientText>
          <p className="text-xl mb-8 animate-fade-in-delay text-gray-300">
            Autonomous AI Agents for trusted equity analysis
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            {
              icon: <ChartLine className="w-8 h-8 mb-4 text-blue-400" />,
              title: "Storytelling Drives Capital Flow",
              description: "We believe in the power of narratives to shape investment decisions.",
            },
            {
              icon: <Code className="w-8 h-8 mb-4 text-purple-400" />,
              title: "Commoditized Development",
              description: "Software development has become streamlined through AI-powered tools.",
            },
            {
              icon: <Brain className="w-8 h-8 mb-4 text-pink-400" />,
              title: "First Principles Thinking",
              description: "True advantage lies in combining elements with proprietary data.",
            },
          ].map((tenet, index) => (
            <div 
              key={index} 
              className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl text-center animate-fade-in-delay-3 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:-translate-y-1 relative flex flex-col justify-center min-h-[200px]"
            >
              <div className="absolute top-4 left-4">
                {tenet.icon}
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-100">{tenet.title}</h3>
                <p className="text-gray-300">{tenet.description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="bg-gray-900/50 py-8 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 MorphyusAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

