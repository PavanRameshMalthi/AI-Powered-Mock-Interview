import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowRight,
  FaBriefcase,
  FaChartLine,
  FaCheckCircle,
  FaChevronDown,
  FaFileAlt,
  FaLock,
  FaMicrophone,
  FaRegLightbulb,
} from "react-icons/fa";

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
      Icon: FaBriefcase,
      title: "Role-focused question sets",
      description:
        "Configure practice for frontend, backend, full-stack, data, HR, and role-specific difficulty levels.",
    },
    {
      Icon: FaMicrophone,
      title: "Typed or voice answers",
      description:
        "Respond naturally with the microphone or type detailed answers while the session keeps progress in sync.",
    },
    {
      Icon: FaChartLine,
      title: "Structured scorecards",
      description:
        "Review correctness, relevance, technical accuracy, communication, and completeness after each round.",
    },
    {
      Icon: FaFileAlt,
      title: "Resume-aware feedback",
      description:
        "Use optional resume context to compare target-role keywords and expose gaps before real interviews.",
    },
    {
      Icon: FaRegLightbulb,
      title: "Actionable coaching",
      description:
        "See what landed, what missed, and how to rewrite answers with sharper examples and tradeoffs.",
    },
    {
      Icon: FaLock,
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link
          className="text-base font-black tracking-tight text-white sm:text-lg"
          to="/"
        >
          AI Mock Interview
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            className="rounded-md px-3 py-2 text-sm font-bold text-slate-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            to="/login"
          >
            Sign in
          </Link>
          <Link
            className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            to="/register"
          >
            Create account
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="mb-4 text-sm font-black uppercase tracking-widest text-cyan-300">
            Interview practice workspace
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
            Practice technical interviews with required answers and precise feedback.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Build role-specific mock sessions, answer every question, submit for
            evaluation, and keep the full history of your progress in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-black text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              to="/register"
            >
              Create account <FaArrowRight aria-hidden="true" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-700 px-5 text-sm font-black text-slate-100 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              to="/login"
            >
              Sign in
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="rounded-lg border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/40 sm:p-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
          aria-label="Interview workflow preview"
        >
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-300">
                Session flow
              </p>
              <h2 className="mt-1 text-xl font-black text-white">From setup to history</h2>
            </div>
            <span className="rounded-md border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
              Authenticated
            </span>
          </div>
          <ol className="space-y-3">
            {steps.map(([title, description], index) => (
              <li
                className="grid grid-cols-[auto_1fr] gap-4 rounded-md border border-slate-800 bg-slate-950/60 p-4"
                key={title}
              >
                <span className="grid h-9 w-9 place-items-center rounded-md bg-cyan-300 text-sm font-black text-slate-950">
                  {index + 1}
                </span>
                <span>
                  <strong className="block text-sm text-white">{title}</strong>
                  <span className="mt-1 block text-sm leading-6 text-slate-400">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </motion.div>
      </section>

      <motion.section
        className="border-y border-slate-800 bg-slate-900/45 px-4 py-16 sm:px-6 lg:px-8"
        {...sectionMotion}
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">
              A complete preparation loop without fake urgency.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                className="rounded-lg border border-slate-800 bg-slate-950/55 p-5"
                key={feature.title}
              >
                <feature.Icon className="mb-5 text-2xl text-cyan-300" aria-hidden="true" />
                <h3 className="text-lg font-black text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="px-4 py-16 sm:px-6 lg:px-8" {...sectionMotion}>
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">
              Built around the real interview flow.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              The product path is direct: configure, answer, evaluate, and
              review. Each step supports the next one without hiding the work.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map(([title, description], index) => (
              <div
                className="rounded-lg border border-slate-800 bg-slate-900/55 p-5"
                key={title}
              >
                <span className="text-sm font-black text-cyan-300">
                  Step {index + 1}
                </span>
                <h3 className="mt-3 text-lg font-black text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="border-y border-slate-800 bg-slate-900/45 px-4 py-16 sm:px-6 lg:px-8"
        {...sectionMotion}
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
              Benefits
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">
              Make practice specific enough to change behavior.
            </h2>
          </div>
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div
                className="flex gap-4 rounded-lg border border-slate-800 bg-slate-950/55 p-5"
                key={benefit}
              >
                <FaCheckCircle className="mt-1 shrink-0 text-cyan-300" aria-hidden="true" />
                <p className="m-0 text-base leading-7 text-slate-300">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="px-4 py-16 sm:px-6 lg:px-8" {...sectionMotion}>
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">
              Practical answers before you begin.
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <article
                  className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/55"
                  key={faq.question}
                >
                  <button
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-black text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    type="button"
                  >
                    {faq.question}
                    <FaChevronDown
                      className={`shrink-0 text-cyan-300 transition ${isOpen ? "rotate-180" : ""}`}
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
                        <p className="m-0 border-t border-slate-800 px-5 py-4 text-sm leading-7 text-slate-400">
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

      <motion.section
        className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"
        {...sectionMotion}
      >
        <div className="rounded-lg border border-cyan-300/30 bg-cyan-300 p-6 text-slate-950 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-slate-700">
              Next step
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
              Prepare with a flow that requires complete answers.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-800">
              Create an account, run a mock session, submit it, and review the
              saved result when you are ready to improve the next round.
            </p>
          </div>
          <Link
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-300 lg:mt-0"
            to="/register"
          >
            Create account <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </motion.section>
    </main>
  );
};

export default Landing;
