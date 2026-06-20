process.env.JWT_SECRET = "test-secret";
process.env.FRONTEND_URL = "http://localhost:5173";

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock("../models/Interview", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  countDocuments: jest.fn(),
  distinct: jest.fn(),
  updateMany: jest.fn(),
  deleteMany: jest.fn(),
}));

jest.mock("../models/AtsReport", () => ({
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  deleteMany: jest.fn(),
}));

jest.mock("../utils/gemini", () => ({
  generateContent: jest.fn(),
}));

jest.mock("../utils/resumeParser", () => jest.fn());

const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Interview = require("../models/Interview");
const AtsReport = require("../models/AtsReport");
const model = require("../utils/gemini");
const extractResumeText = require("../utils/resumeParser");
const { app } = require("../server");

const token = () => jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("auth API", () => {
  test("rejects invalid registration payload", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "",
      email: "bad-email",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("rejects weak passwords during registration", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("registers a user, issues a JWT session, and does not return the password", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "student",
      save: jest.fn(),
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "TEST@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.password).toBeUndefined();
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@example.com" })
    );
  });

  test("rejects duplicate registration", async () => {
    User.findOne.mockResolvedValue({ _id: "existing-user" });

    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(409);
  });

  test("rejects missing login credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({});

    expect(response.status).toBe(400);
  });

  test("rejects malformed login email", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "Password123!",
    });

    expect(response.status).toBe(400);
  });

  test("rejects invalid login passwords", async () => {
    const hashedPassword = await bcrypt.hash("Password123!", 4);
    User.findOne.mockResolvedValue({
      _id: "user-1",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      role: "student",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "WrongPassword123!",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  test("rejects NoSQL operator injection in login payloads", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: { $ne: null },
      password: "Password123!",
    });

    expect(response.status).toBe(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("logs in a valid user", async () => {
    const hashedPassword = await bcrypt.hash("Password123!", 4);
    const save = jest.fn();
    User.findOne.mockResolvedValue({
      _id: "user-1",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      role: "student",
      save,
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.password).toBeUndefined();
    expect(response.header["set-cookie"][0]).toContain("refreshToken=");
    expect(save).toHaveBeenCalled();
  });

  test("creates a session refresh cookie when rememberMe is false", async () => {
    const hashedPassword = await bcrypt.hash("Password123!", 4);
    User.findOne.mockResolvedValue({
      _id: "user-1",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      role: "student",
      save: jest.fn(),
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "Password123!",
      rememberMe: false,
    });

    expect(response.status).toBe(200);
    expect(response.header["set-cookie"][0]).toContain("refreshToken=");
    expect(response.header["set-cookie"][0]).not.toMatch(/Max-Age|Expires/i);
  });

  test("refreshes a valid refresh-token session", async () => {
    const save = jest.fn();
    const crypto = require("crypto");
    const refreshToken = "refresh-token";
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "user-1",
        name: "Test User",
        email: "test@example.com",
        role: "student",
        refreshTokenHash,
        save,
      }),
    });

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .send({ rememberMe: false });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe("test@example.com");
    expect(response.header["set-cookie"][0]).not.toMatch(/Max-Age|Expires/i);
  });

  test("verifies an email token", async () => {
    const save = jest.fn();
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        isEmailVerified: false,
        emailVerificationTokenHash: "hash",
        save,
      }),
    });

    const crypto = require("crypto");
    const rawToken = "a".repeat(48);
    const response = await request(app).post("/api/auth/verify-email").send({
      token: rawToken,
    });

    expect(response.status).toBe(200);
    expect(User.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        emailVerificationTokenHash: crypto
          .createHash("sha256")
          .update(rawToken)
          .digest("hex"),
      })
    );
    expect(save).toHaveBeenCalled();
  });
});

