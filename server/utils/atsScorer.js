// ─── Stop words filtered during tokenisation ──────────────────────────────
const STOP_WORDS = new Set([
  "and", "are", "for", "from", "has", "have", "the", "this", "that",
  "with", "your", "you", "will", "role", "job", "work", "team", "using",
]);

// ─── Role → required keyword sets ─────────────────────────────────────────
const ROLE_KEYWORDS = {
  frontend:  ["react", "javascript", "typescript", "html", "css", "accessibility", "responsive", "redux", "vite"],
  backend:   ["node", "express", "api", "mongodb", "database", "authentication", "rest", "security"],
  fullstack: ["react", "node", "express", "mongodb", "api", "javascript", "deployment", "authentication"],
  data:      ["python", "sql", "analytics", "pandas", "machine", "learning", "dashboard", "statistics"],
  devops:    ["docker", "ci", "cd", "aws", "cloud", "linux", "monitoring", "deployment"],
};

// ─── Section detection patterns ────────────────────────────────────────────
const SECTION_PATTERNS = {
  contact:    /(email|phone|linkedin|github|portfolio)/i,
  skills:     /(skills|technologies|tools|programming languages)/i,
  experience: /(experience|internship|employment|work history)/i,
  education:  /(education|degree|university|college|school)/i,
  projects:   /(projects|portfolio|case study|built|developed)/i,
};

// ─── Comprehensive skill catalogue ────────────────────────────────────────
// Each entry: { token, label }
//   token  – lowercase word to look for in resume tokens
//   label  – human-readable label shown in UI
const SKILL_CATALOGUE = [
  // Languages
  { token: "javascript",  label: "JavaScript Development" },
  { token: "typescript",  label: "TypeScript" },
  { token: "python",      label: "Python" },
  { token: "java",        label: "Java" },
  { token: "c#",          label: "C#" },
  { token: "php",         label: "PHP" },
  { token: "ruby",        label: "Ruby" },
  { token: "go",          label: "Go (Golang)" },
  { token: "kotlin",      label: "Kotlin" },
  { token: "swift",       label: "Swift" },
  // Web basics
  { token: "html",        label: "HTML & CSS" },
  { token: "css",         label: "HTML & CSS" },
  // Frameworks & libraries
  { token: "react",       label: "React Development" },
  { token: "angular",     label: "Angular" },
  { token: "vue",         label: "Vue.js" },
  { token: "next",        label: "Next.js" },
  { token: "redux",       label: "State Management (Redux)" },
  { token: "node",        label: "Node.js Backend" },
  { token: "express",     label: "Express.js" },
  { token: "fastapi",     label: "FastAPI" },
  { token: "django",      label: "Django" },
  { token: "spring",      label: "Spring Boot" },
  // Databases
  { token: "mongodb",     label: "MongoDB" },
  { token: "sql",         label: "SQL Database Knowledge" },
  { token: "postgresql",  label: "PostgreSQL" },
  { token: "mysql",       label: "MySQL" },
  { token: "redis",       label: "Redis" },
  { token: "firebase",    label: "Firebase" },
  // Tools & platforms
  { token: "git",         label: "Git & GitHub" },
  { token: "github",      label: "Git & GitHub" },
  { token: "docker",      label: "Docker" },
  { token: "kubernetes",  label: "Kubernetes" },
  { token: "aws",         label: "AWS Cloud" },
  { token: "azure",       label: "Microsoft Azure" },
  { token: "gcp",         label: "Google Cloud Platform" },
  { token: "linux",       label: "Linux / Unix" },
  // Practices
  { token: "api",         label: "REST API Development" },
  { token: "graphql",     label: "GraphQL" },
  { token: "testing",     label: "Testing Frameworks" },
  { token: "jest",        label: "Testing Frameworks (Jest)" },
  { token: "ci",          label: "CI/CD Pipelines" },
  { token: "cd",          label: "CI/CD Pipelines" },
  { token: "agile",       label: "Agile / Scrum" },
  { token: "scrum",       label: "Agile / Scrum" },
  { token: "accessibility", label: "Web Accessibility (a11y)" },
  { token: "responsive",  label: "Responsive Web Design" },
  { token: "deployment",  label: "Deployment & DevOps" },
  { token: "security",    label: "Security Best Practices" },
  { token: "authentication", label: "Authentication & Auth" },
  // Data & AI
  { token: "analytics",   label: "Data Analytics" },
  { token: "pandas",      label: "Pandas / Data Science" },
  { token: "machine",     label: "Machine Learning" },
  { token: "tensorflow",  label: "TensorFlow / AI" },
  { token: "tableau",     label: "Data Visualisation (Tableau)" },
];

// Tokens that indicate project / experience content ─────────────────────────
const PROJECT_TOKENS = new Set([
  "built", "developed", "created", "designed", "implemented", "deployed",
  "project", "projects", "portfolio", "application", "app", "website",
  "system", "platform", "tool", "api", "service",
]);

