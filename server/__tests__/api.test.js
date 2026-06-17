process.env.JWT_SECRET = "test-secret";
process.env.FRONTEND_URL = "http://localhost:5173";

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../models/Interview", () => ({
  create: jest.fn(),
  find: jest.fn(),
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

  test("registers a user without returning the password", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "student",
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "TEST@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(201);
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
      password: "Password123",
    });

    expect(response.status).toBe(409);
  });

  test("rejects missing login credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({});

    expect(response.status).toBe(400);
  });

  test("logs in a valid user", async () => {
    const hashedPassword = await bcrypt.hash("Password123", 4);
    User.findOne.mockResolvedValue({
      _id: "user-1",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      role: "student",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.password).toBeUndefined();
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
    expect(Interview.find).toHaveBeenCalledWith({ user: "user-1" });
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
