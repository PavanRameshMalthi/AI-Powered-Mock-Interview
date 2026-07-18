// ─── Section detection patterns ────────────────────────────────────────────────
const SECTION_PATTERNS = {
  contact:        /(email|phone|mobile|linkedin|github|portfolio|address)/i,
  summary:        /(summary|objective|profile|about me|professional profile)/i,
  education:      /(education|degree|university|college|school|b\.tech|b\.e|m\.tech|bsc)/i,
  skills:         /(skills|technologies|tools|programming languages|tech stack)/i,
  projects:       /(projects|portfolio|case study)/i,
  experience:     /(experience|internship|employment|work history|work experience)/i,
  certifications: /(certification|certified|certificate|coursera|udemy)/i,
  achievements:   /(achievement|award|honor|recognition|accomplishment)/i,
  languages:      /(languages spoken|spoken languages|language proficiency)/i,
};

// ─── Action verb lists ─────────────────────────────────────────────────────────
const STRONG_ACTION_VERBS = [
  "led", "built", "developed", "designed", "implemented", "deployed", "optimized",
  "improved", "reduced", "increased", "architected", "engineered", "automated",
  "launched", "created", "established", "managed", "delivered", "achieved",
  "spearheaded", "transformed", "streamlined", "collaborated", "mentored",
];

// ─── Achievement indicators ────────────────────────────────────────────────────
const ACHIEVEMENT_PATTERNS = [
  /\d+%/,             // percentages: "increased by 30%"
  /\$[\d,]+/,         // dollar amounts
  /\d+\+?\s*(users|clients|projects|months|years|people|members)/i,
  /reduced|increased|improved|saved|generated|grew|scaled/i,
];

// ─── Grammar indicators (simple heuristics) ───────────────────────────────────
const COMMON_ERRORS = [
  /\bi\s+am\b/i,       // lowercase "i"
  /\s{3,}/,            // multiple spaces
  /[,]{2,}/,           // double commas
];

// ─── Section score helpers ────────────────────────────────────────────────────
const clamp = (v) => Math.min(Math.max(Math.round(v), 0), 100);

/**
 * Detect which sections exist in the resume text.
 * @param {string} text
 * @returns {Object} sectionsFound map
 */
const detectSections = (text) => {
  const result = {};
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    result[key] = pattern.test(text);
  }
  return result;
};

/**
 * Compute resume statistics.
 * @param {string} text
 * @param {string[]} skillsDetected
 * @returns {Object}
 */
const computeResumeStats = (text, skillsDetected = []) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = text.length;
  // Rough estimate: 350 words per page for a resume
  const estimatedPages = Math.max(1, Math.round(wordCount / 350));
  // Reading time: 200 wpm average
  const estimatedReadingTime = Math.max(1, Math.round(wordCount / 200));

  // Count projects: look for bullet points near "project" sections
  const projectMatches = (text.match(/\b(project|built|developed|created|designed)\b/gi) || []).length;
  const projectsCount = Math.min(Math.floor(projectMatches / 2), 15);

  // Count experience entries: look for date ranges like "2020 - 2022" or "Jan 2021"
  const experienceMatches = (text.match(/\b(20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi) || []).length;
  const experienceCount = Math.min(Math.floor(experienceMatches / 3), 10);

  return {
    wordCount,
    charCount,
    estimatedPages,
    estimatedReadingTime,
    skillsCount: skillsDetected.length,
    projectsCount,
    experienceCount,
  };
};

/**
 * Compute 12-category ATS analysis scores.
 * @param {string} text
 * @param {Object} atsScore - result from scoreResumeForRole
 * @param {Object} sections - result from detectSections
 * @returns {Object} atsAnalysis
 */
