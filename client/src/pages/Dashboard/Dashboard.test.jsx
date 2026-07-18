import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import dashboardService from "../../services/dashboardService";

jest.mock("../../services/dashboardService", () => ({
  getDashboardSummary: jest.fn(),
  getAnalytics: jest.fn(),
}));

jest.mock("../../services/authService", () => ({
  logout: jest.fn(() => Promise.resolve({ success: true })),
}));

jest.mock("../../services/api", () => ({
  get: jest.fn(() => Promise.resolve({ data: { stats: null } })),
  post: jest.fn(),
}));

test("renders dashboard summary and actions", async () => {
  localStorage.setItem(
    "user",
    JSON.stringify({ name: "Test User", email: "test@example.com" })
  );
  dashboardService.getDashboardSummary.mockResolvedValue({
    completed: 2,
    averageScore: 82,
    recent: [{ _id: "1", role: "Frontend Developer", score: 84 }],
  });
  dashboardService.getAnalytics.mockResolvedValue({
    summary: { bestScore: 94, improvementPercentage: 10, interviewStreak: 3 },
    trends: {
      interviewScores: [{ role: "Frontend Developer", score: 84 }],
      atsScores: [],
      weeklyProgress: [{ week: "2026-06-15", averageScore: 82 }],
      monthlyProgress: [{ month: "2026-06", averageScore: 82 }],
    },
    skillGrowth: [{ skill: "React", score: 88 }],
    strongSkillAreas: [{ name: "React" }],
    weakSkillAreas: [{ name: "Accessibility" }],
  });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText("82%")).toBeInTheDocument();
  });

  expect(screen.getByText("Total Interviews")).toBeInTheDocument();
  expect(screen.getByText("Average Score")).toBeInTheDocument();
  expect(screen.getByText("Best Score")).toBeInTheDocument();
  expect(screen.getByText("Interview Streak")).toBeInTheDocument();
  expect(screen.getByText("94%")).toBeInTheDocument();
  expect(screen.getByText("3d")).toBeInTheDocument();
  expect(screen.getByText("Strong Areas")).toBeInTheDocument();
  expect(screen.getByText("Weak Areas")).toBeInTheDocument();
  expect(screen.getByText("React")).toBeInTheDocument();
  expect(screen.getByText("Accessibility")).toBeInTheDocument();
  expect(screen.getByText("Score Trend")).toBeInTheDocument();
  expect(screen.getByText("Weekly Progress")).toBeInTheDocument();
  expect(screen.getByText("Monthly Progress")).toBeInTheDocument();
  expect(screen.getByText("Skill Growth")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /start interview/i })).toHaveAttribute(
    "href",
    "/interview-setup"
  );
});
