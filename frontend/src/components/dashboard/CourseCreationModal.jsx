import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BookOpen, BarChart3, Clock, Target } from "lucide-react";

const CourseCreationModal = ({ isOpen, onClose, topic, onGenerate }) => {
  const [difficulty, setDifficulty] = useState("intermediate");
  const [modules, setModules] = useState(4);
  const [duration, setDuration] = useState("medium");
  const [focus, setFocus] = useState("balanced");

  const difficultyOptions = [
    { value: "beginner", label: "Beginner", description: "New to the topic" },
    { value: "intermediate", label: "Intermediate", description: "Some experience" },
    { value: "advanced", label: "Advanced", description: "Expert level" },
  ];

  const durationOptions = [
    { value: "short", label: "Quick", description: "1-2 hours", modules: 3 },
    { value: "medium", label: "Standard", description: "3-5 hours", modules: 4 },
    { value: "long", label: "Comprehensive", description: "6+ hours", modules: 6 },
  ];

  const focusOptions = [
    { value: "theory", label: "Theory", icon: BookOpen, description: "Concepts & understanding" },
    { value: "practical", label: "Practical", icon: Target, description: "Hands-on & examples" },
    { value: "balanced", label: "Balanced", icon: BarChart3, description: "Mix of both" },
  ];

  const handleGenerate = () => {
    onGenerate({
      topic,
      difficulty,
      modules,
      duration,
      focus,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
              Customize Your Course
            </h2>
            <p className="text-white/60 text-sm sm:text-base">
              Topic: <span className="text-cyan-400 font-medium">{topic}</span>
            </p>
          </div>

          {/* Options */}
          <div className="space-y-8">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-3">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDifficulty(option.value)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      difficulty === option.value
                        ? "border-cyan-400 bg-cyan-400/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className={`font-semibold mb-1 ${difficulty === option.value ? "text-cyan-400" : "text-white"}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-white/60">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Modules */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Course Duration</label>
              <div className="grid grid-cols-3 gap-3">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDuration(option.value);
                      setModules(option.modules);
                    }}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      duration === option.value
                        ? "border-cyan-400 bg-cyan-400/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className={`font-semibold ${duration === option.value ? "text-cyan-400" : "text-white"}`}>
                        {option.label}
                      </span>
                    </div>
                    <div className="text-xs text-white/60">{option.description}</div>
                    <div className="text-xs text-white/40 mt-1">{option.modules} modules</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Focus */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Learning Focus</label>
              <div className="grid grid-cols-3 gap-3">
                {focusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFocus(option.value)}
                    className={`p-4 rounded-xl border transition-all text-center ${
                      focus === option.value
                        ? "border-cyan-400 bg-cyan-400/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <option.icon className={`w-6 h-6 mx-auto mb-2 ${focus === option.value ? "text-cyan-400" : "text-white"}`} />
                    <div className={`font-semibold mb-1 ${focus === option.value ? "text-cyan-400" : "text-white"}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-white/60">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Course
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CourseCreationModal;
