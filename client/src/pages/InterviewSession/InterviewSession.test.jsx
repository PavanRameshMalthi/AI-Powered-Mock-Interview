import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import InterviewSession from "./InterviewSession";

jest.mock("../../components/UI/Toast", () => ({
  showError: jest.fn(),
}));

test("saves answers and navigates to results on finish", async () => {
  localStorage.setItem("questions", JSON.stringify(["Question one?"]));
  localStorage.setItem("answers", JSON.stringify([]));

  render(
    <MemoryRouter initialEntries={["/interview-session"]}>
      <Routes>
        <Route path="/interview-session" element={<InterviewSession />} />
        <Route path="/results" element={<h1>Results</h1>} />
      </Routes>
    </MemoryRouter>
  );

  await userEvent.type(screen.getByLabelText(/your answer/i), "My answer");
  await userEvent.click(screen.getByRole("button", { name: /finish interview/i }));

  expect(JSON.parse(localStorage.getItem("answers"))).toEqual(["My answer"]);
  expect(screen.getByRole("heading", { name: /results/i })).toBeInTheDocument();
});

test("shows empty state when no questions exist", () => {
  localStorage.removeItem("questions");

  render(
    <MemoryRouter>
      <InterviewSession />
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: /no interview questions/i })).toBeInTheDocument();
});

test("allows skipping the question when no answer is entered", async () => {
  localStorage.setItem("questions", JSON.stringify(["Question one?"]));
  localStorage.setItem("answers", JSON.stringify([]));

  render(
    <MemoryRouter initialEntries={["/interview-session"]}>
      <Routes>
        <Route path="/interview-session" element={<InterviewSession />} />
        <Route path="/results" element={<h1>Results</h1>} />
      </Routes>
    </MemoryRouter>
  );

  const skipBtn = screen.getByRole("button", { name: /skip question/i });
  expect(skipBtn).toBeInTheDocument();
  await userEvent.click(skipBtn);

  expect(JSON.parse(localStorage.getItem("answers"))).toEqual([""]);
  expect(screen.getByRole("heading", { name: /results/i })).toBeInTheDocument();
});
