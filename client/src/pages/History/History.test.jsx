import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import History from "./History";
import historyService from "../../services/historyService";

jest.mock("../../services/historyService", () => ({
  getHistory: jest.fn(),
}));

test("renders interview history rows", async () => {
  historyService.getHistory.mockResolvedValue({
    interviews: [
      {
        _id: "1",
        role: "Frontend Developer",
        score: 88,
        atsScore: { score: 76 },
        createdAt: "2026-06-17T00:00:00.000Z",
      },
    ],
  });

  render(
    <MemoryRouter>
      <History />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
  });
  expect(screen.getByText("88%")).toBeInTheDocument();
  expect(screen.getByText("76")).toBeInTheDocument();
});
