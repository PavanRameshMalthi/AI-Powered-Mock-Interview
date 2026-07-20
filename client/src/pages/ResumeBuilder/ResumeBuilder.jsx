import { Fragment, useState, useEffect, useRef } from "react";
import {
  FileText,
  Trash2,
  Copy,
  Edit,
  Plus,
  Eye,
} from "lucide-react";
import api from "../../services/api";
import "./ResumeBuilder.css";

const skillCategories = {
  programming: "Programming Languages",
  frameworks: "Frameworks & Libraries",
  databases: "Databases",
  tools: "Tools & Technologies",
  soft: "Soft Skills",
};

const sampleData = {
  personal: {
    fullName: "John Doe",
    email: "john.doe@gmail.com",
    phone: "+91 9876543210",
    address: "Hyderabad, India",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    portfolio: "https://johndoe.dev",
  },
  summary: "Motivated Full Stack Developer skilled in HTML, CSS, JavaScript, React, Node.js and MongoDB with experience building responsive web applications.",
  education: [
    {
      degree: "B.Tech Computer Science",
      college: "ABC Engineering College",
      university: "JNTU",
      startYear: "2022",
      endYear: "2026",
      score: "8.5 CGPA",
    },
  ],
  skills: {
    programming: ["JavaScript", "Java", "Python"],
    frameworks: ["React", "Node.js", "Express"],
    databases: ["MongoDB", "MySQL"],
    tools: ["Git", "GitHub", "VS Code"],
    soft: ["Communication", "Teamwork"],
  },
  projects: [
    {
      title: "Resume Builder",
      description: "Built a responsive resume builder with ATS score checker and PDF export.",
      technologies: "HTML, CSS, JavaScript",
      github: "https://github.com/johndoe/resume-builder",
      live: "https://resume-builder-demo.com",
    },
  ],
  experience: [
    {
      company: "Tech Solutions",
      role: "Web Developer Intern",
      duration: "Jan 2025 - Mar 2025",
      responsibilities: "Developed responsive web pages and fixed UI bugs.",
    },
  ],
  certifications: [
    {
      name: "Full Stack Web Development",
      organization: "Udemy",
      issueDate: "2025-01-15",
      credentialUrl: "https://example.com/certificate",
    },
  ],
  achievements: {
    awards: "Best Student Project Award",
    hackathons: "Smart India Hackathon Participant",
    competitions: "Coding Contest Finalist",
    academic: "Dean's List",
  },
};

