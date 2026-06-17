const STOP_WORDS = new Set([
  "and",
  "are",
  "for",
  "from",
  "has",
  "have",
  "the",
  "this",
  "that",
  "with",
  "your",
  "you",
  "will",
  "role",
  "job",
  "work",
  "team",
  "using",
]);

const ROLE_KEYWORDS = {
  frontend: ["react", "javascript", "typescript", "html", "css", "accessibility", "responsive", "redux", "vite"],
  backend: ["node", "express", "api", "mongodb", "database", "authentication", "rest", "security"],
  fullstack: ["react", "node", "express", "mongodb", "api", "javascript", "deployment", "authentication"],
  data: ["python", "sql", "analytics", "pandas", "machine", "learning", "dashboard", "statistics"],
  devops: ["docker", "ci", "cd", "aws", "cloud", "linux", "monitoring", "deployment"],
};

const SECTION_PATTERNS = {
  contact: /(email|phone|linkedin|github|portfolio)/i,
  skills: /(skills|technologies|tools|programming languages)/i,
  experience: /(experience|internship|employment|work history)/i,
  education: /(education|degree|university|college|school)/i,
  projects: /(projects|portfolio|case study|built|developed)/i,
};

const clampScore = (value) => Math.min(Math.max(Math.round(value), 0), 100);

const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

const getRoleKeywords = (role) => {
  const normalizedRole = String(role || "").toLowerCase();
  const roleTokens = tokenize(normalizedRole);
  const mappedKeywords = Object.entries(ROLE_KEYWORDS)
    .filter(([key]) => normalizedRole.includes(key))
    .flatMap(([, keywords]) => keywords);

  return [...new Set([...roleTokens, ...mappedKeywords])].slice(0, 18);
};

const getLevel = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Moderate";
  return "Needs work";
};

const scoreResumeForRole = ({ resumeText, role = "" }) => {
  const text = String(resumeText || "").trim();

  if (!text) {
    return {
      score: 0,
      level: "Needs work",
      matchedKeywords: [],
      missingKeywords: getRoleKeywords(role).slice(0, 8),
      sectionScores: {
        contact: 0,
        skills: 0,
        experience: 0,
        education: 0,
        projects: 0,
      },
      recommendations: ["Upload a text-based PDF resume before scoring ATS fit."],
    };
  }

  const resumeTokens = new Set(tokenize(text));
  const roleKeywords = getRoleKeywords(role);
  const matchedKeywords = roleKeywords.filter((keyword) =>
    resumeTokens.has(keyword.toLowerCase())
  );
  const missingKeywords = roleKeywords
    .filter((keyword) => !matchedKeywords.includes(keyword))
    .slice(0, 8);

  const keywordScore = roleKeywords.length
    ? (matchedKeywords.length / roleKeywords.length) * 100
    : 65;

  const sectionScores = Object.fromEntries(
    Object.entries(SECTION_PATTERNS).map(([section, pattern]) => [
      section,
      pattern.test(text) ? 100 : 0,
    ])
  );
  const sectionScore =
    Object.values(sectionScores).reduce((total, score) => total + score, 0) /
    Object.keys(sectionScores).length;

  const impactWords = (text.match(
    /\b(led|built|improved|reduced|increased|optimized|deployed|designed|implemented|automated)\b/gi
  ) || []).length;
  const metricWords = (text.match(/\b\d+%?|\b\d+\+?\b/g) || []).length;
  const impactScore = clampScore(impactWords * 12 + metricWords * 6);
  const lengthScore = clampScore(Math.min(text.length / 30, 100));

  const score = clampScore(
    keywordScore * 0.38 + sectionScore * 0.27 + impactScore * 0.2 + lengthScore * 0.15
  );

  const recommendations = [];
  if (missingKeywords.length) {
    recommendations.push(`Add relevant role keywords: ${missingKeywords.slice(0, 5).join(", ")}.`);
  }
  if (sectionScores.projects === 0) {
    recommendations.push("Add a projects section with measurable outcomes.");
  }
  if (impactScore < 45) {
    recommendations.push("Use stronger impact statements with numbers, results, and action verbs.");
  }
  if (!recommendations.length) {
    recommendations.push("Resume is well aligned. Keep examples concise and metrics-driven.");
  }

  return {
    score,
    level: getLevel(score),
    matchedKeywords: matchedKeywords.slice(0, 12),
    missingKeywords,
    sectionScores,
    recommendations,
  };
};

module.exports = {
  scoreResumeForRole,
};
