import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Flame, Timer, ChevronRight, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

const TIMER_SECONDS = 30;

const QuizComponent = ({ questions, onComplete }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);

  const question = questions[currentQ];
  const isCorrect = selected === question?.correctAnswer;

  // Timer
  useEffect(() => {
    if (submitted || finished) return;
    if (timeLeft <= 0) {
      setSubmitted(true);
      setStreak(0);
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted, finished]);

  const handleSubmit = useCallback(() => {
    if (selected === null) return;
    setSubmitted(true);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = {
        selectedAnswer: selected,
        correctAnswer: question?.correctAnswer ?? 0,
        question: question?.question || "",
        explanation: question?.explanation || ""
      };
      return next;
    });
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else {
      setStreak(0);
    }
  }, [selected, isCorrect]);

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      const fullAnswers = [...answers];
      if (!fullAnswers[currentQ]) {
        fullAnswers[currentQ] = {
          selectedAnswer: selected ?? -1,
          correctAnswer: question?.correctAnswer ?? 0,
          question: question?.question || "",
          explanation: question?.explanation || ""
        };
      }
      const incorrectQuestions = fullAnswers
        .map((ans, idx) => {
          if (!ans) return null;
          const q = questions[idx];
          if (!q) return null;
          if (ans.selectedAnswer === ans.correctAnswer) return null;
          return {
            question: ans.question,
            correctAnswer: ans.correctAnswer,
            selectedAnswer: ans.selectedAnswer,
            explanation: ans.explanation
          };
        })
        .filter(Boolean);
      const finalScore = fullAnswers.reduce((acc, ans) => {
        if (!ans) return acc;
        return acc + (ans.selectedAnswer === ans.correctAnswer ? 1 : 0);
      }, 0);
      if (onComplete) {
        onComplete({
          score: finalScore,
          total: questions.length,
          incorrectQuestions
        });
      }
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      return;
    }
    setCurrentQ((c) => c + 1);
    setSelected(null);
    setSubmitted(false);
    setTimeLeft(TIMER_SECONDS);
  };

  if (finished) {
    const weakPoints = answers
      .filter((ans) => ans && ans.selectedAnswer !== ans.correctAnswer)
      .map((ans) => ({
        question: ans.question,
        explanation: ans.explanation
      }));
    const finalScore = answers.reduce((acc, ans) => {
      if (!ans) return acc;
      return acc + (ans.selectedAnswer === ans.correctAnswer ? 1 : 0);
    }, 0);

    return (
      <motion.div
        className="flex flex-col items-center justify-center py-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Trophy className="w-16 h-16 text-accent mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h2>
        <p className="text-xl text-muted-foreground mb-6">
          You scored{" "}
          <span className="text-primary font-bold">{finalScore}</span> /{" "}
          {questions.length}
        </p>
        {maxStreak >= 2 && (
          <div className="flex items-center gap-2 text-accent mb-4">
            <Flame className="w-5 h-5" />
            <span className="font-semibold">Best streak: {maxStreak} in a row!</span>
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          {finalScore === questions.length
            ? "🎉 Perfect score! Amazing!"
            : finalScore >= questions.length / 2
            ? "👍 Good job! Keep learning!"
            : "📚 Keep practicing, you'll get there!"}
        </div>
        {weakPoints.length > 0 && (
          <div className="mt-8 w-full max-w-xl">
            <h3 className="text-lg font-semibold text-foreground mb-3">Weak Points</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              {weakPoints.map((wp, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border/60 bg-muted/20">
                  <div className="font-semibold text-foreground">{wp.question}</div>
                  <div>{wp.explanation}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft <= 5 ? "bg-destructive" : timeLeft <= 10 ? "bg-accent" : "bg-primary";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted-foreground">
          Question {currentQ + 1} of {questions.length}
        </div>
        <div className="flex items-center gap-4">
          {streak >= 2 && (
            <motion.div
              className="flex items-center gap-1 text-accent text-sm font-semibold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={streak}
            >
              <Flame className="w-4 h-4" />
              {streak} streak!
            </motion.div>
          )}
          <div className="text-sm font-semibold text-foreground">
            Score: {score}/{questions.length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full mb-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQ + (submitted ? 1 : 0)) / questions.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Timer */}
      <div className="h-1 bg-muted rounded-full mb-8 overflow-hidden">
        <motion.div
          className={`h-full ${timerColor} rounded-full transition-colors`}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
        <Timer className="w-4 h-4" />
        <span className={timeLeft <= 5 ? "text-destructive font-bold" : ""}>
          {timeLeft}s
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="text-xl font-semibold text-foreground mb-6">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              let classes = "glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all border ";
              
              if (submitted) {
                if (i === question.correctAnswer) {
                  classes += "border-success bg-success/10";
                } else if (i === selected && !isCorrect) {
                  classes += "border-destructive bg-destructive/10";
                } else {
                  classes += "border-transparent opacity-50";
                }
              } else if (i === selected) {
                classes += "border-primary bg-primary/10";
              } else {
                classes += "border-transparent hover:border-primary/30 hover:bg-primary/5";
              }

              return (
                <motion.button
                  key={i}
                  className={classes}
                  onClick={() => !submitted && setSelected(i)}
                  whileHover={!submitted ? { scale: 1.01 } : {}}
                  whileTap={!submitted ? { scale: 0.99 } : {}}
                  disabled={submitted}
                >
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold text-foreground shrink-0">
                    {letter}
                  </span>
                  <span className="text-foreground text-left">{opt}</span>
                  {submitted && i === question.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-success ml-auto" />
                  )}
                  {submitted && i === selected && !isCorrect && i !== question.correctAnswer && (
                    <XCircle className="w-5 h-5 text-destructive ml-auto" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Explanation: </span>
                  {question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="mt-6 flex justify-end">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selected === null}
                className="glow-button px-6 py-3 rounded-xl text-sm font-medium text-primary-foreground disabled:opacity-50 disabled:pointer-events-none"
              >
                Submit Answer
              </button>
            ) : (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleNext}
                className="glow-button px-6 py-3 rounded-xl text-sm font-medium text-primary-foreground flex items-center gap-2"
              >
                {currentQ + 1 >= questions.length ? "See Results" : "Next Question"}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizComponent;
