import { FileCode } from "lucide-react";

const CodeChallenges = ({ questions }) => {
  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
        Code Challenges
      </h2>
      
      <div className="space-y-4 sm:space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="border border-border/30 rounded-xl sm:rounded-2xl bg-card/30 backdrop-blur-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border/20">
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                {q.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {q.description}
              </p>
              <div className="text-xs text-muted-foreground mt-2 font-mono">
                Expected: <span className="text-primary">{q.expectedOutput}</span>
              </div>
            </div>
            
            <div className="flex items-center px-3 sm:px-4 py-2 border-b border-border/10 bg-muted/10">
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                <FileCode className="w-3 h-3" /> main.c
              </span>
            </div>
            
            <pre className="p-3 sm:p-4 text-xs sm:text-sm font-mono text-foreground overflow-x-auto leading-5 sm:leading-6 min-h-[120px]">
              {q.starterCode}
            </pre>
          </div>
        ))}
      </div>
    </>
  );
};

export default CodeChallenges;
