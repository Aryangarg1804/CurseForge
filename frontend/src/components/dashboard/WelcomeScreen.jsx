import { Search, Sparkles, Terminal } from "lucide-react";
import { memo } from "react";
import Galaxy from "@/components/Galaxy";

// Memoize Galaxy to prevent re-renders on every keystroke
const MemoizedGalaxy = memo(Galaxy);

const topicSuggestions = [
  "Pointers in C", 
  "React Hooks", 
  "Python Basics", 
  "System Design", 
  "Data Structures", 
  "Machine Learning"
];

const WelcomeScreen = ({ createQuery, setCreateQuery, creating, onGenerate }) => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 overflow-hidden bg-black will-change-auto">
      {/* Galaxy Background */}
      <div className="absolute inset-0 z-0 bg-black will-change-transform">
        <MemoizedGalaxy 
          mouseRepulsion
          mouseInteraction
          density={2}
          glowIntensity={0.1}
          saturation={0.2}
          hueShift={120}
          twinkleIntensity={0.5}
          rotationSpeed={0.05}
          repulsionStrength={1}
          autoCenterRepulsion={0}
          starSpeed={0.1}
          speed={0.8}
        />
      </div>
      
      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-6 sm:mb-8">
          <Terminal className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-3 px-4" style={{ fontFamily: "'Sora', sans-serif" }}>
          What do you want to <span className="text-white/60">learn</span>?
        </h1>
        <p className="text-white/50 text-sm sm:text-base mb-8 sm:mb-10 px-4">
          Enter any topic and AI will generate a complete course for you
        </p>

        <div className="relative mb-6 sm:mb-8">
          <div className="relative border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm hover:border-white/20 focus-within:border-white/30 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 p-2 sm:p-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                <input 
                  type="text" 
                  value={createQuery} 
                  onChange={(e) => setCreateQuery(e.target.value)} 
                  placeholder="e.g., Pointers in C..." 
                  className="w-full pl-10 sm:pl-14 pr-3 py-3 sm:py-4 bg-transparent text-white placeholder:text-white/40 text-sm sm:text-base focus:outline-none rounded-lg sm:rounded-xl" 
                  onKeyDown={(e) => e.key === "Enter" && onGenerate()} 
                />
              </div>
              <button 
                onClick={onGenerate} 
                disabled={creating || !createQuery.trim()} 
                className="w-full sm:w-auto sm:absolute sm:right-2.5 bg-white text-black px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> 
                    <span className="sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> 
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {topicSuggestions.map((s, i) => (
            <button 
              key={i} 
              onClick={() => setCreateQuery(s)} 
              className="px-4 py-2 rounded-lg text-sm text-white/60 border border-white/10 bg-white/5 hover:border-white/20 hover:text-white hover:bg-white/10 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
