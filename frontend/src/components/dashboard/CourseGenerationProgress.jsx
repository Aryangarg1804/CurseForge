import { motion } from "framer-motion";
import { Sparkles, BookOpen, CheckCircle2 } from "lucide-react";

const CourseGenerationProgress = ({ stage, progress }) => {
  const stages = [
    { id: "analyzing", label: "Analyzing topic", icon: Sparkles },
    { id: "generating", label: "Generating modules", icon: BookOpen },
    { id: "complete", label: "Course ready!", icon: CheckCircle2 },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" />

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-8"
      >
        {/* Animated Icon */}
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border-4 border-cyan-400/20 border-t-cyan-400"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">Generating your course...</span>
            <span className="text-sm font-mono text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
            />
          </div>
        </div>

        {/* Stages */}
        <div className="space-y-3">
          {stages.map((s, index) => {
            const isComplete = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const Icon = s.icon;

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCurrent
                    ? "bg-cyan-400/10 border border-cyan-400/30"
                    : isComplete
                    ? "bg-white/5 border border-white/10"
                    : "bg-transparent border border-transparent"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isComplete
                      ? "bg-cyan-400/20 text-cyan-400"
                      : isCurrent
                      ? "bg-cyan-400 text-black animate-pulse"
                      : "bg-white/5 text-white/40"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    isComplete || isCurrent ? "text-white" : "text-white/40"
                  }`}
                >
                  {s.label}
                </span>
                {isComplete && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 ml-auto" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tip */}
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-xs text-white/60 text-center">
            💡 Tip: We're using AI to create personalized content tailored to your learning needs
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseGenerationProgress;
