import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, BookOpen, Trophy, Terminal, Cpu, Code2, Brain, Star, Play, GraduationCap, Users, Building2, Rocket, CheckCircle2, Shield, Globe } from "lucide-react";
import Galaxy from "@/components/Galaxy";

const floatingTopics = [
  { text: "React Hooks", x: "8%", y: "22%", delay: 0 },
  { text: "Python Basics", x: "78%", y: "12%", delay: 1 },
  { text: "System Design", x: "88%", y: "52%", delay: 2 },
  { text: "Data Structures", x: "3%", y: "62%", delay: 1.5 },
  { text: "Machine Learning", x: "65%", y: "78%", delay: 0.5 },
  { text: "TypeScript", x: "20%", y: "80%", delay: 0.8 },
];

const features = [
  { icon: Sparkles, title: "AI-Powered Generation", description: "Generate complete courses with lessons, quizzes, and assignments powered by advanced AI models" },
  { icon: Zap, title: "Interactive Quizzes", description: "Duolingo-style quizzes with streaks, timers, and instant feedback to boost retention" },
  { icon: BookOpen, title: "Rich Content", description: "Comprehensive lessons, syntax-highlighted code examples, and hands-on coding assignments" },
  { icon: Trophy, title: "Certificates", description: "Earn verifiable certificates on completion and share your achievements on LinkedIn" },
];

const stats = [
  { value: "10K+", label: "Courses Generated" },
  { value: "50K+", label: "Active Learners" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "500+", label: "Topics Covered" },
];

const howItWorks = [
  { step: "01", title: "Choose a Topic", description: "Enter any subject you want to learn — from programming to design to business", icon: Brain },
  { step: "02", title: "AI Generates Course", description: "Our AI creates a structured curriculum with comprehensive lessons, quizzes, and assignments", icon: Cpu },
  { step: "03", title: "Learn & Practice", description: "Go through interactive lessons, take quizzes, and complete coding challenges", icon: Code2 },
  { step: "04", title: "Get Certified", description: "Complete the course and earn a verifiable certificate to showcase your skills", icon: GraduationCap },
];

const testimonials = [
  { name: "Sarah Chen", role: "Frontend Developer", quote: "Generated a complete React course in seconds. The quizzes were incredibly well-structured.", avatar: "SC" },
  { name: "Marcus Johnson", role: "CS Student", quote: "This platform helped me understand data structures better than any textbook. The interactive assignments are amazing.", avatar: "MJ" },
  { name: "Priya Patel", role: "Product Manager", quote: "Used it to learn SQL and Python basics. The AI-generated content is surprisingly high quality.", avatar: "PP" },
];

const useCases = [
  { 
    icon: Users, 
    title: "Individual Learners", 
    description: "Master new skills at your own pace with personalized AI-generated courses",
    features: ["Unlimited course generation", "Progress tracking", "Certificates"]
  },
  { 
    icon: Building2, 
    title: "Teams & Organizations", 
    description: "Upskill your entire team with custom learning paths and analytics",
    features: ["Team management", "Custom content", "Usage analytics"]
  },
  { 
    icon: GraduationCap, 
    title: "Educational Institutions", 
    description: "Supplement curriculum with AI-powered course materials and assessments",
    features: ["Student management", "Bulk licensing", "LMS integration"]
  },
];