describe("protected interview APIs", () => {
  test("rejects invalid auth tokens", async () => {
    const response = await request(app)
      .post("/api/interview/generate")
      .set("Authorization", "Bearer invalid-token")
      .send({ role: "Frontend Developer" });

    expect(response.status).toBe(401);
  });

  test("rejects expired auth tokens", async () => {
    const expiredToken = jwt.sign(
      { id: "user-1" },
      process.env.JWT_SECRET,
      { expiresIn: "-1s" }
    );

    const response = await request(app)
      .post("/api/interview/generate")
      .set("Authorization", `Bearer ${expiredToken}`)
      .send({ role: "Frontend Developer" });

    expect(response.status).toBe(401);
  });

  test("rejects tampered auth tokens", async () => {
    const validToken = token();
    const tamperedToken = `${validToken.slice(0, -1)}x`;

    const response = await request(app)
      .post("/api/interview/generate")
      .set("Authorization", `Bearer ${tamperedToken}`)
      .send({ role: "Frontend Developer" });

    expect(response.status).toBe(401);
  });

  test("blocks unauthenticated question generation", async () => {
    const response = await request(app)
      .post("/api/interview/generate")
      .send({ role: "Frontend Developer" });

    expect(response.status).toBe(401);
  });

  test("generates fallback questions when Gemini fails", async () => {
    model.generateContent.mockRejectedValue(new Error("provider down"));

    const response = await request(app)
      .post("/api/interview/generate")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        role: "Frontend Developer",
        difficulty: "Beginner",
        questionCount: 3,
        resumeText: "Skills React JavaScript projects",
      });

    expect(response.status).toBe(200);
    expect(response.body.questions).toHaveLength(3);
    expect(response.body.questions[0]).toContain("Frontend Developer");
    expect(response.body.atsScore.score).toBeGreaterThan(0);
  });

  test("rejects missing interview roles", async () => {
    const response = await request(app)
      .post("/api/interview/generate")
      .set("Authorization", `Bearer ${token()}`)
      .send({ role: "" });

    expect(response.status).toBe(400);
  });

  test("rejects invalid interview difficulties", async () => {
    const response = await request(app)
      .post("/api/interview/generate")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        role: "Frontend Developer",
        difficulty: "Impossible",
      });

    expect(response.status).toBe(400);
  });

  test("parses Gemini JSON question output", async () => {
    model.generateContent.mockResolvedValue({
      response: {
        text: () => '["Question one?","Question two?"]',
      },
    });

    const response = await request(app)
      .post("/api/interview/generate")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        role: "Backend Developer",
        questionCount: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.questions).toEqual(["Question one?", "Question two?"]);
  });

  test("rejects invalid evaluation payload", async () => {
    const response = await request(app)
      .post("/api/evaluation/evaluate")
      .set("Authorization", `Bearer ${token()}`)
      .send({ role: "" });

    expect(response.status).toBe(400);
  });

  test("evaluates and saves an interview", async () => {
    model.generateContent.mockRejectedValue(new Error("provider down"));
    Interview.create.mockResolvedValue({});

    const response = await request(app)
      .post("/api/evaluation/evaluate")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        role: "Frontend Developer",
        questions: ["Question?"],
        answers: ["Answer."],
        resumeText:
          "Skills React JavaScript HTML CSS Projects built dashboard improved performance 30%",
      });

    expect(response.status).toBe(200);
    expect(response.body.overall).toBeGreaterThan(0);
    expect(response.body.atsScore.score).toBeGreaterThan(0);
    expect(Interview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user-1",
        role: "Frontend Developer",
        atsScore: expect.any(Object),
      })
    );
  });

  test("caps clearly wrong answers even when Gemini returns high scores", async () => {
    model.generateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            technical: 95,
            communication: 90,
            problemSolving: 92,
            overall: 94,
            feedback: "Overly generous model response.",
          }),
      },
    });
    Interview.create.mockResolvedValue({});

    const response = await request(app)
      .post("/api/evaluation/evaluate")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        role: "Frontend Developer",
        questions: ["Explain React state management and when you would use it."],
        answers: ["I don't know."],
      });

    expect(response.status).toBe(200);
    expect(response.body.overall).toBeLessThanOrEqual(25);
    expect(response.body.technical).toBeLessThanOrEqual(25);
    expect(Interview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        score: expect.any(Number),
        feedback: expect.objectContaining({
          overall: expect.any(Number),
        }),
      })
    );
  });

  test("returns high detailed scores for a correct answer", async () => {
    model.generateContent.mockRejectedValue(new Error("provider down"));
    Interview.create.mockResolvedValue({});

    const response = await request(app)
      .post("/api/evaluation/evaluate")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        role: "Frontend Developer",
        questions: [
          {
            question: "Explain React component architecture for a large application.",
            expectedAnswer:
              "A strong answer explains React components, state management, performance, testing, and scalability with examples.",
            keywords: ["react", "components", "state", "performance", "testing", "scalability"],
          },
        ],
        answers: [
          "I would use modular React components with clear responsibilities, hooks and context for state, memoization and code splitting for performance, Testing Library for testing, and scalable folders with error boundaries. For example, I optimized a dashboard and reduced render work.",
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.overall).toBeGreaterThanOrEqual(75);
    expect(response.body.questionScores[0]).toEqual(
      expect.objectContaining({
        correctnessScore: expect.any(Number),
        relevanceScore: expect.any(Number),
        technicalAccuracyScore: expect.any(Number),
        communicationScore: expect.any(Number),
        whatWasCorrect: expect.any(Array),
        whatWasIncorrect: expect.any(Array),
        correctAnswer: expect.any(String),
        improvementSuggestion: expect.any(String),
      })
    );
  });

  test.each([
    ["empty", ""],
    ["random", "asdf qwerty lorem ipsum as an AI"],
  ])("returns low detailed scores for a %s answer", async (_label, answer) => {
    model.generateContent.mockRejectedValue(new Error("provider down"));
    Interview.create.mockResolvedValue({});

    const response = await request(app)
      .post("/api/evaluation/evaluate")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        role: "Frontend Developer",
        questions: ["Explain React state management."],
        answers: [answer],
      });

    expect(response.status).toBe(200);
    expect(response.body.overall).toBeLessThanOrEqual(25);
    expect(response.body.questionScores[0].score).toBeLessThanOrEqual(25);
  });

  test("returns current user's history", async () => {
    const select = jest.fn().mockResolvedValue([
      { _id: "interview-1", role: "Frontend Developer", score: 80 },
    ]);
    const limit = jest.fn(() => ({ select }));
    const sort = jest.fn(() => ({ limit }));
    Interview.find.mockReturnValue({ sort });

    const response = await request(app)
      .get("/api/history")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.status).toBe(200);
    expect(response.body.interviews).toHaveLength(1);
    expect(Interview.find).toHaveBeenCalledWith({
      user: "user-1",
      deletedAt: null,
    });
  });

  test("sorts history by highest score when requested", async () => {
    const select = jest.fn().mockResolvedValue([]);
    const limit = jest.fn(() => ({ select }));
    const sort = jest.fn(() => ({ limit }));
    Interview.find.mockReturnValue({ sort });

    const response = await request(app)
      .get("/api/history?sort=score-high")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.status).toBe(200);
    expect(sort).toHaveBeenCalledWith({ score: -1, createdAt: -1 });
  });

  test("returns one interview detail record", async () => {
    const interviewId = "507f1f77bcf86cd799439011";
    const select = jest.fn().mockResolvedValue({
      _id: interviewId,
      role: "Frontend Developer",
      questions: ["Question?"],
      answers: ["Answer."],
      feedback: { strengths: ["react"] },
    });
    Interview.findOne.mockReturnValue({ select });

    const response = await request(app)
      .get(`/api/history/${interviewId}`)
      .set("Authorization", `Bearer ${token()}`);

    expect(response.status).toBe(200);
    expect(response.body.interview.questions).toHaveLength(1);
    expect(Interview.findOne).toHaveBeenCalledWith({
      _id: interviewId,
      user: "user-1",
    });
  });

  test("soft deletes an interview history item", async () => {
    const interviewId = "507f1f77bcf86cd799439011";
    const select = jest.fn().mockResolvedValue({
      _id: interviewId,
      role: "Frontend Developer",
      deletedAt: new Date(),
    });
    Interview.findOneAndUpdate.mockReturnValue({ select });

    const response = await request(app)
      .delete(`/api/history/${interviewId}`)
      .set("Authorization", `Bearer ${token()}`);

    expect(response.status).toBe(200);
    expect(Interview.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: interviewId, user: "user-1", deletedAt: null },
      { deletedAt: expect.any(Date) },
      { new: true }
    );
  });

  test("soft deletes an interview through the plural interviews API", async () => {
    const interviewId = "507f1f77bcf86cd799439011";
    const select = jest.fn().mockResolvedValue({
      _id: interviewId,
      role: "Frontend Developer",
      deletedAt: new Date(),
    });
    Interview.findOneAndUpdate.mockReturnValue({ select });

    const response = await request(app)
      .delete(`/api/interviews/${interviewId}`)
      .set("Authorization", `Bearer ${token()}`);

    expect(response.status).toBe(200);
    expect(Interview.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: interviewId, user: "user-1", deletedAt: null },
      { deletedAt: expect.any(Date) },
      { new: true }
    );
  });

  test("bulk deletes selected interview history items", async () => {
    const ids = ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"];
    Interview.updateMany.mockResolvedValue({ modifiedCount: 2 });

    const response = await request(app)
      .patch("/api/history/bulk-delete")
      .set("Authorization", `Bearer ${token()}`)
      .send({ interviewIds: ids });

    expect(response.status).toBe(200);
    expect(response.body.deletedCount).toBe(2);
    expect(Interview.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ids }, user: "user-1", deletedAt: null },
      { deletedAt: expect.any(Date) }
    );
  });

  test("restores a deleted interview history item", async () => {
    const interviewId = "507f1f77bcf86cd799439011";
    const select = jest.fn().mockResolvedValue({
      _id: interviewId,
      role: "Frontend Developer",
      deletedAt: null,
    });
    Interview.findOneAndUpdate.mockReturnValue({ select });

    const response = await request(app)
      .patch(`/api/history/${interviewId}/restore`)
      .set("Authorization", `Bearer ${token()}`);

    expect(response.status).toBe(200);
    expect(Interview.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: interviewId, user: "user-1", deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    );
  });

  test("returns admin platform summary for admins", async () => {
    const adminToken = jwt.sign({ id: "admin-1", role: "admin" }, process.env.JWT_SECRET);
    const userSelect = jest.fn().mockResolvedValue([
      { _id: "user-1", name: "Test User", email: "test@example.com" },
    ]);
    const userLimit = jest.fn(() => ({ select: userSelect }));
    const userSort = jest.fn(() => ({ limit: userLimit }));
    const interviewSelect = jest.fn().mockResolvedValue([
      { _id: "interview-1", role: "Frontend Developer", score: 88 },
    ]);
    const populate = jest.fn(() => ({ select: interviewSelect }));
    const interviewLimit = jest.fn(() => ({ populate }));
    const interviewSort = jest.fn(() => ({ limit: interviewLimit }));

    User.countDocuments.mockResolvedValue(3);
    Interview.countDocuments.mockResolvedValue(5);
    AtsReport.countDocuments.mockResolvedValue(4);
    User.find.mockReturnValue({ sort: userSort });
    Interview.find.mockReturnValue({ sort: interviewSort });
    Interview.distinct.mockResolvedValue(["user-1"]);

    const response = await request(app)
      .get("/api/admin/summary")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.summary.totalUsers).toBe(3);
    expect(response.body.summary.activeUsers).toBe(1);
  });

  test("blocks admin APIs for students", async () => {
    const response = await request(app)
      .get("/api/admin/summary")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.status).toBe(403);
  });
});