const computeATSAnalysis = (text, atsScore, sections) => {
  const tokens = text.toLowerCase().split(/\s+/);

  // 1. Formatting — penalize if very short, no structure
  const hasMultipleSections = Object.values(sections).filter(Boolean).length;
  const formattingScore = clamp(hasMultipleSections * 14);
  const formattingExplanation = formattingScore >= 70
    ? "Resume has a clear multi-section structure."
    : formattingScore >= 50
    ? "Some sections detected but layout could be improved."
    : "Resume appears to lack clear section headers — add Contact, Skills, Education, Experience, Projects.";

  // 2. Keyword Match
  const keywordScore = clamp((atsScore.matchedKeywords?.length || 0) * 8);
  const keywordExplanation = keywordScore >= 70
    ? `Strong keyword presence — ${atsScore.matchedKeywords?.length || 0} industry keywords found.`
    : `Only ${atsScore.matchedKeywords?.length || 0} keywords matched. Add more role-specific terms.`;

  // 3. Skills Match
  const skillsScore = clamp((atsScore.skillsDetected?.length || 0) * 7);
  const skillsExplanation = skillsScore >= 70
    ? `Detected ${atsScore.skillsDetected?.length || 0} technical skills — excellent coverage.`
    : `Only ${atsScore.skillsDetected?.length || 0} technical skills identified. Add a dedicated Skills section.`;

  // 4. Education
  const educationScore = sections.education ? clamp(atsScore.sectionScores?.education || 75) : 20;
  const educationExplanation = sections.education
    ? "Education section found with relevant details."
    : "No education section detected. Add your degree, university, and graduation year.";

  // 5. Projects
  const projectsScore = sections.projects
    ? clamp((atsScore.sectionScores?.projects || 0))
    : 15;
  const projectsExplanation = sections.projects
    ? "Projects section detected. Ensure each project has tech stack and outcomes."
    : "No Projects section found. Add 2–4 projects with measurable results.";

  // 6. Experience
  const experienceScore = sections.experience
    ? clamp(atsScore.sectionScores?.experience || 70)
    : 10;
  const experienceExplanation = sections.experience
    ? "Work experience section found."
    : "No experience section detected. Add internships, part-time work, or freelance projects.";

  // 7. Contact Info
  const contactScore = sections.contact ? 90 : 20;
  const contactExplanation = sections.contact
    ? "Contact information is present."
    : "Contact details missing — add email, phone, LinkedIn, and GitHub.";

  // 8. Grammar (heuristic)
  const errorCount = COMMON_ERRORS.reduce((count, re) => count + (re.test(text) ? 1 : 0), 0);
  const grammarScore = clamp(100 - errorCount * 20);
  const grammarExplanation = grammarScore >= 80
    ? "No obvious grammatical issues detected."
    : "Possible grammar issues found. Consider proofreading with Grammarly.";

  // 9. Readability
  const avgWordsPerSentence = text.split(/[.!?]+/).filter(Boolean).length
    ? text.split(/\s+/).length / text.split(/[.!?]+/).filter(Boolean).length
    : 0;
  const readabilityScore = clamp(avgWordsPerSentence > 5 && avgWordsPerSentence < 20 ? 85 : 55);
  const readabilityExplanation = readabilityScore >= 75
    ? "Good sentence length and readability."
    : "Sentences may be too long or too short. Aim for 10–18 words per bullet point.";

  // 10. Professional Summary
  const summaryScore = sections.summary ? 85 : 20;
  const summaryExplanation = sections.summary
    ? "Professional summary found — good first impression for recruiters."
    : "No professional summary detected. Add a 3–4 line summary at the top.";

  // 11. Action Verbs
  const actionVerbCount = STRONG_ACTION_VERBS.reduce(
    (count, verb) => count + (new RegExp(`\\b${verb}\\b`, "gi").test(text) ? 1 : 0),
    0
  );
  const actionVerbScore = clamp(actionVerbCount * 10);
  const actionVerbExplanation = actionVerbScore >= 70
    ? `Strong action verbs found (${actionVerbCount} detected). Great use of impact language.`
    : `Only ${actionVerbCount} strong action verbs detected. Use more: led, built, deployed, optimized.`;

  // 12. Achievements
  const achievementCount = ACHIEVEMENT_PATTERNS.reduce(
    (count, re) => count + (re.test(text) ? 1 : 0),
    0
  );
  const achievementsScore = clamp(achievementCount * 22);
  const achievementsExplanation = achievementsScore >= 70
    ? "Quantified achievements detected — excellent for ATS and recruiters."
    : "Add measurable achievements: percentages, dollar values, or user counts.";

  return {
    formatting:          { score: formattingScore,    explanation: formattingExplanation },
    keywordMatch:        { score: keywordScore,        explanation: keywordExplanation },
    skillsMatch:         { score: skillsScore,         explanation: skillsExplanation },
    education:           { score: educationScore,      explanation: educationExplanation },
    projects:            { score: projectsScore,       explanation: projectsExplanation },
    experience:          { score: experienceScore,     explanation: experienceExplanation },
    contactInfo:         { score: contactScore,        explanation: contactExplanation },
    grammar:             { score: grammarScore,        explanation: grammarExplanation },
    readability:         { score: readabilityScore,    explanation: readabilityExplanation },
    professionalSummary: { score: summaryScore,        explanation: summaryExplanation },
    actionVerbs:         { score: actionVerbScore,     explanation: actionVerbExplanation },
    achievements:        { score: achievementsScore,   explanation: achievementsExplanation },
  };
};

