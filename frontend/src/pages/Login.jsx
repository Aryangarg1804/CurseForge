import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Terminal, Eye, EyeOff, Loader2, AlertCircle, Mail, Lock, BookOpen, Sparkles, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      toast.success("Welcome back!");

    } catch (err) {
      setError(err.message || "Login failed");
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[1100px] z-10"
      >
        <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-white/[0.06] bg-zinc-950 backdrop-blur-2xl shadow-2xl">
          {/* Left Panel - Branding & Features */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 relative overflow-hidden">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(6,182,212,0.05) 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
            
            <div className="relative z-10">
              <Link to="/" className="inline-flex items-center gap-2 mb-12 group">
                <div className="p-2 rounded-xl bg-cyan-400/10 border border-cyan-400/20 group-hover:bg-cyan-400/20 transition-colors">
                  <Terminal className="h-6 w-6 text-cyan-400" />
                </div>
                <span className="font-display text-2xl font-bold text-white">
                  CourseForge <span className="text-white/60">AI</span>
                </span>
              </Link>

              <h2 className="text-4xl font-display font-bold mb-4 leading-tight text-white">
                Welcome Back to
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AI-Powered Learning</span>
              </h2>
              <p className="text-white/60 text-lg mb-12">Access your courses and continue your learning journey</p>

              <div className="space-y-6">
                {[
                  { icon: Brain, title: "AI-Generated Courses", desc: "Create personalized courses instantly" },
                  { icon: BookOpen, title: "Smart Learning Paths", desc: "Adaptive content for your goals" },
                  { icon: Sparkles, title: "Interactive Content", desc: "Quizzes, assignments, and more" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="p-2.5 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                      <item.icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-white">{item.title}</h3>
                      <p className="text-sm text-white/60">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

           
          </div>

          {/* Right Panel - Form */}
          <div className="p-8 lg:p-12">
            {/* Logo for mobile */}
            <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <Terminal className="h-6 w-6 text-cyan-400" />
              <span className="font-display text-xl font-bold text-white">
                CourseForge <span className="text-white/60">AI</span>
              </span>
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2 text-white">Sign In</h1>
              <p className="text-white/60">Enter your credentials to access your account</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm text-destructive"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block text-white">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-white">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                  >
                    {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20 text-cyan-400 focus:ring-cyan-400/50 bg-white/5" />
                  <span className="text-sm text-white/60">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-cyan-400/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-white/60 mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