describe("resume upload API", () => {
  test("requires a resume file", async () => {
    const response = await request(app)
      .post("/api/resume/upload")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/upload/i);
  });

  test("extracts text from a valid DOCX upload", async () => {
    extractResumeText.mockResolvedValue("Skills Node Express Projects");

    const response = await request(app)
      .post("/api/resume/upload")
      .set("Authorization", `Bearer ${token()}`)
      .attach("resume", Buffer.from("PK\u0003\u0004docx"), {
        filename: "resume.docx",
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

    expect(response.status).toBe(200);
    expect(response.body.resumeText).toBe("Skills Node Express Projects");
    expect(response.body.atsScore.score).toBeGreaterThan(0);
  });

  test("rejects corrupted DOCX uploads", async () => {
    const response = await request(app)
      .post("/api/resume/upload")
      .set("Authorization", `Bearer ${token()}`)
      .attach("resume", Buffer.from("not a docx"), {
        filename: "resume.docx",
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Uploaded file is not a valid DOCX");
  });

  test("rejects TXT resume uploads", async () => {
    const response = await request(app)
      .post("/api/resume/upload")
      .set("Authorization", `Bearer ${token()}`)
      .attach("resume", Buffer.from("plain text"), {
        filename: "resume.txt",
        contentType: "text/plain",
      });

    expect(response.status).toBe(400);
  });

  test("rejects corrupted PDF uploads", async () => {
    const response = await request(app)
      .post("/api/resume/upload")
      .set("Authorization", `Bearer ${token()}`)
      .attach("resume", Buffer.from("not a real pdf"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Uploaded file is not a valid PDF");
  });

  test("rejects oversized PDF uploads", async () => {
    const response = await request(app)
      .post("/api/resume/upload")
      .set("Authorization", `Bearer ${token()}`)
      .attach("resume", Buffer.alloc(5 * 1024 * 1024 + 1, "%"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Resume must be smaller than 5 MB");
  });

  test("extracts text from a valid PDF upload", async () => {
    extractResumeText.mockResolvedValue("Skills React JavaScript Projects");

    const response = await request(app)
      .post("/api/resume/upload")
      .set("Authorization", `Bearer ${token()}`)
      .attach("resume", Buffer.from("%PDF-1.4"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(200);
    expect(response.body.resumeText).toBe("Skills React JavaScript Projects");
    expect(response.body.atsScore.score).toBeGreaterThan(0);
  });

  test("scores resume text against a target role", async () => {
    const response = await request(app)
      .post("/api/resume/ats-score")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        role: "Frontend Developer",
        resumeText:
          "Email github skills React JavaScript CSS experience projects built UI improved 25%",
      });

    expect(response.status).toBe(200);
    expect(response.body.atsScore.level).toEqual(expect.any(String));
    expect(response.body.atsScore.matchedKeywords).toContain("react");
  });
});
