import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Results from "./Results";
import api from "../../services/api";

jest.mock("../../services/api", () => ({
  post: jest.fn(),
}));

test("evaluates and renders scorecard", async () => {
  localStorage.setItem("questions", JSON.stringify(["Question?"]));
  localStorage.setItem("answers", JSON.stringify(["Answer."]));
  localStorage.setItem(
    "interviewConfig",
    JSON.stringify({ role: "Frontend Developer" })
  );
  localStorage.setItem("resumeText", "React JavaScript project resume");
  api.post.mockResolvedValue({
    data: {
      overall: 90,
      technical: 88,
      communication: 91,
      problemSolving: 89,
      feedback: "Strong answer.",
      atsScore: {
        score: 84,
        level: "Strong",
        matchedKeywords: ["react", "javascript"],
        missingKeywords: ["accessibility"],
        recommendations: ["Add accessibility examples."],
      },
    },
  });

  render(
    <MemoryRouter>
      <Results />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText("90")).toBeInTheDocument();
  });
  expect(screen.getByText("Strong answer.")).toBeInTheDocument();
  expect(screen.getByText(/ats resume fit/i)).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledWith(
    "/evaluation/evaluate",
    expect.objectContaining({ resumeText: "React JavaScript project resume" })
  );
});

test("shows an error when interview state is missing", async () => {
  localStorage.clear();

  render(
    <MemoryRouter>
      <Results />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByRole("heading", { name: /results unavailable/i })).toBeInTheDocument();
  });

  expect(screen.getByText(/complete an interview/i)).toBeInTheDocument();
});
