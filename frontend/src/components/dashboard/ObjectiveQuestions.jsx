import { CheckCircle2, XCircle, Trophy, ChevronRight } from "lucide-react";

const ObjectiveQuestions = ({ 
  questions, 
  currentIndex, 
  setCurrentIndex, 
  selected, 
  setSelected, 
  submitted, 
  setSubmitted, 
  score, 
  setScore 
}) => {
  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setCurrentIndex(c => c + 1);
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
          Subjective Questions
        </h2>
        <span className="text-xs sm:text-sm text-muted-foreground font-mono">
          Score: <span className="text-primary">{score}/{questions.length}</span>
        </span>
      </div>

      <div className="border border-border/30 rounded-xl sm:rounded-2xl bg-card/30 backdrop-blur-sm p-4 sm:p-6 mb-4">
        <div className="text-xs text-muted-foreground font-mono mb-3">
          Question {currentIndex + 1} of {questions.length}
        </div>
        
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">
          {currentQuestion.question}
        </h3>
        
        <div className="space-y-2 sm:space-y-3">
          {currentQuestion.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            let cls = "w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border transition-all text-left ";
            
            if (submitted) {
              if (i === currentQuestion.correctAnswer) {
                cls += "border-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)]";
              } else if (i === selected) {
                cls += "border-destructive bg-destructive/10";
              } else {
                cls += "border-border/20 opacity-40";
              }
            } else if (i === selected) {
              cls += "border-primary bg-primary/10";
            } else {
              cls += "border-border/30 hover:border-primary/30 hover:bg-primary/5";
            }
            
            return (
              <button 
                key={i} 
                className={cls} 
                onClick={() => !submitted && setSelected(i)}
              >
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center text-xs sm:text-sm font-bold font-mono shrink-0">
                  {letter}
                </span>
                <span className="text-foreground text-sm sm:text-base">{opt}</span>
                {submitted && i === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--success))] ml-auto" />
                )}
                {submitted && i === selected && i !== currentQuestion.correctAnswer && (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive ml-auto" />
                )}
              </button>
            );
          })}
        </div>
        
        {submitted && (
          <div className="mt-4 p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/20">
            <p className="text-xs sm:text-sm text-muted-foreground">
              <strong className="text-foreground">Explanation:</strong> {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        {!submitted ? (
          <button 
            onClick={handleSubmit} 
            disabled={selected === null} 
            className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            Submit Answer
          </button>
        ) : currentIndex + 1 < questions.length ? (
          <button 
            onClick={handleNext} 
            className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-sm text-primary font-semibold flex items-center justify-center sm:justify-start gap-2">
            <Trophy className="w-4 h-4" /> Done! {score}/{questions.length}
          </div>
        )}
      </div>
    </>
  );
};

export default ObjectiveQuestions;
