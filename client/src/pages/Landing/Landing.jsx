import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  FileText,
  Lock,
  Mic,
  Lightbulb,
  Shield,
  Zap,
  Globe,
  Cpu,
  Layers
} from "lucide-react";

const sectionMotion = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.45, ease: "easeOut" },
};

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const features = [
    {
      Icon: Briefcase,
      title: "Role-focused question sets",
      description:
        "Configure practice for frontend, backend, full-stack, data, HR, and role-specific difficulty levels.",
    },
    {
      Icon: Mic,
      title: "Typed or voice answers",
      description:
        "Respond naturally with the microphone or type detailed answers while the session keeps progress in sync.",
    },
    {
      Icon: TrendingUp,
      title: "Structured scorecards",
      description:
        "Review correctness, relevance, technical accuracy, communication, and completeness after each round.",
    },
    {
      Icon: FileText,
      title: "Resume-aware feedback",
      description:
        "Use optional resume context to compare target-role keywords and expose gaps before real interviews.",
    },
    {
      Icon: Lightbulb,
      title: "Actionable coaching",
      description:
        "See what landed, what missed, and how to rewrite answers with sharper examples and tradeoffs.",
    },
    {
      Icon: Lock,
      title: "Private history",
      description:
        "Save completed sessions to your account so improvement, reports, and certificates stay accessible.",
    },
  ];

  const steps = [
    ["Choose context", "Pick a role, difficulty, and optional resume input."],
    ["Answer every prompt", "Move forward only after each question has a real answer."],
    ["Submit for evaluation", "Generate a detailed scorecard and question-level feedback."],
    ["Review your history", "Revisit saved sessions and track what to improve next."],
  ];

  const benefits = [
    "Practice the exact skill of explaining your work clearly under interview pressure.",
    "Turn vague feedback into concrete next actions for projects, resume keywords, and answer structure.",
    "Keep preparation organized across sessions instead of scattering notes across docs and chats.",
  ];

  const faqs = [
    {
      question: "Do I need to upload a resume?",
      answer:
        "No. Resume context is optional. You can run a general mock interview or add resume text when you want role-keyword feedback.",
    },
    {
      question: "Can I use voice answers?",
      answer:
        "Yes, supported browsers can capture speech through the Web Speech API. You can also edit the transcript before moving on.",
    },
    {
      question: "What prevents skipped answers?",
      answer:
        "Each interview question requires a non-empty answer before the Next or Finish action becomes available.",
    },
    {
      question: "Where are results stored?",
      answer:
        "Completed evaluations are saved to your authenticated history so you can review previous answers and feedback.",
    },
  ];

  const techStack = [
    { name: "React", icon: Globe, color: "#61DAFB", desc: "Dynamic UI components & routing" },
    { name: "Node.js", icon: Cpu, color: "#339933", desc: "Scalable backend & API handlers" },
    { name: "MongoDB", icon: Layers, color: "#47A248", desc: "Flexible career progress store" },
    { name: "Gemini AI", icon: Zap, color: "#8B5CF6", desc: "Intelligent evaluation models" },
    { name: "Tailwind", icon: Globe, color: "#06B6D4", desc: "Utility-first clean layout design" },
    { name: "JWT", icon: Shield, color: "#FF007F", desc: "Secure token-based sessions" },
  ];

  return (
    <main className="min-h-screen bg-[#0B1120] text-slate-100 font-sans relative overflow-hidden" style={{ isolation: "isolate" }}>
      {/* ── Background Glow Circles ── */}
      <div 
        style={{
          position: "fixed",
          top: "-15%",
          left: "-10%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
          zIndex: -1,
          filter: "blur(60px)",
          pointerEvents: "none"
        }}
      />
      <div 
        style={{
          position: "fixed",
          bottom: "-10%",
          right: "-10%",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
          zIndex: -1,
          filter: "blur(60px)",
          pointerEvents: "none"
        }}
      />
      {/* Subtle Grid pattern */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          backgroundSize: "40px 40px",
          backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px)",
          zIndex: -2,
          pointerEvents: "none"
        }}
      />

      {/* ── Navbar ── */}
      <nav 
        className="sticky top-0 z-50 w-full"
        style={{
          background: "rgba(11, 17, 32, 0.75)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <Link
            className="text-lg font-black tracking-tight text-white transition hover:text-indigo-400"
            to="/"
            style={{ textDecoration: "none" }}
          >
            AI Career Platform
          </Link>
          <div className="flex items-center gap-3">
            <Link
              className="px-4 py-2 text-sm font-bold text-slate-400 transition hover:text-white"
              to="/login"
              style={{ textDecoration: "none" }}
            >
              Login
            </Link>
            <Link
              className="btn btn-primary compact"
              to="/register"
              style={{
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                textDecoration: "none"
              }}
            >
              Signup
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-12 sm:px-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-6">
            <Zap size={12} /> Interview Practice Workspace
          </div>
          <h1 className="max-w-xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
            Practice technical interviews with required answers and precise feedback.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-400 sm:text-lg">
            Build role-specific mock sessions, answer every question, submit for
            evaluation, and keep the full history of your progress in one place.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              className="btn btn-primary"
              to="/register"
              style={{
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 20px rgba(99, 102, 241, 0.25)",
                textDecoration: "none"
              }}
            >
              Signup <ArrowRight size={16} />
            </Link>
            <Link
              className="btn btn-secondary"
              to="/login"
              style={{
                borderRadius: "10px",
                padding: "12px 24px",
                textDecoration: "none"
              }}
            >
              Login
            </Link>
            <button
              className="btn btn-ghost"
              style={{
                borderRadius: "10px",
                padding: "12px 24px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "var(--text)"
              }}
              onClick={() => {}}
            >
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Right Preview Card */}
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          aria-label="Interview workflow preview"
          style={{
            padding: "28px",
            background: "rgba(30, 41, 59, 0.4)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}
        >
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Session flow
              </p>
              <h2 className="mt-1 text-lg font-black text-white">From setup to history</h2>
            </div>
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-bold text-slate-400">
              Authenticated
            </span>
          </div>
          <ol className="space-y-4">
            {steps.map(([title, description], index) => (
              <li
                className="grid grid-cols-[auto_1fr] gap-4 rounded-xl border border-white/5 bg-[#0B1120]/60 p-4 transition-all duration-300 hover:border-indigo-500/30"
                key={title}
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm font-black text-indigo-400">
                  {index + 1}
                </span>
                <span>
                  <strong className="block text-sm text-slate-200">{title}</strong>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </motion.div>
      </section>

      {/* ── Trusted Technologies / Stack Section ── */}
      <section className="border-t border-white/5 bg-[#0F172A]/40 py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <p className="text-center text-xs font-black uppercase tracking-widest text-indigo-400 mb-10">
            Trusted Platform Architecture
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {techStack.map((tech) => (
              <div 
                key={tech.name} 
                className="panel"
                style={{
                  padding: "16px",
                  textAlign: "center",
                  background: "rgba(30, 41, 59, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <div style={{ color: tech.color, background: `${tech.color}12`, padding: "8px", borderRadius: "8px" }}>
                  <tech.icon size={18} />
                </div>
                <strong className="text-sm text-slate-200">{tech.name}</strong>
                <span className="text-[10px] text-slate-500 leading-normal">{tech.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <motion.section
        className="border-y border-white/5 bg-[#0F172A]/20 px-6 py-20 sm:px-8"
        {...sectionMotion}
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-400">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">
              A complete preparation loop without fake urgency.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                className="panel interactive-row"
                key={feature.title}
                style={{
                  padding: "24px",
                  background: "rgba(30, 41, 59, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  transition: "transform 0.2s, border-color 0.2s"
                }}
              >
                <div className="mb-5 inline-flex p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <feature.Icon size={20} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-black text-slate-200">{feature.title}</h3>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── How It Works / Workflow Section ── */}
      <motion.section className="px-6 py-20 sm:px-8" {...sectionMotion}>
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-400">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">
              Built around the real interview flow.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              The product path is direct: configure, answer, evaluate, and
              review. Each step supports the next one without hiding the work.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {steps.map(([title, description], index) => (
              <div
                className="panel"
                key={title}
                style={{
                  padding: "24px",
                  background: "rgba(30, 41, 59, 0.25)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px"
                }}
              >
                <span className="text-xs font-black text-indigo-400">
                  Step {index + 1}
                </span>
                <h3 className="mt-3 text-base font-black text-slate-200">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Benefits Section ── */}
      <motion.section
        className="border-y border-white/5 bg-[#0F172A]/40 px-6 py-20 sm:px-8"
        {...sectionMotion}
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-400">
              Benefits
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">
              Make practice specific enough to change behavior.
            </h2>
          </div>
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div
                className="flex gap-4 rounded-xl border border-white/5 bg-[#0B1120]/80 p-5"
                key={benefit}
              >
                <CheckCircle2 className="mt-1 shrink-0 text-indigo-400" size={18} aria-hidden="true" />
                <p className="m-0 text-sm leading-6 text-slate-400">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── FAQ Accordion Section ── */}
      <motion.section className="px-6 py-20 sm:px-8" {...sectionMotion}>
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-400">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">
              Practical answers before you begin.
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <article
                  className="overflow-hidden rounded-xl border border-white/5 bg-slate-900/30"
                  key={faq.question}
                >
                  <button
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-bold text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition hover:bg-white/5"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    type="button"
                  >
                    {faq.question}
                    <ChevronDown
                      className={`shrink-0 text-indigo-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      size={18}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="m-0 border-t border-white/5 px-6 py-4 text-xs leading-6 text-slate-400 bg-slate-900/10">
                          {faq.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── Footer CTA ── */}
      <motion.section
        className="mx-auto w-full max-w-7xl px-6 pb-24 sm:px-8"
        {...sectionMotion}
      >
        <div 
          className="rounded-2xl p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-8"
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.3)"
          }}
        >
          <div className="mb-6 lg:mb-0">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-400">
              Next step
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-normal text-white sm:text-3xl">
              Prepare with a flow that requires complete answers.
            </h2>
            <p className="mt-3 max-w-2xl text-xs leading-6 text-slate-400">
              Create an account, run a mock session, submit it, and review the
              saved result when you are ready to improve the next round.
            </p>
          </div>
          <Link
            className="btn btn-secondary lg:mt-0"
            style={{ 
              background: "#fff", 
              color: "#0B1120", 
              fontWeight: 700, 
              padding: "12px 24px",
              borderRadius: "10px",
              border: "none",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
            to="/register"
          >
            Signup <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-[#0A0F1D] py-12 text-slate-500 text-xs">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p>© 2026 AI Career Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://github.com" className="hover:text-slate-300 transition">GitHub</a>
            <a href="https://linkedin.com" className="hover:text-slate-300 transition">LinkedIn</a>
            <a href="mailto:support@aicareer.com" className="hover:text-slate-300 transition">Email</a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
