import api from "./api";
import authService from "./authService";
import dashboardService from "./dashboardService";
import historyService from "./historyService";
import interviewService from "./interviewService";
import resumeService from "./resumeService";

jest.mock("./api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("auth service posts login and registration data", async () => {
  api.post.mockResolvedValue({ data: { success: true } });

  await authService.login({ email: "test@example.com" });
  await authService.register({ email: "test@example.com" });

  expect(api.post).toHaveBeenNthCalledWith(1, "/auth/login", {
    email: "test@example.com",
  });
  expect(api.post).toHaveBeenNthCalledWith(2, "/auth/register", {
    email: "test@example.com",
  });
});

test("interview service retries legacy route on 404", async () => {
  api.post
    .mockRejectedValueOnce({ response: { status: 404 } })
    .mockResolvedValueOnce({ data: { questions: ["Question?"] } });

  const response = await interviewService.generateQuestions({
    role: "Frontend Developer",
  });

  expect(response.questions).toEqual(["Question?"]);
  expect(api.post).toHaveBeenNthCalledWith(2, "/interview/generate-questions", {
    role: "Frontend Developer",
  });
});

test("resume and history services call expected endpoints", async () => {
  const formData = new FormData();
  api.post.mockResolvedValue({ data: { resumeText: "Resume" } });
  api.get.mockResolvedValue({ data: { interviews: [] } });

  await resumeService.uploadResume(formData);
  await resumeService.scoreResume({
    resumeText: "React resume",
    role: "Frontend Developer",
  });
  await historyService.getHistory();

  expect(api.post).toHaveBeenCalledWith(
    "/resume/upload",
    formData,
    expect.objectContaining({ headers: expect.any(Object) })
  );
  expect(api.post).toHaveBeenCalledWith("/resume/ats-score", {
    resumeText: "React resume",
    role: "Frontend Developer",
  });
  expect(api.get).toHaveBeenCalledWith("/history");
});

test("dashboard service summarizes interview history", async () => {
  api.get.mockResolvedValue({
    data: {
      interviews: [
        { _id: "1", score: 80 },
        { _id: "2", score: 100 },
      ],
    },
  });

  const summary = await dashboardService.getDashboardSummary();

  expect(summary.completed).toBe(2);
  expect(summary.averageScore).toBe(90);
  expect(summary.recent).toHaveLength(2);
});
