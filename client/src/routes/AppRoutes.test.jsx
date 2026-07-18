import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";

jest.mock("../services/authService", () => ({
  login: jest.fn(),
  register: jest.fn(),
  refreshSession: jest.fn(() => Promise.reject(new Error("No session"))),
}));

jest.mock("../services/dashboardService", () => ({
  getDashboardSummary: jest.fn(() =>
    Promise.resolve({ completed: 0, averageScore: 0, recent: [] })
  ),
  getAnalytics: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("../services/resumeService", () => ({
  uploadResume: jest.fn(),
  getActiveResume: jest.fn(() => Promise.resolve({ success: true, resume: null })),
  getResumeHistory: jest.fn(() => Promise.resolve({ resumes: [], pagination: null })),
}));

jest.mock("../services/interviewService", () => ({
  generateQuestions: jest.fn(),
}));

jest.mock("../services/historyService", () => ({
  getHistory: jest.fn(() => Promise.resolve({ interviews: [] })),
}));

jest.mock("../services/api", () => ({
  post: jest.fn(),
}));

test("renders public landing route", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <AppRoutes />
    </MemoryRouter>
  );

  expect(
    await screen.findByRole("heading", {
      name: /practice technical interviews with required answers/i,
    })
  ).toBeInTheDocument();
});

test("redirects protected routes to login", async () => {
  localStorage.clear();

  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <AppRoutes />
    </MemoryRouter>
  );

  expect(await screen.findByRole("heading", { name: /login/i })).toBeInTheDocument();
});
