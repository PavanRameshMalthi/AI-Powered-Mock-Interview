import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Landing from "./Landing";

test("renders landing page without fake social proof or removed landing actions", () => {
  render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: /practice technical interviews/i })).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /signup/i })[0]).toHaveAttribute(
    "href",
    "/register"
  );
  expect(screen.getByRole("heading", { name: /resume-aware feedback/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /built around the real interview flow/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /practical answers before you begin/i })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /start interview/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /watch demo/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /watch demo/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/ratings/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/interviews completed/i)).not.toBeInTheDocument();
});
