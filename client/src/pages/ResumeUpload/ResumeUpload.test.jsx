import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ResumeUpload from "./ResumeUpload";
import resumeService from "../../services/resumeService";
import { showError } from "../../components/UI/Toast";

jest.mock("../../services/resumeService", () => ({
  uploadResume: jest.fn(),
  scoreResume: jest.fn(),
  getActiveResume: jest.fn(() => Promise.resolve({ success: true, resume: null })),
  getResumeHistory: jest.fn(() => Promise.resolve({ resumes: [], pagination: null })),
}));

jest.mock("../../components/UI/Toast", () => ({
  showLoading: jest.fn(() => "toast-id"),
  dismissToast: jest.fn(),
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test("uploads a valid PDF resume and stores extracted text", async () => {
  resumeService.uploadResume.mockResolvedValue({
    resumeText: "Resume text",
    atsScore: { score: 74, level: "Strong" },
  });
  const file = new File(["content"], "resume.pdf", {
    type: "application/pdf",
  });

  render(
    <MemoryRouter>
      <ResumeUpload />
    </MemoryRouter>
  );

  await userEvent.upload(screen.getByLabelText(/choose a pdf or docx resume/i), file);
  await userEvent.click(screen.getByRole("button", { name: /upload resume/i }));

  await waitFor(() => {
    expect(resumeService.uploadResume).toHaveBeenCalled();
  });
  expect(localStorage.getItem("resumeText")).toBe("Resume text");
  expect(JSON.parse(localStorage.getItem("atsScore"))).toEqual({
    score: 74,
    level: "Strong",
  });
  expect(screen.getAllByText(/74/i)[0]).toBeInTheDocument();
  expect(screen.getByText(/Overall ATS Readiness/i)).toBeInTheDocument();
});

test("rejects non-PDF files before upload", async () => {
  const user = userEvent.setup({ applyAccept: false });
  const file = new File(["content"], "resume.txt", {
    type: "text/plain",
  });

  render(
    <MemoryRouter>
      <ResumeUpload />
    </MemoryRouter>
  );

  await user.upload(screen.getByLabelText(/choose a pdf or docx resume/i), file);

  expect(showError).toHaveBeenCalledWith("Please select a PDF or DOCX file");
  expect(resumeService.uploadResume).not.toHaveBeenCalled();
});

test("accepts DOCX resumes before upload", async () => {
  const file = new File(["content"], "resume.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  render(
    <MemoryRouter>
      <ResumeUpload />
    </MemoryRouter>
  );

  await userEvent.upload(screen.getByLabelText(/choose a pdf or docx resume/i), file);

  expect(screen.getByText("resume.docx")).toBeInTheDocument();
  expect(showError).not.toHaveBeenCalled();
});

test("requires a selected file before uploading", async () => {
  render(
    <MemoryRouter>
      <ResumeUpload />
    </MemoryRouter>
  );

  await userEvent.click(screen.getByRole("button", { name: /upload resume/i }));

  expect(showError).toHaveBeenCalledWith("Choose a PDF or DOCX resume first");
});
