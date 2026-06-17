import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import InterviewSetup from "./InterviewSetup";
import interviewService from "../../services/interviewService";

jest.mock("../../services/interviewService", () => ({
  generateQuestions: jest.fn(),
}));

jest.mock("../../components/UI/Toast", () => ({
  showLoading: jest.fn(() => "toast-id"),
  dismissToast: jest.fn(),
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

test("generates interview questions and saves interview state", async () => {
  interviewService.generateQuestions.mockResolvedValue({
    questions: ["Question one?", "Question two?"],
    atsScore: { score: 81, level: "Strong" },
  });

  render(
    <MemoryRouter>
      <InterviewSetup />
    </MemoryRouter>
  );

  await userEvent.type(screen.getByLabelText(/target role/i), "Frontend Developer");
  await userEvent.click(
    screen.getByRole("button", { name: /generate interview/i })
  );

  await waitFor(() => {
    expect(interviewService.generateQuestions).toHaveBeenCalled();
  });

  expect(JSON.parse(localStorage.getItem("questions"))).toEqual([
    "Question one?",
    "Question two?",
  ]);
  expect(JSON.parse(localStorage.getItem("atsScore"))).toEqual({
    score: 81,
    level: "Strong",
  });
});