const ResumeBuilder = () => {
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentResume, setCurrentResume] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [saveStatus, setSaveStatus] = useState("Saved");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const templateOptions = [
    { value: "professional", label: "Professional" },
    { value: "student", label: "Student" },
    { value: "modern", label: "Modern" },
    { value: "minimal", label: "Minimal" },
    { value: "creative", label: "Creative" },
    { value: "ats", label: "ATS Format" }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setDropdownOpen(!dropdownOpen);
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
    } else if (e.key === "ArrowDown" && dropdownOpen) {
      e.preventDefault();
      const currentIndex = templateOptions.findIndex(opt => opt.value === currentResume.template);
      const nextIndex = (currentIndex + 1) % templateOptions.length;
      setCurrentResume((prev) => ({ ...prev, template: templateOptions[nextIndex].value }));
      triggerAutoSave();
    } else if (e.key === "ArrowUp" && dropdownOpen) {
      e.preventDefault();
      const currentIndex = templateOptions.findIndex(opt => opt.value === currentResume.template);
      const prevIndex = (currentIndex - 1 + templateOptions.length) % templateOptions.length;
      setCurrentResume((prev) => ({ ...prev, template: templateOptions[prevIndex].value }));
      triggerAutoSave();
    }
  };

  // Temporary skill typing inputs
  const [skillInputs, setSkillInputs] = useState({
    programming: "",
    frameworks: "",
    databases: "",
    tools: "",
    soft: "",
  });

  const saveTimeoutRef = useRef(null);
  const currentResumeRef = useRef(null);

  // Sync ref with state to prevent stale closure in debounce
  useEffect(() => {
    currentResumeRef.current = currentResume;
  }, [currentResume]);

  useEffect(() => {
    fetchResumes();
    fetchStats();
  }, []);

  async function fetchResumes() {
    try {
      const res = await api.get("/resume-builder");
      setResumes(res.data.resumes || []);
    } catch (error) {
      console.error("Failed to fetch resumes", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await api.get("/resume-builder/stats");
      setStats(res.data.stats || null);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  }

  // Debounced auto-save
  const triggerAutoSave = () => {
    setSaveStatus("Saving...");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const doc = currentResumeRef.current;
      if (!doc) return;
      try {
        await api.put(`/resume-builder/${doc._id}`, {
          name: doc.name,
          template: doc.template,
          data: doc.data,
        });
        setSaveStatus("Saved");
        fetchStats(); // Update dashboard average stats
      } catch {
        setSaveStatus("Save Failed");
      }
    }, 8000); // 800ms debounce
  };

  // Handle single field input changes
  const handleFieldChange = (path, value) => {
    setCurrentResume((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let temp = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        temp = temp[parts[i]];
      }
      temp[parts[parts.length - 1]] = value;
      return updated;
    });
    triggerAutoSave();
  };

  // Handle repeater input changes
  const handleRepeaterChange = (section, index, key, value) => {
    setCurrentResume((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.data[section][index][key] = value;
      return updated;
    });
    triggerAutoSave();
  };

  // Add repeater row
  const addRepeaterItem = (section) => {
    const blankItems = {
      education: { degree: "", college: "", university: "", startYear: "", endYear: "", score: "" },
      projects: { title: "", description: "", technologies: "", github: "", live: "" },
      experience: { company: "", role: "", duration: "", responsibilities: "" },
      certifications: { name: "", organization: "", issueDate: "", credentialUrl: "" },
    };

    setCurrentResume((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.data[section].push({ ...blankItems[section] });
      return updated;
    });
    triggerAutoSave();
  };

  // Remove repeater row
  const removeRepeaterItem = (section, index) => {
    if (!window.confirm("Delete this item?")) return;
    setCurrentResume((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.data[section].splice(index, 1);
      return updated;
    });
    triggerAutoSave();
  };

  // Add Skill Tag
  const addSkill = (category) => {
    const value = skillInputs[category].trim();
    if (!value) return;

    setCurrentResume((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated.data.skills[category]) updated.data.skills[category] = [];
      const exists = updated.data.skills[category].some(
        (s) => s.toLowerCase() === value.toLowerCase()
      );
      if (!exists) updated.data.skills[category].push(value);
      return updated;
    });

    setSkillInputs((prev) => ({ ...prev, [category]: "" }));
    triggerAutoSave();
  };

  // Remove Skill Tag
  const removeSkill = (category, index) => {
    setCurrentResume((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.data.skills[category].splice(index, 1);
      return updated;
    });
    triggerAutoSave();
  };

  // CRUD API Calls

  const handleCreate = async () => {
    try {
      const res = await api.post("/resume-builder", {
        name: "My Resume",
        template: "professional",
      });
      fetchResumes();
      fetchStats();
      setCurrentResume(res.data.resume);
      setIsEditing(true);
      setActiveTab("personal");
    } catch {
      alert("Failed to create resume");
    }
  };

  const handleEdit = (resume) => {
    setCurrentResume(resume);
    setIsEditing(true);
    setActiveTab("personal");
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/resume-builder/${id}/duplicate`);
      fetchResumes();
      fetchStats();
    } catch {
      alert("Failed to duplicate resume");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.delete(`/resume-builder/${id}`);
      fetchResumes();
      fetchStats();
    } catch {
      alert("Failed to delete resume");
    }
  };

  const handleSetActive = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/resume-builder/${id}/set-active`);
      fetchResumes();
      fetchStats();
    } catch {
      alert("Failed to set active resume");
    }
  };

  // Load John Doe sample data
  const handleLoadSample = () => {
    setCurrentResume((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.data = JSON.parse(JSON.stringify(sampleData));
      return updated;
    });
    triggerAutoSave();
  };

  // PDF Downloader (CDN-backed html2pdf)
  const handleDownloadPdf = async () => {
    if (saveStatus === "Saving...") {
      alert("Please wait until changes are saved.");
      return;
    }

    if (!window.html2pdf) {
      await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = resolve;
        document.body.appendChild(script);
      });
    }

    const previewElement = document.getElementById("resumePreview");
    if (!previewElement) return;

    window.html2pdf()
      .set({
        margin: 10,
        filename: `${currentResume.name.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(previewElement)
      .save();
  };

  // Force Immediate Save on Exit
  const handleSaveAndExit = async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    try {
      await api.put(`/resume-builder/${currentResume._id}`, {
        name: currentResume.name,
        template: currentResume.template,
        data: currentResume.data,
      });
    } catch (error) {
      console.error(error);
    }
    setIsEditing(false);
    setCurrentResume(null);
    fetchResumes();
    fetchStats();
  };

  // --- Live Resume Layout Renderers ---

  const renderContacts = () => {
    const p = currentResume.data.personal || {};
    const links = [
      p.phone,
      p.email ? <a key="email" href={`mailto:${p.email}`}>{p.email}</a> : null,
      p.address,
      p.linkedin ? <a key="li" href={p.linkedin} target="_blank" rel="noreferrer">LinkedIn</a> : null,
      p.github ? <a key="gh" href={p.github} target="_blank" rel="noreferrer">GitHub</a> : null,
      p.portfolio ? <a key="port" href={p.portfolio} target="_blank" rel="noreferrer">Portfolio</a> : null,
    ].filter(Boolean);

    return (
      <div className="resume-contact">
        {links.map((item, idx) => (
          <Fragment key={idx}>
            {idx > 0 && <span>|</span>}
            {item}
          </Fragment>
        ))}
      </div>
    );
  };

  const renderEducationSection = () => {
    const list = currentResume.data.education || [];
    const activeList = list.filter((e) => e.degree || e.college || e.university);
    if (!activeList.length) return null;

    return (
      <div className="resume-section">
        <h2>Education</h2>
        {activeList.map((edu, idx) => (
          <div className="resume-entry" key={idx}>
            <div className="resume-entry-head">
              <span>{edu.degree || "Degree"}{edu.score ? `, ${edu.score}` : ""}</span>
              <span>{[edu.startYear, edu.endYear].filter(Boolean).join(" - ")}</span>
            </div>
            <div className="resume-entry-sub">
              <span>{[edu.college, edu.university].filter(Boolean).join(" | ")}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProjectsSection = () => {
    const list = currentResume.data.projects || [];
    const activeList = list.filter((p) => p.title || p.description);
    if (!activeList.length) return null;

    return (
      <div className="resume-section">
        <h2>Projects</h2>
        {activeList.map((proj, idx) => (
          <div className="resume-entry" key={idx}>
            <div className="resume-entry-head">
              <span>{proj.title || "Project Title"}{proj.technologies ? ` | ${proj.technologies}` : ""}</span>
              <span>
                {[
                  proj.github ? <a key="g" href={proj.github} target="_blank" rel="noreferrer">GitHub</a> : null,
                  proj.live ? <a key="l" href={proj.live} target="_blank" rel="noreferrer">Live Demo</a> : null,
                ].filter(Boolean).reduce((prev, curr) => [prev, " | ", curr], null) || ""}
              </span>
            </div>
            {proj.description && (
              <ul>
                {proj.description.split(/\n|;/).map((line, lIdx) => {
                  const cleaned = line.replace(/^[-*•]\s*/, "").trim();
                  return cleaned ? <li key={lIdx}>{cleaned}</li> : null;
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderExperienceSection = () => {
    const list = currentResume.data.experience || [];
    const activeList = list.filter((e) => e.company || e.role || e.responsibilities);
    if (!activeList.length) return null;

    return (
      <div className="resume-section">
        <h2>Experience</h2>
        {activeList.map((exp, idx) => (
          <div className="resume-entry" key={idx}>
            <div className="resume-entry-head">
              <span>{exp.role || "Job Role"}</span>
              <span>{exp.duration || ""}</span>
            </div>
            <div className="resume-entry-sub">
              <span>{exp.company || "Company"}</span>
            </div>
            {exp.responsibilities && (
              <ul>
                {exp.responsibilities.split(/\n|;/).map((line, lIdx) => {
                  const cleaned = line.replace(/^[-*•]\s*/, "").trim();
                  return cleaned ? <li key={lIdx}>{cleaned}</li> : null;
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCertificationsSection = () => {
    const list = currentResume.data.certifications || [];
    const activeList = list.filter((c) => c.name || c.organization);
    if (!activeList.length) return null;

    return (
      <div className="resume-section">
        <h2>Certifications</h2>
        {activeList.map((cert, idx) => (
          <div className="resume-entry" key={idx}>
            <div className="resume-entry-head">
              <span>{cert.name || "Certificate"}</span>
              <span>{cert.issueDate || ""}</span>
            </div>
            <div className="resume-entry-sub">
              <span>{cert.organization || ""}</span>
              {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noreferrer">Credential</a>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSkillsSection = (mode = "plain") => {
    const skillsObj = currentResume.data.skills || {};
    const categories = Object.entries(skillsObj).filter(([, v]) => v && v.length);
    if (!categories.length) return null;

    return (
      <div className="resume-section">
        <h2>Technical Skills</h2>
        <div className="resume-skills">
          {categories.map(([key, list]) => {
            if (mode === "bars") {
              return list.slice(0, 8).map((skill, idx) => (
                <div className="skill-bar" key={idx}>
                  <strong>{skill}</strong>
                  <span style={{ "--level": `${90 - idx * 5}%` }}></span>
                </div>
              ));
            }
            return (
              <div key={key}>
                <strong>{skillCategories[key]}:</strong> {list.join(", ")}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAchievementsSection = () => {
    const ach = currentResume.data.achievements || {};
    const items = [
      ach.awards ? ["Awards", ach.awards] : null,
      ach.hackathons ? ["Hackathons", ach.hackathons] : null,
      ach.competitions ? ["Competitions", ach.competitions] : null,
      ach.academic ? ["Academic", ach.academic] : null,
    ].filter(Boolean);

    if (!items.length) return null;

    return (
      <div className="resume-section">
        <h2>Achievements</h2>
        <ul>
          {items.map(([label, val], idx) => (
            <li key={idx}>
              <strong>{label}:</strong> {val}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // --- Templates compilation wrapper ---

  const renderProfessionalTemplate = () => {
    const p = currentResume.data.personal || {};
    return (
      <div className="resume-paper professional">
        <header className="resume-header">
          <h1>{p.fullName || "Your Full Name"}</h1>
          {renderContacts()}
        </header>

        {currentResume.data.summary && (
          <div className="resume-section">
            <h2>Professional Summary</h2>
            <p>{currentResume.data.summary.replace(/<[^>]*>/g, "")}</p>
          </div>
        )}

        {renderEducationSection()}
        {renderProjectsSection()}
        {renderExperienceSection()}
        {renderCertificationsSection()}
        {renderAchievementsSection()}
        {renderSkillsSection()}
      </div>
    );
  };

  const renderStudentTemplate = () => {
    const p = currentResume.data.personal || {};
    return (
      <div className="resume-paper student">
        <header className="resume-header">
          <h1>{p.fullName || "Your Full Name"}</h1>
          {renderContacts()}
        </header>

        {currentResume.data.summary && (
          <div className="resume-section">
            <h2>Career Objective</h2>
            <p>{currentResume.data.summary.replace(/<[^>]*>/g, "")}</p>
          </div>
        )}

        {renderSkillsSection()}
        {renderEducationSection()}
        {renderProjectsSection()}
        {renderCertificationsSection()}
        {renderAchievementsSection()}
      </div>
    );
  };

  const renderModernTemplate = () => {
    const p = currentResume.data.personal || {};
    return (
      <div className="resume-paper modern">
        <aside className="resume-sidebar-col">
          <header className="resume-header">
            <h1>{p.fullName || "Your Name"}</h1>
            {renderContacts()}
          </header>
          {renderSkillsSection("bars")}
          {renderCertificationsSection()}
        </aside>
        <main className="resume-main-col">
          {currentResume.data.summary && (
            <div className="resume-section">
              <h2>Profile</h2>
              <p>{currentResume.data.summary.replace(/<[^>]*>/g, "")}</p>
            </div>
          )}
          {renderExperienceSection()}
          {renderProjectsSection()}
          {renderEducationSection()}
          {renderAchievementsSection()}
        </main>
      </div>
    );
  };

  const renderMinimalTemplate = () => {
    const p = currentResume.data.personal || {};
    return (
      <div className="resume-paper minimal">
        <header className="resume-header">
          <h1>{p.fullName || "Your Name"}</h1>
          {renderContacts()}
        </header>

        {currentResume.data.summary && (
          <div className="resume-section">
            <h2>Summary</h2>
            <p>{currentResume.data.summary.replace(/<[^>]*>/g, "")}</p>
          </div>
        )}

        {renderSkillsSection()}
        {renderExperienceSection()}
        {renderProjectsSection()}
        {renderEducationSection()}
        {renderCertificationsSection()}
        {renderAchievementsSection()}
      </div>
    );
  };

  const renderCreativeTemplate = () => {
    const p = currentResume.data.personal || {};
    return (
      <div className="resume-paper creative">
        <header className="resume-header">
          <h1>{p.fullName || "Your Name"}</h1>
          {renderContacts()}
        </header>

        {currentResume.data.summary && (
          <div className="resume-section">
            <h2>About Me</h2>
            <p>{currentResume.data.summary.replace(/<[^>]*>/g, "")}</p>
          </div>
        )}

        {renderExperienceSection()}
        {renderProjectsSection()}
        {renderSkillsSection()}
        {renderEducationSection()}
        {renderCertificationsSection()}
        {renderAchievementsSection()}
      </div>
    );
  };

  const renderAtsTemplate = () => {
    const p = currentResume.data.personal || {};
    return (
      <div className="resume-paper ats">
        <header className="resume-header">
          <h1>{p.fullName || "Your Full Name"}</h1>
          {renderContacts()}
        </header>

        {currentResume.data.summary && (
          <div className="resume-section">
            <h2>Professional Summary</h2>
            <p>{currentResume.data.summary.replace(/<[^>]*>/g, "")}</p>
          </div>
        )}

        {renderSkillsSection()}
        {renderExperienceSection()}
        {renderEducationSection()}
        {renderProjectsSection()}
        {renderCertificationsSection()}
        {renderAchievementsSection()}
      </div>
    );
  };

  const renderLiveTemplate = () => {
    const t = currentResume.template;
    if (t === "student") return renderStudentTemplate();
    if (t === "modern") return renderModernTemplate();
    if (t === "minimal") return renderMinimalTemplate();
    if (t === "creative") return renderCreativeTemplate();
    if (t === "ats") return renderAtsTemplate();
    return renderProfessionalTemplate();
  };

  // --- Render Views ---

  if (loading) {
    return (
      <div className="app-shell narrow" style={{ paddingTop: "80px", textAlign: "center", color: "var(--muted)" }}>
        Loading Resume Builder…
      </div>
    );
  }

  // --- View A: Resume Dashboard / History Grid ---
  if (!isEditing) {
    return (
      <main className="app-shell">
        <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="eyebrow">Interactive Resume Builder</p>
            <h1>My Resumes</h1>
            <p className="muted">Create multiple tailored versions and sync them natively with mock interviews.</p>
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} /> Create New Resume
          </button>
        </header>

        {/* Overview Stats */}
        {stats && (
          <section className="rb-stats-grid">
            <article className="stat-card">
              <span>Total Resumes</span>
              <strong>{stats.totalResumes}</strong>
            </article>
            <article className="stat-card">
              <span>Active Resume</span>
              <strong style={{ fontSize: "1.1rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: "4px" }}>
                {stats.activeResume ? stats.activeResume.name : "None"}
              </strong>
            </article>
            <article className="stat-card">
              <span>Average ATS Score</span>
              <strong>{stats.averageAtsScore}%</strong>
            </article>
            <article className="stat-card">
              <span>Latest Resume</span>
              <strong style={{ fontSize: "1.1rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: "4px" }}>
                {stats.latestResume ? stats.latestResume.name : "None"}
              </strong>
            </article>
          </section>
        )}

        {/* History Grid */}
        <section className="panel">
          <h2>Saved Resumes ({resumes.length})</h2>
          {resumes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              <p>No resumes saved yet. Click "Create New Resume" to get started.</p>
            </div>
          ) : (
            <div className="rb-history-grid">
              {resumes.map((res) => (
                <div key={res._id} className={`card rb-card ${res.isActive ? "active-resume-card" : ""}`} style={{ border: res.isActive ? "2px solid var(--primary)" : "1px solid var(--border)" }}>
                  {res.isActive && <span className="rb-card-active-badge">Active</span>}
                  <div>
                    <h3 style={{ fontSize: "1.2rem", margin: 0 }}>{res.name}</h3>
                    <div className="rb-card-meta">
                      <span>Template: <strong>{res.template}</strong></span>
                      <span>ATS Completeness: <strong>{res.atsScore}%</strong></span>
                      <span>Modified: {new Date(res.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="rb-card-actions-full">
                    <button className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => handleEdit(res)}>
                      <Edit size={14} /> Edit
                    </button>
                    {!res.isActive && (
                      <button className="btn btn-ghost" style={{ border: "1px solid var(--border)" }} onClick={(e) => handleSetActive(res._id, e)}>
                        Set Active
                      </button>
                    )}
                  </div>
                  <div className="rb-card-actions">
                    <button className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "6px" }} onClick={(e) => handleDuplicate(res._id, e)}>
                      <Copy size={12} /> Copy
                    </button>
                    <button className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "6px", color: "var(--danger)" }} onClick={(e) => handleDelete(res._id, e)}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  // --- View B: Full Resume Workspace Editor & Live Preview ---
  const currentPersonal = currentResume.data.personal || {};
  const currentSkills = currentResume.data.skills || {};

  return (
    <main className="app-shell" style={{ width: "100%" }}>
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="eyebrow">Editing Resume</p>
          <input
            type="text"
            className="rb-input"
            value={currentResume.name}
            onChange={(e) => {
              const val = e.target.value;
              setCurrentResume((prev) => ({ ...prev, name: val }));
              triggerAutoSave();
            }}
            style={{ fontSize: "1.5rem", fontWeight: "800", background: "transparent", border: "none", borderBottom: "1px dashed var(--border)", borderRadius: 0, padding: "4px 0", width: "auto" }}
          />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div ref={dropdownRef} className="relative inline-block text-left" style={{ width: "160px", position: "relative" }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onKeyDown={handleDropdownKeyDown}
              className="btn btn-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
            >
              <span>{templateOptions.find(opt => opt.value === currentResume.template)?.label || "Select Template"}</span>
              <svg
                className="w-4 h-4 ml-2"
                style={{
                  width: "16px",
                  height: "16px",
                  transition: "transform 0.2s ease",
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)"
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <ul
                className="absolute right-0 z-50 w-full mt-2"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  width: "100%",
                  zIndex: 50,
                  marginTop: "8px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                  overflow: "hidden",
                  listStyle: "none",
                  padding: "4px 0",
                  margin: 0
                }}
                role="listbox"
                aria-label="Resume Templates"
              >
                {templateOptions.map((opt) => {
                  const isSelected = opt.value === currentResume.template;
                  return (
                    <li
                      key={opt.value}
                      onClick={() => {
                        setCurrentResume((prev) => ({ ...prev, template: opt.value }));
                        triggerAutoSave();
                        setDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 16px",
                        fontSize: "0.875rem",
                        color: isSelected ? "var(--text)" : "var(--muted)",
                        background: isSelected ? "rgba(99, 102, 241, 0.15)" : "transparent",
                        cursor: "pointer",
                        fontWeight: isSelected ? "700" : "400",
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "center"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--primary)";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isSelected ? "rgba(99, 102, 241, 0.15)" : "transparent";
                        e.currentTarget.style.color = isSelected ? "var(--text)" : "var(--muted)";
                      }}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {opt.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <button className="btn btn-secondary" onClick={handleDownloadPdf}>
            <FileText size={16} /> Download PDF
          </button>
          <button className="btn btn-primary" onClick={handleSaveAndExit}>
            Save & Exit
          </button>
        </div>
      </header>

      {/* Editor Shell Grid */}
      <div className="rb-workspace">
        {/* Nav list */}
        <aside className="rb-sidebar-nav">
          <button className={`rb-nav-link ${activeTab === "personal" ? "active" : ""}`} onClick={() => setActiveTab("personal")}>
            Personal Info
          </button>
          <button className={`rb-nav-link ${activeTab === "summary" ? "active" : ""}`} onClick={() => setActiveTab("summary")}>
            Summary
          </button>
          <button className={`rb-nav-link ${activeTab === "skills" ? "active" : ""}`} onClick={() => setActiveTab("skills")}>
            Skills
          </button>
          <button className={`rb-nav-link ${activeTab === "education" ? "active" : ""}`} onClick={() => setActiveTab("education")}>
            Education
          </button>
          <button className={`rb-nav-link ${activeTab === "experience" ? "active" : ""}`} onClick={() => setActiveTab("experience")}>
            Experience
          </button>
          <button className={`rb-nav-link ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>
            Projects
          </button>
          <button className={`rb-nav-link ${activeTab === "certifications" ? "active" : ""}`} onClick={() => setActiveTab("certifications")}>
            Certifications
          </button>
          <button className={`rb-nav-link ${activeTab === "achievements" ? "active" : ""}`} onClick={() => setActiveTab("achievements")}>
            Achievements
          </button>
          <button className="btn btn-ghost" style={{ fontSize: "0.85rem", marginTop: "12px", border: "1px solid var(--border)" }} onClick={handleLoadSample}>
            Load Sample
          </button>
        </aside>

        {/* Input Forms */}
        <section className="rb-form-pane">
          {activeTab === "personal" && (
            <div className="panel" style={{ display: "grid", gap: "16px" }}>
              <h2>Personal Information</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="rb-form-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="rb-input"
                    value={currentPersonal.fullName || ""}
                    onChange={(e) => handleFieldChange("data.personal.fullName", e.target.value)}
                  />
                </div>
                <div className="rb-form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    className="rb-input"
                    value={currentPersonal.email || ""}
                    onChange={(e) => handleFieldChange("data.personal.email", e.target.value)}
                  />
                </div>
                <div className="rb-form-field">
                  <label>Phone</label>
                  <input
                    type="text"
                    className="rb-input"
                    value={currentPersonal.phone || ""}
                    onChange={(e) => handleFieldChange("data.personal.phone", e.target.value)}
                  />
                </div>
                <div className="rb-form-field">
                  <label>Address</label>
                  <input
                    type="text"
                    className="rb-input"
                    value={currentPersonal.address || ""}
                    onChange={(e) => handleFieldChange("data.personal.address", e.target.value)}
                  />
                </div>
                <div className="rb-form-field">
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    className="rb-input"
                    value={currentPersonal.linkedin || ""}
                    onChange={(e) => handleFieldChange("data.personal.linkedin", e.target.value)}
                  />
                </div>
                <div className="rb-form-field">
                  <label>GitHub</label>
                  <input
                    type="url"
                    className="rb-input"
                    value={currentPersonal.github || ""}
                    onChange={(e) => handleFieldChange("data.personal.github", e.target.value)}
                  />
                </div>
                <div className="rb-form-field rb-span-two">
                  <label>Portfolio</label>
                  <input
                    type="url"
                    className="rb-input"
                    value={currentPersonal.portfolio || ""}
                    onChange={(e) => handleFieldChange("data.personal.portfolio", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="panel" style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Summary / Career Objective</h2>
                <span className="muted" style={{ fontSize: "0.85rem" }}>
                  {(currentResume.data.summary || "").length}/700
                </span>
              </div>
              <div className="rb-form-field">
                <textarea
                  className="rb-textarea"
                  value={currentResume.data.summary || ""}
                  maxLength={700}
                  onChange={(e) => handleFieldChange("data.summary", e.target.value)}
                  placeholder="Summarize your career highlights..."
                  style={{ minHeight: "180px" }}
                />
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="panel" style={{ display: "grid", gap: "16px" }}>
              <h2>Technical Skills</h2>
              {Object.entries(skillCategories).map(([key, label]) => (
                <div key={key} className="rb-skill-category">
                  <label style={{ fontWeight: "700", display: "block" }}>{label}</label>
                  <div className="rb-skill-input-row">
                    <input
                      type="text"
                      className="rb-input"
                      value={skillInputs[key]}
                      onChange={(e) => setSkillInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addSkill(key)}
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                    <button className="btn btn-secondary" onClick={() => addSkill(key)}>
                      Add
                    </button>
                  </div>
                  <div className="rb-skill-tags">
                    {(currentSkills[key] || []).map((skill, idx) => (
                      <span key={idx} className="rb-skill-tag">
                        {skill}
                        <button onClick={() => removeSkill(key, idx)}>x</button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "education" && (
            <div className="panel" style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Education History</h2>
                <button className="btn btn-secondary" onClick={() => addRepeaterItem("education")}>
                  + Add Education
                </button>
              </div>
              {currentResume.data.education.map((item, idx) => (
                <div key={idx} className="rb-repeat-item">
                  <div className="rb-repeat-item-header">
                    <span>Education #{idx + 1}</span>
                    <button className="btn btn-ghost" style={{ color: "var(--danger)" }} onClick={() => removeRepeaterItem("education", idx)}>
                      Delete
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="rb-form-field">
                      <label>Degree</label>
                      <input
                        type="text"
                        className="rb-input"
                        value={item.degree || ""}
                        onChange={(e) => handleRepeaterChange("education", idx, "degree", e.target.value)}
                      />
                    </div>
                    <div className="rb-form-field">
                      <label>CGPA / Score</label>
                      <input
                        type="text"
                        className="rb-input"
                        value={item.score || ""}
                        onChange={(e) => handleRepeaterChange("education", idx, "score", e.target.value)}
                      />
                    </div>
                    <div className="rb-form-field">
                      <label>College / School</label>
                      <input
                        type="text"
                        className="rb-input"
                        value={item.college || ""}
                        onChange={(e) => handleRepeaterChange("education", idx, "college", e.target.value)}
                      />
                    </div>
                    <div className="rb-form-field">
                      <label>University</label>
                      <input
                        type="text"
                        className="rb-input"
                        value={item.university || ""}
                        onChange={(e) => handleRepeaterChange("education", idx, "university", e.target.value)}
                      />
                    </div>
                    <div className="rb-form-field">
                      <label>Start Year</label>
                      <input
                        type="text"
                        className="rb-input"
                        value={item.startYear || ""}
                        onChange={(e) => handleRepeaterChange("education", idx, "startYear", e.target.value)}
                      />
                    </div>
                    <div className="rb-form-field">
                      <label>End Year</label>
                      <input
                        type="text"
                        className="rb-input"
                        value={item.endYear || ""}
                        onChange={(e) => handleRepeaterChange("education", idx, "endYear", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "experience" && (
            <div className="panel" style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Work Experience</h2>
                <button className="btn btn-secondary" onClick={() => addRepeaterItem("experience")}>
                  + Add Experience
                </button>
              </div>
              {currentResume.data.experience.map((item, idx) => (
                <div key={idx} className="rb-repeat-item">
                  <div className="rb-repeat-item-header">
                    <span>Experience #{idx + 1}</span>
                    <button className="btn btn-ghost" style={{ color: "var(--danger)" }} onClick={() => removeRepeaterItem("experience", idx)}>
                      Delete
                    </button>
                  </div>
                  <div style={{ display: "grid", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="rb-form-field">
                        <label>Company</label>
                        <input
                          type="text"
                          className="rb-input"
                          value={item.company || ""}
                          onChange={(e) => handleRepeaterChange("experience", idx, "company", e.target.value)}
                        />
                      </div>
                      <div className="rb-form-field">
                        <label>Role</label>
                        <input
                          type="text"
                          className="rb-input"
                          value={item.role || ""}
                          onChange={(e) => handleRepeaterChange("experience", idx, "role", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="rb-form-field">
                      <label>Duration (e.g. June 2024 - Present)</label>
                      <input
                        type="text"
                        className="rb-input"
                        value={item.duration || ""}
                        onChange={(e) => handleRepeaterChange("experience", idx, "duration", e.target.value)}
                      />
                    </div>
                    <div className="rb-form-field">
                      <label>Responsibilities</label>
                      <textarea
                        className="rb-textarea"
                        value={item.responsibilities || ""}
                        onChange={(e) => handleRepeaterChange("experience", idx, "responsibilities", e.target.value)}
                        placeholder="Detail your roles and achievements..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="panel" style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Projects</h2>
                <button className="btn btn-secondary" onClick={() => addRepeaterItem("projects")}>
                  + Add Project
                </button>
              </div>
              {currentResume.data.projects.map((item, idx) => (
                <div key={idx} className="rb-repeat-item">
                  <div className="rb-repeat-item-header">
                    <span>Project #{idx + 1}</span>
                    <button className="btn btn-ghost" style={{ color: "var(--danger)" }} onClick={() => removeRepeaterItem("projects", idx)}>
                      Delete
                    </button>
                  </div>
                  <div style={{ display: "grid", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="rb-form-field">
                        <label>Project Title</label>
                        <input
                          type="text"
                          className="rb-input"
                          value={item.title || ""}
                          onChange={(e) => handleRepeaterChange("projects", idx, "title", e.target.value)}
                        />
                      </div>
                      <div className="rb-form-field">
                        <label>Technologies Used</label>
                        <input
                          type="text"
                          className="rb-input"
                          value={item.technologies || ""}
                          onChange={(e) => handleRepeaterChange("projects", idx, "technologies", e.target.value)}
                          placeholder="React, CSS, Node..."
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="rb-form-field">
                        <label>GitHub Link</label>
                        <input
                          type="url"
                          className="rb-input"
                          value={item.github || ""}
                          onChange={(e) => handleRepeaterChange("projects", idx, "github", e.target.value)}
                        />
                      </div>
                      <div className="rb-form-field">
                        <label>Live Link</label>
                        <input
                          type="url"
                          className="rb-input"
                          value={item.live || ""}
                          onChange={(e) => handleRepeaterChange("projects", idx, "live", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="rb-form-field">
                      <label>Description</label>
                      <textarea
                        className="rb-textarea"
                        value={item.description || ""}
                        onChange={(e) => handleRepeaterChange("projects", idx, "description", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "certifications" && (
            <div className="panel" style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Certifications</h2>
                <button className="btn btn-secondary" onClick={() => addRepeaterItem("certifications")}>
                  + Add Certification
                </button>
              </div>
              {currentResume.data.certifications.map((item, idx) => (
                <div key={idx} className="rb-repeat-item">
                  <div className="rb-repeat-item-header">
                    <span>Certification #{idx + 1}</span>
                    <button className="btn btn-ghost" style={{ color: "var(--danger)" }} onClick={() => removeRepeaterItem("certifications", idx)}>
                      Delete
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="rb-form-field">
                      <label>Certificate Name</label>
                      <input
                        type="text"
                        className="rb-input"
                        value={item.name || ""}
                        onChange={(e) => handleRepeaterChange("certifications", idx, "name", e.target.value)}
                      />
                    </div>
                    <div className="rb-form-field">
                      <label>Organization</label>
                      <input
                        type="text"
                        className="rb-input"
                        value={item.organization || ""}
                        onChange={(e) => handleRepeaterChange("certifications", idx, "organization", e.target.value)}
                      />
                    </div>
                    <div className="rb-form-field">
                      <label>Issue Date</label>
                      <input
                        type="text"
                        className="rb-input"
                        value={item.issueDate || ""}
                        onChange={(e) => handleRepeaterChange("certifications", idx, "issueDate", e.target.value)}
                      />
                    </div>
                    <div className="rb-form-field">
                      <label>Credential URL</label>
                      <input
                        type="url"
                        className="rb-input"
                        value={item.credentialUrl || ""}
                        onChange={(e) => handleRepeaterChange("certifications", idx, "credentialUrl", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="panel" style={{ display: "grid", gap: "16px" }}>
              <h2>Achievements</h2>
              <div style={{ display: "grid", gap: "12px" }}>
                <div className="rb-form-field">
                  <label>Awards</label>
                  <textarea
                    className="rb-textarea"
                    value={currentResume.data.achievements.awards || ""}
                    onChange={(e) => handleFieldChange("data.achievements.awards", e.target.value)}
                  />
                </div>
                <div className="rb-form-field">
                  <label>Hackathons</label>
                  <textarea
                    className="rb-textarea"
                    value={currentResume.data.achievements.hackathons || ""}
                    onChange={(e) => handleFieldChange("data.achievements.hackathons", e.target.value)}
                  />
                </div>
                <div className="rb-form-field">
                  <label>Competitions</label>
                  <textarea
                    className="rb-textarea"
                    value={currentResume.data.achievements.competitions || ""}
                    onChange={(e) => handleFieldChange("data.achievements.competitions", e.target.value)}
                  />
                </div>
                <div className="rb-form-field">
                  <label>Academic Highlights</label>
                  <textarea
                    className="rb-textarea"
                    value={currentResume.data.achievements.academic || ""}
                    onChange={(e) => handleFieldChange("data.achievements.academic", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Live Preview Pane */}
        <section className="rb-preview-pane">
          <div className="rb-preview-toolbar">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Eye size={16} />
              <strong style={{ fontSize: "0.95rem" }}>Live Preview</strong>
            </div>
            <span className="rb-save-status" style={{ color: saveStatus === "Saved" ? "var(--primary)" : "var(--muted)" }}>
              {saveStatus}
            </span>
          </div>

          <div id="resumePreview">
            {renderLiveTemplate()}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResumeBuilder;