const trustedBy = [
  { name: "TechCorp", employees: "500+ employees" },
  { name: "StartupHub", employees: "2K+ students" },
  { name: "CodeAcademy", employees: "10K+ learners" },
  { name: "InnovateLab", employees: "1K+ professionals" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dot grid background */}
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        
        {/* Subtle gradient glow */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, hsla(185, 80%, 50%, 0.08) 0%, transparent 50%)`
        }} />

        {/* Floating tags */}
        {floatingTopics.map((topic, i) => (
          <motion.div
            key={i}
            className="absolute hidden lg:flex items-center gap-2 backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] px-4 py-2 rounded-full text-xs text-white/50 pointer-events-none"
            style={{ left: topic.x, top: topic.y }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.5, y: 0 }}
            transition={{ delay: topic.delay + 0.8, duration: 1.2 }}
          >
            <span className="text-cyan-400/70">{"›"}</span>
            {topic.text}
          </motion.div>
        ))}

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs mb-8 backdrop-blur-sm bg-white/[0.03] border border-white/[0.08]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="tracking-wider text-xs text-white/70">AI-POWERED LEARNING PLATFORM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-pulse" />
            </motion.div>

            {/* Heading */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-bold tracking-tight mb-8 leading-[0.9]" style={{ fontFamily: "'Sora', sans-serif" }}>
              <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">Learn anything,</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">lightning fast</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-14 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Generate complete courses on any topic in seconds.
            <br className="hidden sm:block" />
            AI-powered lessons, quizzes, and hands-on projects.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 rounded-xl text-base font-semibold inline-flex items-center gap-2.5 bg-white text-black hover:bg-white/90 transition-all group shadow-lg shadow-white/5"
            >
              Start Forging
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-xl text-base font-medium text-white/80 hover:text-white backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all inline-flex items-center gap-2.5 group"
            >
              <Play className="w-5 h-5" />
              View Demo
            </button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            className="mt-24 mx-auto max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            <div className="flex flex-wrap justify-center gap-12 sm:gap-20">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-5xl font-bold text-white mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/40 tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
              AI-Powered Course Creation
            </h2>
            <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
              Generate comprehensive courses with AI. Get interactive lessons, quizzes, and coding challenges — all in one intelligent platform.
            </p>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            className="relative rounded-2xl p-2 overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-yellow-500/5" />
            <div className="relative aspect-video rounded-xl  overflow-hidden">
              <img 
                src="/ForgeAI.png" 
                alt="CourseForge AI Dashboard Preview" 
                className="w-full h-full object-cover object-top"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-white/40 text-sm mb-8 tracking-wider uppercase">Trusted by teams worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-16">
              {trustedBy.map((company, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-white/70 font-semibold text-lg mb-1">{company.name}</div>
                  <div className="text-white/30 text-xs">{company.employees}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <span className="text-cyan-400/70 font-medium text-xs tracking-widest mb-4 block uppercase">Built for everyone</span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              Perfect for any use case
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, i) => (
              <motion.div
                key={i}
                className="relative group p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                  <useCase.icon className="w-7 h-7 text-cyan-400/80" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{useCase.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-2 text-white/40 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400/60" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <span className="text-cyan-400/70 font-medium text-xs tracking-widest mb-4 block uppercase">How it works</span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              Four simple steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div 
                key={i} 
                className="relative group" 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="relative z-10 p-8 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500">
                  <div className="text-white/10 font-bold text-6xl mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>{item.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                    <item.icon className="w-6 h-6 text-cyan-400/80" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <span className="text-yellow-400/70 font-medium text-xs tracking-widest mb-4 block uppercase">Features</span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
              Everything you need
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">Next-generation learning tools powered by AI</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                className="rounded-xl p-8 border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500 cursor-default group" 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-yellow-400/80" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-cyan-400/70 font-medium text-xs tracking-widest mb-4 block uppercase">Why CourseForge AI</span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              Built different
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              className="group p-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-cyan-400/20 transition-all duration-500"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6 text-cyan-400/80" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Lightning Fast</h3>
              <p className="text-white/50 leading-relaxed">Generate complete courses in seconds, not days. Our AI understands context and creates structured, comprehensive content instantly.</p>
            </motion.div>

            <motion.div
              className="group p-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-cyan-400/20 transition-all duration-500"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-yellow-400/80" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Quality Guaranteed</h3>
              <p className="text-white/50 leading-relaxed">Every course is carefully structured with lessons, quizzes, and practical assignments. No generic content—just quality learning.</p>
            </motion.div>

            <motion.div
              className="group p-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-yellow-400/20 transition-all duration-500"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-cyan-400/80" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Adaptive Learning</h3>
              <p className="text-white/50 leading-relaxed">Content adapts to your skill level. Start from basics or dive deep—the AI adjusts complexity based on your progress.</p>
            </motion.div>

            <motion.div
              className="group p-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-yellow-400/20 transition-all duration-500"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-yellow-400/80" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Learn Anything</h3>
              <p className="text-white/50 leading-relaxed">From programming to design, business to languages—if you can think it, we can create a course for it. No limits.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div className="text-center mb-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <span className="text-yellow-400/70 font-medium text-xs tracking-widest mb-4 block uppercase">Testimonials</span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              Loved by learners
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i} 
                className="rounded-xl p-8 border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-500" 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400/80 fill-yellow-400/80" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-8">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white/70 font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/40">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Highlight / Value Props */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-cyan-400/70 font-medium text-xs tracking-widest mb-4 block uppercase">Simple Pricing</span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
              Start free, scale later
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Try CourseForge AI with no credit card required. Upgrade when you're ready.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>$0</span>
                <span className="text-white/40 text-sm ml-2">/month</span>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2 text-white/60 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400/60 mt-0.5 flex-shrink-0" />
                  <span>3 courses per month</span>
                </div>
                <div className="flex items-start gap-2 text-white/60 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400/60 mt-0.5 flex-shrink-0" />
                  <span>Basic quizzes</span>
                </div>
                <div className="flex items-start gap-2 text-white/60 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400/60 mt-0.5 flex-shrink-0" />
                  <span>Community support</span>
                </div>
              </div>
              <button 
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15] text-white transition-all text-sm font-medium"
              >
                Get Started
              </button>
            </motion.div>

            {/* Pro Plan - Highlighted */}
            <motion.div
              className="p-8 rounded-2xl border-2 border-cyan-400/30 bg-gradient-to-b from-cyan-500/[0.08] to-blue-500/[0.04] backdrop-blur-sm relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-medium">
                Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>$19</span>
                <span className="text-white/40 text-sm ml-2">/month</span>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2 text-white/80 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Unlimited courses</span>
                </div>
                <div className="flex items-start gap-2 text-white/80 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Advanced quizzes & assignments</span>
                </div>
                <div className="flex items-start gap-2 text-white/80 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-start gap-2 text-white/80 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Verified certificates</span>
                </div>
              </div>
              <button 
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-xl bg-white text-black hover:bg-white/90 transition-all text-sm font-semibold"
              >
                Start Forging
              </button>
            </motion.div>

            {/* Teams Plan */}
            <motion.div
              className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-white mb-2">Teams</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>$49</span>
                <span className="text-white/40 text-sm ml-2">/month</span>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2 text-white/60 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400/60 mt-0.5 flex-shrink-0" />
                  <span>Everything in Pro</span>
                </div>
                <div className="flex items-start gap-2 text-white/60 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400/60 mt-0.5 flex-shrink-0" />
                  <span>Up to 10 team members</span>
                </div>
                <div className="flex items-start gap-2 text-white/60 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400/60 mt-0.5 flex-shrink-0" />
                  <span>Team analytics</span>
                </div>
                <div className="flex items-start gap-2 text-white/60 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400/60 mt-0.5 flex-shrink-0" />
                  <span>Custom integrations</span>
                </div>
              </div>
              <button 
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15] text-white transition-all text-sm font-medium"
              >
                Contact Sales
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cyan-500/5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-8 leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              Ready to start?
            </h2>
            <p className="text-white/50 text-lg mb-12 max-w-2xl mx-auto">
              Join thousands of learners mastering new skills with AI.
            </p>
            <button 
              onClick={() => navigate("/signup")} 
              className="bg-white text-black hover:bg-white/90 px-10 py-5 rounded-xl text-lg font-semibold inline-flex items-center gap-3 group transition-all shadow-lg shadow-white/5"
            >
              Start Forging Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-orange-950/20" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-orange-900/10 via-yellow-900/5 to-transparent" />
        
        {/* Dot Grid */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        
        <div className="relative z-10 py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="w-6 h-6 text-white" />
                  <span className="font-bold text-white text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>CourseForge AI</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                  Next-generation learning platform powered by AI. Create, learn, and master any skill.
                </p>
              </div>
              
              {/* Links */}
              <div>
                <h3 className="text-white/90 font-semibold text-sm mb-4">Product</h3>
                <div className="flex flex-col gap-3">
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Features</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Pricing</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Documentation</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">API</a>
                </div>
              </div>
              
              <div>
                <h3 className="text-white/90 font-semibold text-sm mb-4">Company</h3>
                <div className="flex flex-col gap-3">
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">About</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Blog</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Careers</a>
                  <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Contact</a>
                </div>
              </div>
            </div>
            
            {/* Bottom Section */}
            <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/30">© 2026 CourseForge AI. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-xs text-white/30 hover:text-white/50 transition-colors">Privacy</a>
                <a href="#" className="text-xs text-white/30 hover:text-white/50 transition-colors">Terms</a>
                <a href="#" className="text-xs text-white/30 hover:text-white/50 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