const EXPERIENCE_TOKENS = new Set([
  "internship", "intern", "experience", "worked", "employed", "company",
  "organization", "team", "led", "managed", "collaborated",
]);

const EDUCATION_TOKENS = new Set([
  "degree", "bachelor", "master", "phd", "university", "college",
  "school", "b.tech", "b.e", "m.tech", "bsc", "msc", "diploma", "cgpa", "gpa",
]);

const CERT_TOKENS = new Set([
  "certification", "certified", "certificate", "course", "coursera",
  "udemy", "linkedin", "aws certified", "google certified", "microsoft certified",
]);

// ─── Helpers ───────────────────────────────────────────────────────────────
const clampScore = (v) => Math.min(Math.max(Math.round(v), 0), 100);

const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

const getRoleKeywords = (role) => {
  const norm = String(role || "").toLowerCase();
  const mapped = Object.entries(ROLE_KEYWORDS)
    .filter(([key]) => norm.includes(key))
    .flatMap(([, kws]) => kws);
  return [...new Set([...tokenize(norm), ...mapped])].slice(0, 18);
};

const getLevel = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Moderate";
  return "Needs work";
};

// Deduplicate by label ───────────────────────────────────────────────────────
const uniqueByLabel = (arr) => {
  const seen = new Set();
  return arr.filter(({ label }) => {
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
};

// ─── Main scoring function ─────────────────────────────────────────────────
const scoreResumeForRole = ({ resumeText, role = "" }) => {
  const text = String(resumeText || "").trim();

  if (!text) {
    return {
      score: 0,
      level: "Needs work",
      matchedKeywords: [],
      missingKeywords: getRoleKeywords(role).slice(0, 8),
      skillsDetected: [],
      strongAreas: [],
      weakAreas: ["Resume text could not be extracted."],
      recommendedNextSkills: [],
      resumeEnhancementSuggestions: ["Upload a text-based PDF resume before scoring ATS fit."],
      skillGapAnalysis: { detected: [], recommended: [] },
      sectionScores: { contact: 0, skills: 0, experience: 0, education: 0, projects: 0 },
      recommendations: ["Upload a text-based PDF resume before scoring ATS fit."],
    };
  }

  const tokens = tokenize(text);
  const tokenSet = new Set(tokens);

  // ── 1. Keyword matching ───────────────────────────────────────────────────
  const roleKeywords   = getRoleKeywords(role);

  const cataloguedSkills = uniqueByLabel(
    SKILL_CATALOGUE.filter(({ token }) => tokenSet.has(token))
  );

  const tokenToLabel = SKILL_CATALOGUE.reduce((map, item) => {
    map[item.token] = item.label;
    return map;
  }, {});

  const matchedKeywords = [...new Set(cataloguedSkills.map((item) => item.label))];
  const missingKeywords = roleKeywords
    .filter((kw) => !tokenSet.has(kw) && tokenToLabel[kw])
    .map((kw) => tokenToLabel[kw])
    .slice(0, 8);

  const keywordScore = roleKeywords.length
    ? (roleKeywords.filter((kw) => tokenSet.has(kw)).length / roleKeywords.length) * 100
    : 65;

  // ── 2. Section detection ──────────────────────────────────────────────────
  const sectionScores = Object.fromEntries(
    Object.entries(SECTION_PATTERNS).map(([k, re]) => [k, re.test(text) ? 100 : 0])
  );
  const sectionAvg = Object.values(sectionScores).reduce((a, b) => a + b, 0) / Object.keys(sectionScores).length;

  // ── 3. Impact & length scores ─────────────────────────────────────────────
  const impactWords = (text.match(/\b(led|built|improved|reduced|increased|optimized|deployed|designed|implemented|automated)\b/gi) || []).length;
  const metricWords = (text.match(/\b\d+%?|\b\d+\+?\b/g) || []).length;
  const impactScore = clampScore(impactWords * 12 + metricWords * 6);
  const lengthScore = clampScore(Math.min(text.length / 30, 100));

  // ── 4. Overall score ──────────────────────────────────────────────────────
  const score = clampScore(keywordScore * 0.38 + sectionAvg * 0.27 + impactScore * 0.2 + lengthScore * 0.15);

  // ── 5. Granular section sub-scores ───────────────────────────────────────
  const hasProjects = tokens.some((t) => PROJECT_TOKENS.has(t));
  const hasExperience = tokens.some((t) => EXPERIENCE_TOKENS.has(t));
  const hasEducation = tokens.some((t) => EDUCATION_TOKENS.has(t));
  const hasCerts = tokens.some((t) => CERT_TOKENS.has(t));

  const technicalSkillScore = clampScore((cataloguedSkills.length / Math.max(SKILL_CATALOGUE.length * 0.3, 1)) * 100);
  const projectScore = clampScore((hasProjects ? 70 : 0) + impactWords * 5);
  const educationScore = hasEducation ? 80 : 30;
  const certScore = hasCerts ? 75 : 20;
  const completenessScore = clampScore(sectionAvg);

  const skillsDetected = [...new Set(cataloguedSkills.map((s) => s.label))];

  const strongAreas = [
    ...cataloguedSkills.map((s) => s.label),
    ...(hasProjects ? ["Academic / Personal Projects"] : []),
    ...(hasExperience ? ["Industry Experience"] : []),
    ...(hasEducation ? ["Formal Education Background"] : []),
    ...(hasCerts ? ["Professional Certifications"] : []),
    ...(impactWords >= 3 ? ["Impact-Driven Accomplishments"] : []),
    ...(metricWords >= 4 ? ["Quantified Achievements"] : []),
    ...(sectionScores.contact === 100 ? ["Complete Contact Information"] : []),
  ].filter(Boolean).slice(0, 8);

  const ROLE_EXPECTED = {
    frontend: ["javascript", "typescript", "react", "html", "css", "testing", "git", "redux", "accessibility", "responsive"],
    backend: ["node", "express", "api", "mongodb", "sql", "authentication", "docker", "testing", "security", "redis"],
    fullstack: ["javascript", "typescript", "react", "node", "express", "mongodb", "api", "git", "docker", "testing"],
    data: ["python", "sql", "pandas", "analytics", "machine", "tensorflow", "tableau", "git", "statistics"],
    devops: ["docker", "kubernetes", "aws", "ci", "linux", "git", "monitoring", "security", "cloud"],
  };

  const norm = String(role || "").toLowerCase();
  const expectedTokens = Object.entries(ROLE_EXPECTED)
    .filter(([key]) => norm.includes(key))
    .flatMap(([, kws]) => kws);

  const baselineTokens = expectedTokens.length
    ? expectedTokens
    : ["javascript", "typescript", "git", "testing", "docker", "api", "sql", "react", "security", "ci"];

  const missingExpectedTokens = baselineTokens.filter((token) => !tokenSet.has(token));
  const missingSkillEntries = uniqueByLabel(
    SKILL_CATALOGUE.filter(({ token }) => missingExpectedTokens.includes(token))
  );

  const missingNonTechnical = [];
  if (!hasProjects) missingNonTechnical.push("Project Portfolio");
  if (!hasExperience) missingNonTechnical.push("Work / Internship Experience");
  if (!hasCerts) missingNonTechnical.push("Professional Certifications");
  if (impactWords < 2) missingNonTechnical.push("Impact Statements & Metrics");
  if (sectionScores.skills === 0) missingNonTechnical.push("Dedicated Skills Section");

  const weakAreas = [
    ...missingSkillEntries.map((s) => s.label),
    ...missingNonTechnical,
  ].filter(Boolean).slice(0, 8);

  const recommendedNextSkills = missingSkillEntries.map((s) => s.label).slice(0, 6);

  // ── 10. Improvement recommendations ──────────────────────────────────────
  const recommendations = [];
  if (missingKeywords.length)
    recommendations.push(`Add role keywords to your resume: ${missingKeywords.slice(0, 5).join(", ")}.`);
  if (sectionScores.projects === 0)
    recommendations.push("Add a Projects section with measurable outcomes and links.");
  if (impactScore < 45)
    recommendations.push("Use stronger action verbs (led, built, optimised) and add quantified results.");
  if (!hasCerts)
    recommendations.push("Add relevant certifications (AWS, Google, Microsoft, Coursera, etc.).");
  if (sectionScores.skills === 0)
    recommendations.push("Add a clearly labelled Skills or Technologies section.");
  if (!recommendations.length)
    recommendations.push("Resume is well-aligned. Keep examples concise and metrics-driven.");

  // ── 11. Skill Gap Analysis ────────────────────────────────────────────────
  const skillGapAnalysis = {
    detected:    skillsDetected.slice(0, 10),
    recommended: recommendedNextSkills,
  };

  return {
    score,
    level: getLevel(score),
    matchedKeywords: matchedKeywords.slice(0, 12),
    missingKeywords,
    skillsDetected,
    strongAreas,
    weakAreas,
    recommendedNextSkills,
    resumeEnhancementSuggestions: recommendations,
    skillGapAnalysis,
    sectionScores: {
      ...sectionScores,
      technicalSkills: technicalSkillScore,
      projects:        projectScore,
      education:       educationScore,
      certifications:  certScore,
      completeness:    completenessScore,
    },
    // backward compat
    strengths:   strongAreas,
    weaknesses:  weakAreas,
    recommendations,
  };
};

module.exports = { scoreResumeForRole };