/**
 * Generate rule-based AI suggestions as a fallback.
 * @param {Object} atsAnalysis
 * @param {Object} sections
 * @param {Object} atsScore
 * @returns {Array}
 */
const generateFallbackSuggestions = (atsAnalysis, sections, atsScore) => {
  const suggestions = [];

  if (atsAnalysis.achievements.score < 60) {
    suggestions.push({
      title: "Add Quantified Achievements",
      detail: "Include specific metrics like 'Reduced load time by 40%' or 'Built app used by 500+ users'. Numbers make your resume stand out to ATS and recruiters.",
      priority: "high",
    });
  }
  if (!sections.summary) {
    suggestions.push({
      title: "Write a Professional Summary",
      detail: "Add a 3–4 sentence summary at the top. Mention your role, years of experience, key skills, and what you're looking for. This is the first thing recruiters read.",
      priority: "high",
    });
  }
  if (atsAnalysis.actionVerbs.score < 60) {
    suggestions.push({
      title: "Use Stronger Action Verbs",
      detail: "Replace weak verbs like 'helped' or 'worked on' with powerful verbs: led, built, deployed, architected, engineered, optimized, delivered.",
      priority: "high",
    });
  }
  if (!sections.projects) {
    suggestions.push({
      title: "Add a Projects Section",
      detail: "List 2–4 projects with: project name, technologies used, your role, and measurable outcomes. Include GitHub or live demo links.",
      priority: "medium",
    });
  }
  if (atsAnalysis.keywordMatch.score < 60) {
    suggestions.push({
      title: "Improve ATS Keywords",
      detail: `Add more industry-specific keywords. Currently missing: ${(atsScore.missingKeywords || []).slice(0, 4).join(", ")}. Include these naturally in your descriptions.`,
      priority: "high",
    });
  }
  if (!sections.certifications) {
    suggestions.push({
      title: "Add Certifications",
      detail: "Include relevant certifications from AWS, Google, Microsoft, Coursera, or Udemy. Certifications add credibility and ATS score.",
      priority: "medium",
    });
  }
  if (atsAnalysis.formatting.score < 60) {
    suggestions.push({
      title: "Improve Resume Structure",
      detail: "Ensure your resume has clear section headers: Contact, Summary, Skills, Experience, Projects, Education. A structured layout improves ATS parsing.",
      priority: "high",
    });
  }
  if (atsAnalysis.experience.score < 50) {
    suggestions.push({
      title: "Enhance Experience Descriptions",
      detail: "For each role, use the STAR format: Situation, Task, Action, Result. Focus on impact, not just responsibilities.",
      priority: "medium",
    });
  }
  if ((atsScore.skillsDetected || []).length < 5) {
    suggestions.push({
      title: "Mention More Technologies",
      detail: "List all relevant tools, languages, frameworks, and platforms you know. Include version control (Git), cloud platforms, databases, and testing frameworks.",
      priority: "medium",
    });
  }
  if (atsAnalysis.readability.score < 60) {
    suggestions.push({
      title: "Improve Readability",
      detail: "Use bullet points instead of long paragraphs. Each bullet should be 1–2 lines. Start each point with an action verb. Avoid dense blocks of text.",
      priority: "low",
    });
  }

  return suggestions.slice(0, 8);
};

module.exports = {
  detectSections,
  computeResumeStats,
  computeATSAnalysis,
  generateFallbackSuggestions,
};
