import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Share2, ArrowRight, Trophy, Clock, Target, BookCheck } from "lucide-react";
import confetti from "canvas-confetti";

const CourseComplete = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#00ff88', '#00ffcc', '#00ff55'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#00ff88', '#00ffcc', '#00ff55'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <div className="min-h-screen pt-24 px-4 flex items-center justify-center particle-bg cyber-grid">
      <motion.div
        className="max-w-xl w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center"
          style={{ boxShadow: "0 0 40px hsla(150, 100%, 50%, 0.3)" }}
        >
          <Trophy className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
          Course <span className="neon-text">Complete!</span> 🎉
        </h1>
        <p className="text-muted-foreground mb-8">
          Congratulations on completing <span className="text-primary font-medium">Pointers in C Programming</span>
        </p>

        {/* Certificate Preview */}
        <div className="glass-card-strong rounded-2xl p-8 mb-8 gradient-border">
          <div className="border border-dashed border-primary/30 rounded-xl p-6">
            <p className="text-xs text-primary/60 uppercase tracking-widest mb-2 font-mono">Certificate of Completion</p>
            <h2 className="text-2xl font-bold neon-text mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>Pointers in C Programming</h2>
            <p className="text-sm text-muted-foreground">Awarded to <span className="text-foreground">Alex Johnson</span></p>
            <p className="text-xs text-muted-foreground mt-3 font-mono">February 23, 2026</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Clock, label: "Time Spent", value: "2h 45m" },
            { icon: Target, label: "Quiz Score", value: "92%" },
            { icon: BookCheck, label: "Lessons", value: "4/4" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="glass-card-strong rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-primary font-mono">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="glow-button px-6 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Certificate
          </button>
          <button className="px-6 py-3 rounded-xl glass-card-strong text-foreground text-sm font-medium flex items-center justify-center gap-2 hover:border-primary/30 transition-all">
            <Share2 className="w-4 h-4" />
            Share on LinkedIn
          </button>
        </div>

        <button
          onClick={() => navigate("/create")}
          className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group font-mono"
        >
          Generate Another Course
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};

export default CourseComplete;
